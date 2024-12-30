import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.tsx";
import Header from "../components/Header.js";
import tradeData from "../assets/data.json";
import detailedData from "../assets/trade.json";
import Layout from "../components/Layout.tsx";
import "./Summary.css";
import SummaryCard from "../components/SummaryCard.js";
import { ChartContainer } from "@/src/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import PieChartComponent from "./PieChartComponent.tsx"; // Adjust the path as needed
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
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
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import PaidIcon from "@mui/icons-material/PaidRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDoneRounded";
import PriceChangeIcon from "@mui/icons-material/PriceChangeRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeRounded";
import ScheduleSendOutlinedIcon from "@mui/icons-material/ScheduleSendRounded";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintRounded";
import MoneyOutlinedIcon from "@mui/icons-material/MoneyRounded";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import "../output.css";
import BarChartWithAPI from "../components/BarChartWithAPI.js";

interface APIResponse {
  response: {
    reportDate: string;
    tradeEvents: number;
    tradeEventsWoFp: number;
    newTrades: number;
    amendedTrades: number;
    cancelledTrades: number;
    eligibleTrades: number;
    transactions: number;
    acceptedTransactions: number;
    submittedTransactions: number;
    rejectedTransactions: number;
    lateSubmissionTransactions: number;
  };
  correlationId: string;
  statusCode: number;
  message: string;
}

interface RequestBody {
  correlationId: string;
  applicationName: string;
  transactionDate: string;
}

interface TradeDataItem {
  "Reporting Date": string;
  [key: string]: string | number;
}

interface DetailedDataItem {
  "Order Number": number;
  "Trade Status": string;
  "ARM Status": string;
  "Reporting Date": string;
  "Late Submission Only": boolean;
  "No ISIN Only": boolean;
  ISIN: string;
  [key: string]: any;
}

const typedTradeData = tradeData as TradeDataItem[];
const typedDetailedData = detailedData as DetailedDataItem[];

const typeMap: Record<string, string> = {
  Transactions: "Transaction",
  "Accepted TRNs": "Accepted",
  "Submitted TRNs": "Submitted",
  "Rejected TRNs": "Rejected",
  "Late Submission TRNs": "Late Submission",
  "Trade Events": "Trade Event",
  "Trades No Fingerprint": "No Fingerprint",
  "New Trades": "New",
  "Amended Trades": "Amend",
  "Cancelled Trades": "Cancel",
};

