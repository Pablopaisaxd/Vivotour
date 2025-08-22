import React, { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import "./style/Perfil.css";

export const Perfil = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-avatar">
          <img
            src="https://www.w3schools.com/howto/img_avatar.png"
            alt="Avatar"
          />
        </div>

        <h2 className="perfil-nombre">{user?.nombre || "Usuario"}</h2>
        <p className="perfil-email">{user?.email || "Correo no disponible"}</p>
        <p className="perfil-email">{user?.tipoDocumento} {user?.numeroDocumento || "Identificacion no disponible"}</p>
        

        <button className="perfil-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
