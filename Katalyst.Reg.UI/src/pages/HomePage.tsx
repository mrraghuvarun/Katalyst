import React from "react";
import Topbar from "../components/Navbar.tsx";
import "./HomePage.css";

const HomePage: React.FC = () => {
  return (
    <div className="katalyst-home">
      <Topbar />
      <main className="katalyst-content">
        <section className="katalyst-hero">
          <div className="katalyst-hero-text">
            <h1>Welcome to Katalyst</h1>
            <p>
              Empowering you with cutting-edge tools and services to spark
              innovation.
            </p>
            <div className="katalyst-cta">
              <button className="katalyst-primary">Get Started</button>
              <button className="katalyst-secondary">Learn More</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
