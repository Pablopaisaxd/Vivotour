import React from 'react';
import './style/Separacion.css';

import icons1 from '../../assets/icons/cash-coin.png';
import icons2 from '../../assets/icons/service.png';
import icons3 from '../../assets/icons/house-svgrepo-com.svg';
import icons4 from '../../assets/Icons/car-svgrepo-com (1).svg';

const Separacion = () => {
    const items = [
        { 
            img: icons1, 
            alt: "Precios accesibles", 
            title: "Precios accesibles",
            text: "Disfruta de tarifas competitivas y ofertas especiales para que tu viaje sea más accesible.",
        },
        { 
            img: icons2, 
            alt: "Servicio al cliente", 
            title: "Servicio al cliente",
            text: "Atención personalizada para resolver cualquier duda durante tu experiencia de viaje." 
        },
        { 
            img: icons3, 
            alt: "Hospedaje", 
            title: "Hospedaje",
            text: "Alojamientos especiales para toda tu familia con atención personalizada." 
        },
        { 
            img: icons4, 
            alt: "Movilidad", 
            title: "Movilidad",
            text: "te movilizamos a tus lugares favoritos a tu propio ritmo y en tu medio favorito." ,
            style: { width: "70px", height: "70px", margin: "-0.3rem"} 
        }
    ];

    return (
      <div className="benefits-section">
          <h1 className="benefits-title">Ventajas de estar con nosotros</h1>
          <div className="res">
              {items.map((item, i) => (
                  <React.Fragment key={i}>
                      <div className="square1">
                          <div className="imgres">
                              <img src={item.img} alt={item.alt} className="imgicon" style={item.style} />
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
