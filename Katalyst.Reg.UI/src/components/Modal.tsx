import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
// Replace with your ShadCN imports
import { flexRender } from "@tanstack/react-table"; // Ensure this is installed and correctly imported

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: Array<Record<string, any>>;
  title: string;
  date: string;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
  date,
}) => {
  const navigate = useNavigate();

  // const handleTradeReportRedirect = () => {
  //   navigate("/trade");
  // };

  if (!isOpen) return null;

  // Generate columns based on data keys
  const columns =
    data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          header: key,
          accessorKey: key,
        }))
      : [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* <div className="modal-header"> */}
        {/* <button onClick={onClose} className="close-button">Close</button>
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
          />
          <button onClick={handleTradeReportRedirect} className="trade-report-button">
            Trade Report
          </button> */}
        {/* </div> */}
        {/* <h2 className="modal-title">
          {title} Details - {date}
        </h2> */}

        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-center w-full">
            <h4 className="text-2xl font-semibold text-gray-800">
              {title} Details
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Date:{" "}
              {new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="modal-table-container">
          {data.length === 0 ? (
            <p className="text-center text-gray-500">
              No data available for the selected card.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center"
                      key={column.accessorKey}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={`${rowIndex}-${colIndex}`}
                        className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b"
                      >
                        {flexRender(row[column.accessorKey], row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
