import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";
import logo from "../assets/logo.png";
const Modal = ({ isOpen, onClose, data, title, date }) => {
    const navigate = useNavigate();
    const handleTradeReportRedirect = () => {
        navigate("/trade");
    };
    if (!isOpen)
        return null;
    return (<div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button onClick={onClose} className="close-button">Close</button>
          <img src={logo} // Replace this with your logo's path
     alt="Logo" className="logo-image"/>
          <button onClick={handleTradeReportRedirect} className="trade-report-button">
            Trade Report
          </button>
        </div>
        <h2 className="modal-title">
          {title} Details - {date}
        </h2>

        <div className="modal-table-container">
          {data.length === 0 ? (<p className="text-center text-gray-500">No data available for the selected card.</p>) : (<table className="modal-table">
              <thead>
                <tr>
                  <th className="modal-table-row-header">#</th>
                  {Object.keys(data[0]).map((key) => (<th key={key}>{key}</th>))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (<tr key={index}>
                    <td className="modal-table-row-header">{index + 1}</td>
                    {Object.values(row).map((value, i) => (<td key={i}>{value}</td>))}
                  </tr>))}
              </tbody>
            </table>)}
        </div>
      </div>
    </div>);
};
export default Modal;
