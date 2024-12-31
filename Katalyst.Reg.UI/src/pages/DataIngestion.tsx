import React, { useEffect, useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { BlobServiceClient } from '@azure/storage-blob';
import { XCircleIcon } from "lucide-react";
import Layout from "../components/Layout.tsx";
import Modal from "../components/HistoryModal.tsx";
import SuccessModal from "../components/SuccessModal.tsx";
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
} from "@/src/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';

interface UploadHistory {
  originalIndex: number;
  filename: string;
  date: string;
  status: string;
}

const BackReporting: React.FC = () => {
  // Azure Configuration
  const SAS_URL = 'https://mifiddatainjection.blob.core.windows.net/datainjection?sp=racwdli&st=2024-12-30T13:20:41Z&se=2024-12-30T21:20:41Z&sv=2022-11-02&sr=c&sig=cLUGhRPkx0tS181WMDpniNOiG%2BK9WHCRDC%2F8s5fU5Fw%3D';

  // State Management
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
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Computed Properties
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (csvData.length === 0) return [];
    return Object.keys(csvData[0]).map((key) => ({
      accessorKey: key,
      header: key,
    }));
  }, [csvData]);

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

  // Table Instance
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

  // File Handling Functions
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setCsvData(jsonData);
            setCurrentStep(2);
          }
        };
        reader.readAsBinaryString(selectedFile);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCurrentStep(1);
    setCsvData([]);
  };

  // Validation Functions
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

  // Azure Upload Function
  const uploadToAzure = async () => {
    if (!validateFields() || !file) return;
    setLoading(true);

    try {
      // Azure Upload
      const blobServiceClient = new BlobServiceClient(SAS_URL);
      const containerClient = blobServiceClient.getContainerClient('datainjection');
      const blobName = `${Date.now()}-${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      await blockBlobClient.uploadBrowserData(file, {
        blobHTTPHeaders: { blobContentType: file.type }
      });

      // Backend API Call
      const backendUrl = 'http://localhost:7071/api/upload';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobName,
          databaseName,
          tableName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Update History
      setUploadHistory((prev) => [
        ...prev,
        {
          originalIndex: prev.length + 1,
          filename: file.name,
          date: new Date().toLocaleDateString(),
          status: "Uploaded",
        },
      ]);

      // Reset State
      setIsModalOpen(true);
      setFile(null);
      setCsvData([]);
      setDatabaseName("");
      setTableName("");
      setCurrentStep(1);
    } catch (error) {
      console.error("Error during upload:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Navigation Functions
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

  // Search Functions
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
    const filtered = uploadHistory.filter((history) =>
      Object.values(history).some((value) =>
        value.toString().toLowerCase().includes(searchValue.toLowerCase())
      )
    );
    setFilteredHistory(filtered);
  };

  if (loading) {
    return <Loading />;
  }

  const borderColor = (step) =>
    currentStep > step ? "border-green-500" : "border-gray-500";

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <Tabs defaultValue="update_report" className="w-full mt-16">
        <TabsList className="bg-white p-2 py-6 rounded-lg mb-4">
          <TabsTrigger value="update_report">Update Report</TabsTrigger>
          <TabsTrigger value="back_report">Back Report History</TabsTrigger>
        </TabsList>
        <TabsContent value="update_report">
          <div className="bg-white w-full p-6 mb-6 rounded-xl">
            <h3 className="text-xl font-semibold text-black mb-6">
              Upload Process
            </h3>

            {/* Stepper */}
            <div className="stepper flex flex-col md:flex-row lg:flex-row justify-between items-center mb-8 max-w-[800px] mx-auto">
              <div
                className={`step ${currentStep > 1 ? "completed" : ""} ${
                  currentStep === 1 ? "active" : ""
                } flex flex-col items-center`}
              >
                <Button className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                  STEP 1
                </Button>
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
                <Button className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                  STEP 2
                </Button>
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
                <Button className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
                  STEP 3
                </Button>
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

            <hr className="my-2 w-full border-gray-200" />

            {/* Step 1: File Upload */}
            {currentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Select the CSV or XLSX File
                </h3>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {/* File Drop Zone */}
                  <label
                    htmlFor="file-upload"
                    className="border-2 border-dashed border-blue-500 bg-blue-50 text-blue-700 rounded-lg flex sm:h-auto sm:w-auto items-center justify-between p-4 h-[80px] w-full min-w-[400px] cursor-pointer hover:bg-blue-100"
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
                    className={`bg-black text-white hover:bg-gray-800 px-16 py-6 ${
                      !file ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleUpload}
                    disabled={!file}
                  >
                    Upload
                  </Button>
                </div>
              </>
            )}

            {/* Uploaded File Name Display */}
            {file && (
              <div className="inline-block">
                <div className="rounded-lg mt-4 flex items-center justify-between border border-blue-500 bg-blue-50 text-blue-700 h-auto p-2 gap-4">
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <XCircleIcon
                    onClick={handleRemoveFile}
                    className="w-4 h-4 text-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-xl">
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
                              disabled={!table.getCanPreviousPage()}
                              className={`${
                                !table.getCanPreviousPage()
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
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
                              disabled={!table.getCanNextPage()}
                              className={`${
                                !table.getCanNextPage()
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              }`}
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

              <div className="flex justify-end gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  size="lg"
                >
                  Previous
                </Button>
                <Button onClick={handleNextStep} size="lg">
                  Next
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content p-6 bg-white rounded-xl">
              <h3 className="text-lg font-medium text-gray-700 mb-8">
                Data Preview
              </h3>

              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-700 font-instrument-sans">
                  Are you sure?
                </h1>
                <p className="text-sm text-gray-600">
                  Are you sure you want to upload this CSV file?
                </p>
                <div className="flex flex-col md:flex-row lg:flext-row justify-center mt-6 space-x-4">
                  <Button
                    onClick={handlePreviousStep}
                    size="lg"
                    variant="outline"
                    className="mb-2 align-start"
                  >
                    Previous
                  </Button>
                  <Button onClick={uploadToAzure} size="lg">
                    Confirm Upload
                  </Button>
                </div>
              </div>
            </div>
          )}

          <SuccessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
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