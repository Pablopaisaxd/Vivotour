import React, { useContext } from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/new vivo contorno2.png';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const Nav = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReservaClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/Reserva");
    } else {
      navigate("/Login");
    }
  };

  return (
    <header className="nav">
      <nav className="nav-bottom">
        <li>
          <Link to={'/'} className="btnav" href="#Inicio" >Inicio</Link>
        </li>
        <li>
          <a className="btnav" href="#Descubre" onClick={(e) => { e.preventDefault(); scrollToSection("Descubre"); }}>Descubre</a>
        </li>

        <div className="nav-logo">
          <img src={logo} alt="logoVentana" className="main-logo" />
        </div>

        <li>
          <a className="btnav" href="#Reservar" onClick={handleReservaClick}>Reservar</a>
        </li>

        {isAuthenticated ? (
          <>
            <li><a className="btnlog" onClick={() => navigate("/Perfil")}>Perfil</a></li>
            <li><a className="btnav" onClick={() => navigate("/Admin")}>Admin</a></li>
          </>
        ) : (
          <li><a className="btnlog" onClick={() => navigate("/Login")}>Acceder</a></li>
        )}
      </nav>
    </header>
  );
};

export default Nav;
