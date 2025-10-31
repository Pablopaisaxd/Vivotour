import React, { useContext, useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (action) => {
    action();
    closeMenu();
  };

  return (
    <header className="nav">
      <button className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuToggle}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      
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

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src={logo} alt="logoVentana" className="main-logo" onClick={() => handleNavigation(handleLogoClick)} />
          <button className="mobile-menu-close" onClick={closeMenu}>Cerrar</button>
        </div>
        
        <nav className="mobile-menu-nav">
          <a onClick={() => handleNavigation(() => navigate("/"))} className="btnav">INICIO</a>
          <a onClick={(e) => { e.preventDefault(); handleNavigation(() => scrollToSection("Descubre")); }} className="btnav">DESCUBRE</a>
          <a onClick={(e) => { e.preventDefault(); handleNavigation(handleReservaClick); }} className="btnav">RESERVAR</a>
          {isAuthenticated ? (
            isAdmin ? (
              onAdmin ? (
                <a className="btnlog" onClick={() => handleNavigation(() => { logout(); navigate('/'); })}>CERRAR SESIÓN</a>
              ) : (
                <a className="btnlog" onClick={() => handleNavigation(() => navigate("/Admin"))}>ADMIN</a>
              )
            ) : (
              onPerfil ? (
                <a className="btnlog" onClick={() => handleNavigation(() => { logout(); navigate('/'); })}>CERRAR SESIÓN</a>
              ) : (
                <a className="btnlog" onClick={() => handleNavigation(() => navigate("/Perfil"))}>PERFIL</a>
              )
            )
          ) : (
            <a className="btnlog" onClick={() => handleNavigation(() => navigate("/Login"))}>ACCEDER</a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Nav;
