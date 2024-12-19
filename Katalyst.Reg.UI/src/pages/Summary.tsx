import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.tsx";
import tradeData from "../assets/data.json";
import detailedData from "../assets/trade.json";
import Layout from "../components/Layout.tsx";
import "./Summary.css";
import { ArrowUpRight } from "lucide-react";
import SummaryCard from "../components/SummaryCard.js";

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

  const handleCardClick = (title: string): void => {
    const [year, month, day] = selectedDate.split("-");
    const formattedDate = `${day}/${month}/${year}`;
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedDate(e.target.value);
  };

  const closeModal = (): void => setModalOpen(false);

  const formattedModalDate = selectedDate.split("-").reverse().join("/");

  return (
    <Layout collapsed={collapsed}>
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-2xl font-semibold text-black mb-6">Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(typeMap).map((key) => (
            <SummaryCard
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
