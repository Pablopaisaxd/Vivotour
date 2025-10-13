import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Nav from './Navbar';
import Footer from "../../components/use/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoVivoTour from "../../assets/Logos/new vivo contorno2.png";
import "./style/Perfil.css";

export const Perfil = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
  const [reservas, setReservas] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  // Estados para edición de nombre y email
  const [editField, setEditField] = useState(null); // 'nombre' | 'email' | null
  const [nombreEdit, setNombreEdit] = useState(user?.nombre || "");
  const [emailEdit, setEmailEdit] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Función para formatear fechas de forma segura
  const formatSafeDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return 'Fecha no disponible';
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Función para formatear fechas para PDF (evita desfase de zona horaria)
  const formatDateForPDF = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return 'Fecha no disponible';
    try {
      // Usar la fecha tal como viene, sin conversión de zona horaria
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Función para generar PDF de una reserva específica con diseño mejorado
  const generarPDFReserva = (reserva) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colores del tema
    const colorPrimario = [75, 172, 53]; // Verde VivoTour
    const colorSecundario = [255, 201, 20]; // Amarillo VivoTour
    const colorTexto = [45, 45, 45]; // Gris oscuro
    const colorSubtitulo = [100, 100, 100]; // Gris medio
    
    try {
      // Cargar y agregar logo (como imagen base64 o directamente)
      // Header con fondo verde
      doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Título principal en blanco
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE RESERVA", pageWidth / 2, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("La Ventana del Río Melcocho", pageWidth / 2, 28, { align: 'center' });
      
      // Reset color para el contenido
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      
      // Sección de información del cliente
      doc.setFillColor(255, 249, 230);
      doc.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
      doc.text("FECHAS DE LA RESERVA", 20, yPos + 5);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      doc.text(`Fecha de reserva: ${formatDateForPDF(reserva.fechaReserva)}`, 20, yPos + 15);
      doc.text(`Check-in: ${formatDateForPDF(reserva.fechaIngreso)}`, 20, yPos + 22);
      doc.text(`Check-out: ${formatDateForPDF(reserva.fechaSalida)}`, 20, yPos + 29);
      
      // Sección de alojamiento
      yPos += 50;
      if (reserva.alojamiento) {
        const altoAlojamiento = reserva.alojamiento.proveedor ? 45 : 35;
        doc.setFillColor(250, 255, 250);
        doc.rect(15, yPos - 5, pageWidth - 30, altoAlojamiento, 'F');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text("DETALLES DEL ALOJAMIENTO", 20, yPos + 5);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text(`Tipo: ${reserva.alojamiento.descripcion || 'No especificado'}`, 20, yPos + 15);
        doc.text(`Ubicación: ${reserva.alojamiento.ubicacion || 'No especificada'}`, 20, yPos + 22);
        doc.text(`Capacidad: ${reserva.alojamiento.capacidad || 'No especificada'}`, 20, yPos + 29);
        
        if (reserva.alojamiento.proveedor) {
          doc.text(`Proveedor: ${reserva.alojamiento.proveedor}`, 20, yPos + 36);
          yPos += 7;
        }
        
        yPos += 35;
      }
      
      // Información adicional (manejo seguro)
      if (reserva.informacion && reserva.informacion.trim()) {
        yPos += 10;
        
        doc.setFillColor(255, 245, 238);
        
        // Calcular altura necesaria para la información adicional
        const maxWidth = pageWidth - 40;
        const infoLines = doc.splitTextToSize(reserva.informacion, maxWidth);
        const altoInfo = Math.max(25, (infoLines.length * 5) + 15);
        
        // Verificar si necesitamos una nueva página
        if (yPos + altoInfo > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.rect(15, yPos - 5, pageWidth - 30, altoInfo, 'F');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text("INFORMACIÓN ADICIONAL", 20, yPos + 5);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        
        // Agregar texto línea por línea de manera segura
        let lineYPos = yPos + 15;
        infoLines.forEach((line, index) => {
          if (lineYPos + 5 < pageHeight - 30) {
            doc.text(line, 20, lineYPos);
            lineYPos += 5;
          }
        });
        
        yPos = lineYPos + 10;
      }
      
      // Footer decorativo
      const footerY = pageHeight - 30;
      doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.rect(0, footerY, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VivoTour - La Ventana del Río Melcocho", pageWidth / 2, footerY + 10, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Cocorná, Antioquia - Colombia", pageWidth / 2, footerY + 16, { align: 'center' });
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, footerY + 22, { align: 'center' });
      
      // Descargar con nombre más descriptivo
      const fechaDescarga = new Date().toISOString().split('T')[0];
      doc.save(`VivoTour_Reserva_${fechaDescarga}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

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
            {/* NOMBRE */}
            <div className="perfil-info-item">
              <label>Nombre</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="perfil-info-content" style={{ marginRight: '0.5rem' }}>
                  {editField === "nombre" ? (
                    <>
                      <input
                        className="perfil-edit-input"
                        type="text"
                        value={nombreEdit}
                        onChange={e => setNombreEdit(e.target.value)}
                        disabled={saving}
                      />
                      <button className="btn-mini" onClick={async () => {
                        setSaving(true);
                        setEditError("");
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch('http://localhost:5000/usuario/update', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ nombre: nombreEdit })
                          });
                          let json;
                          try {
                            json = await res.json();
                          } catch {
                            setEditError('No se pudo conectar con el servidor');
                            setSaving(false);
                            return;
                          }
                          if (json.success && json.usuario) {
                            setUser(prev => ({ ...prev, ...json.usuario }));
                            setEditField(null);
                            setEditError('Nombre actualizado correctamente');
                          } else {
                            setEditError(json.mensaje || 'Error al actualizar');
                          }
                        } catch (e) {
                          setEditError('No se pudo conectar con el servidor');
                        }
                        setSaving(false);
                      }} disabled={saving}>Aceptar</button>
                      <button className="btn-mini danger" onClick={() => { setEditField(null); setNombreEdit(user?.nombre || ""); }} disabled={saving}>Cancelar</button>
                    </>
                  ) : (
                    <span>{user?.nombre || "Usuario"}</span>
                  )}
                </div>
                {editField !== "nombre" && (
                  <button className="btn-edit" title="Editar nombre" onClick={() => setEditField("nombre") }>
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
                )}
              </div>
              {editField === "nombre" && editError && <div className="perfil-edit-error">{editError}</div>}
            </div>

            {/* EMAIL */}
            <div className="perfil-info-item">
              <label>Correo</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="perfil-info-content" style={{ marginRight: '0.5rem' }}>
                  {editField === "email" ? (
                    <>
                      <input
                        className="perfil-edit-input"
                        type="email"
                        value={emailEdit}
                        onChange={e => setEmailEdit(e.target.value)}
                        disabled={saving}
                      />
                      <button className="btn-mini" onClick={async () => {
                        setSaving(true);
                        setEditError("");
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch('http://localhost:5000/usuario/update', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({ email: emailEdit })
                          });
                          let json;
                          try {
                            json = await res.json();
                          } catch {
                            setEditError('No se pudo conectar con el servidor');
                            setSaving(false);
                            return;
                          }
                          if (json.success && json.usuario) {
                            setUser(prev => ({ ...prev, ...json.usuario }));
                            setEditField(null);
                            setEditError('Correo actualizado correctamente');
                          } else {
                            setEditError(json.mensaje || 'Error al actualizar');
                          }
                        } catch (e) {
                          setEditError('No se pudo conectar con el servidor');
                        }
                        setSaving(false);
                      }} disabled={saving}>Aceptar</button>
                      <button className="btn-mini danger" onClick={() => { setEditField(null); setEmailEdit(user?.email || ""); }} disabled={saving}>Cancelar</button>
                    </>
                  ) : (
                    <span>{user?.email || "Correo no disponible"}</span>
                  )}
                </div>
                {editField !== "email" && (
                  <button className="btn-edit" title="Editar correo" onClick={() => setEditField("email") }>
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
                )}
              </div>
              {editField === "email" && editError && <div className="perfil-edit-error">{editError}</div>}
            </div>

            {/* DOCUMENTO (solo visual) */}
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
            <div className="perfil-change-wrapper">
              <Link to="/reset" className="perfil-change-password">Cambiar Contraseña</Link>
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
                      <li key={r.id} className="reserva-item">
                        <div className="reserva-header">
                          <span className="reserva-estado">Reserva</span>
                          <div className="reserva-actions">
                            <button className="btn-mini" onClick={() => generarPDFReserva(r)}>Descargar PDF</button>
                            <button className="btn-mini danger" onClick={() => eliminarReserva(r.id)}>Eliminar</button>
                          </div>
                        </div>
                        <div className="reserva-detalles">
                          <div className="reserva-fechas">
                            <strong>📅 Fechas:</strong>
                            <span>Ingreso: {formatSafeDate(r.fechaIngreso)}</span>
                            <span>Salida: {formatSafeDate(r.fechaSalida)}</span>
                          </div>
                          {r.alojamiento && (
                            <div className="reserva-alojamiento">
                              <strong>🏠 Alojamiento:</strong>
                              <p>{r.alojamiento.descripcion}</p>
                              <small>📍 {r.alojamiento.ubicacion} | 👥 Capacidad: {r.alojamiento.capacidad}</small>
                              {r.alojamiento.proveedor && <small>🏢 Proveedor: {r.alojamiento.proveedor}</small>}
                            </div>
                          )}
                          {r.informacion && (
                            <div className="reserva-info">
                              <strong>ℹ️ Información adicional:</strong>
                              <p>{r.informacion}</p>
                            </div>
                          )}
                        </div>
                        <small className="reserva-fecha">Reserva realizada: {formatSafeDate(r.fechaReserva)}</small>
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
                        <p className="opinion-texto">"{o.opinion}"</p>
                        <div className="opinion-footer">
                          <small>Email: {o.email}</small>
                          {o.numeroDocumento && (
                            <small>• {o.tipoDocumento}: {o.numeroDocumento}</small>
                          )}
                        </div>
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