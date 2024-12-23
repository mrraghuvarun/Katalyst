import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import emailjs from "emailjs-com";
import Layout from "../components/Layout.tsx";
import Modal from "../components/HistoryModal.tsx";
import "./BackReporting.css";
import Loading from "../components/Loading.tsx";
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
} from "@/src/components/ui/table"

interface UploadHistory {
  filename: string;
  date: string;
  status: string;
}

const BackReporting: React.FC = () => {
  const [collapsed] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [databaseName, setDatabaseName] = useState<string>("");
  const [tableName, setTableName] = useState<string>("");
  const [errors, setErrors] = useState<{ databaseName?: string; tableName?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
    setUploadedFile(null);
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

  const handleConfirmUpload = async () => {
    if (!validateFields()) return;
  
    setLoading(true); // Show loading page
  
    try {
      const defaultFileResponse = await fetch("/default.xlsx"); // Replace with actual default file path
      const defaultFileBlob = await defaultFileResponse.blob();
  
      const uploadedWorkbook = XLSX.read(await file!.arrayBuffer(), { type: "array" });
      const defaultWorkbook = XLSX.read(await defaultFileBlob.arrayBuffer(), { type: "array" });
  
      const uploadedData = XLSX.utils.sheet_to_json(uploadedWorkbook.Sheets[uploadedWorkbook.SheetNames[0]]);
      const defaultData = XLSX.utils.sheet_to_json(defaultWorkbook.Sheets[defaultWorkbook.SheetNames[0]]);
  
      let changedRows = 0;
      uploadedData.forEach((row, index) => {
        if (JSON.stringify(row) !== JSON.stringify(defaultData[index])) {
          changedRows++;
        }
      });
  
      const emailParams = {
        to_name: "Recipient Name",
        file_name: file!.name,
        upload_date: new Date().toLocaleDateString(),
        database_name: databaseName,
        table_name: tableName,
        changed_rows: changedRows,
      };
  
      await emailjs.send(
        "service_wwbo9w7",
        "template_c7yghon",
        emailParams,
        "zcZkGQ35dZ0552hi-"
      );
  
      alert("Upload confirmed and email sent successfully!");
  
      setUploadHistory((prevHistory) => [
        ...prevHistory,
        { filename: file!.name, date: new Date().toLocaleDateString(), status: "Uploaded" },
      ]);
  
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
  

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  

  return (
    <Layout collapsed={collapsed}>
      {loading ? ( // Show loading page if loading state is true
        <Loading />
      ) : (
        <div className="bg-white p-6 rounded-xl">
      {/* Toggle Buttons */}
      <div className="toggle-buttons flex gap-4 mb-6">
        <button
          onClick={() => setIsHistoryModalOpen(false)}
          className={`upload-button px-4 py-2 rounded ${
            !isHistoryModalOpen ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Upload Process
        </button>
        <button
          onClick={toggleHistoryModal}
          className={`history-button px-4 py-2 rounded ${
            isHistoryModalOpen ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          History
        </button>
      </div>

      <h2 className="text-lg font-bold mb-6">Upload Process</h2>

      {/* Stepper */}
      <div className="stepper flex justify-between mb-8">
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
              currentStep >= 1 ? "text-blue-700 font-medium" : "text-gray-500"
            }`}
          >
            Upload CSV File
          </p>
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
              currentStep >= 2 ? "text-blue-700 font-medium" : "text-gray-500"
            }`}
          >
            Data Process
          </p>
        </div>

        <div
          className={`step ${currentStep === 3 ? "active" : ""} flex flex-col items-center`}
        >
          <div className="circle bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center rounded-full">
            STEP 3
          </div>
          <p
            className={`textColor mt-2 ${
              currentStep === 3 ? "text-blue-700 font-medium" : "text-gray-500"
            }`}
          >
            Confirm Upload
          </p>
        </div>
      </div>
      <hr className="my-8 w-full border-gray-200" />

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          {/* File Drop Zone */}
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-blue-500 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-between h-[81px] w-[535px] p-4 cursor-pointer hover:bg-blue-100"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Click to <span className="text-blue-500 font-semibold">Upload File</span>
              </span>
              <span className="text-xs text-gray-500">
                Supported files: PDF or CSV
              </span>
            </div>
            <FileIcon className="w-6 h-6 text-blue-500" />
            <input
              id="file-upload"
              type="file"
              accept=".pdf, .csv"
              onChange={handleFileChange}
              className="hidden"
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
            <div className="uploaded-file-display flex items-center justify-between border border-blue-500 bg-blue-50 text-blue-700 rounded-lg px-4 py-2 w-[535px]">
              <span className="text-sm font-medium">{file.name}</span>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>
          )}
<div className="bg-white p-6 rounded-xl">
{currentStep === 2 && (
  <div className="step-content space-y-6">

<div className="mb-6">
  <h3 className="text-lg font-medium text-gray-700 mb-4">Data Preview</h3>
  
  <div className="flex gap-4">
    <div className="flex-1">
      <label className="block text-sm text-gray-600 mb-2">Database Name</label>
      <input
        type="text"
        placeholder="Enter database name"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        value={databaseName}
        onChange={(e) => setDatabaseName(e.target.value)}
      />
      {errors.databaseName && (
        <p className="text-red-500 text-sm mt-1">{errors.databaseName}</p>
      )}
    </div>

    <div className="flex-1">
      <label className="block text-sm text-gray-600 mb-2">Table Name</label>
      <input
        type="text"
        placeholder="Enter table name"
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      {errors.tableName && (
        <p className="text-red-500 text-sm mt-1">{errors.tableName}</p>
      )}
    </div>
  </div>
</div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
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
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </TableBody>
              </Table>

    {/* Pagination Controls */}
    <div className="flex items-center justify-end gap-4 mt-4">
    <div className="text-sm text-gray-500 justify-end">
    Showing{" "}
    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
    to{" "}
    {Math.min(
      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
      csvData.length
    )}{" "}
    from {csvData.length} entries
  </div>
  <Pagination>
    <PaginationContent>
      {/* Previous Button */}
      <PaginationItem>
        <PaginationPrevious
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          style={{
            pointerEvents: table.getCanPreviousPage() ? "auto" : "none",
            opacity: table.getCanPreviousPage() ? 1 : 0.5,
            cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
          }}
        />
      </PaginationItem>

      {/* Page Numbers */}
      {Array.from({ length: table.getPageCount() }, (_, i) => (
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => table.setPageIndex(i)}
            isActive={table.getState().pagination.pageIndex === i}
            style={{
              backgroundColor:
                table.getState().pagination.pageIndex === i
                  ? "rgb(0, 123, 255)"
                  : "transparent",
              color:
                table.getState().pagination.pageIndex === i ? "white" : "black",
              borderRadius: "4px",
              padding: "0.5rem",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      ))}

      {/* Next Button */}
      <PaginationItem>
        <PaginationNext
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          style={{
            pointerEvents: table.getCanNextPage() ? "auto" : "none",
            opacity: table.getCanNextPage() ? 1 : 0.5,
            cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
          }}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>

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
          <div className="step-content">
            <h3>Confirm Upload</h3>
            <p>Are you sure you want to upload this CSV file?</p>
            <button onClick={handleConfirmUpload} className="upload-button">
              Confirm Upload
            </button>
          </div>
        )}

        <div className="navigation-buttons">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="previous-button"
          >
            Previous
          </button>
          <button onClick={handleNextStep} disabled={currentStep === 3} className="next-button">
            Next
          </button>
        </div>

        <Modal
          isOpen={isHistoryModalOpen}
          onClose={toggleHistoryModal}
          data={uploadHistory}
          title="Upload History"
        />
      </div>
      )}
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
export default BackReporting;