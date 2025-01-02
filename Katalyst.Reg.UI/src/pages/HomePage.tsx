import React from "react";
import Topbar from "../components/Navbar.tsx";
import { useNavigate } from "react-router-dom";
// import "./HomePage.css"; // Keeping the custom CSS for any additional styles

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleMIFIDClick = () => {
    navigate("/login");
  };

  const handleDataIngestionClick = () => {
    navigate("/data-ingestion");
  };

  return (
    <div className="katalyst-home bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Topbar />
      <main className="katalyst-content flex-1 py-5 text-center mt-20">
        <section className="katalyst-hero bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16 px-5 rounded-lg shadow-lg max-w-3xl mx-auto">
          <div className="katalyst-hero-text">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Katalyst
            </h1>
            <span className="text-lg text-white md:text-xl mb-6">
              Empowering you with cutting-edge tools and services to spark
              innovation.
            </span>
            <div className="katalyst-cta flex gap-4 justify-center mt-4">
              <button
                className="katalyst-primary bg-yellow-400 text-gray-800 py-3 px-6 rounded-md text-lg font-bold transition-all duration-300 ease-in-out hover:bg-yellow-500"
                onClick={handleMIFIDClick}
              >
                MIFID
              </button>
              <button
                className="katalyst-secondary bg-white text-blue-500 py-3 px-6 border-2 border-blue-500 rounded-md text-lg font-bold transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
                onClick={handleDataIngestionClick}
              >
                DATA INGESTION
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
