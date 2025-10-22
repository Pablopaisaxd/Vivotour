import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

const ExtraServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'otros'
  });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');

  const categories = [
    { value: 'otros', label: 'Otros Servicios' },
    { value: 'equipo', label: 'Equipo/Gear' },
    { value: 'fotografia', label: 'Fotografía' },
    { value: 'comida', label: 'Comida Extra' },
    { value: 'transporte', label: 'Transporte Extra' }
  ];

  // Servicios por defecto para demostración
  const defaultServices = [
    {
      id: 1,
      name: 'Mula de salida',
      description: 'Transporte en mula para salida desde Ventana del Río Melcocho. Viaje de aproximadamente 1.5 horas.',
      price: '30000',
      category: 'transporte'
    },
    {
      id: 2,
      name: 'Camping extra',
      description: 'Noche adicional de camping con todas las comodidades incluidas.',
      price: '25000',
      category: 'otros'
    },
    {
      id: 3,
      name: 'Desayuno extra',
      description: 'Desayuno adicional completo para una persona.',
      price: '12000',
      category: 'comida'
    },
    {
      id: 4,
      name: 'Fotografía Profesional',
      description: 'Sesión de fotos profesional durante tu experiencia. Incluye edición de 50+ fotos.',
      price: '85000',
      category: 'fotografia'
    },
    {
      id: 5,
      name: 'Paquete Equipo Premium',
      description: 'Alquiler de equipo de aventura de alta calidad: casco, arnés, cuerdas.',
      price: '45000',
      category: 'equipo'
    }
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.warn('No token, skipping initialization');
      return;
    }

    try {
      // Llamar el endpoint de inicialización
      await fetch(`${apiConfig.baseUrl}/api/initialize-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => console.log('Initialize data call result:', err));

      // Luego cargar los servicios
      fetchServices();
    } catch (err) {
      console.error('Error in initialization:', err);
      fetchServices();
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        console.warn('No token found, using default services');
        setServices(defaultServices);
        return;
      }
      
      const response = await fetch(`${apiConfig.baseUrl}/api/extra-services`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const fetchedServices = data.services && data.services.length > 0 ? data.services : defaultServices;
        setServices(fetchedServices);
      } else {
        console.warn('Error fetching services, using default services');
        setServices(defaultServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setError('No hay token de autenticación');
      console.error('No token found');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${apiConfig.baseUrl}/api/extra-services/${editingId}`
        : `${apiConfig.baseUrl}/api/extra-services`;

      console.log(`${method} request to:`, url, 'Data:', formData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'otros'
        });
        setEditingId(null);
        await fetchServices();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.mensaje || 'Error al guardar el servicio');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error submitting service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setFormData(service);
    setEditingId(service.id);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setError('No hay token de autenticación');
      console.error('No token found');
      setShowDeleteModal(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Eliminando servicio ${serviceToDelete.id}`);
      
      const response = await fetch(`${apiConfig.baseUrl}/api/extra-services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        setSuccess(true);
        setShowDeleteModal(false);
        setServiceToDelete(null);
        await fetchServices(); // Recargar desde BD
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.mensaje || 'Error al eliminar el servicio');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
      console.error('Error deleting service:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleDelete = async (id) => {
    // Mantener para compatibilidad, pero usar el modal ahora
    const service = services.find(s => s.id === id);
    if (service) {
      handleDeleteClick(service);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'otros'
    });
    setEditingId(null);
  };

  const getCategoryLabel = (value) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const styles = {
    container: {
      padding: '30px',
      backgroundColor: 'var(--card-background)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: '2rem',
      marginBottom: '30px',
      textAlign: 'center',
      color: 'var(--rich-black)',
      fontWeight: '600'
    },
    formContainer: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
      border: '1px solid var(--border-color-light)'
    },
    formGroup: {
      marginBottom: '15px',
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '5px',
      fontWeight: '500',
      color: 'var(--rich-black)',
      fontSize: '14px'
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid var(--border-color-light)',
      fontSize: '14px',
      fontFamily: 'inherit'
    },
    select: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid var(--border-color-light)',
      fontSize: '14px',
      fontFamily: 'inherit'
    },
    textarea: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid var(--border-color-light)',
      fontSize: '14px',
      fontFamily: 'inherit',
      minHeight: '80px',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      fontSize: '14px'
    },
    submitBtn: {
      backgroundColor: 'var(--forest-green)',
      color: 'white'
    },
    cancelBtn: {
      backgroundColor: '#ccc',
      color: '#333'
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px'
    },
    serviceCard: {
      backgroundColor: '#fff',
      padding: '18px',
      borderRadius: '12px',
      border: '2px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      cursor: 'default',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minHeight: '280px',
      boxSizing: 'border-box'
    },
    serviceCardHover: {
      borderColor: 'var(--forest-green)',
      boxShadow: '0 4px 15px rgba(75,172,53,0.3)',
      transform: 'translateY(-3px)'
    },
    serviceTitle: {
      fontSize: '1.05rem',
      fontWeight: '600',
      marginBottom: '5px',
      color: 'var(--rich-black)'
    },
    servicePrice: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: 'var(--forest-green)',
      marginBottom: '8px'
    },
    serviceCategory: {
      display: 'inline-block',
      backgroundColor: '#e6f4d9',
      color: '#2e7d32',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '10px',
      width: 'fit-content'
    },
    serviceDescription: {
      fontSize: '14px',
      color: '#555',
      marginBottom: '15px',
      minHeight: '50px',
      flex: '1'
    },
    serviceActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      marginTop: 'auto',
      paddingTop: '10px'
    },
    btnPrimary: {
      padding: '9px 14px',
      borderRadius: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
      fontSize: '13px',
      backgroundColor: 'var(--forest-green)',
      color: '#fff'
    },
    btnSecondary: {
      padding: '9px 14px',
      borderRadius: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      fontSize: '13px',
      backgroundColor: '#fff',
      color: 'var(--rich-black)'
    },
    btnDanger: {
      padding: '9px 14px',
      borderRadius: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
      fontSize: '13px',
      backgroundColor: '#dc3545',
      color: '#fff'
    },
    alert: {
      padding: '12px 20px',
      marginBottom: '20px',
      borderRadius: '4px',
      textAlign: 'center',
      border: '1px solid'
    },
    alertError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderColor: '#f5c6cb'
    },
    alertSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      borderColor: '#c3e6cb'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      maxWidth: '450px',
      width: '90%',
      animation: 'fadeIn 0.3s ease-in-out',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '15px',
      color: 'var(--rich-black)',
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: '1rem',
      color: '#555',
      marginBottom: '10px',
      textAlign: 'center',
    },
    modalWarning: {
      fontSize: '0.9rem',
      color: '#d32f2f',
      fontWeight: '600',
      marginBottom: '25px',
      textAlign: 'center',
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
    },
    btnCancel: {
      padding: '10px 25px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      color: 'var(--rich-black)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    btnConfirm: {
      padding: '10px 25px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      backgroundColor: '#dc3545',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={styles.container} className="extra-services-management-container">
      <h2 style={styles.title}>Gestión de Servicios Extras</h2>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>Cambios guardados exitosamente</div>}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ ...styles.button, ...styles.submitBtn }}
        >
          {showForm ? 'Cerrar formulario' : 'Crear Nuevo Servicio'}
        </button>
      </div>

      {showForm && (
      <div style={styles.formContainer}>
        <h3 style={{ marginBottom: '20px', color: 'var(--rich-black)' }}>
          {editingId ? 'Editar Servicio' : 'Nuevo Servicio Extra'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre del Servicio</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="Ej: Fotografía Profesional"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={styles.textarea}
              placeholder="Describe el servicio"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Precio ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                style={styles.input}
                placeholder="0.00"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={styles.select}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ ...styles.buttonGroup, marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Guardando...' : editingId ? 'Actualizar Servicio' : 'Crear Servicio'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{ ...styles.button, ...styles.cancelBtn }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      )}

      <h3 style={{ marginBottom: '20px', color: 'var(--rich-black)', marginTop: '30px' }}>Servicios Actuales</h3>
      <div style={styles.servicesGrid}>
        {services.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
            No hay servicios creados aún
          </p>
        ) : (
          services.map(service => (
            <div key={service.id} style={styles.serviceCard}>
              <div style={styles.serviceTitle}>{service.name}</div>
              <div style={styles.servicePrice}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0
                }).format(service.price)}
              </div>
              <div style={styles.serviceCategory}>{getCategoryLabel(service.category)}</div>
              <div style={styles.serviceDescription}>{service.description}</div>
              <div style={styles.serviceActions}>
                <button
                  onClick={() => handleEdit(service)}
                  style={styles.btnPrimary}
                  onMouseOver={(e) => e.target.style.background = '#3d9129'}
                  onMouseOut={(e) => e.target.style.background = 'var(--forest-green)'}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(service)}
                  style={styles.btnDanger}
                  onMouseOver={(e) => e.target.style.background = '#c82333'}
                  onMouseOut={(e) => e.target.style.background = '#dc3545'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && serviceToDelete && (
        <div style={styles.modalOverlay} onClick={handleCancelDelete}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Confirmar Eliminación</h3>
            <p style={styles.modalMessage}>
              ¿Estás seguro que deseas eliminar el servicio <strong>{serviceToDelete.name}</strong>?
            </p>
            <p style={styles.modalWarning}>
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={handleCancelDelete}
                style={styles.btnCancel}
                onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                onMouseOut={(e) => e.target.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                style={{...styles.btnConfirm, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
                onMouseOver={(e) => !loading && (e.target.style.background = '#c82333')}
                onMouseOut={(e) => !loading && (e.target.style.background = '#dc3545')}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraServicesManagement;
