import React from "react";
import "./style/MenuServicios.css";

const MenuServicios = ({ visible, onClose, serviciosExtra }) => {
  if (!visible) return null;

  return (
    <div className="menu-servicios-overlay">
      <div className="menu-servicios-content">
        <button className="close-btn" onClick={onClose}>   </button>
        <h2 className="titulo">Más Servicios</h2>
        <div className="sservicios">
          {serviciosExtra.map((servicio, index) => (
            <div className={`s${index + 1}`} key={index}>
              <div className="circle">
                <img
                  className="darkimgs"
                  src={servicio.img}
                  alt={servicio.nombre}
                />
              </div>
              <p className="ps">{servicio.nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuServicios;
