import React, { useState, useEffect } from 'react';

const GalleryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryImages, setCategoryImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [coverImages, setCoverImages] = useState({});

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
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gallery/categories', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
        
        const covers = {};
        data.categories.forEach(cat => {
          covers[cat.IdCategoria] = defaultCoverImages[cat.IdCategoria] || '/src/assets/Fondos/default.jpg';
        });
        setCoverImages(covers);
      }
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
    }
  };

  const fetchCategoryImages = async (categoryId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/images/${categoryId}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCategoryImages(data.images);
      }
    } catch (error) {
      console.error('Error obteniendo imágenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageEdit = async (categoryId, event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await fetch(`http://localhost:5000/api/gallery/category/${categoryId}/cover`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setCoverImages(prev => ({
          ...prev,
          [categoryId]: `http://localhost:5000${data.coverImage.RutaImagen}`
        }));
        alert('Portada actualizada correctamente');
      }
    } catch (error) {
      console.error('Error actualizando portada:', error);
      alert('Error al actualizar la portada');
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
    setShowModal(true);
    fetchCategoryImages(category.IdCategoria);
  };

  const handleAddImages = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:5000/api/gallery/upload/${selectedCategory.IdCategoria}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        fetchCategoryImages(selectedCategory.IdCategoria);
        alert(`${data.images.length} imagen(es) agregada(s) correctamente`);
      }
    } catch (error) {
      console.error('Error agregando imágenes:', error);
      alert('Error al agregar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/image/${imageId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchCategoryImages(selectedCategory.IdCategoria);
        alert('Imagen eliminada correctamente');
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('Error al eliminar imagen');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(categoryImages.length / IMAGES_PER_PAGE);
  const startIndex = currentPage * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = categoryImages.slice(startIndex, endIndex);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Gestión de Galería</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {categories.map(category => (
          <div key={category.IdCategoria} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              borderBottom: '1px solid #eee',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                {categoryTexts[category.IdCategoria] || category.NombreCategoria}
              </h3>
              <label style={{
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                transition: 'background-color 0.2s'
              }} title="Editar portada">
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
                height: '200px',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <img 
                src={coverImages[category.IdCategoria]} 
                alt={category.NombreCategoria}
                style={{
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
                backgroundColor: 'rgba(0,0,0,0.6)',
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
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddImages}
                    style={{ display: 'none' }}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                  Agregar Imágenes
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
                  {currentImages.map((image) => (
                    <div key={image.IdImagen} style={{
                      position: 'relative',
                      aspectRatio: '1',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <img 
                        src={`http://localhost:5000${image.RutaImagen}`} 
                        alt={`Imagen ${image.IdImagen}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
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
                        onClick={() => handleDeleteImage(image.IdImagen)}
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
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
