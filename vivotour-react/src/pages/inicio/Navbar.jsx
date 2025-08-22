import React, { useContext } from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/logo.png';
import vivoTour from '../../assets/Logos/vivoTour.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';


const Nav = () => {

  const {isAuthenticated, user, logout}=useContext(AuthContext);
  return (
    <div className="nav" id="navaccess">
      <div className="logos">
        <img src={logo} alt="logoVentana"  className="imgven" />
        <img src={vivoTour} alt="logoVivo"  className="imgvivo" />
      </div>

      <nav className="navbar" id="navbar">
        <a className="btnav" id="btnnav" href="#Inicio" >Inicio</a>
        <a className="btnav btndes" id="btnnav" href="#Descubre" >Descubre</a>
        <Link to={"/Reserva"} className="btnav" id="btnres">Reservar</Link>
      </nav>

      <div className="acces">
        {isAuthenticated ? (
          <>
          <Link to={"/Perfil"} className="btnav btnlog">Ir a tu perfil</Link>
          </>
        ):(<Link to={"/Login"} className="btnav btnlog">Acceder</Link>)}
      </div>
    </div>
  );
};

export default Nav;
