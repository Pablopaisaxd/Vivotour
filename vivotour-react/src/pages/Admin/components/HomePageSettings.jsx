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

// Mapa para resolver rutas de assets del frontend a componentes importados
const assetMap = {
    '/assets/Fondos/Rio.jpg': img1,
    '/assets/Fondos/Río.jpg': img1,
    '/assets/Fondos/Fondo5.jpg': img2,
    '/assets/Fondos/Entrada.jpg': img3,
    '/assets/Fondos/columpio delante.jpg': opinImg1,
    '/assets/Fondos/turista acostado en hamaca.jpg': opinImg2,
    '/assets/Fondos/turistas en rio 2.jpg': opinImg3,
};

// Función para resolver URLs de imagen correctamente
const resolveImageUrl = (imgUrl) => {
    // Si está en el mapa de assets, retornar el componente importado
    if (assetMap[imgUrl]) {
        return assetMap[imgUrl];
    }
    // Si es una URL de uploads, prepender baseUrl
    if (imgUrl && imgUrl.startsWith('/uploads/')) {
        return `${apiConfig.baseUrl}${imgUrl}`;
    }
    // Si ya es una URL completa o dataURL, retornarla como está
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

    // Función para obtener la ruta original del asset
    const getOriginalAssetPath = (img) => {
        // Buscar en el mapa de assets para obtener la ruta original
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

            // Verificar si hay cambios en presentación
            const hasPresentationChanges = presentationChanged.some(c => c);
            if (hasPresentationChanges) {
                console.log('Saving presentation images...');
                const presentationForm = new FormData();
                
                // Enviar TODAS las 3 imágenes, pero solo las nuevas como archivos
                for (let i = 0; i < presentationImages.length; i++) {
                    const img = presentationImages[i];
                    if (img && typeof img === 'string' && img.startsWith('data:')) {
                        // Es una imagen nueva - enviarla como archivo
                        presentationForm.append('presentationImages', toFile(img, `pres_${i}.jpg`));
                    }
                }
                
                // Enviar las rutas de las imágenes existentes que no cambiaron
                const existingUrls = [];
                for (let i = 0; i < presentationImages.length; i++) {
                    const img = presentationImages[i];
                    if (img && typeof img === 'string' && !img.startsWith('data:')) {
                        // Puede ser un asset o una URL de uploads
                        const assetPath = getOriginalAssetPath(img);
                        const ruta = assetPath || img; // Usar ruta original del asset o la URL tal como está
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
                console.log('Presentation response:', res.status);
                if (res.ok) ok = true;
            }

            // Verificar si hay cambios en opinión
            const hasOpinionChanges = opinionChanged.some(c => c);
            if (hasOpinionChanges) {
                console.log('Saving opinion images...');
                const opinionForm = new FormData();
                
                // Enviar TODAS las 3 imágenes, pero solo las nuevas como archivos
                for (let i = 0; i < opinionImages.length; i++) {
                    const img = opinionImages[i];
                    if (img && typeof img === 'string' && img.startsWith('data:')) {
                        // Es una imagen nueva - enviarla como archivo
                        opinionForm.append('opinionImages', toFile(img, `opin_${i}.jpg`));
                    }
                }
                
                // Enviar las rutas de las imágenes existentes que no cambiaron
                const existingUrls = [];
                for (let i = 0; i < opinionImages.length; i++) {
                    const img = opinionImages[i];
                    if (img && typeof img === 'string' && !img.startsWith('data:')) {
                        // Puede ser un asset o una URL de uploads
                        const assetPath = getOriginalAssetPath(img);
                        const ruta = assetPath || img; // Usar ruta original del asset o la URL tal como está
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
                console.log('Opinion response:', res.status);
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

    return (
        <div style={{ padding: '30px', backgroundColor: 'var(--card-background)', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center', color: 'var(--rich-black)', fontWeight: '600' }}>Configuración de Página de Inicio</h2>
            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px 20px', marginBottom: '20px', borderRadius: '4px', textAlign: 'center', border: '1px solid #f5c6cb', width: '100%', maxWidth: '600px' }}>Error: {error}</div>}
            {success && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px 20px', marginBottom: '20px', borderRadius: '4px', textAlign: 'center', border: '1px solid #c3e6cb', width: '100%', maxWidth: '600px' }}>Cambios guardados exitosamente</div>}
            
            <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--rich-black)', fontWeight: '500' }}>Imágenes de Presentación</h3>
                <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {getPadded(presentationImages).map((img, i) => (
                        <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <img src={img || ph} style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--border-color-light)' }} onError={(e) => e.target.src = ph} />
                            <label style={{ cursor: 'pointer', backgroundColor: 'var(--forest-green)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', border: 'none', fontWeight: '500', transition: 'background-color 0.3s' }}>
                                Cambiar
                                <input type='file' accept='image/*' onChange={(e) => handle('presentation', i, e)} style={{ display: 'none' }} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '1.4rem', color: 'var(--rich-black)', fontWeight: '500' }}>Imágenes de Opinión</h3>
                <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {getPadded(opinionImages).map((img, i) => (
                        <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <img src={img || ph} style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--border-color-light)' }} onError={(e) => e.target.src = ph} />
                            <label style={{ cursor: 'pointer', backgroundColor: 'var(--forest-green)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', border: 'none', fontWeight: '500', transition: 'background-color 0.3s' }}>
                                Cambiar
                                <input type='file' accept='image/*' onChange={(e) => handle('opinion', i, e)} style={{ display: 'none' }} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={save} disabled={loading} style={{ backgroundColor: 'var(--forest-green)', color: 'white', padding: '12px 40px', fontSize: '16px', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontWeight: '600', transition: 'background-color 0.3s' }}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    );
};

export default HomePageSettings;
