import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import "./Data.css";
import tradeData from '../assets/data.json';
const tradeDataTyped = tradeData;
const Data = () => {
    const navigate = useNavigate();
    const [collapsed] = useState(false);
    return (<Layout collapsed={collapsed}>
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
      <table className="data-table">
        <thead>
          <tr>
            <th>Reporting Date</th>
            <th>Total Number of Trade Events</th>
            <th>Total Number of Trade Events without Fingerprint</th>
            <th>Total Number of New Trades</th>
            <th>Total Number of Trades in Amended Status</th>
            <th>Total Number of Trades in Cancelled Status</th>
            <th>Total Number of Eligible Trades</th>
            <th>Total Number of TRN</th>
            <th>Total Number of TRN Accepted</th>
            <th>Total Number of TRN in Submitted Status</th>
            <th>Total Number of TRN Rejected</th>
            <th>Total Number of Late Submission</th>
          </tr>
        </thead>
        <tbody>
          {tradeDataTyped.map((item, index) => (<tr key={index}>
              <td>{item["Reporting Date"]}</td>
              <td>{item["Total Number of Trade Events"]}</td>
              <td>{item["Total Number of Trade Events without Fingerprint"]}</td>
              <td>{item["Total Number of New Trades"]}</td>
              <td>{item["Total Number of Trades in Amended Status"]}</td>
              <td>{item["Total Number of Trades in Cancelled Status"]}</td>
              <td>{item["Total Number of Eligible Trades"]}</td>
              <td>{item["Total Number of TRN"]}</td>
              <td>{item["Total Number of TRN Accepted"]}</td>
              <td>{item["Total Number of TRN in Submitted Status"]}</td>
              <td>{item["Total Number of TRN Rejected"]}</td>
              <td>{item["Total Number of Late Submission"]}</td>
            </tr>))}
        </tbody>
      </table>
      </div>
    </Layout>);
};
export default Data;
