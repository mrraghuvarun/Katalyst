import React, { useState, useEffect } from "react";
import { XCircleIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/src/components/ui/pagination";
import "./Modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: Array<Record<string, any>>;
  title: string;
  date: string;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data, title, date }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      // Reset pagination when modal is closed
      setCurrentPage(1);
      setItemsPerPage(3); // Reset itemsPerPage as well
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice(startIndex, endIndex);

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
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-center w-full">
            <h4 className="text-2xl font-semibold text-gray-800">
              {title} Details
            </h4>
            {date && (
              <p className="text-sm text-gray-600 mt-2">
                Date:{" "}
                {(() => {
                  const [day, month, year] = date.split("/");
                  return new Date(`${year}-${month}-${day}`).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );
                })()}
              </p>
            )}
          </div>
          <XCircleIcon
            onClick={onClose}
            className="w-6 h-6 text-gray-500 cursor-pointer"
          />
        </div>

        <div className="modal-table-container">
          {data.length === 0 ? (
            <p className="text-center text-gray-500">
              No data available for the selected card.
            </p>
          ) : (
            <>
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
                  {currentData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={`${rowIndex}-${colIndex}`}
                          className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b"
                        >
                          {row[column.accessorKey]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="ml-auto max-w-[700px] flex flex-col md:flex-row lg:flex-row items-center justify-end gap-2 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, data.length)}{" "}
                  of {data.length}
                </div>

                <div className="flex items-end gap-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          style={{
                            cursor:
                              currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1,
                          }}
                        />
                      </PaginationItem>

                      {totalPages <= 3 ? (
                        [...Array(totalPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              isActive={currentPage === index + 1}
                              onClick={() => setCurrentPage(index + 1)}
                              className="cursor-pointer"
                              style={{
                                backgroundColor:
                                  currentPage === index + 1
                                    ? "#007bff"
                                    : "transparent",
                                color:
                                  currentPage === index + 1 ? "#fff" : "#000",
                              }}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))
                      ) : currentPage < 2 ? (
                        <>
                          {[0, 1, 2].map((index) => (
                            <PaginationItem key={index}>
                              <PaginationLink
                                isActive={currentPage === index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className="cursor-pointer"
                                style={{
                                  backgroundColor:
                                    currentPage === index + 1
                                      ? "#007bff"
                                      : "transparent",
                                  color:
                                    currentPage === index + 1 ? "#fff" : "#000",
                                }}
                              >
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        </>
                      ) : currentPage >= totalPages - 2 ? (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          {[totalPages - 3, totalPages - 2, totalPages - 1].map(
                            (index) => (
                              <PaginationItem key={index}>
                                <PaginationLink
                                  isActive={currentPage === index + 1}
                                  onClick={() => setCurrentPage(index + 1)}
                                  className="cursor-pointer"
                                  style={{
                                    backgroundColor:
                                      currentPage === index + 1
                                        ? "#007bff"
                                        : "transparent",
                                    color:
                                      currentPage === index + 1
                                        ? "#fff"
                                        : "#000",
                                  }}
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}
                        </>
                      ) : (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          {[currentPage - 1, currentPage, currentPage + 1].map(
                            (index) => (
                              <PaginationItem key={index}>
                                <PaginationLink
                                  isActive={currentPage === index + 1}
                                  onClick={() => setCurrentPage(index + 1)}
                                  className="cursor-pointer"
                                  style={{
                                    backgroundColor:
                                      currentPage === index + 1
                                        ? "#007bff"
                                        : "transparent",
                                    color:
                                      currentPage === index + 1
                                        ? "#fff"
                                        : "#000",
                                  }}
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          style={{
                            cursor:
                              currentPage === totalPages
                                ? "not-allowed"
                                : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-10 w-16 rounded border border-input bg-background px-3 ml-4"
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
