import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/ENVIFO.png";
import "./Navbar.css";
import { FaRegUserCircle } from "react-icons/fa"; // importamos el icono

function Navbar() {
  return (
    <nav>
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>

      <ul className="menu">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/Simulator">Simulador 3D</Link>
        </li>
        <li>
          <Link to="/Contact">Contact</Link>
        </li>
      </ul>

      <div className="right-section">
        <Link to="/Login" className="Login-btn">
          <FaRegUserCircle size={28} color="white" />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
