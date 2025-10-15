import React, { useContext } from 'react';
import './style/Navbar.css';
import logo from '../../assets/Logos/new vivo contorno2.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const Nav = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const onPerfil = location.pathname.toLowerCase() === '/perfil';
  const onAdmin = location.pathname.toLowerCase() === '/admin';
  const isAdmin = user && (user.IdRol === 1 || user.rol === 'Admin');

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

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <header className="nav">
      <nav className="nav-bottom">
        <li>
          <a onClick={() => navigate("/")} className="btnav">INICIO</a>
        </li>
        <li>
          <a className="btnav" href="#Descubre" onClick={(e) => { e.preventDefault(); scrollToSection("Descubre"); }}>DESCUBRE</a>
        </li>

        <div className="nav-logo">
          <img src={logo} alt="logoVentana" className="main-logo" onClick={handleLogoClick} />
        </div>

        <li>
          <a className="btnav" href="#Reservar" onClick={handleReservaClick}>RESERVAR</a>
        </li>

        {isAuthenticated ? (
          <>
            {isAdmin ? (
              <>
                {onAdmin ? (
                  <li><a className="btnlog" onClick={() => { logout(); navigate('/'); }}>CERRAR SESIÓN</a></li>
                ) : (
                  <li><a className="btnlog" onClick={() => navigate("/Admin")}>ADMIN</a></li>
                )}
              </>
            ) : (
              <>
                {onPerfil ? (
                  <li><a className="btnlog" onClick={() => { logout(); navigate('/'); }}>CERRAR SESIÓN</a></li>
                ) : (
                  <li><a className="btnlog" onClick={() => navigate("/Perfil")}>PERFIL</a></li>
                )}
              </>
            )}
          </>
        ) : (
          <li><a className="btnlog" onClick={() => navigate("/Login")}>ACCEDER</a></li>
        )}
      </nav>
    </header>
  );
};

export default Nav;
