import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';
import img1 from '../../../assets/Fondos/Rio.jpg';
import img2 from '../../../assets/Fondos/Fondo5.jpg';
import img3 from '../../../assets/Fondos/Entrada.jpg';
import opinImg1 from '../../../assets/Fondos/columpio delante.jpg';
import opinImg2 from '../../../assets/Fondos/turista acostado en hamaca.jpg';
import opinImg3 from '../../../assets/Fondos/turistas en rio 2.jpg';

const DEFAULT_PRESENTATION = [img1, img2, img3];
const DEFAULT_OPINION = [opinImg1, opinImg2, opinImg3];

const assetMap = {
    '/assets/Fondos/Rio.jpg': img1,
    '/assets/Fondos/Río.jpg': img1,
    '/assets/Fondos/Fondo5.jpg': img2,
    '/assets/Fondos/Entrada.jpg': img3,
    '/assets/Fondos/columpio delante.jpg': opinImg1,
    '/assets/Fondos/turista acostado en hamaca.jpg': opinImg2,
    '/assets/Fondos/turistas en rio 2.jpg': opinImg3,
};

const resolveImageUrl = (imgUrl) => {
    if (assetMap[imgUrl]) {
        return assetMap[imgUrl];
    }
    if (imgUrl && imgUrl.startsWith('/uploads/')) {
        return `${apiConfig.baseUrl}${imgUrl}`;
    }
    return imgUrl;
};

