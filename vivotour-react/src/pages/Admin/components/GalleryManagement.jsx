import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

const GalleryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryImages, setCategoryImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coverImages, setCoverImages] = useState({});
  const [error, setError] = useState(null);

  const IMAGES_PER_PAGE = 10;

  const defaultCoverImages = {
    1: '/src/assets/Fondos/Fauna.png',
    2: '/src/assets/Fondos/Vegetacion.jpg', 
    3: '/src/assets/Fondos/Rio cascada.jpg',
    4: '/src/assets/Fondos/cabaña square.jpeg',
    5: '/src/assets/Fondos/Puente amarillo.jpg',
    6: '/src/assets/Fondos/Cabalgata.jpg',
    7: '/src/assets/Fondos/Jacuzzi hamaca.jpg'
  };

  const categoryTexts = {
    1: 'Fauna',
    2: 'Flora', 
    3: 'Río',
    4: 'Cabañas',
    5: 'Puentes',
    6: 'Cabalgatas',
    7: 'Experiencias'
  };

  useEffect(() => {
    fetchCategories();
    initializeGalleryOnLoad();
  }, []);

  useEffect(() => {
    // Gallery images updated
  }, [categoryImages]);

  const initializeGalleryOnLoad = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseUrl}/api/gallery/init`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Gallery initialized automatically
      }
    } catch (error) {
      // Gallery already initialized
    }
  };

  const initializeGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiConfig.baseUrl}/api/gallery/init`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.mensaje);
        if (selectedCategory) {
          await fetchCategoryImages(selectedCategory.IdCategoria);
        }
      }
    } catch (error) {
      console.error('❌ Error inicializando galería:', error);
      setError(`Error: ${error.message}`);
      alert('Error al inicializar la galería');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(apiConfig.endpoints.galleryCategories, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        
        const covers = {};
        data.categories.forEach(cat => {
          covers[cat.IdCategoria] = defaultCoverImages[cat.IdCategoria] || '/src/assets/Fondos/default.jpg';
        });
        setCoverImages(covers);
      } else {
        setError('No se pudieron cargar las categorías');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  const fetchCategoryImages = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const url = apiConfig.endpoints.galleryImages(categoryId);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategoryImages(data.images);
      } else {
        setError('No se pudieron cargar las imágenes');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageEdit = async (categoryId, event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await fetch(apiConfig.endpoints.galleryCoverUpdate(categoryId), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCoverImages(prev => ({
          ...prev,
          [categoryId]: `${apiConfig.baseUrl}${data.coverImage.RutaImagen}`
        }));
        alert('Portada actualizada correctamente');
      }
    } catch (error) {
      console.error('❌ Error actualizando portada:', error);
      setError(`Error: ${error.message}`);
      alert('Error al actualizar la portada');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    setShowModal(true);
    fetchCategoryImages(category.IdCategoria);
  };

  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      console.warn('❌ No se seleccionaron archivos');
      return;
    }

    if (!selectedCategory) {
      console.error('❌ No hay categoría seleccionada');
      alert('Por favor selecciona una categoría primero');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      const categoryId = selectedCategory.IdCategoria;
      
      files.forEach(file => {
        formData.append('images', file);
      });

      const url = apiConfig.endpoints.galleryUpload(categoryId);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchCategoryImages(categoryId);
        event.target.value = '';
      } else {
        setError(data.mensaje || 'Error desconocido');
        alert('Error: ' + (data.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      alert('Error al agregar imágenes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(apiConfig.endpoints.galleryDeleteImage(imageId), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchCategoryImages(selectedCategory.IdCategoria);
      }
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(categoryImages.length / IMAGES_PER_PAGE);
  const startIndex = currentPage * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = categoryImages.slice(startIndex, endIndex);

  const styles = {
    container: {
      padding: '1.5rem',
      width: '100%',
      maxWidth: 'none',
      boxSizing: 'border-box',
      background: 'var(--alice-blue)',
      borderRadius: '12px',
      border: '1px solid var(--input-border)',
      boxShadow: '0 8px 32px var(--shadow-light)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    title: {
      margin: 0,
      fontSize: '1.75rem',
      color: 'var(--rich-black)',
      fontWeight: '700',
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    errorAlert: {
      background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
      color: '#721c24',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      border: '1px solid #dc3545',
      fontWeight: '500',
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
      marginTop: '1.5rem',
      margin: '1.5rem 0',
      padding: '0',
      width: '100%',
      boxSizing: 'border-box'
    },
    categoryCard: {
      border: '2px solid var(--forest-green)',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 8px 25px var(--shadow-strong)',
      transition: 'var(--transition)',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
    },
    categoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem',
      borderBottom: '2px solid var(--forest-green)',
      background: 'linear-gradient(135deg, var(--alice-blue), rgba(75, 172, 53, 0.1))',
    },
    categoryTitle: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: '700',
      color: 'var(--forest-green)'
    },
    editButton: {
      cursor: 'pointer',
      padding: '0.75rem',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      transition: 'var(--transition)',
      boxShadow: '0 4px 12px var(--shadow-strong)',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      paddingBottom: '60%',
      cursor: 'pointer',
      overflow: 'hidden'
    },
    coverImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'var(--transition)'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(75, 172, 53, 0.8), rgba(255, 201, 20, 0.8))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      opacity: 0,
      transition: 'var(--transition)',
      fontSize: '1.1rem',
      fontWeight: '700'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(26, 24, 27, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    },
    modalContent: {
      background: 'var(--alice-blue)',
      borderRadius: '16px',
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--input-border)',
      boxShadow: '0 20px 60px rgba(26, 24, 27, 0.3)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: '1px solid var(--input-border)',
      background: 'linear-gradient(135deg, var(--alice-blue), rgba(75, 172, 53, 0.1))',
    },
    modalTitle: {
      margin: 0,
      fontSize: '1.3rem',
      fontWeight: '700',
      color: 'var(--rich-black)'
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    addButton: {
      background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
      color: 'white',
      padding: '0.75rem 1.25rem',
      borderRadius: '25px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'var(--transition)',
      boxShadow: '0 4px 15px var(--shadow-strong)',
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.8)',
      color: 'var(--rich-black)',
      border: '1px solid var(--input-border)',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'var(--transition)',
    },
    loadingText: {
      padding: '3rem',
      textAlign: 'center',
      fontSize: '1.1rem',
      color: 'var(--input-placeholder)',
      fontWeight: '500',
    },
    modalBody: {
      padding: '1.5rem',
      flex: 1,
      overflow: 'auto'
    },
    imagesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem'
    },
    imageCard: {
      position: 'relative',
      aspectRatio: '16/9',
      border: '1px solid var(--input-border)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.8)',
      transition: 'var(--transition)',
    },
    modalImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    deleteButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'linear-gradient(135deg, #dc3545, #c82333)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      transition: 'var(--transition)',
      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'var(--input-placeholder)'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '2rem',
      padding: '1rem'
    },
    paginationButton: {
      padding: '0.75rem 1.25rem',
      borderRadius: '25px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'var(--transition)',
    },
    paginationInfo: {
      padding: '0.75rem 1.25rem',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '25px',
      border: '1px solid var(--input-border)',
      fontWeight: '500',
    },
    modalFooter: {
      padding: '1rem 1.5rem',
      borderTop: '1px solid var(--input-border)',
      background: 'linear-gradient(135deg, var(--alice-blue), rgba(75, 172, 53, 0.1))',
      textAlign: 'center',
      color: 'var(--input-placeholder)'
    }
  };

  return (
    <div className="gallery-management-full" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🖼️ Gestión de Galería</h2>
      </div>
      
      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
        </div>
      )}
      
      <div style={styles.categoriesGrid}>
        {categories.map(category => (
          <div 
            key={category.IdCategoria} 
            style={styles.categoryCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 40px var(--shadow-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-strong)';
            }}
          >
            <div style={styles.categoryHeader}>
              <h3 style={styles.categoryTitle}>
                {categoryTexts[category.IdCategoria] || category.NombreCategoria}
              </h3>
              <label 
                style={styles.editButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-strong)';
                }}
                title="Editar portada"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverImageEdit(category.IdCategoria, e)}
                  style={{ display: 'none' }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </label>
            </div>
            
            <div 
              style={styles.imageContainer}
              onClick={() => handleCategoryClick(category)}
            >
              <img 
                src={coverImages[category.IdCategoria]} 
                alt={category.NombreCategoria}
                style={styles.coverImage}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div 
                style={styles.overlay}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              >
                <span>📸 Gestionar Imágenes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedCategory && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                📸 Gestionar: {categoryTexts[selectedCategory.IdCategoria] || selectedCategory.NombreCategoria}
              </h3>
              <div style={styles.modalActions}>
                <label 
                  style={{
                    ...styles.addButton,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow-strong)';
                  }}
                >
                  <input
                    id={`file-input-${selectedCategory.IdCategoria}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddImages}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                  {loading ? 'Subiendo...' : '➕ Agregar Imágenes'}
                </label>
                <button 
                  style={styles.closeButton}
                  onClick={() => setShowModal(false)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 4px 15px var(--shadow-medium)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow-light)';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {loading && (
              <div style={styles.loadingText}>
                🔄 Cargando...
              </div>
            )}

            <div style={styles.modalBody}>
              {currentImages.length > 0 ? (
                <div style={styles.imagesGrid}>
                  {currentImages.map((image) => {
                    const imageId = image.IdGaleria || image.IdImagen;
                    
                    let imageUrl = image.RutaImagen;
                    
                    if (imageUrl.startsWith('/src/assets/')) {
                      try {
                        const pathParts = imageUrl.replace('/src/assets/imgs/', '').split('/');
                        
                        const allImgs = import.meta.glob('../../assets/imgs/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
                        const matchedKey = Object.keys(allImgs).find(key => key.includes(pathParts[pathParts.length - 1]));
                        
                        if (matchedKey) {
                          imageUrl = allImgs[matchedKey].default;
                        }
                      } catch (e) {
                        // Error loading asset image
                      }
                    } else if (imageUrl.startsWith('/uploads/')) {
                      imageUrl = `${apiConfig.baseUrl}${imageUrl}`;
                    }
                    
                    return (
                    <div 
                      key={imageId} 
                      style={styles.imageCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-medium)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-light)';
                      }}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`Imagen ${imageId}`}
                        style={styles.modalImage}
                        onError={(e) => {
                          console.warn('❌ Error loading image:', image.RutaImagen, '| Final URL:', imageUrl);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDeleteImage(imageId)}
                        title="Eliminar imagen"
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📷 No hay imágenes en esta categoría</p>
                  <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>Haz clic en "Agregar Imágenes" para subir nuevas fotos</p>
                </div>
              )}

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                      ...styles.paginationButton,
                      background: currentPage === 0 ? 'rgba(255, 255, 255, 0.5)' : 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
                      color: currentPage === 0 ? 'var(--input-placeholder)' : 'white',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                      boxShadow: currentPage === 0 ? 'none' : '0 4px 12px var(--shadow-strong)',
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={styles.paginationInfo}>
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      ...styles.paginationButton,
                      background: currentPage === totalPages - 1 ? 'rgba(255, 255, 255, 0.5)' : 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
                      color: currentPage === totalPages - 1 ? 'var(--input-placeholder)' : 'white',
                      cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                      boxShadow: currentPage === totalPages - 1 ? 'none' : '0 4px 12px var(--shadow-strong)',
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                📊 Total de imágenes: {categoryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;