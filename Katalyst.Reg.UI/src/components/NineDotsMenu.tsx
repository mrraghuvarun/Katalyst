import React, { useState } from "react";
import { Link } from "react-router-dom";

// Import the images
import mifidIcon from "../assets/MIFID.ico";
import dataIngestion from "../assets/dataingestion.jpg";

const NineDotsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* 9-dots icon */}
      <button
        className="text-xl text-gray-800 hover:text-blue-600 transition-colors"
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        ⋮⋮⋮
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 bg-white border border-gray-300 rounded-lg shadow-md w-72 p-4 z-50">
          <ul className="grid grid-cols-3 gap-4">
            <li>
              <Link
                to="/login"
                className="flex flex-col items-center text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <img src={mifidIcon} alt="MIFID" className="w-10 h-10 mb-2" />
                <span className="text-sm">MIFID</span>
              </Link>
            </li>
            <li>
              <Link
                to="/data-ingestion"
                className="flex flex-col items-center text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <img src={dataIngestion} alt="Data Injection" className="w-10 h-10 mb-2" />
                <span className="text-sm">Data Ingestion</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NineDotsMenu;
