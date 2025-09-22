import React, { useState } from 'react';

const HomePageSettings = () => {
    const [presentationImages, setPresentationImages] = useState([
        '../../assets/Fondos/Río.jpg',
        '../../assets/Fondos/Fondo5.jpg',
        '../../assets/Fondos/Entrada.jpg',
    ]);
    const [opinionImages, setOpinionImages] = useState([
        '../../assets/Fondos/columpio delante.jpg',
        '../../assets/Fondos/turista acostado en hamaca.jpg',
        '../../assets/Fondos/turistas en rio 2.jpg',
    ]);

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

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Presentación (Máx. 3)</h3>
                <div style={styles.imageContainer}>
                    {presentationImages.map((img, index) => (
                        <div key={index} style={styles.imageWrapper}>
                            <img src={img} alt={`Presentación ${index + 1}`} style={styles.imagePreview} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange('presentation', index, e)}
                                style={styles.fileInput}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Opinión (Máx. 3)</h3>
                <div style={styles.imageContainer}>
                    {opinionImages.map((img, index) => (
                        <div key={index} style={styles.imageWrapper}>
                            <img src={img} alt={`Opinión ${index + 1}`} style={styles.imagePreview} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange('opinion', index, e)}
                                style={styles.fileInput}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button style={styles.button}>Guardar Cambios</button>
        </div>
    );
};

export default HomePageSettings;