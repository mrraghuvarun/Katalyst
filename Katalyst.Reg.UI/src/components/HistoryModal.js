import React from "react";
import "./HistoryModal.css";
import logo from "../assets/logo.png";
const HistoryModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen)
        return null;
    return (<div className="modal-overlay">
      <div className="modal-content">
        {/* Logo Section */}
        <div className="modal-logo">
          <button onClick={onClose} className="cl-button">
            Close
          </button>
          <div className="logo-image-container">
            <img src={logo} // Replace this with your logo's path
     alt="Logo" className="logo-image"/>
          </div>
        </div>

        {/* Header Section */}
        <div className="modal-header">
          <div className="title-container">
            <h2>{title}</h2>
          </div>
        </div>

        {/* Body Section */}
        <div className="modal-body">
          {data.length === 0 ? (<p className="no-data-message">No history available.</p>) : (<table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Uploaded Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((history, index) => (<tr key={index}>
                    <td>{index + 1}</td>
                    <td>{history.filename}</td>
                    <td>{history.date}</td>
                    <td>{history.status}</td>
                  </tr>))}
              </tbody>
            </table>)}
        </div>
      </div>
    </div>);
};
export default HistoryModal;
