import React, { useContext, useEffect, useRef, useState } from "react";
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
  const [reservas, setReservas] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

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
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor selecciona un archivo de imagen válido (png, jpg, jpeg, gif).");
    }
  };

  // Cargar reservas y opiniones del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchAll = async () => {
      try {
        setLoadingData(true);
        setError("");
        const [resReservas, resOpiniones] = await Promise.all([
          fetch('http://localhost:5000/mis-reservas', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/mis-opiniones', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const jsonReservas = await resReservas.json();
        const jsonOpiniones = await resOpiniones.json();
        if (jsonReservas.success) setReservas(jsonReservas.reservas || []);
        if (jsonOpiniones.success) setOpiniones(jsonOpiniones.opiniones || []);
      } catch (e) {
        setError('No se pudo cargar la información');
      } finally {
        setLoadingData(false);
      }
    };
    fetchAll();
  }, []);

  const eliminarReserva = async (id) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setReservas(prev => prev.filter(r => r.id !== id));
      } else {
        alert(json.mensaje || 'No se pudo eliminar');
      }
    } catch (e) {
      alert('Error del servidor');
    }
  };

  const eliminarOpinion = async (id) => {
    if (!confirm('¿Eliminar esta opinión?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/mis-opiniones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setOpiniones(prev => prev.filter(o => o.id !== id));
      } else {
        alert(json.mensaje || 'No se pudo eliminar');
      }
    } catch (e) {
      alert('Error del servidor');
    }
  };

  return (
    <div className="perfil-page">
      <Nav />
      <div className="perfil-container perfil-grid">
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
        </div>
        <div className="perfil-panel">
          <div className="perfil-section">
            <h2>Mis reservas</h2>
            {loadingData ? (
              <p>Cargando...</p>
            ) : (
              <>
                {reservas.length === 0 ? (
                  <p>No tienes reservas aún.</p>
                ) : (
                  <ul className="lista-reservas">
                    {reservas.slice(0, 5).map((r) => (
                      <li key={r.id} className={`reserva-item estado-${r.estado}`}>
                        <div className="reserva-header">
                          <span className="reserva-estado">Estado: {r.estado}</span>
                          <button className="btn-mini danger" onClick={() => eliminarReserva(r.id)}>Eliminar</button>
                        </div>
                        <div className="reserva-detalles">
                          <pre>{JSON.stringify(r.detalles, null, 2)}</pre>
                        </div>
                        <small className="reserva-fecha">Creada: {new Date(r.createdAt).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="perfil-section">
            <h2>Mis opiniones</h2>
            {loadingData ? (
              <p>Cargando...</p>
            ) : (
              <>
                {opiniones.length === 0 ? (
                  <p>No has publicado opiniones aún.</p>
                ) : (
                  <ul className="lista-opiniones">
                    {opiniones.map((o) => (
                      <li key={o.id} className="opinion-item">
                        <div className="opinion-top">
                          <strong>{o.nombre}</strong>
                          <button className="btn-mini danger" onClick={() => eliminarOpinion(o.id)}>Eliminar</button>
                        </div>
                        <p>{o.opinion}</p>
                        <small>{new Date(o.createdAt).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};