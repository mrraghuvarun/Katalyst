import React from 'react';
import { Link } from 'react-router-dom';
import NineDotsMenu from './NineDotsMenu.tsx';
import './Navbar.css';

const Topbar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="topbar-wrapper">
        <Link to="/" className="topbar-logo">
          Katalyst
        </Link>
        
        <ul className="menu-list">
          <li className="menu-item">
            <Link to="/" className="menu-link">Home</Link>
          </li>
          <li className="menu-item">
            <Link to="/about" className="menu-link">About</Link>
          </li>
          <li className="menu-item">
            <Link to="/services" className="menu-link">Services</Link>
          </li>
          <li className="menu-item">
            <Link to="/contact" className="menu-link">Contact</Link>
          </li>
        </ul>
        
        <div className="topbar-controls">
          <NineDotsMenu />
          <Link to="/login" className="signin-button">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;