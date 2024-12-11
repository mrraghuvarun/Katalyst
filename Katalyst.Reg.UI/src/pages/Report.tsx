import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import tradeData from '../assets/data.json';
import Layout from "../components/Layout.tsx";
import "./Report.css";

// Register the required components for Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define a type for the trade data items
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

// Cast tradeData to the TradeDataItem array type
const tradeDataTyped = tradeData as TradeDataItem[];

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed] = useState(false);
  const [selectedField, setSelectedField] = useState<keyof TradeDataItem>("Total Number of Trade Events");

  // Prepare labels and field data for the chart
  const labels = tradeDataTyped.map(item => item["Reporting Date"]);
  const fieldData = tradeDataTyped.map(item => item[selectedField]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: selectedField,
        data: fieldData,
        backgroundColor: "#3e95cd",
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Define the fields that can be selected in the dropdown
  const fields: (keyof TradeDataItem)[] = [
    "Total Number of Trade Events",
    "Total Number of Trade Events without Fingerprint",
    "Total Number of New Trades",
    "Total Number of Trades in Amended Status",
    "Total Number of Trades in Cancelled Status",
    "Total Number of Eligible Trades",
    "Total Number of TRN",
    "Total Number of TRN Accepted",
    "Total Number of TRN in Submitted Status",
    "Total Number of TRN Rejected",
    "Total Number of Late Submission"
  ];

  return (
    <Layout collapsed={collapsed}>
      <div className="header-container">
        <h1>Summary Dashboard</h1>
        <div className="tabs">
          <button className="tab" onClick={() => navigate("/summary")}>
            Summary
          </button>
          <button className="tab active" onClick={() => navigate("/report")}>
            Report
          </button>
          <button className="tab" onClick={() => navigate("/data")}>
            Data
          </button>
        </div>
      </div>
      <div className="cards-container">
      <div className="dropdown-container">
        <label htmlFor="fields">Select a field to display: </label>
        <select
          id="fields"
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value as keyof TradeDataItem)}
        >
          {fields.map((field, index) => (
            <option key={index} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        <h3>Day wise report on {selectedField}</h3>
        <Bar data={chartData} options={options} />
      </div>
      </div>
    </Layout>
  );
};

export default Report;
