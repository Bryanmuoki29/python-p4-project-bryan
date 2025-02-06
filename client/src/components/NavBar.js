import React from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav>
      <NavLink to="/" className="nav-link">Home</NavLink>
      <NavLink to="/amenities" className="nav-link">Amenities</NavLink>
      <NavLink to="/profile" className="nav-link">Profile</NavLink>
      <NavLink to="/login" className="nav-link">Login</NavLink>
   </nav>
  );
}

export default NavBar;
