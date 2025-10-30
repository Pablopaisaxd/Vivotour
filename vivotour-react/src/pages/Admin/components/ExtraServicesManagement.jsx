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
      await fetch(`${apiConfig.baseUrl}/api/initialize-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => console.log('Initialize data call result:', err));

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
    setShowForm(true);
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
        await fetchServices();
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
    setShowForm(false);
  };

  const getCategoryLabel = (value) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const styles = {
    container: {
      padding: '1.5rem',
      background: 'var(--alice-blue)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '12px',
      border: '1px solid var(--input-border)',
      boxShadow: '0 8px 32px var(--shadow-light)',
    },
    title: {
      fontSize: '1.75rem',
      marginBottom: '1.5rem',
      textAlign: 'center',
      color: 'var(--rich-black)',
      fontWeight: '700',
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    formContainer: {
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: '1px solid var(--input-border)',
      backdropFilter: 'blur(10px)',
    },
    formGroup: {
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: 'var(--rich-black)',
      fontSize: '0.95rem'
    },
    input: {
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid var(--input-border)',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      background: 'var(--input-bg)',
      color: 'var(--rich-black)',
      transition: 'var(--transition)',
    },
    select: {
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid var(--input-border)',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      background: 'var(--input-bg)',
      color: 'var(--rich-black)',
      transition: 'var(--transition)',
    },
    textarea: {
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid var(--input-border)',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      minHeight: '100px',
      resize: 'vertical',
      background: 'var(--input-bg)',
      color: 'var(--rich-black)',
      transition: 'var(--transition)',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      border: 'none',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'var(--transition)',
      fontSize: '0.95rem',
      boxShadow: '0 4px 12px var(--shadow-light)',
    },
    submitBtn: {
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      color: 'white',
      boxShadow: '0 4px 15px var(--shadow-strong)',
    },
    cancelBtn: {
      background: 'rgba(255, 255, 255, 0.8)',
      color: 'var(--rich-black)',
      border: '1px solid var(--input-border)',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    serviceCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '1.5rem',
      borderRadius: '16px',
      border: '1px solid var(--input-border)',
      boxShadow: '0 4px 20px var(--shadow-light)',
      cursor: 'default',
      transition: 'var(--transition)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minHeight: '320px',
      boxSizing: 'border-box',
      backdropFilter: 'blur(10px)',
    },
    serviceTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: 'var(--rich-black)'
    },
    servicePrice: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: 'var(--forest-green)',
      marginBottom: '0.75rem'
    },
    serviceCategory: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '700',
      marginBottom: '1rem',
      width: 'fit-content',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    serviceDescription: {
      fontSize: '0.95rem',
      color: 'var(--input-placeholder)',
      marginBottom: '1rem',
      minHeight: '60px',
      flex: '1',
      lineHeight: '1.5',
    },
    serviceActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'center',
      marginTop: 'auto',
      paddingTop: '1rem'
    },
    btnPrimary: {
      padding: '0.75rem 1.25rem',
      borderRadius: '20px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'var(--transition)',
      fontSize: '0.9rem',
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      color: 'white',
      boxShadow: '0 4px 12px var(--shadow-strong)',
    },
    btnDanger: {
      padding: '0.75rem 1.25rem',
      borderRadius: '20px',
      fontWeight: '700',
      cursor: 'pointer',
      border: 'none',
      transition: 'var(--transition)',
      fontSize: '0.9rem',
      background: 'linear-gradient(135deg, #dc3545, #c82333)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
    },
    alert: {
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid',
      fontWeight: '500',
    },
    alertError: {
      background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
      color: '#721c24',
      borderColor: '#dc3545'
    },
    alertSuccess: {
      background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
      color: '#155724',
      borderColor: 'var(--forest-green)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(26, 24, 27, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)',
    },
    modalContent: {
      background: 'var(--alice-blue)',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(26, 24, 27, 0.3)',
      maxWidth: '450px',
      width: '90%',
      border: '1px solid var(--input-border)',
    },
    modalTitle: {
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: 'var(--rich-black)',
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: '1rem',
      color: 'var(--rich-black)',
      marginBottom: '0.75rem',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    modalWarning: {
      fontSize: '0.9rem',
      color: '#dc3545',
      fontWeight: '600',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    modalButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    btnCancel: {
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      fontSize: '0.95rem',
      fontWeight: '600',
      border: '1px solid var(--input-border)',
      background: 'rgba(255, 255, 255, 0.8)',
      color: 'var(--rich-black)',
      cursor: 'pointer',
      transition: 'var(--transition)',
    },
    btnConfirm: {
      padding: '0.75rem 1.5rem',
      borderRadius: '25px',
      fontSize: '0.95rem',
      fontWeight: '600',
      border: 'none',
      background: 'linear-gradient(135deg, #dc3545, #c82333)',
      color: 'white',
      cursor: 'pointer',
      transition: 'var(--transition)',
      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
    },
    noServices: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      color: 'var(--input-placeholder)',
      fontSize: '1.1rem',
      fontStyle: 'italic',
      padding: '2rem',
    }
  };

  return (
    <div style={styles.container} className="extra-services-management-container">
      <h2 style={styles.title}>Gestión de Servicios Extras</h2>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>Cambios guardados exitosamente</div>}

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ ...styles.button, ...styles.submitBtn }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px var(--shadow-strong)';
          }}
        >
          {showForm ? '✕ Cerrar formulario' : '➕ Crear Nuevo Servicio'}
        </button>
      </div>

      {showForm && (
      <div style={styles.formContainer}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: 'var(--rich-black)',
          fontSize: '1.3rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {editingId ? '✏️ Editar Servicio' : '➕ Nuevo Servicio Extra'}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

          <div style={{ ...styles.buttonGroup, marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                ...styles.button, 
                ...styles.submitBtn, 
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px var(--shadow-strong)';
              }}
            >
              {loading ? 'Guardando...' : editingId ? '💾 Actualizar Servicio' : '➕ Crear Servicio'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{ ...styles.button, ...styles.cancelBtn }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 15px var(--shadow-medium)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px var(--shadow-light)';
                }}
              >
                ✕ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      )}

      <h3 style={{ 
        marginBottom: '1.5rem', 
        color: 'var(--rich-black)', 
        marginTop: '1.5rem',
        fontSize: '1.3rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        📋 Servicios Actuales
      </h3>
      <div style={styles.servicesGrid}>
        {services.length === 0 ? (
          <p style={styles.noServices}>
            No hay servicios creados aún
          </p>
        ) : (
          services.map(service => (
            <div 
              key={service.id} 
              style={styles.serviceCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 30px var(--shadow-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow-light)';
              }}
            >
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
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px var(--shadow-strong)';
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(service)}
                  style={styles.btnDanger}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDeleteModal && serviceToDelete && (
        <div style={styles.modalOverlay} onClick={handleCancelDelete}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>⚠️ Confirmar Eliminación</h3>
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
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 15px var(--shadow-medium)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px var(--shadow-light)';
                }}
              >
                ✕ Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                style={{
                  ...styles.btnConfirm, 
                  opacity: loading ? 0.6 : 1, 
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                {loading ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraServicesManagement;