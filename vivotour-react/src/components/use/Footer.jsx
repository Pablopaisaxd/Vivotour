import React from 'react';
import './style/Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-content">
                    <h3>REDES SOCIALES</h3>
                    <ul className="list">
                        <li><a className="footeropc" href="https://www.facebook.com">FACEBOOK</a></li>
                        <li><a className="footeropc" href="https://www.instagram.com">INSTAGRAM</a></li>
                        <li><a className="footeropc" href="https://www.whatsapp.com">WHATSAPP</a></li>
                    </ul>
                </div>
                <div className="footer-content">
                    <h3>CONTACTOS</h3>
                    <p>Telefono: +57 322 4435315</p>
                    <p>Telefono: +57 321 6921773</p>
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
                    <li><a className="footeropc" href="">WRHV+69 COCORNA, ANTIOQUIA</a></li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;
