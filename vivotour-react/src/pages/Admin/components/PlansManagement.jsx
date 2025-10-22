import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

// Importar imágenes antiguas de los planes
const imgsRio = Object.values(import.meta.glob('../../../assets/imgs/rio/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaFenix = Object.values(import.meta.glob('../../../assets/imgs/cabañas/Cabaña_fenix/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaAventureros = Object.values(import.meta.glob('../../../assets/imgs/cabañas/Cabaña_los_aventureros/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCamping = Object.values(import.meta.glob('../../../assets/imgs/zona_camping/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));

// Planes existentes desde Reserva.jsx - Importados directamente
const PLANS = [
    {
        id: 'ventana-rio',
        title: 'Plan Amanecer Ventana del Río Melcocho',
        price: 200000,
        priceType: 'perPerson',
        capacity: { min: 1, max: 6 },
        fixedNights: 1,
        images: imgsRio.slice(0, 8),
        description: 'Incluye reserva y seguro, cena del día de llegada, desayuno y fiambre al día siguiente, transporte en mula para entrar (1.5h aprox) y tour al río Melcocho con guía al día siguiente. Comodidades: baño con agua caliente, jacuzzi climatizado al aire libre, malla catamarán y hamacas.',
    },
    {
        id: 'cabana-fenix',
        title: 'Cabaña Fénix (pareja)',
        price: 600000,
        priceType: 'perCouple',
        capacity: { min: 2, max: 2 },
        fixedNights: 1,
        images: imgsCabanaFenix,
        description: 'Incluye reserva y seguro, tres comidas (cena, desayuno y fiambre), transporte en mula para entrar y salir, tour al río Melcocho. Comodidades exclusivas: baño con agua caliente, jacuzzi privado y malla catamarán.',
    },
    {
        id: 'cabana-aventureros',
        title: 'Cabaña de los Aventureros',
        price: 200000,
        priceType: 'perPerson',
        capacity: { min: 1, max: 8 },
        fixedNights: 1,
        images: imgsCabanaAventureros,
        description: '2 días, 1 noche. Incluye reserva, seguro, transporte en mula a la finca, cena de bienvenida, desayuno, fiambre y excursión guiada al río Melcocho. Comodidades: jacuzzi al aire libre, malla catamarán y hamacas.',
    },
    {
        id: 'dia-de-sol',
        title: 'Día de sol en el Río Melcocho',
        price: 40000,
        priceType: 'perPerson',
        capacity: { min: 1, max: 12 },
        fixedNights: 0,
        images: imgsRio.slice(10, 18),
        description: 'Incluye reserva, seguro y fiambre. Caminata de 20 a 60 minutos según el charco elegido. Ideal para disfrutar el día y conectar con la naturaleza.',
    },
];

const PlansManagement = () => {
  const [plans, setPlans] = useState(PLANS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    priceType: 'perPerson',
    capacity: { min: 1, max: 6 },
    fixedNights: 1,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [previewImages, setPreviewImages] = useState([]); // Imágenes en preview (locales)
  const [uploadingImages, setUploadingImages] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [planImages, setPlanImages] = useState({}); // { planId: [{ url, filename }] }

  // Función para generar ID automáticamente desde el título
  const generateId = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Manejar selección de imágenes (preview local)
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviewImages([...previewImages, ...newImages]);
  };

  // Eliminar imagen del preview
  const removePreviewImage = (index) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
  };

  // Subir imágenes seleccionadas al servidor
  const handleUploadImages = async () => {
    if (!editingId || previewImages.length === 0) {
      setError('Selecciona un plan y al menos una imagen');
      return;
    }

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }

    try {
      setUploadingImages(true);
      setError(null);

      const uploadedImages = [];
      let failedCount = 0;

      for (let i = 0; i < previewImages.length; i++) {
        const img = previewImages[i];
        const formDataUpload = new FormData();
        formDataUpload.append('image', img.file);

        try {
          const uploadUrl = `${apiConfig.baseUrl}/api/plans/${editingId}/images`;
          
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
            },
            body: formDataUpload,
          });

          if (response.ok) {
            const data = await response.json();
            uploadedImages.push({
              url: data.imageUrl,
              filename: data.filename
            });
          } else {
            const errorData = await response.json();
            console.error(`Error subiendo imagen ${i + 1}:`, errorData);
            failedCount++;
          }
        } catch (err) {
          console.error(`Error en carga de imagen ${i + 1}:`, err);
          failedCount++;
        }
      }

      // Actualizar la lista de imágenes del plan
      if (uploadedImages.length > 0) {
        setPlanImages({
          ...planImages,
          [editingId]: [...(planImages[editingId] || []), ...uploadedImages]
        });
        setPreviewImages([]);
        setSuccess(true);
        if (failedCount === 0) {
        } else {
          setError(`⚠️ Se subieron ${uploadedImages.length} imágenes, pero ${failedCount} fallaron`);
        }
        setTimeout(() => {
          setSuccess(false);
          setError(null);
        }, 3000);
      } else if (failedCount > 0) {
        setError(`Error: No se pudo subir ninguna de las ${previewImages.length} imágenes`);
      }
    } catch (err) {
      console.error('Error en handleUploadImages:', err);
      setError('Error al subir imágenes: ' + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  // Cargar imágenes de un plan (antiguas + nuevas)
  const loadPlanImages = async (planId) => {
    const currentToken = localStorage.getItem('token');
    
    try {
      // Obtener imágenes antiguas del PLANS local
      const planDefecto = PLANS.find(p => p.id === planId);
      const imagenasAntiguas = planDefecto?.images || [];
      
      // Convertir imágenes antiguas al formato de imágenes nuevas
      const imagenasAntiguasFormato = imagenasAntiguas.map((url, idx) => ({
        url: url,
        filename: `legacy_${planId}_${idx}`,
        isLegacy: true // Marcar como antigua para no poder eliminar
      }));

      if (!currentToken) {
        // Si no hay token, solo mostrar las antiguas
        setPlanImages({
          ...planImages,
          [planId]: imagenasAntiguasFormato
        });
        return;
      }

      // Obtener imágenes nuevas del servidor
      const response = await fetch(`${apiConfig.baseUrl}/api/plans/${planId}/images`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const nuevasImagenes = data.images || [];
        
        // Mezclar antiguas + nuevas
        const todasLasImagenes = [
          ...imagenasAntiguasFormato,
          ...nuevasImagenes.map(img => ({
            ...img,
            isLegacy: false
          }))
        ];
        
        setPlanImages({
          ...planImages,
          [planId]: todasLasImagenes
        });
      } else {
        // Si hay error al traer nuevas, solo mostrar antiguas
        setPlanImages({
          ...planImages,
          [planId]: imagenasAntiguasFormato
        });
      }
    } catch (err) {
      console.error('Error cargando imágenes:', err);
      // Fallback: mostrar solo las antiguas
      const planDefecto = PLANS.find(p => p.id === planId);
      const imagenasAntiguas = planDefecto?.images || [];
      const imagenasAntiguasFormato = imagenasAntiguas.map((url, idx) => ({
        url: url,
        filename: `legacy_${planId}_${idx}`,
        isLegacy: true
      }));
      setPlanImages({
        ...planImages,
        [planId]: imagenasAntiguasFormato
      });
    }
  };

  // Eliminar una imagen subida
  const handleDeleteImage = async (planId, filename) => {
    // Verificar si es una imagen antigua (legacy)
    const imagen = planImages[planId]?.find(img => img.filename === filename);
    if (imagen?.isLegacy) {
      setError('No se pueden eliminar las fotos antiguas, solo las nuevas subidas.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setError('No hay token de autenticación');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiConfig.baseUrl}/api/plans/${planId}/images/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        // Actualizar lista local
        setPlanImages({
          ...planImages,
          [planId]: planImages[planId].filter(img => img.filename !== filename)
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al eliminar la imagen');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al eliminar imagen');
    } finally {
      setLoading(false);
    }
  };

  // Cargar planes del servidor
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setPlans(PLANS);
        return;
      }

      const response = await fetch(`${apiConfig.baseUrl}/api/plans`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plans && data.plans.length > 0) {
          // Mapear los campos del backend al formato esperado por el frontend
          const mappedPlans = data.plans.map(plan => ({
            id: plan.id,
            title: plan.name, // El backend usa 'name', el frontend usa 'title'
            description: plan.description,
            price: plan.price,
            duration: plan.duration,
            maxPersons: plan.maxPersons,
            capacity: {
              min: 1,
              max: plan.maxPersons || 6
            },
            fixedNights: plan.duration || 1,
            priceType: 'perPerson', // Campo que el backend no guarda, usar por defecto
            includesFood: plan.includesFood,
            includesTransport: plan.includesTransport,
            includesGuide: plan.includesGuide,
          }));
          setPlans(mappedPlans);
        } else {
          // Si no hay planes en BD, usar los por defecto
          setPlans(PLANS);
        }
      } else {
        console.error('Error loading plans:', response.status);
        setPlans(PLANS);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans(PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    
    if (name.startsWith('capacity.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        capacity: {
          ...prev.capacity,
          [key]: parseInt(value)
        }
      }));
    } else if (name === 'title' && !editingId) {
      // Generar automáticamente el ID cuando editas el título (solo en creación, no en edición)
      setFormData(prev => ({
        ...prev,
        [name]: value,
        id: generateId(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      if (!formData.title || !formData.price) {
        setError('Título y precio son requeridos');
        return;
      }

      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setError('No hay token de autenticación');
        return;
      }

      setLoading(true);

      const dataToSend = {
        name: formData.title,
        description: formData.description || '',
        price: parseFloat(formData.price),
        duration: parseInt(formData.fixedNights) || 1,
        maxPersons: parseInt(formData.capacity?.max) || 6,
      };

      const url = editingId 
        ? `${apiConfig.baseUrl}/api/plans/${editingId}` 
        : `${apiConfig.baseUrl}/api/plans`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        
        const isNewPlan = !editingId;
        
        // Si es un plan nuevo, guardar el ID para usar en subida de imágenes
        if (isNewPlan && data.planId) {
          setEditingId(data.planId);
          
          // Recargar los planes del servidor para sincronizar
          await loadPlans();
          
          // Si hay imágenes en preview, subirlas automáticamente
          if (previewImages.length > 0) {
            for (let i = 0; i < previewImages.length; i++) {
              const img = previewImages[i];
              const formDataUpload = new FormData();
              formDataUpload.append('image', img.file);

              try {
                const uploadUrl = `${apiConfig.baseUrl}/api/plans/${data.planId}/images`;
                const uploadResponse = await fetch(uploadUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${currentToken}`,
                  },
                  body: formDataUpload,
                });

                if (!uploadResponse.ok) {
                  console.error(`Error subiendo imagen ${i + 1}`);
                }
              } catch (uploadErr) {
                console.error(`Error en subida de imagen ${i + 1}:`, uploadErr);
              }
            }
            
            // Limpiar imágenes preview después de subir
            setPreviewImages([]);
            
            // Cargar las imágenes del plan para mostrar las que se acaban de subir
            await loadPlanImages(data.planId);
          }
          
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          // Para planes existentes
          // Recargar los planes del servidor para sincronizar
          await loadPlans();
          
          setSuccess(true);
          setShowForm(false);
          // Limpiar el formulario solo si fue un plan existente
          setFormData({
            id: '',
            title: '',
            description: '',
            price: '',
            priceType: 'perPerson',
            capacity: { min: 1, max: 6 },
            fixedNights: 1,
            addons: []
          });
          setEditingId(null);
          setTimeout(() => setSuccess(false), 3000);
        }
      } else {
        const errorText = await response.text();
        setError('Error al guardar: ' + response.status + ' - ' + errorText);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error: ' + String(err?.message || 'Desconocido'));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      id: plan.id,
      title: plan.title,
      description: plan.description || '',
      price: plan.price,
      priceType: plan.priceType || 'perPerson',
      capacity: plan.capacity || { min: 1, max: 6 },
      fixedNights: plan.fixedNights || plan.duration || 1,
    });
    setEditingId(plan.id);
    setShowForm(true);
    setCarouselIndex(0);
    setPreviewImages([]);
    // Cargar imágenes del plan
    loadPlanImages(plan.id);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

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
      
      const response = await fetch(`${apiConfig.baseUrl}/api/plans/${planToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess(true);
        setShowDeleteModal(false);
        // Actualizar estado local removiendo el plan
        setPlans(plans.filter(p => p.id !== planToDelete.id));
        setPlanToDelete(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.mensaje || 'Error al eliminar el plan');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
      console.error('Error deleting plan:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const handleDelete = async (id) => {
    // Mantener para compatibilidad, pero usar el modal ahora
    const plan = plans.find(p => p.id === id);
    if (plan) {
      handleDeleteClick(plan);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      price: '',
      priceType: 'perPerson',
      capacity: { min: 1, max: 6 },
      fixedNights: 1,
      addons: []
    });
    setEditingId(null);
    setShowForm(false);
    setPreviewImages([]);
    setCarouselIndex(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
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
    textarea: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid var(--border-color-light)',
      fontSize: '14px',
      fontFamily: 'inherit',
      minHeight: '100px',
      resize: 'vertical'
    },
    checkboxGroup: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px'
    },
    planCard: {
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
      minHeight: '320px',
      boxSizing: 'border-box'
    },
    planTitle: {
      fontSize: '1.05rem',
      fontWeight: '600',
      marginBottom: '5px',
      color: 'var(--rich-black)'
    },
    planPrice: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: 'var(--forest-green)',
      marginBottom: '8px'
    },
    planDescription: {
      fontSize: '14px',
      color: '#555',
      marginBottom: '15px',
      minHeight: '70px',
      flex: '1'
    },
    planDetails: {
      fontSize: '13px',
      color: '#666',
      marginBottom: '8px'
    },
    planActions: {
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
    },
    modalTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      marginBottom: '15px',
      color: 'var(--rich-black)',
    },
    modalMessage: {
      fontSize: '1rem',
      color: '#333',
      marginBottom: '10px',
      lineHeight: '1.5',
    },
    modalWarning: {
      fontSize: '0.9rem',
      color: '#dc3545',
      fontStyle: 'italic',
      marginBottom: '20px',
    },
    modalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
    },
    btnCancel: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '2px solid #ccc',
      backgroundColor: '#fff',
      color: '#333',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
    },
    btnConfirm: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#dc3545',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
    }
  };

  return (
    <div style={styles.container} className="plans-management-container">
      <h2 style={styles.title}>Gestión de Planes de Reserva</h2>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>Cambios guardados exitosamente</div>}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            if (!showForm) {
              // Si estamos abriendo el formulario para crear un plan nuevo
              setEditingId(null);
              setFormData({
                id: '',
                title: '',
                description: '',
                price: '',
                priceType: 'perPerson',
                capacity: { min: 1, max: 6 },
                fixedNights: 1,
                addons: []
              });
            }
            setShowForm(!showForm);
          }}
          style={{ ...styles.button, ...styles.submitBtn }}
        >
          {showForm ? 'Cerrar formulario' : 'Crear Nuevo Plan'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={{ marginBottom: '20px', color: 'var(--rich-black)' }}>
            {editingId ? 'Editar Plan' : 'Nuevo Plan'}
          </h3>

          <form id="plan-form" onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Título del Plan</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ej: Plan Aventura"
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
                placeholder="Describe el plan detalladamente"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Precio (COP)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="40000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Precio</label>
                <select
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="perPerson">Por Persona</option>
                  <option value="perCouple">Por Pareja</option>
                  <option value="fixed">Precio Fijo</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Noches</label>
                <input
                  type="number"
                  name="fixedNights"
                  value={formData.fixedNights}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacidad Mínima</label>
                <input
                  type="number"
                  name="capacity.min"
                  value={formData.capacity.min}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="1"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Capacidad Máxima</label>
                <input
                  type="number"
                  name="capacity.max"
                  value={formData.capacity.max}
                  onChange={handleInputChange}
                  style={styles.input}
                  min="1"
                />
              </div>
            </div>

          </form>

          {/* Sección de Imágenes - Siempre que el formulario esté abierto */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--rich-black)' }}>Fotos del Plan</h3>
              
              {/* Input file */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Agregar Fotos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={styles.input}
                />
              </div>

              {/* Preview de imágenes a subir */}
              {previewImages.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--rich-black)', marginBottom: '10px' }}>Imágenes por subir ({previewImages.length})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {previewImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={img.preview} 
                          alt={`preview-${idx}`} 
                          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploadingImages}
                    style={{
                      ...styles.button,
                      ...styles.submitBtn,
                      marginTop: '10px',
                      opacity: uploadingImages ? 0.6 : 1
                    }}
                  >
                    {uploadingImages ? 'Subiendo...' : `Subir ${previewImages.length} imagen(s)`}
                  </button>
                </div>
              )}

              {/* Imágenes subidas */}
              {planImages[editingId] && planImages[editingId].length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--rich-black)', marginBottom: '15px' }}>
                    Fotos del Plan ({planImages[editingId].length})
                  </h4>
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#f0f8ff', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
                    <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                      ℹ️ <strong>La primera foto es la portada</strong> que se muestra en la reserva
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {planImages[editingId].map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={img.isLegacy ? img.url : `${apiConfig.baseUrl}${img.url}`}
                          alt={`uploaded-${idx}`} 
                          style={{ 
                            width: '100%', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            opacity: img.isLegacy ? 0.8 : 1,
                            border: idx === 0 ? '3px solid #FFD700' : img.isLegacy ? '2px solid #999' : 'none'
                          }}
                          title={idx === 0 ? '⭐ Portada del plan' : img.isLegacy ? 'Foto original del plan' : 'Foto subida'}
                        />
                        {/* Badge de portada */}
                        {idx === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            background: '#FFD700',
                            color: '#333',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            ⭐ PORTADA
                          </div>
                        )}
                        {/* Solo mostrar botón de eliminar para imágenes nuevas */}
                        {!img.isLegacy && (
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(editingId, img.filename)}
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '25px',
                              height: '25px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              opacity: loading ? 0.6 : 1
                            }}
                          >
                            ×
                          </button>
                        )}
                        {/* Badge para imágenes antiguas */}
                        {img.isLegacy && (
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            Original
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!planImages[editingId] || planImages[editingId].length === 0) && previewImages.length === 0 && (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No hay fotos aún. Selecciona y sube imágenes para este plan.</p>
              )}
            </div>

            {/* Botones de Crear/Actualizar - Después de la sección de fotos */}
            <div style={{ ...styles.buttonGroup, marginTop: '30px' }}>
              <button
                type="submit"
                form="plan-form"
                disabled={loading}
                style={{ ...styles.button, ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar Plan' : 'Crear Plan'}
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
        </div>
      )}

      <h3 style={{ marginBottom: '20px', color: 'var(--rich-black)', marginTop: '30px' }}>Planes Actuales</h3>
      <div style={styles.plansGrid}>
        {plans.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
            No hay planes creados aún
          </p>
        ) : (
          plans.map(plan => (
            <div key={plan.id} style={styles.planCard}>
              <div style={styles.planTitle}>{plan.title}</div>
              <div style={styles.planPrice}>{formatPrice(plan.price)}</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                <strong>Tipo:</strong> {plan.priceType === 'perPerson' ? 'Por Persona' : plan.priceType === 'perCouple' ? 'Por Pareja' : 'Precio Fijo'} 
                {' | '}
                <strong>Noches:</strong> {plan.fixedNights}
              </div>
              <div style={styles.planDescription}>{plan.description}</div>
              <div style={styles.planDetails}>
                <strong>Capacidad:</strong> {plan.capacity?.min ?? 1} - {plan.capacity?.max ?? 6} personas
              </div>
              <div style={styles.planActions}>
                <button
                  onClick={() => handleEdit(plan)}
                  style={styles.btnPrimary}
                  onMouseOver={(e) => e.target.style.background = '#3d9129'}
                  onMouseOut={(e) => e.target.style.background = 'var(--forest-green)'}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(plan)}
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

      {showDeleteModal && planToDelete && (
        <div style={styles.modalOverlay} onClick={handleCancelDelete}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Confirmar Eliminación</h3>
            <p style={styles.modalMessage}>
              ¿Estás seguro que deseas eliminar el plan <strong>{planToDelete.title}</strong>?
            </p>
            <p style={styles.modalWarning}>Esta acción no se puede deshacer.</p>
            <div style={styles.modalButtons}>
              <button onClick={handleCancelDelete} style={styles.btnCancel}>
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={loading} 
                style={{...styles.btnConfirm, opacity: loading ? 0.7 : 1}}
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

export default PlansManagement;
