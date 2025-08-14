import React from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/logo.png';
import vivoTour from '../../assets/Logos/vivoTour.png';

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
        <button className="btnav btnlog">Acceder</button>
      </div>
    </div>
  );
};

export default Nav;
