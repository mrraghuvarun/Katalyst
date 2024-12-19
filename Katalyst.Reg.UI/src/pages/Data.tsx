import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import tradeData from "../assets/data.json";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import '../output.css';

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

const tradeDataTyped = tradeData as TradeDataItem[];

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

const Data: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed] = useState<boolean>(false);

  const table = useReactTable({
    data: tradeDataTyped,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Layout collapsed={collapsed}>
      <div className="header-container">
        <h1>Summary Dashboard</h1>
        <div className="tabs">
          <button className="tab" onClick={() => navigate("/summary")}>
            Summary
          </button>
          <button className="tab" onClick={() => navigate("/report")}>
            Report
          </button>
          <button className="tab active" onClick={() => navigate("/data")}>
            Data
          </button>
        </div>
      </div>
      <div className="cards-container">
        <Table>
          <TableCaption>A list of recent trade data.</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className="bg-sky-300" key={column.accessorKey}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <span>
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Data;
