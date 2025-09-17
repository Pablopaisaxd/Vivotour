import React from 'react';
import './style/Separacion.css';

import icons1 from '../../assets/icons/cash-coin.png';
import icons2 from '../../assets/icons/service.png';
import icons3 from '../../assets/icons/landscape.png';
import icons4 from '../../assets/icons/round-travel-explore.png';

const Separacion = () => {
    const items = [
        { 
            img: icons1, 
            alt: "Precios accesibles", 
            title: "Precios accesibles",
            text: "Disfruta de tarifas competitivas y ofertas especiales para que tu viaje sea más accesible." 
        },
        { 
            img: icons2, 
            alt: "Servicio al cliente", 
            title: "Servicio al cliente",
            text: "Atención personalizada 24/7 para resolver cualquier duda durante tu experiencia de viaje." 
        },
        { 
            img: icons3, 
            alt: "Paisajes", 
            title: "Paisajes únicos",
            text: "Descubre destinos increíbles con vistas espectaculares que quedarán en tu memoria." 
        },
        { 
            img: icons4, 
            alt: "Exploración", 
            title: "Exploración total",
            text: "Vive aventuras auténticas y explora cada rincón con nuestras experiencias únicas." 
        }
    ];

    return (
      <div className="benefits-section">
          <h1 className="benefits-title">Beneficios</h1>
          <div className="res">
              {items.map((item, i) => (
                  <React.Fragment key={i}>
                      <div className="square1">
                          <div className="imgres">
                              <img src={item.img} alt={item.alt} className="imgicon" />
                              <h2 className="ps">{item.title}</h2>
                              <p className="description">{item.text}</p>
                          </div>
                      </div>
                      {i !== items.length - 1 && <div className="line1"></div>}
                  </React.Fragment>
              ))}
          </div>
      </div>
  );
};

export default Separacion;
