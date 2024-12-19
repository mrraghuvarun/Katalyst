import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.tsx";
import Modal from "../components/Modal.tsx";
import tradeData from "../assets/data.json";
import detailedData from "../assets/trade.json";
import Layout from "../components/Layout.tsx";
import "./Summary.css";
// Add type assertions for the imported JSON data
const typedTradeData = tradeData;
const typedDetailedData = detailedData;
const Summary = () => {
    const navigate = useNavigate();
    const [collapsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState("2024-09-06");
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState("");
    const selectedData = typedTradeData.find((item) => item["Reporting Date"] === selectedDate);
    const typeMap = {
        Transactions: "Transaction",
        "Accepted TRNs": "Accepted",
        "Submitted TRNs": "Submitted",
        "Rejected TRNs": "Rejected",
        "Late Submission TRNs": "Late Submission",
        "Trade Events": "Trade Event",
        "Trades No Fingerprint": "No Fingerprint",
        "New Trades": "New",
        "Amended Trades": "Amend",
        "Cancelled Trades": "Cancel"
    };
    const handleCardClick = (title) => {
        const [year, month, day] = selectedDate.split("-");
        const formattedDate = `${day}/${month}/${year}`;
        const type = typeMap[title];
        console.log("Clicked Card Type:", type);
        console.log("Selected Date:", formattedDate);
        let filteredData;
        if (title === "Trade Events") {
            filteredData = typedDetailedData.filter((item) => ["New", "Amend", "Cancel"].includes(item["Trade Status"]) &&
                item["Reporting Date"] === formattedDate);
        }
        else {
            filteredData = typedDetailedData.filter((item) => item["Trade Status"] === type && item["Reporting Date"] === formattedDate);
        }
        setModalData(filteredData);
        setModalTitle(title);
        setModalOpen(true);
    };
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };
    const closeModal = () => setModalOpen(false);
    // Format the selected date for display in the modal
    const formattedModalDate = selectedDate.split("-").reverse().join("/");
    return (<Layout collapsed={collapsed}>
      <div className="header-container">
        <h1 className="text-red-500">Summary Dashboard</h1>
        <div className="tabs">
          <button className="tab active" onClick={() => navigate("/summary")}>
            Summary
          </button>
          <button className="tab" onClick={() => navigate("/report")}>
            Report
          </button>
          <button className="tab" onClick={() => navigate("/data")}>
            Data
          </button>
        </div>
        <div className="reporting-date">
          Reporting Date:
          <input type="date" value={selectedDate} onChange={handleDateChange}/>
        </div>
      </div>


      <div className="cards-container">
      <div className="summary-cards">
        <Card title="Transactions" value={0} icon="shuffle" color="purple" date={selectedDate} onClick={() => handleCardClick("Transactions")}/>
        <Card title="Accepted TRNs" value={selectedData ? selectedData["Total Number of TRN Accepted"] : 0} icon="check" color="green" date={selectedDate} onClick={() => handleCardClick("Accepted TRNs")}/>
        <Card title="Submitted TRNs" value={selectedData ? selectedData["Total Number of TRN in Submitted Status"] : 0} icon="check" color="blue" date={selectedDate} onClick={() => handleCardClick("Submitted TRNs")}/>
        <Card title="Rejected TRNs" value={selectedData ? selectedData["Total Number of TRN Rejected"] : 0} icon="x" color="red" date={selectedDate} onClick={() => handleCardClick("Rejected TRNs")}/>
        <Card title="Late Submission TRNs" value={selectedData ? selectedData["Total Number of Late Submission"] : 0} icon="calendar" color="orange" date={selectedDate} onClick={() => handleCardClick("Late Submission TRNs")}/>
        <Card title="Trade Events" value={selectedData ? selectedData["Total Number of Trade Events"] : 0} icon="cart" color="purple" date={selectedDate} onClick={() => handleCardClick("Trade Events")}/>
        <Card title="Trades No Fingerprint" value={selectedData
            ? selectedData["Total Number of Trade Events without Fingerprint"]
            : 0} icon="fingerprint" color="yellow" date={selectedDate} onClick={() => handleCardClick("Trades No Fingerprint")}/>
        <Card title="New Trades" value={selectedData ? selectedData["Total Number of New Trades"] : 0} icon="plus" color="blue" date={selectedDate} onClick={() => handleCardClick("New Trades")}/>
        <Card title="Amended Trades" value={selectedData ? selectedData["Total Number of Trades in Amended Status"] : 0} icon="edit" color="green" date={selectedDate} onClick={() => handleCardClick("Amended Trades")}/>
        <Card title="Cancelled Trades" value={selectedData ? selectedData["Total Number of Trades in Cancelled Status"] : 0} icon="x" color="red" date={selectedDate} onClick={() => handleCardClick("Cancelled Trades")}/>
      </div>
    </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} data={modalData} title={modalTitle} date={formattedModalDate} // Pass the formatted date to the modal
    />
    </Layout>);
};
export default Summary;
