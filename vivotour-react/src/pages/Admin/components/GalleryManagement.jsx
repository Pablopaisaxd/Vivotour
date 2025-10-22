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
    // Inicializar galería automáticamente al cargar
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
        // Recargar imágenes de la categoría seleccionada si existe
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
      // Error fetching categories
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
      // Error fetching images
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
        // Limpiar el input
        event.target.value = '';
      } else {
        setError(data.mensaje || 'Error desconocido');
        alert('Error: ' + (data.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      // Error adding images
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

  return (
    <div className="gallery-management-full" style={{ padding: '20px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Gestión de Galería</h2>
      </div>
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px 20px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
        </div>
      )}
      <div style={{ 
        display: 'grid', 
        /* Show exactly 2 cards per row */
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '30px',
        marginTop: '20px',
        margin: '20px 0',
        padding: '0',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {categories.map(category => (
          <div key={category.IdCategoria} style={{
            border: '2px solid #4bac35',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(75,172,53,0.15)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(75,172,53,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(75,172,53,0.15)';
          }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              borderBottom: '2px solid #4bac35',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#4bac35' }}>
                {categoryTexts[category.IdCategoria] || category.NombreCategoria}
              </h3>
              <label style={{
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: '#4bac35',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(75,172,53,0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d9129'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4bac35'}
              title="Editar portada">
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
              style={{
                position: 'relative',
                width: '100%',
                /* Make cover image container a horizontal rectangle instead of a square */
                paddingBottom: '60%',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <img 
                src={coverImages[category.IdCategoria]} 
                alt={category.NombreCategoria}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(75,172,53,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.3s',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              >
                <span>Gestionar Imágenes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para gestionar imágenes */}
      {showModal && selectedCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0 }}>
                Gestionar: {categoryTexts[selectedCategory.IdCategoria] || selectedCategory.NombreCategoria}
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}>
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
                  {loading ? 'Subiendo...' : 'Agregar Imágenes'}
                </label>
                <button 
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {loading && (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                fontSize: '16px',
                color: '#666'
              }}>
                Cargando...
              </div>
            )}

            <div style={{ 
              padding: '20px', 
              flex: 1, 
              overflow: 'auto' 
            }}>
              {currentImages.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  {currentImages.map((image) => {
                    // Obtener ID de la imagen (puede ser IdGaleria o IdImagen dependiendo de la tabla)
                    const imageId = image.IdGaleria || image.IdImagen;
                    
                    // Construir la URL según el tipo de imagen
                    let imageUrl = image.RutaImagen;
                    
                    // Si es una ruta de assets (comienza con /src/assets)
                    if (imageUrl.startsWith('/src/assets/')) {
                      // Importar dinámicamente desde assets
                      try {
                        // Convertir ruta: /src/assets/imgs/fauna/mono.jpg -> fauna/mono.jpg
                        const pathParts = imageUrl.replace('/src/assets/imgs/', '').split('/');
                        
                        // Usar import.meta.glob para cargar la imagen
                        const allImgs = import.meta.glob('../../assets/imgs/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
                        const matchedKey = Object.keys(allImgs).find(key => key.includes(pathParts[pathParts.length - 1]));
                        
                        if (matchedKey) {
                          imageUrl = allImgs[matchedKey].default;
                        }
                      } catch (e) {
                        // Error loading asset image
                      }
                    } else if (imageUrl.startsWith('/uploads/')) {
                      // Si es una imagen subida, usar URL completa del servidor
                      imageUrl = `${apiConfig.baseUrl}${imageUrl}`;
                    }
                    
                    return (
                    <div key={imageId} style={{
                      position: 'relative',
                      /* Make modal image tiles rectangular (wider) using 16:9 aspect ratio */
                      aspectRatio: '16/9',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <img 
                        src={imageUrl} 
                        alt={`Imagen ${imageId}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.warn('❌ Error loading image:', image.RutaImagen, '| Final URL:', imageUrl);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button 
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                        onClick={() => handleDeleteImage(imageId)}
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6c757d'
                }}>
                  <p>No hay imágenes en esta categoría</p>
                  <p style={{ fontSize: '14px' }}>Haz clic en "Agregar Imágenes" para subir nuevas fotos</p>
                </div>
              )}

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '25px',
                  padding: '15px'
                }}>
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentPage === 0 ? '#e9ecef' : '#007bff',
                      color: currentPage === 0 ? '#6c757d' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Anterior
                  </button>
                  <span style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6'
                  }}>
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentPage === totalPages - 1 ? '#e9ecef' : '#007bff',
                      color: currentPage === totalPages - 1 ? '#6c757d' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #eee',
              backgroundColor: '#f8f9fa',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Total de imágenes: {categoryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
