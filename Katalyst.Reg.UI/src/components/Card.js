import React from "react";
import { Box } from "lucide-react";
import "./Card.css";
const iconMap = {
    shuffle: () => (<svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>),
    check: () => (<svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 13l4 4L19 7"/>
    </svg>),
};
const Card = ({ title, value, icon, color, onClick }) => {
    const IconComponent = iconMap[icon] || Box;
    return (<div className={`card ${color}`} onClick={onClick}>
      <div className="card-content">
        <div className="card-header">
          <div className="icon-container">
            <IconComponent />
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-value">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="card-footer">
          {/* <ArrowRight className="hyperlink-icon" /> Add a hyperlink indicator */}
        </div>
      </div>
    </div>);
};
export default Card;
