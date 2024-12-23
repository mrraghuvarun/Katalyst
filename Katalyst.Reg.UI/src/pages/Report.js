import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import tradeData from '../assets/data.json';
import Layout from "../components/Layout.tsx";
import "./Report.css";
// Register the required components for Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, // Use ArcElement for Pie charts instead of PieElement
Title, Tooltip, Legend);
// Cast tradeData to the TradeDataItem array type
const tradeDataTyped = tradeData;
const Report = () => {
    const navigate = useNavigate();
    const [collapsed] = useState(false);
    const [selectedField, setSelectedField] = useState("Total Number of Trade Events");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    // Function to check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        // Add event listener
        window.addEventListener('resize', handleResize);
        // Clean up event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Prepare data for both chart types
    const labels = tradeDataTyped.map(item => item["Reporting Date"]);
    const fieldData = tradeDataTyped.map(item => item[selectedField]);
    // Bar Chart Configuration
    const barChartData = {
        labels: labels,
        datasets: [
            {
                label: selectedField,
                data: fieldData,
                backgroundColor: "#3e95cd",
            }
        ]
    };
    // Pie Chart Configuration
    const pieChartData = {
        labels: labels,
        datasets: [
            {
                label: selectedField,
                data: fieldData,
                backgroundColor: [
                    "#FF6387", "#36A2EB", "#FFCE56", "#4BC0C0",
                    "#9966FF", "#FF9F40", "#FF6384", "#36A6EB"
                ],
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: isMobile ? {} : {
            y: {
                beginAtZero: true
            }
        }
    };
    // Define the fields that can be selected in the dropdown
    const fields = [
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
    return (<Layout collapsed={collapsed}>
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
          <select id="fields" value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
            {fields.map((field, index) => (<option key={index} value={field}>
                {field}
              </option>))}
          </select>
        </div>

        <div className="chart-container">
  <h3>Day wise report on {selectedField}</h3>
  <hr />
  <div style={{ height: isMobile ? '300px' : '400px' }}>
    {isMobile ? (<Pie data={pieChartData} options={chartOptions}/>) : (<Bar data={barChartData} options={chartOptions}/>)}
  </div>
    </div>
      </div>
    </Layout>);
};
export default Report;
