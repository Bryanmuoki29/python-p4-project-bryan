import React from "react";
import "./AmenitiesSection.css"; 

function AmenitiesSection() {
  return (
    <div className="amenities-section">
      <h2>Hotel Amenities</h2>
      <ul className="amenities-list">
        <li>🌐 Free Wi-Fi</li>
        <li>🏊‍♂️ Outdoor Pool</li>
        <li>🍽 Fine Dining Restaurant</li>
        <li>💆 Spa Services</li>
        <li>🏋️‍♀️ Fitness Center</li>
      </ul>
    </div>
  );
}

export default AmenitiesSection;
