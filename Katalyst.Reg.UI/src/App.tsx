import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login.tsx'; 
import Summary from './pages/Summary.tsx';
import Trade from './pages/Trade.tsx';
import Report from './pages/Report.tsx';
import NCAResponse from './pages/NCAResponse.tsx';
import Data from './pages/Data.tsx';
import BackReporting from './pages/BackReporting.tsx';
import Loading from './components/Loading.tsx';
import HomePage from './pages/HomePage.tsx';
import DataInjection from './pages/DataInjection.tsx';
import 'boxicons';
import './App.css';

const App: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set loading to true when location changes (page switch)
    setLoading(true);

    // Simulate a delay to show the loading spinner (can be replaced by real data fetching)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); // Adjust the delay as needed

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [location]); // This hook runs every time the location changes

  return (
    <div>
      {loading && <Loading />} {/* Show loading page during page transition */}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/report" element={<Report />} />
        <Route path="/data" element={<Data />} />
        <Route path="/backreporting" element={<BackReporting />} />
        <Route path="/nca-response" element = {<NCAResponse />} />
        <Route path="/data-injection" element = {<DataInjection />} />
        <Route path="/login" element = {<Login />} />
      </Routes>
    </div>
  );
};

export default App;
