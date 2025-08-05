import React from 'react';
import './style/Navbar.css';
import logo from '../media/logos/logo.png';
import vivoTour from '../media/logos/vivoTour.png';

const Nav = () => {
  return (
    <div className="nav" id="navaccess">
      <div className="logos">
        <img src={logo} alt="logoVentana"  className="imgven" />
        <img src={vivoTour} alt="logoVivo"  className="imgvivo" />
      </div>

      <nav className="navbar" id="navbar">
        <a className="btnav" id="btnnav" href="#Inicio">Inicio</a>
        <a className="btnav btndes" id="btnnav" href="#Descubre">Descubre</a>
        <a className="btnav" id="btnres" href="#">Reservar</a>
      </nav>

      <div className="acces">
        <button className="btnav btnlog">Acceder</button>
      </div>
    </div>
  );
};

export default Nav;
