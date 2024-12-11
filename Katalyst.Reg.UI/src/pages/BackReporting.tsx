import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import emailjs from "emailjs-com";
import Layout from "../components/Layout.tsx";
import Modal from "../components/HistoryModal.tsx";
import "./BackReporting.css";
import Loading from "../components/Loading.tsx";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
      setLoading(false); // Hide loading page
    }
  };
  

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  // Pagination logic
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return csvData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, rowsPerPage, csvData]);

  const totalPages = Math.ceil(csvData.length / rowsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Layout collapsed={collapsed}>
      {loading ? ( // Show loading page if loading state is true
        <Loading />
      ) : (
      <div className="back-reporting-container">
        <div className="toggle-buttons">
          <button onClick={() => setIsHistoryModalOpen(false)} className="upload-button">
            Upload Process
          </button>
          <button onClick={toggleHistoryModal} className="history-button">
            History
          </button>
        </div>
        <h2>Upload Process</h2>

        <div className="stepper">
          <div className={`step ${currentStep === 1 ? "active" : ""}`}>
            <div className="circle">1</div>
            <p>Upload CSV File</p>
          </div>
          <div className={`step ${currentStep === 2 ? "active" : ""}`}>
            <div className="circle">2</div>
            <p>Data Preview</p>
          </div>
          <div className={`step ${currentStep === 3 ? "active" : ""}`}>
            <div className="circle">3</div>
            <p>Confirm Upload</p>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="step-content">
            <h3>Upload CSV or XLSX File</h3>
            <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
            {file && <span className="file-name">{file.name}</span>}
            <button onClick={handleUpload} disabled={!file} className="upload-button">
              Upload
            </button>
          </div>

        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h3>Data Preview</h3>
              <div className="field">
                <label>
                  Database Name:
                  <input
                    type="text"
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                  />
                </label>
                {errors.databaseName && <p className="error">{errors.databaseName}</p>}
              </div>
              <div className="field">
                <label>
                  Table Name:
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                  />
                </label>
                {errors.tableName && <p className="error">{errors.tableName}</p>}
              </div>

            {/* Rows Per Page Selector */}
            <div className="pagination-controls">
              <label>
                Rows per page:
                <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  {[10, 25, 50, 100, 200].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <table>
              <thead>
                <tr>
                  {csvData.length > 0 &&
                    Object.keys(csvData[0]).map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex}>{value as string}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

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

export default BackReporting;