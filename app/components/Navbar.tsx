import React from "react";
import { Link } from "react-router";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="font-bold text-2xl text-gradient">RESUMIND</p>
      </Link>
      <Link to="/upload">
        <p className="primary-button w-fit">Upload Resume</p>
      </Link>
    </nav>
  );
}

export default Navbar;