const iconMap: Record<string, JSX.Element> = {
  Transactions: <PaidIcon className="card-icon" />,
  "Accepted TRNs": <FileDownloadDoneIcon className="card-icon" />,
  "Submitted TRNs": <AccessTimeOutlinedIcon className="card-icon" />,
  "Rejected TRNs": <ScheduleSendOutlinedIcon className="card-icon" />,
  "Late Submission TRNs": <PaidIcon className="card-icon" />,
  "Trade Events": <MoneyOutlinedIcon className="card-icon" />,
  "Trades No Fingerprint": <FingerprintOutlinedIcon className="card-icon" />,
  "New Trades": <ReceiptIcon className="card-icon" />,
  "Amended Trades": <PriceChangeIcon className="card-icon" />,
  "Cancelled Trades": <PaidIcon className="card-icon" />,
};
interface TradeDataItem {
  "Reporting Date": string;
  "Total Number of Trade Events": number;
  "Total Number of Trade Events without Fingerprint": number;
  "Total Number of New Trades": number;
  "Total Number of Trades in Amended Status": number;
  "Total Number of Trades in Cancelled Status": number;
  "Total Number of Eligible Trades": number;
  "Total Number of TRN": number;
  "Total Number of TRN Accepted": number;
  "Total Number of TRN in Submitted Status": number;
  "Total Number of TRN Rejected": number;
  "Total Number of Late Submission": number;
}
const Summary: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date("2024-09-06"),
    to: new Date("2024-12-10"),
  });
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date("2024-12-14")
  );
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<DetailedDataItem[]>([]);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [selectedField, setSelectedField] =
    useState<keyof TradeDataItem>("New Trades");
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
  const selectedData: TradeDataItem | undefined = typedTradeData.find(
    (item: TradeDataItem) => item["Reporting Date"] === formattedSelectedDate
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // const [dateRange, setDateRange] = useState("1 Jan 2024 - 10 Jan 2024");
  const [apiData, setApiData] = useState<APIResponse["response"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Function to format date to yyyy-mm-dd
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("Formatted date:", formattedDate);
    return formattedDate;
  };
  

  const fetchSummaryData = async (date: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      const formattedDate = formatDateForAPI(date);

      const requestBody: RequestBody = {
        correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        applicationName: "string",
        transactionDate: formattedDate,
      };

      console.log("Request body:", requestBody);

      const response = await fetch(
        `http://localhost:5113/api/v1/MifidTransaction/TransactionSummaryByDate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log("Raw API response:", rawData);

      setApiData(rawData.response);
      console.log("Processed API data:", rawData.response);
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      console.log("Selected date changed:", selectedDate);
      fetchSummaryData(selectedDate);
    }
  }, [selectedDate]);

  const getCardValue = (key: string): number => {
    if (!apiData) {
      console.log("No API data available");
      return 0;
    }

    const apiKey = typeMap[key];
    console.log("Getting value for:", key, "using API key:", apiKey);

    const value = apiData[apiKey as keyof typeof apiData] || 0;
    console.log("Retrieved value:", value);

    return value;
  };

  // Add debug log for render
  console.log("Current API data state:", apiData);

  const handleCardClick = (title: string): void => {
    const formattedDate = format(selectedDate, "dd/MM/yyyy");

    let filteredData = typedDetailedData.filter((item) => {
      const matches = {
        "Amended Trades": item["Trade Status"] === "Amend",
        "New Trades": item["Trade Status"] === "New",
        "Cancelled Trades": item["Trade Status"] === "Cancel",
        "Trade Events": ["New", "Amend", "Cancel"].includes(
          item["Trade Status"]
        ),
        "Accepted TRNs": item["ARM Status"] === "Accepted",
        "Submitted TRNs": item["ARM Status"] === "Submitted",
        "Rejected TRNs": item["ARM Status"] === "Rejected",
        "Late Submission TRNs": item["Late Submission Only"] === true,
        "Trades No Fingerprint": !item["ISIN"] || item["No ISIN Only"] === true,
      };

      return (
        matches[title as keyof typeof matches] &&
        item["Reporting Date"] === formattedDate
      );
    });

    console.log("Filtered Data:", filteredData);
    setModalData(filteredData);
    setModalTitle(title);
    setModalOpen(true);
  };
  const [filteredData, setFilteredData] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  const DateRangePicker = () => {
    return (
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "justify-start text-left text-xs font-semibold",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const DatePicker = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left text-xs font-semibold",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className=" h-4 w-4" />
            {format(selectedDate, "PP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  const closeModal = (): void => setModalOpen(false);

  const formattedModalDate = format(selectedDate, "dd/MM/yyyy");
  const tradeDataTyped = tradeData as TradeDataItem[];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  // Corrected typeMap that matches exact data field names
  const typeMap: Record<string, string> = {
    "Trade Events": "tradeEvents",
    "Trades No Fingerprint": "tradeEventsWoFp",
    "New Trades": "newTrades",
    "Amended Trades": "amendedTrades",
    "Cancelled Trades": "cancelledTrades",
    "Eligible Trades": "eligibleTrades",
    Transactions: "transactions",
    "Accepted TRNs": "acceptedTransactions",
    "Submitted TRNs": "submittedTransactions",
    "Rejected TRNs": "rejectedTransactions",
    "Late Submission TRNs": "lateSubmissionTransactions",
  };

  const chartMap: Record<string, string> = {
    "New Trades": "Total Number of New Trades",
    "Amended Trades": "Total Number of Trades in Amended Status",
    Transactions: "Total Number of TRN",
    "Accepted TRNs": "Total Number of TRN Accepted",
    "Submitted TRNs": "Total Number of TRN in Submitted Status",
    "Rejected TRNs": "Total Number of TRN Rejected",
    "Trade Events": "Total Number of Trade Events",
    "Trades No Fingerprint": "Total Number of Trade Events without Fingerprint",
    "Cancelled Trades": "Total Number of Trades in Cancelled Status",
    "Eligible Trades": "Total Number of Eligible Trades",
  };

  const chartData = tradeDataTyped
    .filter((item) => {
      const date = new Date(item["Reporting Date"]);
      return dateRange?.from && dateRange?.to
        ? date >= dateRange.from && date <= dateRange.to
        : true;
    })
    .map((item) => ({
      date: item["Reporting Date"],
      value:
        item[
          chartMap[
            selectedField as keyof typeof chartMap
          ] as keyof TradeDataItem
        ],
    }));

  const highestValue = Math.max(
    ...chartData.map((item) => parseFloat(item.value as string))
  );

  const roundedHighestValue = Math.ceil(highestValue / 100) * 100;

  const chartConfig = {
    value: {
      label: selectedField,
      color: "#2563eb",
    },
  };

  const columns: ColumnDef<TradeDataItem>[] = [
    {
      header: "Reporting Date",
      accessorKey: "Reporting Date",
    },
    {
      header: "Total Number of Trade Events",
      accessorKey: "Total Number of Trade Events",
    },
    {
      header: "Total Number of Trade Events without Fingerprint",
      accessorKey: "Total Number of Trade Events without Fingerprint",
    },
    {
      header: "Total Number of New Trades",
      accessorKey: "Total Number of New Trades",
    },
    {
      header: "Total Number of Trades in Amended Status",
      accessorKey: "Total Number of Trades in Amended Status",
    },
    {
      header: "Total Number of Trades in Cancelled Status",
      accessorKey: "Total Number of Trades in Cancelled Status",
    },
    {
      header: "Total Number of Eligible Trades",
      accessorKey: "Total Number of Eligible Trades",
    },
    {
      header: "Total Number of TRN",
      accessorKey: "Total Number of TRN",
    },
    {
      header: "Total Number of TRN Accepted",
      accessorKey: "Total Number of TRN Accepted",
    },
    {
      header: "Total Number of TRN in Submitted Status",
      accessorKey: "Total Number of TRN in Submitted Status",
    },
    {
      header: "Total Number of TRN Rejected",
      accessorKey: "Total Number of TRN Rejected",
    },
    {
      header: "Total Number of Late Submission",
      accessorKey: "Total Number of Late Submission",
    },
  ];

  const table = useReactTable({
    data: tradeDataTyped,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
  });

  useEffect(() => {
    // Fetch or filter your data here and set it to filteredData
    const data = tradeDataTyped; // Replace with your data fetching logic
    setFilteredData(data);

    // Set startIndex and endIndex based on your pagination logic
    const { pageIndex, pageSize } = table.getState().pagination;
    setStartIndex(pageIndex * pageSize);
    setEndIndex(Math.min((pageIndex + 1) * pageSize, data.length));
  }, [table.getState().pagination]);

  return (
    <Layout>
      <div className="bg-white p-6 rounded-xl mt-16">
        <div className="flex flex-col md:flex-row gap-2 md:gap-12 mb-6">
          <h3 className="text-2xl font-semibold text-black">Summary</h3>
          <div className="date-field">
            <p className="text-sm text-gray-700">Showing: </p>
            <DatePicker />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.keys(typeMap).map((key) => (
              <SummaryCard
                onClick={() => handleCardClick(key)}
                key={key}
                title={key}
                icon={iconMap[key]}
                value={getCardValue(key)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-6 rounded-xl rounded-b-none col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <h3 className="text-2xl font-semibold text-black">Trend Chart</h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">Showing:</p>
              <DateRangePicker
                onDateChange={(selectedDate) =>
                  setDateRange({
                    from: selectedDate?.from || null,
                    to: selectedDate?.to || null,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">Showing info: </p>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="info-select"
              >
                {Object.keys(chartMap).map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Bar Chart Container */}
            <BarChartWithAPI
              dateRange={dateRange}
              selectedField={selectedField}
              isMobile={isMobile}
            />
          </div>

          <hr className="mt-6 w-full border-b-1 border-gray-200" />
        </div>

        <div className="bg-white p-6 rounded-xl col-span-1 mb-4">
          <PieChartComponent />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 pt-2 rounded-t-none">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
          <h3 className="text-2xl font-semibold text-black mb-1">
            Data Dashboard
          </h3>
          <div
            className="date-field"
            style={{ display: "flex", alignItems: "center" }}
          >
            <p className="text-sm text-gray-700">Showing: </p>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="date-select"
            >
              <option value="All">All</option>
            </select>
          </div>
        </div>

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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-0 bg-white py-6 px-4 text-center min-w-32 border-b"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="ml-auto max-w-[700px] flex flex-col md:flex-row lg:flex-row items-center justify-end gap-2 mt-4">
        <p className="text-xs text-gray-500">
          Showing {startIndex + 1} to {endIndex} of {filteredData.length}{" "}
          entries
        </p>
        <div>
          {table.getPageCount() > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    as="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`transition-opacity ${
                      !table.getCanPreviousPage()
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100 cursor-pointer"
                    }`}
                  >
                    Previous
                  </PaginationPrevious>
                </PaginationItem>

                {table.getPageCount() <= 3 ? (
                  [...Array(table.getPageCount())].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        as="button"
                        isActive={
                          table.getState().pagination.pageIndex === index
                        }
                        onClick={() => table.setPageIndex(index)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            table.getState().pagination.pageIndex === index
                              ? "#007bff"
                              : "transparent",
                          color:
                            table.getState().pagination.pageIndex === index
                              ? "#fff"
                              : "#000",
                        }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                ) : table.getState().pagination.pageIndex < 3 ? (
                  <>
                    {[...Array(3)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          as="button"
                          isActive={
                            table.getState().pagination.pageIndex === index
                          }
                          onClick={() => table.setPageIndex(index)}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              table.getState().pagination.pageIndex === index
                                ? "#007bff"
                                : "transparent",
                            color:
                              table.getState().pagination.pageIndex === index
                                ? "#fff"
                                : "#000",
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
                ) : table.getState().pagination.pageIndex >=
                  table.getPageCount() - 2 ? (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    {[...Array(2)].map((_, index) => (
                      <PaginationItem key={table.getPageCount() - 2 + index}>
                        <PaginationLink
                          as="button"
                          isActive={
                            table.getState().pagination.pageIndex ===
                            table.getPageCount() - 2 + index
                          }
                          onClick={() =>
                            table.setPageIndex(table.getPageCount() - 2 + index)
                          }
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              table.getState().pagination.pageIndex ===
                              table.getPageCount() - 2 + index
                                ? "#007bff"
                                : "transparent",
                            color:
                              table.getState().pagination.pageIndex ===
                              table.getPageCount() - 2 + index
                                ? "#fff"
                                : "#000",
                          }}
                        >
                          {table.getPageCount() - 2 + index + 1}
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
                    ].map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          as="button"
                          isActive={
                            table.getState().pagination.pageIndex === page
                          }
                          onClick={() => table.setPageIndex(page)}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              table.getState().pagination.pageIndex === page
                                ? "#007bff"
                                : "transparent",
                            color:
                              table.getState().pagination.pageIndex === page
                                ? "#fff"
                                : "#000",
                          }}
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    as="button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className={`transition-opacity ${
                      !table.getCanNextPage()
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100 cursor-pointer"
                    }`}
                  >
                    Next
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        <div className="rows-per-page-selector" style={{ marginLeft: "1rem" }}>
          <select
            defaultValue={5}
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{
              height: "38px",
              width: "50px",
              padding: "0",
              borderRadius: "4px",
              border: "1px solid #ccc",
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
        title={modalTitle}
        date={formattedModalDate}
      />
    </Layout>
  );
};
export default Summary;
