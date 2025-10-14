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
  
  // Verificar si el usuario es admin (IdRol = 1 o rol = "Admin")
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

  return (
    <header className="nav">
      <nav className="nav-bottom">
        <li>
          <a onClick={()=>navigate("/")} className="btnav" >Inicio</a>
        </li>
        <li>
          <a className="btnav" href="#Descubre" onClick={(e) => { e.preventDefault(); scrollToSection("Descubre"); }}>Descubre</a>
        </li>

        <div className="nav-logo">
          <img src={logo} alt="logoVentana" className="main-logo" onClick={()=> navigate("/")}/>
        </div>

        <li>
          <a className="btnav" href="#Reservar" onClick={handleReservaClick}>Reservar</a>
        </li>

        {isAuthenticated ? (
          <>
            {isAdmin ? (
              // Si es admin, mostrar botón Admin en lugar de Perfil
              <>
                {onAdmin ? (
                  <li><a className="btnlog" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</a></li>
                ) : (
                  <li><a className="btnlog" onClick={() => navigate("/Admin")}>Admin</a></li>
                )}
              </>
            ) : (
              // Si es cliente, mostrar botón Perfil
              <>
                {onPerfil ? (
                  <li><a className="btnlog" onClick={() => { logout(); navigate('/'); }}>Cerrar sesión</a></li>
                ) : (
                  <li><a className="btnlog" onClick={() => navigate("/Perfil")}>Perfil</a></li>
                )}
              </>
            )}
          </>
        ) : (
          <li><a className="btnlog" onClick={() => navigate("/Login")}>Acceder</a></li>
        )}
      </nav>
    </header>
  );
};

export default Nav;
