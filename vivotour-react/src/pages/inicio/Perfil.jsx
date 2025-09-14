import React, { useContext, useRef, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import Nav from './Navbar';
import Footer from "../../components/use/Footer";
import "./style/Perfil.css";

export const Perfil = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
        // Aquí podrías agregar lógica para subir la imagen al backend
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor selecciona un archivo de imagen válido (png, jpg, jpeg, gif).");
    }
  };

  return (
    <div className="perfil-page">
      <Nav />
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-avatar" onClick={handleImageClick} title="Editar imagen de perfil">
            <img src={avatar} alt="Avatar" />
            <div className="perfil-avatar-edit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon-edit"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
              </svg>
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="perfil-info">
            <div className="perfil-info-item">
              <label>Nombre</label>
              <div className="perfil-info-content">
                <span>{user?.nombre || "Usuario"}</span>
                <button className="btn-edit" title="Editar nombre" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-edit"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="perfil-info-item">
              <label>Correo</label>
              <div className="perfil-info-content">
                <span>{user?.email || "Correo no disponible"}</span>
                <button className="btn-edit" title="Editar correo" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-edit"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="perfil-info-item">
              <label>Documento</label>
              <div className="perfil-info-content">
                <span>{user?.tipoDocumento} {user?.numeroDocumento || "Identificación no disponible"}</span>
                <button className="btn-edit" title="Editar documento" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-edit"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button className="perfil-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};