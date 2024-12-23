import React from "react";
import { useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaTachometerAlt,
  FaTable,
  FaLayerGroup,
  FaUndo,
  FaArrowAltCircleRight,
  FaSignOutAlt,
  FaFileUpload,
} from "react-icons/fa";
import "./Sidebar.css";

type SidebarProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">{collapsed ? "M" : "MIFID"}</h1>
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
      </div>
      <ul className="nav-links">
        <li>
          <a
            href="/summary"
            className={`nav-item ${
              ["/summary", "/report", "/data"].includes(location.pathname)
                ? "active"
                : ""
            }`}
          >
            <FaTachometerAlt className="icon" />
            <span className="nav-text">{!collapsed && "Summary Report"}</span>
          </a>
        </li>
        <li>
          <a
            href="/trade"
            className={`nav-item ${
              location.pathname === "/trade" ? "active" : ""
            }`}
          >
            <FaTable className="icon" />
            <span className="nav-text">{!collapsed && "Trade Report"}</span>
          </a>
        </li>
        <li>
          <a
            href="/backreporting"
            className={`nav-item ${
              location.pathname === "/backreporting" ? "active" : ""
            }`}
          >
            <FaFileUpload className="icon" />
            <span className="nav-text">{!collapsed && "Back Reporting"}</span>
          </a>
        </li>
        <li>
          <a href="#trn" className="nav-item">
            <FaLayerGroup className="icon" />
            <span className="nav-text">{!collapsed && "TRN Report"}</span>
          </a>
        </li>
        <li>
          <a href="#arm" className="nav-item">
            <FaUndo className="icon" />
            <span className="nav-text">{!collapsed && "ARM Response"}</span>
          </a>
        </li>
        <li>
          <a href="/nca-response" className="nav-item">
            <FaArrowAltCircleRight className="icon" />
            <span className="nav-text">{!collapsed && "NCA Response"}</span>
          </a>
        </li>
        <li>
          <a href="/" className="nav-item logout">
            <FaSignOutAlt className="icon" />
            <span className="nav-text">{!collapsed && "Logout"}</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
