import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './use/style/cabanas.css';


const CABANAS = [
  {
    nombre: 'Cabaña Estándar',
    precio: 180000,
    imagen: '/src/assets/imgs/cabañas/480467878_649675070906914_2362241510694720593_n.jpg',
    descripcion: 'Cabaña cómoda para 2-4 personas, baño privado, vista a la naturaleza.'
  },
  {
    nombre: 'Cabaña Familiar',
    precio: 250000,
    imagen: '/src/assets/imgs/cabañas/481075019_650095500864871_1808515150791521835_n.jpg',
    descripcion: 'Ideal para familias, capacidad hasta 6 personas, zona de hamacas.'
  },
  {
    nombre: 'Cabaña Premium',
    precio: 320000,
    imagen: '/src/assets/imgs/cabañas/480663679_646500431224378_2214908286760339940_n.jpg',
    descripcion: 'Cabaña de lujo, jacuzzi privado, vista panorámica.'
  }
];



export const Cabanas = ({ onSelect }) => {
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
    <div className="cabanas-list">
      {CABANAS.map((cabana, idx) => (
        <div key={cabana.nombre} className="cabana-card">
          <img className="cabana-img" src={cabana.imagen} alt={cabana.nombre} />
          <h4 className="cabana-title">{cabana.nombre}</h4>
          <div className="cabana-precio">${cabana.precio.toLocaleString('es-CO')} COP</div>
          <button type="button" className="cabana-btn" onClick={() => setSelected(idx)}>Ver más</button>
          {selected === idx && createPortal(
            <div 
              className="modal-overlay"
              onClick={(e) => {
                if (e.currentTarget === e.target) {
                  setSelected(null);
                }
              }}
            >
              <div className="cabana-modal" onClick={(e) => e.stopPropagation()}>
                <h4 className="cabana-title">{cabana.nombre}</h4>
                <img className="cabana-img-modal" src={cabana.imagen} alt={cabana.nombre} />
                <div className="cabana-precio">${cabana.precio.toLocaleString('es-CO')} COP</div>
                <p className="cabana-desc">{cabana.descripcion}</p>
                <button 
                  type="button"
                  className="cabana-btn-modal" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(null);
                  }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="cabana-btn-modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect && onSelect({ tipo: 'cabin', nombre: cabana.nombre, precio: cabana.precio, imagen: cabana.imagen });
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
