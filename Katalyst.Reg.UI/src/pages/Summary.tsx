import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.tsx";
import tradeData from "../assets/data.json";
import detailedData from "../assets/trade.json";
import Layout from "../components/Layout.tsx";
import "./Summary.css";
import SummaryCard from "../components/SummaryCard.js";
import { ChartContainer } from "@/src/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import PieChartComponent from './PieChartComponent.tsx'; // Adjust the path as needed
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import "../output.css";
interface TradeDataItem {
  "Reporting Date": string;
  [key: string]: string | number;
}

interface DetailedDataItem {
  "Trade Status": string;
  "Reporting Date": string;
  [key: string]: string | number;
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
  Transactions: (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  "Accepted TRNs": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  "Submitted TRNs": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 12L15 7L20 12M15 17L20 12M10 12H20M10 12L5 7" />
    </svg>
  ),
  "Rejected TRNs": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  "Late Submission TRNs": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-1 0c0-3.86-3.14-7-7-7s-7 3.14-7 7 3.14 7 7 7 7-3.14 7-7zm-7-3v6h4" />
    </svg>
  ),
  "Trade Events": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 12L12 18L6 12M12 6L6 12M12 6L18 12" />
    </svg>
  ),
  "Trades No Fingerprint": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  ),
  "New Trades": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v4M12 18v4M4 12h4M16 12h4M6.343 6.343l2.828 2.828M17.656 17.656l2.828 2.828M6.343 17.656l2.828-2.828M17.656 6.343l2.828-2.828" />
    </svg>
  ),
  "Amended Trades": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 12L15 7L20 12M15 17L20 12M10 12H20M10 12L5 7" />
    </svg>
  ),
  "Cancelled Trades": (
    <svg
      className="card-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
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
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date("2024-01-01"),
    to: new Date("2024-01-10"),
  });
  const [collapsed] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2024-09-06"));
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

  const handleCardClick = (title: string): void => {
    const formattedDate = format(selectedDate, "dd/MM/yyyy");
    const type = typeMap[title];

    let filteredData: DetailedDataItem[];

    if (title === "Trade Events") {
      filteredData = typedDetailedData.filter(
        (item: DetailedDataItem) =>
          ["New", "Amend", "Cancel"].includes(item["Trade Status"]) &&
          item["Reporting Date"] === formattedDate
      );
    } else {
      filteredData = typedDetailedData.filter(
        (item: DetailedDataItem) =>
          item["Trade Status"] === type &&
          item["Reporting Date"] === formattedDate
      );
    }

    setModalData(filteredData);
    setModalTitle(title);
    setModalOpen(true);
  };

  const DateRangePicker = () => {
    return (
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-[220px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
              "w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, "PPP")}
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
  const typeMap = {
    "New Trades": "Total Number of New Trades",
    "Amended Trades": "Total Number of Trades in Amended Status",
    Transactions: "Total Number of TRN",
    "Accepted TRNs": "Total Number of TRN Accepted",
    "Submitted TRNs": "Total Number of TRN in Submitted Status",
    "Rejected TRNs": "Total Number of TRN Rejected",
    "Trade Events": "Total Number of Trade Events",
    "Trades No Fingerprint": "Total Number of Trade Events without Fingerprint",
  };

  const chartData = tradeDataTyped.map((item) => ({
    date: item["Reporting Date"],
    value:
      item[
        typeMap[selectedField as keyof typeof typeMap] as keyof TradeDataItem
      ],
  }));

  const highestValue = Math.max(
    ...chartData.map((item) => parseFloat(item.value as string))
  );
  // Round off the highest value to the nearest 100 (or adjust this as needed)
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
  

  return (
    <Layout collapsed={collapsed}>
      <div className="bg-white p-6 rounded-xl">
      <div className="flex gap-6">
        <h3 className="text-2xl font-semibold text-black mb-6">Summary</h3>
        <div className="date-field">
        <span className="mr-2">Showing:</span>
        <DatePicker />
        </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(typeMap).map((key) => (
            <SummaryCard
              onClick={() => handleCardClick(key)}
              key={key}
              title={key}
              icon={iconMap[key]}
              value={Number(
                selectedData ? selectedData[`Total Number of ${key}`] || 0 : 0
              )}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl mt-2">
        <div className="flex gap-6  md:w-2/3">
          <h3 className="text-2xl font-semibold text-black mb-100">
            Trend Chart
          </h3>
          <div className="date-field">
          <span className="mr-2">Showing:</span>
          <DateRangePicker
            className="ml-2"
            onDateChange={(selectedDate) =>
              setDateRange({
                from: selectedDate?.from || null,
                to: selectedDate?.to || null,
              })
            }
          />
        </div>
          <div className="field-select">
            <span>Showing info: </span>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="info-select"
            >
              {Object.keys(typeMap).map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 w-full">
  {/* Bar Chart Container */}
  <div className="flex-1">
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        data={chartData}
        width={isMobile ? 300 : 600}
        height={isMobile ? 300 : 400}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            });
          }}
        />
        <YAxis
          dataKey="value"
          domain={[0, roundedHighestValue]}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="value" fill={chartConfig.value.color} radius={4} />
      </BarChart>
    </ChartContainer>
  </div>
  {/* Pie Chart Container */}
<div className="w-full md:w-1/3">
    <PieChartComponent selectedData={selectedData} />
  </div>
</div>
        <hr className="my-12 w-full border-b border-gray-200" />

        <div className="data-container">
          <div className="flex gap-6">
            <h3 className="text-2xl font-semibold text-black mb-1">
              Data Dashboard
            </h3>
            <div
              className="date-field"
              style={{ display: "flex", alignItems: "center" }}
            >
              <span>Showing: </span>
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
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent:"flex-end" }}>
          {table.getPageCount() > 1 && (
            <Pagination
            >
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    as="button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    style={{
                      pointerEvents: table.getCanPreviousPage()
                        ? "auto"
                        : "none",
                      opacity: table.getCanPreviousPage() ? 1 : 0.5,
                      cursor: table.getCanPreviousPage()
                        ? "pointer"
                        : "not-allowed",
                    }}
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
                    style={{
                      pointerEvents: table.getCanNextPage() ? "auto" : "none",
                      opacity: table.getCanNextPage() ? 1 : 0.5,
                      cursor: table.getCanNextPage()
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    Next
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div
            className="rows-per-page-selector"
            style={{ marginLeft: "1rem" }}
          >
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