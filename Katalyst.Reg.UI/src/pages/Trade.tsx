import React, { useState, useEffect } from "react";
import Layout from "../components/Layout.tsx";
import tradeData from "../assets/trade.json";
import * as XLSX from "xlsx";
import { Input } from "@/src/components/ui/input";
import * as FileSaver from "file-saver";
import { Button } from "@/src/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { DocumentDownloadIcon } from "@heroicons/react/outline";
import { Calendar } from "@/src/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import "./Trade.css";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

const COLUMNS = [
  { id: "orderNumber", label: "Order Number", key: "Order Number" },
  { id: "blockIdentifier", label: "Block Identifier", key: "Block Identifier" },
  { id: "securityGroup", label: "Security Group", key: "Security Group" },
  { id: "securityType", label: "Security Type", key: "Security Type" },
  { id: "transactionType", label: "Transaction Type", key: "Transaction Type" },
  { id: "tradeStatus", label: "Trade Status", key: "Trade Status" },
  { id: "touchCount", label: "Touch Count", key: "Touch Count" },
  { id: "securityId", label: "Security ID", key: "Security ID" },
  { id: "isin", label: "ISIN", key: "ISIN" },
  { id: "instrumentName", label: "Instrument Name", key: "Instrument Name" },
  { id: "cfiType", label: "CFI Type", key: "CFI Type" },
  { id: "price", label: "Price", key: "Price" },
  { id: "quantity", label: "Quantity", key: "Quantity" },
  { id: "principal", label: "Principal", key: "Principal" },
  { id: "tradeDate", label: "Trade Date", key: "Trade Date" },
  { id: "settleDate", label: "Settle Date", key: "Settle Date" },
  { id: "trader", label: "Trader", key: "Trader" },
  { id: "ncaStatus", label: "NCA Status", key: "NCA Status" },
  { id: "armStatus", label: "ARM Status", key: "ARM Status" },
] as const;

const Trade: React.FC = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const [filters, setFilters] = useState({
    "Order Number": "",
    "Security ID": "",
    "Trade Date": "",
    "Settle Date": "",
    "Trade Status": "",
    Trader: "",
    "NCA Status": "",
    "ARM Status": "",
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value) {
      setFilteredData(data);
      return;
    }
    const lowercasedValue = value.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(lowercasedValue)
      )
    );
    setFilteredData(filtered);
  };

  const [filteredData, setFilteredData] = useState([]);
  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trade Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(blob, "trade_data.xlsx");
  };

  useEffect(() => {
    // Add unique ids to the data
    const dataWithIds = tradeData.map((item, index) => ({
      ...item,
      id: `trade-${index}`,
    }));
    setData(dataWithIds);
    setFilteredData(dataWithIds);
  }, []);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    const filtered = data.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        if (key.includes("Date")) {
          const rowDate = formatDate(row[key]?.toString() || "");
          return rowDate.includes(value);
        }

        const rowValue = row[key]?.toString().toLowerCase() || "";
        return rowValue.includes(value.toLowerCase());
      });
    });

    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      "Order Number": "",
      "Security ID": "",
      "Trade Date": "",
      "Settle Date": "",
      "Trade Status": "",
      Trader: "",
      "NCA Status": "",
      "ARM Status": "",
    });
    setFilteredData(data);
  };

  // Pagination calculations
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  const renderFilterRow = () => (
    <div className="filter-row p-6 rounded-lg border border-gray-300 mb-6">
      <h3 className="text-2xl font-semibold text-black mb-6">Filter Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(filters).map(([field, value]) => (
          <div
            key={field}
            className="p-2 border border-gray-300 rounded-lg bg-white"
          >
            <label className="block text-sm text-gray-700">{field}</label>
            {field === "Trade Status" ? (
              <select
                value={value}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="w-full border border-white rounded focus:outline-none"
              >
                <option value="">Choose an option</option>
                <option value="New">New</option>
                <option value="Amend">Amend</option>
                <option value="Cancel">Cancel</option>
              </select>
            ) : field.includes("Date") ? (
              <input
                type="date"
                value={value}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="w-full border border-white rounded focus:outline-none"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="w-full border border-white rounded focus:outline-none"
                placeholder={`Enter ${field}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={handleClearFilters} variant="outline" size="lg">
          Clear
        </Button>
        <Button onClick={handleApplyFilters} size="lg">
          Search
        </Button>
      </div>
    </div>
  );

  return (
    <Layout collapsed={false}>
      <div className="bg-white p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-2xl font-semibold text-black mb-6">
              Trade Report
            </h3>
          </div>
          <div className="flex items-center justify-between mb-4 space-x-4">
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
            <Button
              variant="outline"
              className={`flex items-center space-x-2 py-6 ${
                showFilters
                  ? "text-blue-500 border-blue-500 py-6"
                  : "text-black border-gray-300 py-6"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filter Report</span>
              <ChevronDownIcon
                className={`w-4 h-4 transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-4"
            >
              <DocumentDownloadIcon className="h-5 w-5 mr-2" />
              Download as Excel
            </button>
          </div>
        </div>
        {showFilters && renderFilterRow()}
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.id}
                  className="bg-[#EAF3FF] text-black border-0 border-r-2 border-white text-center whitespace-nowrap"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row) => (
              <TableRow key={row.id}>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={`${row.id}-${column.id}`}
                    className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b whitespace-nowrap"
                  >
                    {row[column.key] || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ml-auto max-w-[700px] flex items-center justify-end gap-2 mt-4">
          <p className="text-xs text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {filteredData.length}{" "}
            entries
          </p>

          <div>
            {pageCount > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="cursor-pointer"
                      style={{
                        pointerEvents: currentPage > 0 ? "auto" : "none",
                        opacity: currentPage > 0 ? 1 : 0.5,
                      }}
                    />
                  </PaginationItem>

                  {pageCount <= 3 ? (
                    [...Array(pageCount)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          isActive={currentPage === index}
                          onClick={() => setCurrentPage(index)}
                          className="cursor-pointer"
                          style={{
                            backgroundColor:
                              currentPage === index ? "#007bff" : "transparent",
                            color: currentPage === index ? "#fff" : "#000",
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
                            isActive={currentPage === index}
                            onClick={() => setCurrentPage(index)}
                            className="cursor-pointer"
                            style={{
                              backgroundColor:
                                currentPage === index
                                  ? "#007bff"
                                  : "transparent",
                              color: currentPage === index ? "#fff" : "#000",
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
                  ) : currentPage >= pageCount - 3 ? (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      {[pageCount - 3, pageCount - 2, pageCount - 1].map(
                        (index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              isActive={currentPage === index}
                              onClick={() => setCurrentPage(index)}
                              className="cursor-pointer"
                              style={{
                                backgroundColor:
                                  currentPage === index
                                    ? "#007bff"
                                    : "transparent",
                                color: currentPage === index ? "#fff" : "#000",
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
                              isActive={currentPage === index}
                              onClick={() => setCurrentPage(index)}
                              className="cursor-pointer"
                              style={{
                                backgroundColor:
                                  currentPage === index
                                    ? "#007bff"
                                    : "transparent",
                                color: currentPage === index ? "#fff" : "#000",
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
                        setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
                      }
                      disabled={currentPage === pageCount - 1}
                      className="cursor-pointer"
                      style={{
                        pointerEvents:
                          currentPage < pageCount - 1 ? "auto" : "none",
                        opacity: currentPage < pageCount - 1 ? 1 : 0.5,
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="h-10 w-16 rounded border border-input bg-background px-3 ml-4"
            style={{
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </Layout>
  );
};

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

export default Trade;
