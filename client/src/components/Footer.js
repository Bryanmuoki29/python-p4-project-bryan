import React from "react";
import "./Footer.css"; // Add the new CSS file for footer styling
import '@fortawesome/fontawesome-free/css/all.min.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Contact Section */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: contact@hotelluxury.com</p>
          <p>Phone: +25 456 7890</p>
        </div>

        {/* Subscribe Section */}
        <div className="footer-section">
          <h3>Subscribe to Our Mail List</h3>
          <form>
            <input
              type="email"
              placeholder="Enter your email"
              className="email-input"
              required
            />
            <button type="submit" className="subscribe-button">
              Subscribe
            </button>
          </form>
        </div>

        {/* Social Media Section */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i> Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Hotel Luxury. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
