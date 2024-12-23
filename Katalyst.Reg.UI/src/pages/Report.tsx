"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tradeData from "../assets/data.json";
import Layout from "../components/Layout.tsx";
import { ChartContainer } from "@/src/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import "./Report.css";
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

interface TradeDataItem {
  "Reporting Date": string;
  "Total Number of Transactions": number;
  "Total Number of Accepted TRNs": number;
  "Total Number of Submitted TRNs": number;
  "Total Number of Rejected TRNs": number;
  "Total Number of Trade Events": number;
  "Total Number of Trades No Fingerprint": number;
  "Total Number of New Trades": number;
  "Total Number of Amended Trades": number;
}

const tradeDataTyped = tradeData as TradeDataItem[];

const typeMap = {
  Transactions: "Total Number of TRN",
  "Accepted TRNs": "Total Number of TRN Accepted",
  "Submitted TRNs": "Total Number of TRN in Submitted Status",
  "Rejected TRNs": "Total Number of TRN Rejected",
  "Trade Events": "Total Number of Trade Events",
  "Trades No Fingerprint": "Total Number of Trade Events without Fingerprint",
  "New Trades": "Total Number of New Trades",
  "Amended Trades": "Total Number of Trades in Amended Status",
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("Trade Events");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dateRange, setDateRange] = useState("1 Jan 2024 - 10 Jan 2024");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = tradeDataTyped.map((item) => ({
    date: item["Reporting Date"],
    value:
      item[
        typeMap[selectedField as keyof typeof typeMap] as keyof TradeDataItem
      ],
  }));

  const highestValue = Math.max(...chartData.map((item) => Number(item.value)));
  const roundedHighestValue = Math.ceil(highestValue / 100) * 100;

  const chartConfig = {
    value: {
      label: selectedField,
      color: "#2563eb",
    },
  };

  return (
    <Layout collapsed={collapsed}>
      <div className="header-container">
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
            <option value="1 Jan 2024 - 10 Jan 2024">
              1 Jan 2024 - 10 Jan 2024
            </option>
          </select>
        </div>
        <div
          className="field-select"
          style={{ display: "flex", alignItems: "center" }}
        >
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

      <div className="chart-container">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart
            data={chartData}
            width={isMobile ? 300 : 600}
            height={isMobile ? 300 : 400}
          >
            <CartesianGrid vertical={true} />
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
              domain={[0, roundedHighestValue]} // Dynamic scaling based on the rounded highest value
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()} // Formatting numerical ticks with commas
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="value" fill={chartConfig.value.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </Layout>
  );
};

export default Report;
