// src/components/Header.js
import React from "react";
import logo from "../assets/images/logo.png"; 
import "./Header.css"; 

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <img src={logo} alt="Hotel Luxury" className="header-logo" />
        </div>
        <div className="header-text">
          <h1 className="header-title">Hotel Luxury</h1>
          <p className="header-tagline">Experience the Ultimate Hotel Experience</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
