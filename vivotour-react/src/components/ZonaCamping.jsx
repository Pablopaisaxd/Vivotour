import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './use/style/zonaCamping.css';

const ZONAS_CAMPING = [
  {
    nombre: 'Zona Camping Básica',
    precio: 50000,
    imagen: '/src/assets/imgs/experiencias/464307822_17998791962651046_1107245631182794721_n.jpg',
    descripcion: 'Área para acampar con acceso a baños compartidos y zona de fogata.'
  },
  {
    nombre: 'Zona Camping Familiar',
    precio: 100000,
    imagen: '/src/assets/Fondos/refcamping.jpg',
    descripcion: 'Área amplia para grupos, con zona de picnic y juegos.'
  }
];

export const ZonaCamping = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);


  useEffect(() => {
    if (selected !== null) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [selected]);

  return (
    <div className="camping-list">
      {ZONAS_CAMPING.map((zona, idx) => (
        <div key={zona.nombre} className="camping-card">
          <img className="camping-img" src={zona.imagen} alt={zona.nombre} />
          <h4 className="camping-title">{zona.nombre}</h4>
          <div className="camping-precio">${zona.precio.toLocaleString('es-CO')} COP</div>
          <button type="button" className="camping-btn" onClick={() => setSelected(idx)}>Ver más</button>
          {selected === idx && createPortal(
            <div 
              className="camping-modal"
              onClick={(e) => {
                if (e.currentTarget === e.target) {
                  setSelected(null);
                }
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <h4 className="camping-title">{zona.nombre}</h4>
                <img className="camping-img-modal" src={zona.imagen} alt={zona.nombre} />
                <div className="camping-precio">${zona.precio.toLocaleString('es-CO')} COP</div>
                <p className="camping-desc">{zona.descripcion}</p>
                <button 
                  type="button"
                  className="camping-btn-modal" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(null);
                  }}
                >
                  Cerrar
                </button>
                <button 
                  type="button"
                  className="camping-btn-modal" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect && onSelect({ tipo: 'camping', nombre: zona.nombre, precio: zona.precio, imagen: zona.imagen });
                    setSelected(null);
                  }}
                >
                  Seleccionar
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
      ))}
    </div>
  );
};