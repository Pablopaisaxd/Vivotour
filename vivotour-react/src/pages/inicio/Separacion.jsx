import React from 'react';
import './style/Separacion.css';

import icons1 from '../../assets/icons/cash-coin.png';
import icons2 from '../../assets/icons/service.png';
import icons3 from '../../assets/icons/landscape.png';
import icons4 from '../../assets/icons/round-travel-explore.png';

const Separacion = () => {
    return (
        <div className="res">
            <div className="line1"></div>

            <div className="square1">
                <div className="imgres">
                    <img className="darkimgs" src={icons1} alt="Precios accesibles" height="25%" style={{ paddingTop: '15px' }} />
                    <p className="ps">Precios accesibles</p>
                </div>
            </div>
            <div className="line1"></div>
            <div className="square1">
                <div className="imgres">
                    <img className="darkimgs" src={icons2} alt="Servicio al cliente" height="26%" style={{ paddingTop: '10px' }} />
                    <p className="ps">Servicio al cliente</p>
                </div>
            </div>
            <div className="line1"></div>
            <div className="square1">
                <div className="imgres">
                    <img className="darkimgs" src={icons3} alt="Paisajes" height="28%" style={{ paddingTop: '10px' }} />
                    <p className="ps">Paisajes</p>
                </div>
            </div>
            <div className="line1"></div>
            <div className="square1">
                <div className="imgres">
                    <img className="darkimgs" src={icons4} alt="Exploración" height="28%" style={{ paddingTop: '10px' }} />
                    <p className="ps">Exploración</p>
                </div>
            </div>
            <div className="line1"></div>
        </div>
    );
};

export default Separacion;
