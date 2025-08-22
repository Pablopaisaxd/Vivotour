import React from 'react';
import './style/Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-content">
                    <h3>REDES SOCIALES</h3>
                    <ul className="list">
                        <li><a className="footeropc" href="https://www.facebook.com/ventanadelmelcocho">FACEBOOK</a></li>
                        <li><a className="footeropc" href="https://www.instagram.com/ventanadelmelcocho">INSTAGRAM</a></li>
                        <li><a className="footeropc" href="https://wa.link/cklhli">WHATSAPP</a></li>
                    </ul>
                </div>
                <div className="footer-content">
                    <h3>CONTACTOS</h3>
                    <p>Telefono: +57 322 2212850</p>
                    <p>Telefono: +57 322 4435315</p>
                    <ul className="list">
                        <li>Email: <a className="footeropc" href="mailto:laventanadelriomelcocho@gmail.com">laventanadelriomelcocho@gmail.com</a></li>
                    </ul>
                </div>
                <div className="footer-content">
                    <h3>VIVO TOUR</h3>
                    <ul className="list">
                        <li><a className="footeropc" href="#Inicio">Inicio</a></li>
                        <li><a className="footeropc" href="#Descubre">Descubre</a></li>
                        <li><a className="footeropc" id="btnres" href="#Reservar">Reservar</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-content footerend">
                <ul className="list listend">
                    <li><a className="footeropc" href="">Terminos Y Condiciones</a></li>
                    <p>°</p>
                    <li><a className="footeropc" href="">Soporte Tecnico</a></li>
                </ul>
                <ul className="list">
                    <li><a className="footeropc" href="https://maps.app.goo.gl/RnXtyzBDdyVTeeV7A">WRHV+69 COCORNA, ANTIOQUIA</a></li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;
