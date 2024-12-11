import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.tsx";
import Modal from "../components/Modal.tsx";
import tradeData from "../assets/data.json";
import detailedData from "../assets/trade.json";
import Layout from "../components/Layout.tsx";
import "./Summary.css";

interface TradeDataItem {
  "Reporting Date": string;
  "Total Number of TRN Accepted": number;
  "Total Number of TRN in Submitted Status": number;
  "Total Number of TRN Rejected": number;
  "Total Number of Late Submission": number;
  "Total Number of Trade Events": number;
  "Total Number of Trade Events without Fingerprint": number;
  "Total Number of New Trades": number;
  "Total Number of Trades in Amended Status": number;
  "Total Number of Trades in Cancelled Status": number;
}

interface DetailedDataItem {
  "Trade Status": string;
  "Reporting Date": string;
  [key: string]: string | number;
}

// Add type assertions for the imported JSON data
const typedTradeData = tradeData as TradeDataItem[];
const typedDetailedData = detailedData as DetailedDataItem[];

interface TypeMap {
  [key: string]: string;
}

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("2024-09-06");
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<DetailedDataItem[]>([]);
  const [modalTitle, setModalTitle] = useState<string>("");
  const selectedData: TradeDataItem | undefined = typedTradeData.find(
    (item: TradeDataItem) => item["Reporting Date"] === selectedDate
  );

  const typeMap: TypeMap = {
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

  const handleCardClick = (title: string): void => {
    const [year, month, day] = selectedDate.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    const type = typeMap[title];

    console.log("Clicked Card Type:", type);
    console.log("Selected Date:", formattedDate);

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
          item["Trade Status"] === type && item["Reporting Date"] === formattedDate
      );
    }

    setModalData(filteredData);
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  const closeModal = (): void => setModalOpen(false);

  // Format the selected date for display in the modal
  const formattedModalDate = selectedDate.split("-").reverse().join("/");

  return (
    <Layout collapsed={collapsed}>
      <div className="header-container">
        <h1>Summary Dashboard</h1>
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
          <input type="date" value={selectedDate} onChange={handleDateChange} />
        </div>
      </div>


      <div className="cards-container">
      <div className="summary-cards">
        <Card
          title="Transactions"
          value={0}
          icon="shuffle"
          color="purple"
          date={selectedDate}
          onClick={() => handleCardClick("Transactions")}
        />
        <Card
          title="Accepted TRNs"
          value={selectedData ? selectedData["Total Number of TRN Accepted"] : 0}
          icon="check"
          color="green"
          date={selectedDate}
          onClick={() => handleCardClick("Accepted TRNs")}
        />
        <Card
          title="Submitted TRNs"
          value={selectedData ? selectedData["Total Number of TRN in Submitted Status"] : 0}
          icon="check"
          color="blue"
          date={selectedDate}
          onClick={() => handleCardClick("Submitted TRNs")}
        />
        <Card
          title="Rejected TRNs"
          value={selectedData ? selectedData["Total Number of TRN Rejected"] : 0}
          icon="x"
          color="red"
          date={selectedDate}
          onClick={() => handleCardClick("Rejected TRNs")}
        />
        <Card
          title="Late Submission TRNs"
          value={selectedData ? selectedData["Total Number of Late Submission"] : 0}
          icon="calendar"
          color="orange"
          date={selectedDate}
          onClick={() => handleCardClick("Late Submission TRNs")}
        />
        <Card
          title="Trade Events"
          value={selectedData ? selectedData["Total Number of Trade Events"] : 0}
          icon="cart"
          color="purple"
          date={selectedDate}
          onClick={() => handleCardClick("Trade Events")}
        />
        <Card
          title="Trades No Fingerprint"
          value={
            selectedData
              ? selectedData["Total Number of Trade Events without Fingerprint"]
              : 0
          }
          icon="fingerprint"
          color="yellow"
          date={selectedDate}
          onClick={() => handleCardClick("Trades No Fingerprint")}
        />
        <Card
          title="New Trades"
          value={selectedData ? selectedData["Total Number of New Trades"] : 0}
          icon="plus"
          color="blue"
          date={selectedDate}
          onClick={() => handleCardClick("New Trades")}
        />
        <Card
          title="Amended Trades"
          value={
            selectedData ? selectedData["Total Number of Trades in Amended Status"] : 0
          }
          icon="edit"
          color="green"
          date={selectedDate}
          onClick={() => handleCardClick("Amended Trades")}
        />
        <Card
          title="Cancelled Trades"
          value={
            selectedData ? selectedData["Total Number of Trades in Cancelled Status"] : 0
          }
          icon="x"
          color="red"
          date={selectedDate}
          onClick={() => handleCardClick("Cancelled Trades")}
        />
      </div>
    </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
        title={modalTitle}
        date={formattedModalDate}  // Pass the formatted date to the modal
      />
    </Layout>
  );
};

export default Summary;
