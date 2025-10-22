import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

const HomePageSettings = () => {
    const [presentationImages, setPresentationImages] = useState([]);
    const [opinionImages, setOpinionImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchHomePageImages();
    }, []);

    const fetchHomePageImages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiConfig.baseUrl}/api/homepage-images`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPresentationImages(data.presentationImages || []);
                setOpinionImages(data.opinionImages || []);
            }
        } catch (err) {
            console.error('Error fetching homepage images:', err);
            // Si falla, usar imágenes por defecto
            setPresentationImages([
                '../../assets/Fondos/Río.jpg',
                '../../assets/Fondos/Fondo5.jpg',
                '../../assets/Fondos/Entrada.jpg',
            ]);
            setOpinionImages([
                '../../assets/Fondos/columpio delante.jpg',
                '../../assets/Fondos/turista acostado en hamaca.jpg',
                '../../assets/Fondos/turistas en rio 2.jpg',
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (section, index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (section === 'presentation') {
                    const newImages = [...presentationImages];
                    newImages[index] = reader.result;
                    setPresentationImages(newImages);
                } else if (section === 'opinion') {
                    const newImages = [...opinionImages];
                    newImages[index] = reader.result;
                    setOpinionImages(newImages);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            const token = localStorage.getItem('token');

            // Guardar imágenes de presentación
            const presentationFormData = new FormData();
            presentationImages.forEach((img, index) => {
                if (img instanceof File) {
                    presentationFormData.append(`presentationImages`, img);
                } else if (typeof img === 'string' && img.startsWith('data:')) {
                    const arr = img.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    const n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    for (let i = 0; i < n; i++) {
                        u8arr[i] = bstr.charCodeAt(i);
                    }
                    presentationFormData.append(`presentationImages`, new Blob([u8arr], { type: mime }));
                }
            });

            const presentationResponse = await fetch(`${apiConfig.baseUrl}/api/homepage-images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: presentationFormData
            });

            if (!presentationResponse.ok) {
                throw new Error('Error al guardar imágenes de presentación');
            }

            // Guardar imágenes de opinión
            const opinionFormData = new FormData();
            opinionImages.forEach((img, index) => {
                if (img instanceof File) {
                    opinionFormData.append(`opinionImages`, img);
                } else if (typeof img === 'string' && img.startsWith('data:')) {
                    const arr = img.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    const n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    for (let i = 0; i < n; i++) {
                        u8arr[i] = bstr.charCodeAt(i);
                    }
                    opinionFormData.append(`opinionImages`, new Blob([u8arr], { type: mime }));
                }
            });

            const opinionResponse = await fetch(`${apiConfig.baseUrl}/api/homepage-images/opinion`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: opinionFormData
            });

            if (!opinionResponse.ok) {
                throw new Error('Error al guardar imágenes de opinión');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            alert('Imágenes guardadas correctamente');
        } catch (err) {
            console.error('Error saving images:', err);
            setError(err.message || 'Error al guardar las imágenes');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: 'var(--card-background)',
            borderRadius: '8px',
            boxShadow: '0 5px 15px var(--shadow-light)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        section: {
            marginBottom: '20px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '15px',
        },
        title: {
            fontSize: '1.5rem',
            color: 'var(--rich-black)',
            marginBottom: '15px',
            fontWeight: '600',
        },
        subtitle: {
            fontSize: '1.2rem',
            color: 'var(--rich-black)',
            marginBottom: '10px',
            fontWeight: '500',
        },
        imageContainer: {
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        imageWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: 'var(--alice-blue)',
        },
        imagePreview: {
            width: '150px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '5px',
            marginBottom: '5px',
        },
        fileInput: {
            marginTop: '5px',
        },
        button: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px',
            alignSelf: 'flex-end',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Opciones de Página de Inicio</h2>

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

            {success && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '12px 20px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #c3e6cb'
                }}>
                    ✓ Cambios guardados correctamente
                </div>
            )}

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Presentación (Máx. 3)</h3>
                <div style={styles.imageContainer}>
                    {presentationImages.map((img, index) => (
                        <div key={index} style={styles.imageWrapper}>
                            <img 
                                src={img} 
                                alt={`Presentación ${index + 1}`} 
                                style={styles.imagePreview}
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbjwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                            <label style={{
                                cursor: loading ? 'not-allowed' : 'pointer',
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: 'none',
                                opacity: loading ? 0.6 : 1
                            }}>
                                {loading ? 'Guardando...' : 'Cambiar'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange('presentation', index, e)}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Opinión (Máx. 3)</h3>
                <div style={styles.imageContainer}>
                    {opinionImages.map((img, index) => (
                        <div key={index} style={styles.imageWrapper}>
                            <img 
                                src={img} 
                                alt={`Opinión ${index + 1}`} 
                                style={styles.imagePreview}
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbjwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                            <label style={{
                                cursor: loading ? 'not-allowed' : 'pointer',
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: 'none',
                                opacity: loading ? 0.6 : 1
                            }}>
                                {loading ? 'Guardando...' : 'Cambiar'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange('opinion', index, e)}
                                    style={{ display: 'none' }}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                style={{...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
                onClick={handleSaveChanges}
                disabled={loading}
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    );
};

export default HomePageSettings;