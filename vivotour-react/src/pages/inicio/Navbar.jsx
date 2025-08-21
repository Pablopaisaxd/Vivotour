import React from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/logo.png';
import vivoTour from '../../assets/Logos/vivoTour.png';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <div className="nav" id="navaccess">
      <div className="logos">
        <img src={logo} alt="logoVentana"  className="imgven" />
        <img src={vivoTour} alt="logoVivo"  className="imgvivo" />
      </div>

      <nav className="navbar" id="navbar">
        <a className="btnav" id="btnnav">Inicio</a>
        <a className="btnav btndes" id="btnnav">Descubre</a>
        <a className="btnav" id="btnres">Reservar</a>
      </nav>

      <div className="acces">
        <Link to={"/Login"} className="btnav btnlog">Acceder</Link>
      </div>
    </div>
  );
};

export default Nav;
