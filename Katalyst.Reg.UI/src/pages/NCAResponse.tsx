import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Layout from "../components/Layout.tsx";
import tradeData from "../assets/trade.json"; 
import { FaFilter } from "react-icons/fa";
import * as XLSX from 'xlsx'; 
import * as FileSaver from 'file-saver';
import "./Trade.css";

type TradeData = {
  "Order Number"?: string;
  "Block Identifier"?: string;
  "Security Group"?: string;
  "Security Type"?: string;
  "Transaction Type"?: string;
  "Trade Status"?: string;
  "Touch Count"?: string;
  "Security ID"?: string;
  ISIN?: string;
  "Instrument Name"?: string;
  "CFI Type"?: string;
  Price?: string;
  Quantity?: string;
  Principal?: string;
  "Trade Date"?: string;
  "Settle Date"?: string;
  Trader?: string;
  "NCA Status"?: string;
  "ARM Status"?: string;
};

const Trade: React.FC = () => {
  const [data, setData] = useState<TradeData[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchStates, setSearchStates] = useState<{
    [key in keyof TradeData]?: string;
  }>({
    "Order Number": "",
    "Block Identifier": "",
    "Security Group": "",
    "Security Type": "",
    "Transaction Type": "",
    "Trade Status": "",
    "Touch Count": "",
    "Security ID": "",
    ISIN: "",
    "Instrument Name": "",
    "CFI Type": "",
    Price: "",
    Quantity: "",
    Principal: "",
    "Trade Date": "",
    "Settle Date": "",
    Trader: "",
    "NCA Status": "",
    "ARM Status": "",
  });
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    "Order Number": "",
    "Security ID": "",
    "Trade Date": "",
    "Settle Date": "",
    "Trade Status":"",
    Trader: "",
    "NCA Status": "",
    "ARM Status": "",
  });

  const [filteredData, setFilteredData] = useState<TradeData[]>([]);

  useEffect(() => {
    setData(tradeData as TradeData[]);
    setFilteredData(tradeData as TradeData[]);
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    // Returning the date as a string in the format YYYY-MM-DD for accurate comparison
    return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      "Order Number": "",
      "Security ID": "",
      "Trade Date": "",
      "Settle Date": "",
      "Trade Status":"",
      Trader: "",
      "NCA Status": "",
      "ARM Status": "",
    });
    setFilteredData(data);
  };

  const handleApplyFilters = () => {
    const formattedFilters = {
      ...filters,
      "Trade Date": formatDate(filters["Trade Date"]),
      "Settle Date": formatDate(filters["Settle Date"]),
    };

    const filtered = data.filter((row) => {
      return Object.keys(formattedFilters).every((key) => {
        const filterValue = formattedFilters[key];
        if (!filterValue) return true; // Skip empty filters
        
        if (key === "Trade Date" || key === "Settle Date") {
          // Compare dates correctly by converting the row date to the same format (YYYY-MM-DD)
          const rowDate = formatDate((row[key as keyof TradeData] ?? '').toString());

          return rowDate.includes(filterValue); // Compare date string
        }
  
        // For other fields, use a text comparison
        return row[key as keyof TradeData]?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  
    setFilteredData(filtered);
  };

  const renderFilterRow = () => (
    <div className="filter-row custom-bg p-4 rounded mb-4">
      <div className="grid custom-grid">
        {Object.keys(filters).map((field) => (
          <div key={field} className="filter-field">
            <label className="label-text">{field}</label>
            {field === "Trade Status" ? (
              <select
                value={filters[field] || ""}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="input-field"
              >
                <option value="">Choose an option</option>
                <option value="New">New</option>
                <option value="Amend">Amend</option>
                <option value="Cancel">Cancel</option>
              </select>
            ) : field === "Trade Date" || field === "Settle Date" ? (
              <input
                type="date"
                value={filters[field] || ""}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="input-field"
              />
            ) : (
              <input
                type="text"
                value={filters[field] || ""}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="input-field"
                placeholder={`Enter ${field}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="filter-actions">
        <button onClick={handleClearFilters} className="close-button">
          Clear
        </button>
        <button onClick={handleApplyFilters} className="apply-button">
          Apply
        </button>
      </div>
    </div>
  );
  
  

  useEffect(() => {
    const filtered = data.filter((row) => {
      const matchesGlobalSearch = Object.values(row).some(
        (value) =>
          value != null &&
          value.toString().toLowerCase().includes(search.toLowerCase())
      );
  
      const matchesFieldSearch = Object.keys(searchStates).every((key) => 
        !searchStates[key as keyof TradeData] || 
        row[key as keyof TradeData]?.toString().toLowerCase().includes(
          searchStates[key as keyof TradeData]?.toLowerCase() || ""
        )
      );
  
      return matchesGlobalSearch && matchesFieldSearch;
    });
  
    setFilteredData(filtered);
  }, [search, searchStates, data]);

  const handleSearchChange = (field: keyof TradeData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStates((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trade Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(blob, 'trade_data.xlsx');
  };

  const columns = [
    {
      name: (
        <div>
          Order Number
          <input
            type="text"
            placeholder="Search Order Number..."
            value={searchStates["Order Number"]}
            onChange={handleSearchChange("Order Number")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Order Number"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Block Identifier
          <input
            type="text"
            placeholder="Search Block Identifier..."
            value={searchStates["Block Identifier"]}
            onChange={handleSearchChange("Block Identifier")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Block Identifier"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Security Group
          <input
            type="text"
            placeholder="Search Security Group..."
            value={searchStates["Security Group"]}
            onChange={handleSearchChange("Security Group")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Security Group"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Security Type
          <input
            type="text"
            placeholder="Search Security Type..."
            value={searchStates["Security Type"]}
            onChange={handleSearchChange("Security Type")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Security Type"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Transaction Type
          <input
            type="text"
            placeholder="Search Transaction Type..."
            value={searchStates["Transaction Type"]}
            onChange={handleSearchChange("Transaction Type")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Transaction Type"] || "",
      sortable: false,
    },
    {
      name: (
        <div>
          Trade Status
          <input
            type="text"
            placeholder="Search Trade Status..."
            value={searchStates["Trade Status"]}
            onChange={handleSearchChange("Trade Status")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Trade Status"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Touch Count
          <input
            type="text"
            placeholder="Search Touch Count..."
            value={searchStates["Touch Count"]}
            onChange={handleSearchChange("Touch Count")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Touch Count"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Security ID
          <input
            type="text"
            placeholder="Search Security ID..."
            value={searchStates["Security ID"]}
            onChange={handleSearchChange("Security ID")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Security ID"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          ISIN
          <input
            type="text"
            placeholder="Search ISIN..."
            value={searchStates["ISIN"]}
            onChange={handleSearchChange("ISIN")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["ISIN"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Instrument Name
          <input
            type="text"
            placeholder="Search Instrument Name..."
            value={searchStates["Instrument Name"]}
            onChange={handleSearchChange("Instrument Name")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Instrument Name"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          CFI Type
          <input
            type="text"
            placeholder="Search CFI Type..."
            value={searchStates["CFI Type"]}
            onChange={handleSearchChange("CFI Type")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["CFI Type"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Price
          <input
            type="text"
            placeholder="Search Price..."
            value={searchStates["Price"]}
            onChange={handleSearchChange("Price")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Price"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Quantity
          <input
            type="text"
            placeholder="Search Quantity..."
            value={searchStates["Quantity"]}
            onChange={handleSearchChange("Quantity")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Quantity"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Principal
          <input
            type="text"
            placeholder="Search Principal..."
            value={searchStates["Principal"]}
            onChange={handleSearchChange("Principal")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Principal"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Trade Date
          <input
            type="text"
            placeholder="Search Trade Date..."
            value={searchStates["Trade Date"]}
            onChange={handleSearchChange("Trade Date")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Trade Date"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Settle Date
          <input
            type="text"
            placeholder="Search Settle Date..."
            value={searchStates["Settle Date"]}
            onChange={handleSearchChange("Settle Date")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Settle Date"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          Trader
          <input
            type="text"
            placeholder="Search Trader..."
            value={searchStates["Trader"]}
            onChange={handleSearchChange("Trader")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["Trader"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          NCA Status
          <input
            type="text"
            placeholder="Search NCA Status..."
            value={searchStates["NCA Status"]}
            onChange={handleSearchChange("NCA Status")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row: TradeData) => row["NCA Status"]|| "",
      sortable: false,
    },
    {
      name: (
        <div>
          ARM Status
          <input
            type="text"
            placeholder="Search ARM Status..."
            value={searchStates["ARM Status"]}
            onChange={handleSearchChange("ARM Status")}
            className="search"
            style={{ display: "block", marginTop: "5px", fontSize: "12px", padding: "4px" }}
          />
        </div>
      ),
      selector: (row) => row["ARM Status"] || "",
      sortable: false,
    },
  ];
  

  return (
    <Layout collapsed={false}>
      <div className="trade-content">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h1 style={{ marginRight: "10px" }}>NCA Response</h1>
            <FaFilter 
              size={24} 
              className="filter-icon cursor-pointer" 
              onClick={() => setShowFilters(!showFilters)} 
              style={{ color: showFilters ? 'blue' : 'black' }} 
            />
          </div>
        </div>
  
        <div className="flex justify-between items-center mb-4">
          <input 
            type="text" 
            placeholder="Search" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="search-bar" 
          />
          <button className="button" onClick={handleDownload}>
            Download as Excel
          </button>
        </div>
  
        {/* Move filter row after search bar */}
        {showFilters && (
          <div className="filter-container">
            {renderFilterRow()}
          </div>
        )}
  
        <DataTable 
          columns={columns} 
          data={filteredData} 
          pagination 
          responsive 
          striped 
          highlightOnHover 
          persistTableHead 
        />
      </div>
    </Layout>
  );
};

export default Trade;