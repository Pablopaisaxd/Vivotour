// src/pages/Admin/components/GalleryManagement.jsx
import React, { useState } from 'react';

const GalleryManagement = () => {
    const [coverImages, setCoverImages] = useState({
        sec1: '../../assets/Fondos/Fauna.png',
        sec2: '../../assets/Fondos/Vegetacion.jpg',
        sec3: '../../assets/Fondos/Rio cascada.jpg',
        sec4: '../../assets/Fondos/cabaña square.jpeg',
        sec5: '../../assets/Fondos/Puente amarillo.jpg',
        sec6: '../../assets/Fondos/Cabalgata.jpg',
        sec7: '../../assets/Fondos/Jacuzzi hamaca.jpg',
    });

    const initialModalImages = {
        sec1: [
            '../../assets/imgs/fauna/araña.jpg',
            '../../assets/imgs/fauna/armadillos.jpg',
            '../../assets/imgs/fauna/barranquero.jpg',
            '../../assets/imgs/fauna/capy.jpg',
            '../../assets/imgs/fauna/gallo.jpg',
            '../../assets/imgs/fauna/gato.jpg',
            '../../assets/imgs/fauna/gusano.jpg',
            '../../assets/imgs/fauna/mariposa.jpg',
            '../../assets/imgs/fauna/mono.jpg',
            '../../assets/imgs/fauna/OIP.png',
        ],
        sec2: [
            '../../assets/imgs/flora/bota.jpg',
            '../../assets/imgs/flora/flor.jpg',
            '../../assets/imgs/flora/florFondo.jpg',
            '../../assets/imgs/flora/mata.jpg',
            '../../assets/imgs/flora/ortencia.jpg',
        ],
        sec3: [
            '../../assets/imgs/rio/474329649_627825746425180_7292163290342665103_n.jpg',
            '../../assets/imgs/rio/474431610_627291289811959_9210614094102960593_n.jpg',
            '../../assets/imgs/rio/474484262_627826059758482_7801325264117178547_n.jpg',
            '../../assets/imgs/rio/475832008_635393145668440_7124902200382240738_n.jpg',
            '../../assets/imgs/rio/476022210_635393129001775_3760402276992579991_n.jpg',
            '../../assets/imgs/rio/476160060_639738165233938_7453170523491608119_n.jpg',
            '../../assets/imgs/rio/476436645_639738311900590_4376680368050360241_n.jpg',
            '../../assets/imgs/rio/476560825_641234385084316_4401260814400449712_n.jpg',
            '../../assets/imgs/rio/476890838_641874511686970_6786000744136237367_n.jpg',
            '../../assets/imgs/rio/478705419_643635628177525_2794904906416692158_n.jpg',
        ],
        sec4: [
            '../../assets/imgs/cabañas/477441743_642933308247757_6302000935650247850_n.jpg',
            '../../assets/imgs/cabañas/479564373_642933251581096_7838498170059657685_n.jpg',
            '../../assets/imgs/cabañas/480075878_644245944783160_3376660300750906668_n.jpg',
            '../../assets/imgs/cabañas/480130994_644246084783146_1603066149886287957_n.jpg',
            '../../assets/imgs/cabañas/480272496_644245804783174_6593899205741647006_n.jpg',
            '../../assets/imgs/cabañas/480309013_644246141449807_5374636129316272527_n.jpg',
            '../../assets/imgs/cabañas/480339493_646500557891032_1944932528143366924_n.jpg',
            '../../assets/imgs/cabañas/480387802_646500441224377_3973318646659518734_n.jpg',
            '../../assets/imgs/cabañas/480393816_646500447891043_7400385380002287415_n.jpg',
            '../../assets/imgs/cabañas/480467878_649675070906914_2362241510694720593_n.jpg',
        ],
        sec5: [
            '../../assets/imgs/puentes/472670497_1053955673073418_3318241285626850528_n.jpg',
            '../../assets/imgs/puentes/472777130_617697124104709_9008114209111382074_n.jpg',
            '../../assets/imgs/puentes/472788595_618975387310216_3217232377584828492_n.jpg',
            '../../assets/imgs/puentes/474564467_627153106492444_4186195771352862309_n.jpg',
            '../../assets/imgs/puentes/474624913_627826076425147_6328919594574258746_n.jpg',
            '../../assets/imgs/puentes/477501609_642933211581100_5566429112849237554_n.jpg',
            '../../assets/imgs/puentes/480543669_646500297891058_2562208088458318756_n.jpg',
            '../../assets/imgs/puentes/495453502_18020252624651046_1422023666079310573_n.jpeg',
            '../../assets/imgs/puentes/Adecuacion-puentes-1536x1023.jpeg',
            '../../assets/imgs/puentes/maxresdefault.jpg',
        ],
        sec6: [
            '../../assets/imgs/cabalgatas/472502392_1053694853099500_2785194390021630923_n.jpg',
            '../../assets/imgs/cabalgatas/474522620_627825749758513_4419009548900141936_n.jpg',
            '../../assets/imgs/cabalgatas/474573155_627291309811957_6701037663482779535_n.jpg',
            '../../assets/imgs/cabalgatas/476794478_641221218418966_2784272919739909557_n.jpg',
            '../../assets/imgs/cabalgatas/478083588_643635631510858_4332432915899354854_n.jpg',
            '../../assets/imgs/cabalgatas/479547405_643636044844150_2002916860594613394_n.jpg',
            '../../assets/imgs/cabalgatas/caption (1).jpg',
            '../../assets/imgs/cabalgatas/caption.jpg',
        ],
        sec7: [
            '../../assets/imgs/experiencias/464307822_17998791962651046_1107245631182794721_n.jpg',
            '../../assets/imgs/experiencias/472788524_618551407352614_9032495863670563051_n.jpg',
            '../../assets/imgs/experiencias/472789797_618970930643995_2683850925473442176_n.jpg',
            '../../assets/imgs/experiencias/472877626_618970927310662_1364184376555738189_n.jpg',
            '../../assets/imgs/experiencias/472915340_618551387352616_3310294784352409225_n.jpg',
            '../../assets/imgs/experiencias/475279256_632527145955040_8185283943625516774_n.jpg',
            '../../assets/imgs/experiencias/475341550_632527039288384_7338752661739790796_n.jpg',
            '../../assets/imgs/experiencias/475764316_634176379123450_6285350744659013908_n.jpg',
            '../../assets/imgs/experiencias/475769058_634819549059133_2143391349871963195_n.jpg',
            '../../assets/imgs/experiencias/475840907_636530595554695_2172388258918632212_n.jpg',
        ],
    };

    const [modalImages, setModalImages] = useState(initialModalImages);
    const [selectedSection, setSelectedSection] = useState('sec1');

    const handleCoverImageChange = (section, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImages(prev => ({ ...prev, [section]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleModalImageChange = (section, index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setModalImages(prev => {
                    const newImages = [...prev[section]];
                    newImages[index] = reader.result;
                    return { ...prev, [section]: newImages };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddModalImage = (section) => {
        if (modalImages[section].length < 10) {
            setModalImages(prev => ({ ...prev, [section]: [...prev[section], ''] }));
        } else {
            alert('Solo se permiten un máximo de 10 imágenes en la modal.');
        }
    };

    const handleRemoveModalImage = (section, index) => {
        setModalImages(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
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
        title: {
            fontSize: '1.5rem',
            color: 'var(--rich-black)',
            marginBottom: '15px',
            fontWeight: '600',
        },
        section: {
            marginBottom: '20px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '15px',
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
        removeButton: {
            backgroundColor: 'var(--error-main)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '5px',
        },
        addButton: {
            backgroundColor: 'var(--primary-main)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px',
        },
        modalSelector: {
            display: 'flex',
            overflowX: 'auto',
            gap: '10px',
            paddingBottom: '10px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color-light)',
        },
        modalButton: {
            padding: '8px 15px',
            borderRadius: '5px',
            border: '1px solid var(--border-color-light)',
            backgroundColor: 'var(--alice-blue)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
        },
        modalButtonSelected: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            borderColor: 'var(--forest-green)',
        }
    };

    return (
        <div style={styles.container} className="gallery-management-container">
            <h2 style={styles.title}>Gestión de Galería</h2>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Portada de Galería</h3>
                <div style={styles.imageContainer}>
                    {Object.keys(coverImages).map((sec, index) => (
                        <div key={sec} style={styles.imageWrapper}>
                            <p>{`Sec ${index + 1}`}</p>
                            <img src={coverImages[sec]} alt={`Portada ${sec}`} style={styles.imagePreview} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCoverImageChange(sec, e)}
                                style={styles.fileInput}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Imágenes de Modal (Máx. 10 por sección)</h3>
                <div style={styles.modalSelector}>
                    {Object.keys(modalImages).map((sec, index) => (
                        <button
                            key={sec}
                            style={{
                                ...styles.modalButton,
                                ...(selectedSection === sec ? styles.modalButtonSelected : {})
                            }}
                            onClick={() => setSelectedSection(sec)}
                        >
                            {`Modal ${index + 1}`}
                        </button>
                    ))}
                </div>

                {selectedSection && (
                    <div style={styles.imageContainer}>
                        {modalImages[selectedSection].map((img, index) => (
                            <div key={index} style={styles.imageWrapper}>
                                <img src={img} alt={`Modal ${index + 1}`} style={styles.imagePreview} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleModalImageChange(selectedSection, index, e)}
                                    style={styles.fileInput}
                                />
                                <button
                                    style={styles.removeButton}
                                    onClick={() => handleRemoveModalImage(selectedSection, index)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                        {modalImages[selectedSection].length < 10 && (
                            <button style={styles.addButton} onClick={() => handleAddModalImage(selectedSection)}>
                                Agregar Imagen
                            </button>
                        )}
                    </div>
                )}
            </div>

            <button style={styles.button}>Guardar Cambios</button>
        </div>
    );
};

export default GalleryManagement;