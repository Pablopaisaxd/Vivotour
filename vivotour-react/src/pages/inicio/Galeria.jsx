import React from 'react';
import './style/Galeria.css';

import imgG1 from '../../assets/Fondos/Fauna.png';
import imgG2 from '../../assets/Fondos/Vegetacion.jpg';
import imgG3 from '../../assets/Fondos/Rio cascada.jpg';
import imgG4 from '../../assets/Fondos/cabaña square.jpeg';
import imgG5 from '../../assets/Fondos/montar mula.jpg';
import imgG6 from '../../assets/Fondos/Puente amarillo.jpg';
import imgG7 from '../../assets/Fondos/Cabalgata.jpg';
import imgG8 from '../../assets/Fondos/Jacuzzi hamaca.jpg';

const Galeria = () => {
    
    return (
        <div className="galeria">
            <div className="sec sec1">
                <img src={imgG1} alt="Fauna" />
            </div>
            <div className="sec sec2">
                <img src={imgG2} alt="Vegetación" />
            </div>
            <div className="sec sec3">
                <img src={imgG3} alt="Río Cascada" />
            </div>
            <div className="sec sec4">
                <img src={imgG4} alt="Cabaña" />
            </div>
            <div className="sec sec5">
                <img src={imgG5} alt="Montar Mula" />
            </div>
            <div className="sec sec6">
                <img src={imgG6} alt="Puente Amarillo" />
            </div>
            <div className="sec sec7">
                <img src={imgG7} alt="Cabalgata" />
            </div>
            <div className="sec sec8">
                <img src={imgG8} alt="Jacuzzis" />
            </div>
        </div>
    );
};

export default Galeria;
