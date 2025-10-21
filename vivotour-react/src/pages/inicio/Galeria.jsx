import React, { useState, useEffect } from 'react';
import './style/Galeria.css';
import apiConfig from '../../config/apiConfig';

import imgG1 from '../../assets/Fondos/Fauna.png';
import imgG2 from '../../assets/Fondos/Vegetacion.jpg';
import imgG3 from '../../assets/Fondos/Rio cascada.jpg';
import imgG4 from '../../assets/Fondos/cabaña square.jpeg';
import imgG6 from '../../assets/Fondos/Puente amarillo.jpg';
import imgG7 from '../../assets/Fondos/Cabalgata.jpg';
import imgG8 from '../../assets/Fondos/Jacuzzi hamaca.jpg';

const faunaImports = import.meta.glob('../../assets/imgs/fauna/*.{jpg,jpeg,png}', { eager: true });
const faunaImgs = Object.values(faunaImports).map((mod) => mod.default);

const floraImports = import.meta.glob('../../assets/imgs/flora/*.{jpg,jpeg,png}', { eager: true });
const floraImgs = Object.values(floraImports).map((mod) => mod.default);

const rioImports = import.meta.glob('../../assets/imgs/rio/*.{jpg,jpeg,png}', { eager: true });
const rioImgs = Object.values(rioImports).map((mod) => mod.default);

const cabañasImports = import.meta.glob('../../assets/imgs/cabañas/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', { eager: true });
const cabañasImgs = Object.values(cabañasImports).map((mod) => mod.default);

const puentesImports = import.meta.glob('../../assets/imgs/puentes/*.{jpg,jpeg,png}', { eager: true });
const puentesImgs = Object.values(puentesImports).map((mod) => mod.default);

const cabalgatasImports = import.meta.glob('../../assets/imgs/cabalgatas/*.{jpg,jpeg,png}', { eager: true });
const cabalgatasImgs = Object.values(cabalgatasImports).map((mod) => mod.default);

const experienciasImports = import.meta.glob('../../assets/imgs/experiencias/*.{jpg,jpeg,png}', { eager: true });
const experienciasImgs = Object.values(experienciasImports).map((mod) => mod.default);

const imagenesPorSeccion = {
  sec1: faunaImgs,
  sec2: floraImgs,
  sec3: rioImgs,
  sec4: cabañasImgs,
  sec5: puentesImgs,
  sec6: cabalgatasImgs,
  sec7: experienciasImgs,
};

const Modal = ({ imagenes, onClose }) => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  if (!imagenes) return null;

  const totalPages = Math.ceil(imagenes.length / pageSize);

  const siguiente = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const anterior = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="galeria-modal-overlay" onClick={onClose}>
      <div className="galeria-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="galeria-close-btn" onClick={onClose}>X</button>
        <div className="galeria-modal-images-container">
          <div
            className="galeria-modal-images-track"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const start = pageIndex * pageSize;
              const end = start + pageSize;
              const imagenesPagina = imagenes.slice(start, end);

              return (
                <div className="galeria-modal-images" key={pageIndex}>
                  {imagenesPagina.map((img, idx) => (
                    <img key={idx} src={img} alt={`modal-${idx}`} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        {imagenes.length > pageSize && (
          <div className="galeria-modal-pagination">
            <button className="galeria-arrows" onClick={anterior} disabled={page === 0}>
              Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button className="galeria-arrows" onClick={siguiente} disabled={page === totalPages - 1}>
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Galeria = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [imagenesModal, setImagenesModal] = useState(null);
  const [imagenesDB, setImagenesDB] = useState({});
  const [loading, setLoading] = useState(true);

  // Mapping de categorías a IDs
  const categoryIds = {
    sec1: 1, // Fauna
    sec2: 2, // Flora
    sec3: 3, // Río
    sec4: 4, // Cabañas
    sec5: 5, // Puentes
    sec6: 6, // Cabalgatas
    sec7: 7  // Experiencias
  };

  useEffect(() => {
    // Cargar imágenes de la base de datos al iniciar
    cargarImagenesDB();
  }, []);

  const cargarImagenesDB = async () => {
    try {
      const imagenesDescargadas = {};

      // Descargar imágenes de cada categoría usando endpoint público
      for (const [sec, categoryId] of Object.entries(categoryIds)) {
        try {
          const url = `${apiConfig.baseUrl}/api/gallery/public/${categoryId}`;
          const response = await fetch(url);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.images) {
              imagenesDescargadas[sec] = data.images.map(img => {
                if (img.RutaImagen.startsWith('/uploads/')) {
                  return `${apiConfig.baseUrl}${img.RutaImagen}`;
                }
                return img.RutaImagen;
              });
            }
          }
        } catch (error) {
          console.log(`Info: No se cargaron imágenes para categoría ${categoryId}`);
        }
      }

      setImagenesDB(imagenesDescargadas);
    } catch (error) {
      console.error('Error cargando imágenes de la BD:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerImagenesCombinadas = (sec) => {
    // Combinar imágenes de assets + imágenes de BD
    const imagenesAssets = imagenesPorSeccion[sec] || [];
    const imagenesSubidas = imagenesDB[sec] || [];
    return [...imagenesAssets, ...imagenesSubidas];
  };

  const abrirModal = (sec) => {
    const imagenes = obtenerImagenesCombinadas(sec);
    if (imagenes.length > 0) {
      setImagenesModal(imagenes);
      setModalOpen(true);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setImagenesModal(null);
  };

  return (
    <>
      <div className="galeria">
        <div className="sec sec1" onClick={() => abrirModal("sec1")}>
          <img src={imgG1} alt="Fauna" />
        </div>
        <div className="sec sec2" onClick={() => abrirModal("sec2")}>
          <img src={imgG2} alt="Vegetación" />
        </div>
        <div className="sec sec3" onClick={() => abrirModal("sec3")}>
          <img src={imgG3} alt="Río Cascada" />
        </div>
        <div className="sec sec4" onClick={() => abrirModal("sec4")}>
          <img src={imgG4} alt="Cabaña" />
        </div>
        <div className="sec sec5" onClick={() => abrirModal("sec5")}>
          <img src={imgG6} alt="Puente Amarillo" />
        </div>
        <div className="sec sec6" onClick={() => abrirModal("sec6")}>
          <img src={imgG7} alt="Cabalgata" />
        </div>
        <div className="sec sec7" onClick={() => abrirModal("sec7")}>
          <img src={imgG8} alt="Jacuzzis" />
        </div>
      </div>

      {modalOpen && (
        <Modal imagenes={imagenesModal} onClose={cerrarModal} />
      )}
    </>
  );
};

export default Galeria;
