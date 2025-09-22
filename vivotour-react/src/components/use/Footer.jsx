import React, { useContext } from 'react';
import './style/Footer.css';
import logoend from '../../assets/Logos/ventana.png';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const Footer = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        if (location.pathname === "/") {
        // Si ya estamos en la página de inicio, scrollear
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
        } else {
        // Si no estamos en inicio, redirigir con hash (#)
        navigate("/#" + id);
        }
    };

    const handleReservaClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate("/Reserva");
        } else {
            navigate("/Login");
        }
    };

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
                        <li><a className="footeropc" href="#Inicio" onClick={(e) => { e.preventDefault(); scrollToSection("Inicio"); }}>Inicio</a></li>
                        <li><a className="footeropc" href="#Descubre" onClick={(e) => { e.preventDefault(); scrollToSection("Descubre"); }}>Descubre</a></li>
                        <li><a className="footeropc" href="#Reservar" onClick={handleReservaClick}>Reservar</a></li>
                    </ul>
                </div>

                <div className="footer-vivo-logo-container">
                    <img src={logoend} alt="logoVentana" className="footer-vivo-logo" />
                </div>
            </div>
        </footer>
    );
}

export default Footer;
