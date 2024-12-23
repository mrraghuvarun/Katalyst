import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NineDotsMenu.css';
// Import the images
import mifidIcon from '../assets/MIFID.ico';
import dataInjectionIcon from '../assets/MIFID.ico';
const NineDotsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (<div className="nine-dots-container">
      {/* 9-dots icon */}
      <button className="nine-dots-icon" onClick={toggleMenu} aria-label="Toggle Menu">
        ⋮⋮⋮
      </button>

      {/* Dropdown menu */}
      {isOpen && (<div className="menu-sheet">
          <ul className="menu-grid">
            <li>
              <Link to="/login" className="menu-item">
                <img src={mifidIcon} alt="MIFID"/>
                <span>MIFID</span>
              </Link>
            </li>
            <li>
              <Link to="/data-injection" className="menu-item">
                <img src={dataInjectionIcon} alt="Data Injection"/>
                <span>Data Injection</span>
              </Link>
            </li>
          </ul>
        </div>)}
    </div>);
};
export default NineDotsMenu;
