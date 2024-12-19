"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  Fingerprint,
  FileText,
  PenTool 
} from 'lucide-react';
import tradeData from "../assets/data.json";
import Layout from "../components/Layout.tsx";
import { ChartContainer } from "@/src/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts";
import "./Report.css";

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

// Icon mapping for each field
const iconMap = {
  "Transactions": <DollarSign size={20} />,
  "Accepted TRNs": <CheckCircle size={20} />,
  "Submitted TRNs": <Clock size={20} />,
  "Rejected TRNs": <XCircle size={20} />,
  "Trade Events": <Calendar size={20} />,
  "Trades No Fingerprint": <Fingerprint size={20} />,
  "New Trades": <FileText size={20} />,
  "Amended Trades": <PenTool size={20} />
};

// Type mapping for data fields
// Update the interface to match exact data fields
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

// Corrected typeMap that matches exact data field names
const typeMap = {
  "Transactions": "Total Number of TRN",
  "Accepted TRNs": "Total Number of TRN Accepted",
  "Submitted TRNs": "Total Number of TRN in Submitted Status",
  "Rejected TRNs": "Total Number of TRN Rejected",
  "Trade Events": "Total Number of Trade Events",
  "Trades No Fingerprint": "Total Number of Trade Events without Fingerprint",
  "New Trades": "Total Number of New Trades",
  "Amended Trades": "Total Number of Trades in Amended Status"
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
    value: item[typeMap[selectedField as keyof typeof typeMap] as keyof TradeDataItem],
  }));

  const chartConfig = {
    desktop: {
      label: selectedField,
      color: "#2563eb",
    },
  };

  return (
    <Layout collapsed={collapsed}>
      <div className="header-container">
        <div className="date-field" style={{ display: 'flex', alignItems: 'center' }}>
          <span>Showing: </span>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="1 Jan 2024 - 10 Jan 2024">1 Jan 2024 - 10 Jan 2024</option>
          </select>
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
  
      <div className="chart-container">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData} width={isMobile ? 300 : 600} height={isMobile ? 300 : 400}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short' 
                });
              }}
            />
            <Bar dataKey="value" fill={chartConfig.desktop.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </Layout>
  );
  
};

export default Report;