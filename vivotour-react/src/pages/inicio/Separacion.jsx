import React from 'react';
import './style/Separacion.css';

import icons1 from '../../assets/icons/cash-coin.png';
import icons2 from '../../assets/icons/service.png';
import icons3 from '../../assets/icons/landscape.png';
import icons4 from '../../assets/icons/round-travel-explore.png';

const Separacion = () => {
    const items = [
        { img: icons1, alt: "Precios accesibles", text: "Precios accesibles" },
        { img: icons2, alt: "Servicio al cliente", text: "Servicio al cliente" },
        { img: icons3, alt: "Paisajes", text: "Paisajes" },
        { img: icons4, alt: "Exploración", text: "Exploración" }
    ];

    return (
        <div className="res">
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    <div className="square1">
                        <div className="imgres">
                            <img src={item.img} alt={item.alt} className="imgicon" />
                            <p className="ps">{item.text}</p>
                        </div>
                    </div>
                    {i !== items.length - 1 && <div className="line1"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Separacion;