const HomePageSettings = () => {
    const [presentationImages, setPresentationImages] = useState(DEFAULT_PRESENTATION);
    const [opinionImages, setOpinionImages] = useState(DEFAULT_OPINION);
    const [presentationChanged, setPresentationChanged] = useState([false, false, false]);
    const [opinionChanged, setOpinionChanged] = useState([false, false, false]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchHomePageImages();
    }, []);

    const fetchHomePageImages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiConfig.baseUrl}/api/homepage-images`);
            if (response.ok) {
                const data = await response.json();
                const pres = (data.presentationImages && data.presentationImages.length > 0)
                    ? data.presentationImages.map(u => resolveImageUrl(u))
                    : DEFAULT_PRESENTATION;
                const opin = (data.opinionImages && data.opinionImages.length > 0)
                    ? data.opinionImages.map(u => resolveImageUrl(u))
                    : DEFAULT_OPINION;
                setPresentationImages(pres);
                setOpinionImages(opin);
            } else {
                setPresentationImages(DEFAULT_PRESENTATION);
                setOpinionImages(DEFAULT_OPINION);
            }
        } catch (err) {
            setPresentationImages(DEFAULT_PRESENTATION);
            setOpinionImages(DEFAULT_OPINION);
        } finally {
            setLoading(false);
        }
    };

    const handle = (section, index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (section === 'presentation') {
                const newImages = [...presentationImages];
                newImages[index] = reader.result;
                setPresentationImages(newImages);
                const newChanged = [...presentationChanged];
                newChanged[index] = true;
                setPresentationChanged(newChanged);
            } else {
                const newImages = [...opinionImages];
                newImages[index] = reader.result;
                setOpinionImages(newImages);
                const newChanged = [...opinionChanged];
                newChanged[index] = true;
                setOpinionChanged(newChanged);
            }
        };
        reader.readAsDataURL(file);
    };

    const getPadded = (images) => {
        const padded = [...images];
        while (padded.length < 3) padded.push(null);
        return padded.slice(0, 3);
    };

    const toFile = (dataUrl, name) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        const u8 = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
        return new File([u8], name, { type: mime });
    };

    const getOriginalAssetPath = (img) => {
        for (const [path, importedImg] of Object.entries(assetMap)) {
            if (importedImg === img) {
                return path;
            }
        }
        return null;
    };

    const save = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            const token = localStorage.getItem('token');
            let ok = false;

            const hasPresentationChanges = presentationChanged.some(c => c);
            if (hasPresentationChanges) {
                const presentationForm = new FormData();
                
                for (let i = 0; i < presentationImages.length; i++) {
                    const img = presentationImages[i];
                    if (img && typeof img === 'string' && img.startsWith('data:')) {
                        presentationForm.append('presentationImages', toFile(img, `pres_${i}.jpg`));
                    }
                }
                
                const existingUrls = [];
                for (let i = 0; i < presentationImages.length; i++) {
                    const img = presentationImages[i];
                    if (img && typeof img === 'string' && !img.startsWith('data:')) {
                        const assetPath = getOriginalAssetPath(img);
                        const ruta = assetPath || img;
                        existingUrls.push({ posicion: i + 1, ruta });
                    }
                }
                
                if (existingUrls.length > 0) {
                    presentationForm.append('existingUrls', JSON.stringify(existingUrls));
                }
                
                const res = await fetch(`${apiConfig.baseUrl}/api/homepage-images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: presentationForm
                });
                
                if (res.ok) ok = true;
            }

            const hasOpinionChanges = opinionChanged.some(c => c);
            if (hasOpinionChanges) {
                const opinionForm = new FormData();
                
                for (let i = 0; i < opinionImages.length; i++) {
                    const img = opinionImages[i];
                    if (img && typeof img === 'string' && img.startsWith('data:')) {
                        opinionForm.append('opinionImages', toFile(img, `opin_${i}.jpg`));
                    }
                }
                
                const existingUrls = [];
                for (let i = 0; i < opinionImages.length; i++) {
                    const img = opinionImages[i];
                    if (img && typeof img === 'string' && !img.startsWith('data:')) {
                        const assetPath = getOriginalAssetPath(img);
                        const ruta = assetPath || img;
                        existingUrls.push({ posicion: i + 1, ruta });
                    }
                }
                
                if (existingUrls.length > 0) {
                    opinionForm.append('existingUrls', JSON.stringify(existingUrls));
                }
                
                const res = await fetch(`${apiConfig.baseUrl}/api/homepage-images/opinion`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: opinionForm
                });
                
                if (res.ok) ok = true;
            }

            if (!ok && !hasPresentationChanges && !hasOpinionChanges) {
                setError('Por favor selecciona al menos una imagen para cambiar');
            } else if (ok) {
                setSuccess(true);
                setPresentationChanged([false, false, false]);
                setOpinionChanged([false, false, false]);
                setTimeout(() => setSuccess(false), 3000);
                await fetchHomePageImages();
            }
        } catch (e) {
            console.error('Error saving:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const ph = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbjwvdGV4dD48L3N2Zz4=';

    const styles = {
        container: {
            padding: '1.5rem',
            background: 'var(--alice-blue)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            borderRadius: '12px',
            border: '1px solid var(--input-border)',
            boxShadow: '0 8px 32px var(--shadow-light)'
        },
        title: {
            fontSize: '1.75rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: 'var(--rich-black)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        alert: {
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '600px',
            fontWeight: '500',
        },
        errorAlert: {
            background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
            color: '#721c24',
            border: '1px solid #dc3545'
        },
        successAlert: {
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
            color: '#155724',
            border: '1px solid var(--forest-green)'
        },
        section: {
            marginBottom: '3rem',
            width: '100%',
            maxWidth: '900px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid var(--input-border)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px var(--shadow-light)',
        },
        sectionTitle: {
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.4rem',
            color: 'var(--rich-black)',
            fontWeight: '600',
            borderBottom: '2px solid var(--forest-green)',
            paddingBottom: '0.5rem',
        },
        imagesGrid: {
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
        imageCard: {
            textAlign: 'center',
            
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--input-border)',
            transition: 'var(--transition)',
            boxShadow: '0 4px 15px var(--shadow-light)',
        },
        image: {
            width: '220px',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '2px solid var(--input-border)',
            transition: 'var(--transition)',
        },
        changeButton: {
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.95rem',
            border: 'none',
            fontWeight: '600',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px var(--shadow-strong)',
        },
        saveButton: {
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            borderRadius: '25px',
            border: 'none',
            fontWeight: '700',
            transition: 'var(--transition)',
            boxShadow: '0 6px 20px var(--shadow-strong)',
            marginTop: '2rem',
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}> Configuración de Página de Inicio</h2>
            
            {error && (
                <div style={{ ...styles.alert, ...styles.errorAlert }}>
                     Error: {error}
                </div>
            )}
            
            {success && (
                <div style={{ ...styles.alert, ...styles.successAlert }}>
                    Cambios guardados exitosamente
                </div>
            )}
            
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}> Imágenes de Presentación</h3>
                <div style={styles.imagesGrid}>
                    {getPadded(presentationImages).map((img, i) => (
                        <div 
                            key={i} 
                            style={styles.imageCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-medium)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow-light)';
                            }}
                        >
                            <img 
                                src={img || ph} 
                                style={styles.image} 
                                onError={(e) => e.target.src = ph}
                                alt={`Presentación ${i + 1}`}
                            />
                            <label 
                                style={styles.changeButton}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px var(--shadow-strong)';
                                }}
                            >
                                 Cambiar
                                <input 
                                    type='file' 
                                    accept='image/*' 
                                    onChange={(e) => handle('presentation', i, e)} 
                                    style={{ display: 'none' }} 
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}> Imágenes de Opinión</h3>
                <div style={styles.imagesGrid}>
                    {getPadded(opinionImages).map((img, i) => (
                        <div 
                            key={i} 
                            style={styles.imageCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-medium)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow-light)';
                            }}
                        >
                            <img 
                                src={img || ph} 
                                style={styles.image} 
                                onError={(e) => e.target.src = ph}
                                alt={`Opinión ${i + 1}`}
                            />
                            <label 
                                style={styles.changeButton}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px var(--shadow-strong)';
                                }}
                            >
                                 Cambiar
                                <input 
                                    type='file' 
                                    accept='image/*' 
                                    onChange={(e) => handle('opinion', i, e)} 
                                    style={{ display: 'none' }} 
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={save} 
                disabled={loading} 
                style={{
                    ...styles.saveButton,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                    if (!loading) {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 30px var(--shadow-hover)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px var(--shadow-strong)';
                }}
            >
                {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
        </div>
    );
};

export default HomePageSettings;