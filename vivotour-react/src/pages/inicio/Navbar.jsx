import React, { useContext } from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/vivoTour.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const Nav = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <header className="nav">

      <div className="nav-logo">
        <img src={logo} alt="logoVentana" className="main-logo" />
      </div>


      <nav className="nav-bottom">
        <a className="btnav" href="#Inicio">Inicio</a>
        <a className="btnav" href="#Descubre">Descubre</a>
        <Link to={"/Reserva"} className="btnav">Reservar</Link>
        {isAuthenticated ? (
          <Link to={"/Perfil"} className="btnlog">Perfil</Link>
        ) : (
          <Link to={"/Login"} className="btnlog">Acceder</Link>
        )}
      </nav>
    </header>
  );
};

export default Nav;
