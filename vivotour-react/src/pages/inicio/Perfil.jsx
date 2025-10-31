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
  const [fileError, setFileError] = useState("");
  const [confirmState, setConfirmState] = useState(null);
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

  // Cargar imagen como dataURL para jsPDF (helper local)
  const fetchImageAsDataURL = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      let format = 'JPEG';
      if (blob.type.includes('png') || url.toLowerCase().endsWith('.png')) format = 'PNG';
      return { dataUrl, format };
    } catch (e) {
      console.warn('fetchImageAsDataURL fallo:', e);
      return null;
    }
  };

  // Función para generar PDF de una reserva específica con diseño mejorado
  const generarPDFReserva = async (reserva) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 40; // Inicializar yPos después del header
    
    // Colores del tema
    const colorPrimario = [75, 172, 53]; // Verde VivoTour
    const colorSecundario = [255, 201, 20]; // Amarillo VivoTour
    const colorTexto = [45, 45, 45]; // Gris oscuro
    const colorSubtitulo = [100, 100, 100]; // Gris medio
    
    try {
      // Header con fondo verde
      doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');

      // Intentar añadir logo en esquina superior derecha (no bloquear si falla)
      try {
        const logoObj = await fetchImageAsDataURL(logoVivoTour);
        if (logoObj && logoObj.dataUrl) {
          const getImageDimensions = (dataUrl) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve(null);
            img.src = dataUrl;
          });
          const dims = await getImageDimensions(logoObj.dataUrl);
          if (dims) {
            const desiredW = 36;
            const scale = desiredW / dims.w;
            const desiredH = dims.h * scale;
            const xPos = pageWidth - 15 - desiredW;
            const yLogo = Math.max(4, (35 - desiredH) / 2);
            doc.addImage(logoObj.dataUrl, logoObj.format, xPos, yLogo, desiredW, desiredH);
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar logo en PDF:', e);
      }
      
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
      
      // Se omite la sección de "FECHAS DE LA RESERVA" por solicitud del cliente.
      // En su lugar dejamos espacio para el contenido siguiente.
      
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

        // Sanitizar la información para evitar 'undefined' o 'NaN' y patrones raros
        let safeInfo = String(reserva.informacion || '');
        safeInfo = safeInfo.replace(/\bundefined\b/g, '—').replace(/NaN/g, '—').replace(/\+\$?—/g, '');

        // Calcular altura necesaria para la información adicional
        const maxWidth = pageWidth - 40;
        const infoLines = doc.splitTextToSize(safeInfo, maxWidth);
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
      setError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Por favor selecciona un archivo de imagen válido (png, jpg, jpeg, gif).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("La imagen no puede ser mayor a 5MB");
      return;
    }

    try {
      // Mostrar preview inmediatamente
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);

      // Subir al servidor
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el avatar con la URL del servidor
        setAvatar(result.avatarUrl);
        
        // Actualizar token y usuario en el contexto
        localStorage.setItem('token', result.token);
        setUser(result.user);
        
  // debug: removed console.log for production
      } else {
        setAvatar(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
        setFileError(result.mensaje || 'Error al subir la imagen');
      }
    } catch (error) {
      // Si falla, revertir al avatar anterior
      setAvatar(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
      console.error('Error al subir avatar:', error);
      setFileError('Error de conexión al subir la imagen');
    }
  };

  // Sincronizar avatar cuando user cambia
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user?.avatar]);

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
    setConfirmState({ action: 'eliminarReserva', id, message: '¿Eliminar esta reserva?' });
  };

  const eliminarOpinion = async (id) => {
    setConfirmState({ action: 'eliminarOpinion', id, message: '¿Eliminar esta opinión?' });
  };

  const handleConfirm = async (confirm) => {
    if (!confirmState) return setConfirmState(null);
    const { action, id } = confirmState;
    setConfirmState(null);
    try {
      const token = localStorage.getItem('token');
      if (action === 'eliminarReserva') {
        const res = await fetch(`http://localhost:5000/reservas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) {
          setReservas(prev => prev.filter(r => r.id !== id));
        } else {
          setError(json.mensaje || 'No se pudo eliminar');
        }
      }
      if (action === 'eliminarOpinion') {
        const res = await fetch(`http://localhost:5000/mis-opiniones/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) {
          setOpiniones(prev => prev.filter(o => o.id !== id));
        } else {
          setError(json.mensaje || 'No se pudo eliminar');
        }
      }
    } catch (e) {
      setError('Error del servidor');
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
          {fileError && (
            <div className="perfil-edit-error" role="alert" style={{ marginTop: '0.6rem' }}>{fileError}</div>
          )}

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
                            // debug: removed console.log for production
                          } catch {
                            setEditError('No se pudo conectar con el servidor');
                            setSaving(false);
                            return;
                          }
                          if (json.success && json.usuario) {
                            // debug: removed console.log for production
                            
                            // Si el servidor envía un nuevo token, actualizarlo
                            if (json.token) {
                              // debug: removed console.log for production
                              localStorage.setItem('token', json.token);
                            }
                            
                            setUser(prev => {
                              const updated = { ...prev, ...json.usuario };
                              // debug: removed console.log for production
                              return updated;
                            });
                            setEditField(null);
                            setEditError('Nombre actualizado correctamente');
                            // Limpiar mensaje después de 2 segundos
                            setTimeout(() => setEditError(''), 2000);
                          } else {
                            console.error('Error en la respuesta:', json);
                            setEditError(json.mensaje || 'Error al actualizar');
                          }
                        } catch (e) {
                          setEditError('No se pudo conectar con el servidor');
                        }
                        setSaving(false);
                      }} disabled={saving}>✓</button>
                      <button className="btn-mini danger" onClick={() => { setEditField(null); setNombreEdit(user?.nombre || ""); }} disabled={saving}>X</button>
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
                            // debug: removed console.log for production
                          } catch {
                            setEditError('No se pudo conectar con el servidor');
                            setSaving(false);
                            return;
                          }
                          if (json.success && json.usuario) {
                            // debug: removed console.log for production
                            
                            // Si el servidor envía un nuevo token, actualizarlo
                            if (json.token) {
                              // debug: removed console.log for production
                              localStorage.setItem('token', json.token);
                            }
                            
                            setUser(prev => {
                              const updated = { ...prev, ...json.usuario };
                              // debug: removed console.log for production
                              return updated;
                            });
                            setEditField(null);
                            setEditError('Email actualizado correctamente');
                            // Limpiar mensaje después de 2 segundos
                            setTimeout(() => setEditError(''), 2000);
                          } else {
                            console.error('Error en la respuesta:', json);
                            setEditError(json.mensaje || 'Error al actualizar');
                          }
                        } catch (e) {
                          setEditError('No se pudo conectar con el servidor');
                        }
                        setSaving(false);
                      }} disabled={saving}>✓</button>
                      <button className="btn-mini danger" onClick={() => { setEditField(null); setEmailEdit(user?.email || ""); }} disabled={saving}>X</button>
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
      {confirmState && (
        <div className="overlay">
          <div className="confirm-modal">
            <p>{confirmState.message}</p>
            <div className="confirm-buttons">
              <button className="btn-confirm" onClick={() => handleConfirm(true)}>Sí</button>
              <button className="btn-cancel" onClick={() => setConfirmState(null)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};