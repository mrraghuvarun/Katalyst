import React, { useEffect, useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import emailjs from "emailjs-com";
import Layout from "../components/Layout.tsx";
import Modal from "../components/HistoryModal.tsx";
import SuccessModal from "../components/SuccessModal.tsx";
import "./BackReporting.css";
import Loading from "../components/Loading.tsx";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs.js";

interface UploadHistory {
  originalIndex: number;
  filename: string;
  date: string;
  status: string;
}

const BackReporting: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [databaseName, setDatabaseName] = useState<string>("");
  const [tableName, setTableName] = useState<string>("");

  const [errors, setErrors] = useState<{
    databaseName?: string;
    tableName?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // Pagination state
  // const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const [currentPage, setCurrentPage] = useState(0); // Initial page set to 0
  const pageSize = 5; // Number of entries per page

  // Data to be displayed based on current page
  const pagedData = csvData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const pageCount = Math.ceil(csvData.length / pageSize);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (csvData.length === 0) return [];
    return Object.keys(csvData[0]).map((key) => ({
      accessorKey: key,
      header: key,
    }));
  }, [csvData]);

  // Initialize the table instance
  const table = useReactTable({
    data: csvData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleUpload = () => {
    if (file) {
      setLoading(true); // Show loading
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setCsvData(jsonData);
          setCurrentStep(2); // Move to next step for data preview
        }
        setLoading(false); // Hide loading
      };
      reader.readAsBinaryString(file);
    }
  };

  const validateFields = (): boolean => {
    const newErrors: { databaseName?: string; tableName?: string } = {};
    if (!databaseName.trim()) {
      newErrors.databaseName = "Database Name is required.";
    }
    if (!tableName.trim()) {
      newErrors.tableName = "Table Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleRemoveFile = () => {
    setFile(null); // Clear the file state
    setCurrentStep(1); // Reset to Step 1
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input field
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && file) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateFields()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep(currentStep - 1);
    }
  };

  const [filteredHistory, setFilteredHistory] = useState(uploadHistory);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredHistory(uploadHistory);
    } else {
      handleSearch(search);
    }
  }, [uploadHistory, search]);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);

    if (!searchValue.trim()) {
      setFilteredHistory(uploadHistory);
      return;
    }

    const filtered = uploadHistory.filter(
      (history, index) =>
        history.originalIndex.toString().includes(searchValue) ||
        Object.values(history).some((value) =>
          value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
    );

    setFilteredHistory(filtered);
  };

  const handleConfirmUpload = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const uploadedFile = file!;
      const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();

      let uploadedData;
      if (fileExtension === "csv") {
        const text = await uploadedFile.text();
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        uploadedData = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});
          })
          .filter((row) => Object.values(row).some((value) => value));
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const buffer = await uploadedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        uploadedData = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );
      } else {
        throw new Error(
          "Unsupported file type. Please upload either a CSV or Excel file."
        );
      }

      const emailParams = {
        to_name: "Recipient Name",
        file_name: uploadedFile.name,
        upload_date: new Date().toLocaleDateString(),
        database_name: databaseName,
        table_name: tableName,
        changed_rows: uploadedData.length,
      };

      await emailjs.send(
        "service_wwbo9w7",
        "template_c7yghon",
        emailParams,
        "zcZkGQ35dZ0552hi-"
      );

      // alert("Upload confirmed and email sent successfully!");

      setUploadHistory((prevHistory) => [
        ...prevHistory,
        {
          originalIndex: prevHistory.length + 1,
          filename: uploadedFile.name,
          date: new Date().toLocaleDateString(),
          status: "Uploaded",
        },
      ]);
      setIsModalOpen(true);
      setFile(null);
      setCsvData([]);
      setDatabaseName("");
      setTableName("");
      setCurrentStep(1);
    } catch (error) {
      console.error("Error during file comparison or email sending:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const borderColor = (step) =>
    currentStep > step ? "border-green-500" : "border-gray-500";

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <Tabs defaultValue="update_report" className="w-full">
        <TabsList className="bg-white p-2 py-6 rounded-lg mb-4">
          <TabsTrigger value="update_report">Update Report</TabsTrigger>
          <TabsTrigger value="back_report">Back Report History</TabsTrigger>
        </TabsList>
        <TabsContent
          value="update_report"
          className="bg-white w-full p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-black mb-6">
            Upload Process
          </h3>

          {/* Stepper */}
          <div className="stepper flex justify-between items-center mb-8 max-w-[800px] mx-auto">
            <div
              className={`step ${currentStep > 1 ? "completed" : ""} ${
                currentStep === 1 ? "active" : ""
              } flex flex-col items-center`}
            >
              <div className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                STEP 1
              </div>
              <p
                className={`textColor mt-2 ${
                  currentStep >= 1
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                }`}
              >
                Upload CSV File
              </p>
            </div>
            <div className="flex items-center w-full mx-6 mb-6">
              <div
                className={`h-2 w-2 rounded-full border ${borderColor(1)}`}
              ></div>
              <hr
                className={`border-1 border-dashed ${borderColor(1)} w-full`}
              />
              <div
                className={`h-2 w-2 rounded-full border ${borderColor(1)}`}
              ></div>
            </div>

            <div
              className={`step ${currentStep > 2 ? "completed" : ""} ${
                currentStep === 2 ? "active" : ""
              } flex flex-col items-center`}
            >
              <div className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                STEP 2
              </div>
              <p
                className={`textColor mt-2 ${
                  currentStep >= 2
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                }`}
              >
                Data Process
              </p>
            </div>
            <div className="flex items-center w-full mx-6 mb-6">
              <div
                className={`h-2 w-2 rounded-full border ${borderColor(2)}`}
              ></div>
              <hr
                className={`border-1 border-dashed ${borderColor(2)} w-full`}
              />
              <div
                className={`h-2 w-2 rounded-full border ${borderColor(2)}`}
              ></div>
            </div>
            <div
              className={`step ${
                currentStep === 3 ? "active" : ""
              } flex flex-col items-center`}
            >
              <div className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                STEP 3
              </div>
              <p
                className={`textColor mt-2 ${
                  currentStep === 3
                    ? "text-blue-700 font-medium"
                    : "text-gray-500"
                }`}
              >
                Confirm Upload
              </p>
            </div>
          </div>

          <hr className="my-8 w-full border-gray-200" />

          <div className="bg-white p-1 rounded-xl">
            <h3 className="text-xl font-semibold text-black mb-6">
              Select the CSV or XLSX File
            </h3>
            {/* Step 1: File Upload */}
            {currentStep === 1 && (
              <div className="flex flex-row items-center gap-4">
                {/* File Drop Zone */}
                <label
                  htmlFor="file-upload"
                  className="border-2 border-dashed border-blue-500 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-between h-[81px] w-[535px] p-4 cursor-pointer hover:bg-blue-100"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      Click to{" "}
                      <span className="text-blue-500 font-semibold">
                        Upload File
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Supported files: XLSX or CSV
                    </span>
                  </div>
                  <FileIcon className="w-6 h-6 text-blue-500" />
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>

                {/* Upload Button */}
                <Button
                  size="lg"
                  className={`bg-black text-white hover:bg-gray-800 h-[52px] w-[231px] ${
                    !file ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleUpload}
                  disabled={!file}
                >
                  Upload
                </Button>
              </div>
            )}

            {/* Uploaded File Name Display */}
            {file && (
              <div className="uploaded-file-display flex items-center justify-between border border-blue-500 bg-blue-50 text-blue-700 rounded-lg w-[535px] h-auto p-2">
                <span className="text-sm font-medium truncate">
                  {file.name}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl">
            {currentStep === 2 && (
              <div className="step-content space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Data Preview
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-2">
                        Database Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter database name"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={databaseName}
                        onChange={(e) => setDatabaseName(e.target.value)}
                      />
                      {errors.databaseName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.databaseName}
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-2">
                        Table Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter table name"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                      />
                      {errors.tableName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tableName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Table>
                  {/* Table Header */}
                  <TableHeader>
                    <TableRow>
                      {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))
                      )}
                    </TableRow>
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="text-center py-6"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-end gap-4 mt-4">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      csvData.length
                    )}{" "}
                    from {csvData.length} entries
                  </div>
                  <div>
                    {table.getPageCount() > 1 && (
                      <Pagination>
                        <PaginationContent>
                          {/* Previous Button */}
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                table.setPageIndex((prev) =>
                                  Math.max(0, prev - 1)
                                )
                              }
                              disabled={
                                table.getState().pagination.pageIndex === 1
                              }
                              className="cursor-pointer"
                            />
                          </PaginationItem>

                          {/* Page Numbers with Active Page */}
                          {table.getPageCount() <= 3 ? (
                            [...Array(table.getPageCount())].map((_, index) => (
                              <PaginationItem key={index}>
                                <PaginationLink
                                  isActive={
                                    table.getState().pagination.pageIndex ===
                                    index
                                  }
                                  onClick={() => table.setPageIndex(index)}
                                  className={`cursor-pointer ${
                                    table.getState().pagination.pageIndex ===
                                    index
                                      ? "bg-blue-500 text-white"
                                      : "bg-transparent text-black"
                                  }`}
                                  style={{
                                    pointerEvents:
                                      table.getState().pagination.pageIndex ===
                                      index
                                        ? "none"
                                        : "auto",
                                    opacity:
                                      table.getState().pagination.pageIndex ===
                                      index
                                        ? 1
                                        : 0.7,
                                  }}
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))
                          ) : table.getState().pagination.pageIndex < 2 ? (
                            <>
                              {[0, 1, 2].map((index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    isActive={
                                      table.getState().pagination.pageIndex ===
                                      index
                                    }
                                    onClick={() => table.setPageIndex(index)}
                                    className={`cursor-pointer ${
                                      table.getState().pagination.pageIndex ===
                                      index
                                        ? "bg-blue-500 text-white"
                                        : "bg-transparent text-black"
                                    }`}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            </>
                          ) : table.getState().pagination.pageIndex >=
                            table.getPageCount() - 3 ? (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              {[
                                table.getPageCount() - 3,
                                table.getPageCount() - 2,
                                table.getPageCount() - 1,
                              ].map((index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    isActive={
                                      table.getState().pagination.pageIndex ===
                                      index
                                    }
                                    onClick={() => table.setPageIndex(index)}
                                    className={`cursor-pointer ${
                                      table.getState().pagination.pageIndex ===
                                      index
                                        ? "bg-blue-500 text-white"
                                        : "bg-transparent text-black"
                                    }`}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                            </>
                          ) : (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              {[
                                table.getState().pagination.pageIndex - 1,
                                table.getState().pagination.pageIndex,
                                table.getState().pagination.pageIndex + 1,
                              ].map((index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    isActive={
                                      table.getState().pagination.pageIndex ===
                                      index
                                    }
                                    onClick={() => table.setPageIndex(index)}
                                    className={`cursor-pointer ${
                                      table.getState().pagination.pageIndex ===
                                      index
                                        ? "bg-blue-500 text-white"
                                        : "bg-transparent text-black"
                                    }`}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            </>
                          )}

                          {/* Next Button */}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                table.setPageIndex((prev) =>
                                  Math.min(table.getPageCount() - 1, prev + 1)
                                )
                              }
                              disabled={
                                table.getState().pagination.pageIndex ===
                                table.getPageCount() - 1
                              }
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>

                  {/* Rows Per Page Selector */}
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="border rounded p-1"
                  >
                    {[5, 10, 20, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {currentStep === 3 && (
            <div className="step-content text-center p-6">
              <h1 className="text-[36px] font-bold text-gray-700 font-instrument-sans">
                Are you sure?
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to upload this CSV file?
              </p>
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Confirm Upload
                </button>
              </div>
            </div>
          )}

          <SuccessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          {currentStep > 1 && (
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="text-blue-600 h-12 w-40"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={currentStep === 3}
                className="bg-blue-600 text-white h-12 w-40"
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="back_report"
          className="bg-white w-full p-6 rounded-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black">
              Back Report History
            </h3>

            <div className="flex items-center space-x-2 rounded-lg border border-gray-300 dark:bg-gray-900 px-3.5 py-2">
              <SearchIcon className="h-4 w-4" />
              <Input
                type="search"
                placeholder="Search here"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border-0 outline-none shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center">
                  #
                </TableHead>
                <TableHead className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center">
                  File Name
                </TableHead>
                <TableHead className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center">
                  Uploaded Date
                </TableHead>
                <TableHead className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b">
                      {history.originalIndex}
                    </TableCell>
                    <TableCell className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b">
                      {history.filename}
                    </TableCell>
                    <TableCell className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b">
                      {history.date}
                    </TableCell>
                    <TableCell className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b">
                      {history.status}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b text-gray-500"
                  >
                    No history available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

function FileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default BackReporting;
