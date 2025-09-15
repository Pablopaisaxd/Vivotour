import React, { useState } from 'react';
import './style/Galeria.css';

import imgG1 from '../../assets/Fondos/Fauna.png';
import imgG2 from '../../assets/Fondos/Vegetacion.jpg';
import imgG3 from '../../assets/Fondos/Rio cascada.jpg';
import imgG4 from '../../assets/Fondos/cabaña square.jpeg';
import imgG6 from '../../assets/Fondos/Puente amarillo.jpg';
import imgG7 from '../../assets/Fondos/Cabalgata.jpg';
import imgG8 from '../../assets/Fondos/Jacuzzi hamaca.jpg';

// 🔥 Importa automáticamente todas las imágenes de fauna
const faunaImports = import.meta.glob('../../assets/imgs/fauna/*.{jpg,jpeg,png}', { eager: true });
const faunaImgs = Object.values(faunaImports).map((mod) => mod.default);

const floraImports = import.meta.glob('../../assets/imgs/flora/*.{jpg,jpeg,png}', { eager: true });
const floraImgs = Object.values(floraImports).map((mod) => mod.default);

const rioImports = import.meta.glob('../../assets/imgs/rio/*.{jpg,jpeg,png}', { eager: true });
const rioImgs = Object.values(rioImports).map((mod) => mod.default);

const cabañasImports = import.meta.glob('../../assets/imgs/cabañas/*.{jpg,jpeg,png}', { eager: true });
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

// 📌 Modal con paginación si hay más de 10 imágenes
const Modal = ({ imagenes, onClose }) => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  if (!imagenes) return null;

  const totalPages = Math.ceil(imagenes.length / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;
  const imagenesPagina = imagenes.slice(start, end);

  const siguiente = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const anterior = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        <div className="modal-images">
          {imagenesPagina.map((img, idx) => (
            <img key={idx} src={img} alt={`modal-${idx}`} />
          ))}
        </div>

        {imagenes.length > pageSize && (
          <div className="modal-pagination">
            <button onClick={anterior} disabled={page === 0}>
              Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button onClick={siguiente} disabled={page === totalPages - 1}>
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

  const abrirModal = (sec) => {
    setImagenesModal(imagenesPorSeccion[sec]);
    setModalOpen(true);
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
