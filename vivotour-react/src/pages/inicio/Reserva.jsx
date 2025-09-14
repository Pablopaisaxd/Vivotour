import React, { useState, useContext } from 'react';
import './style/Reserva.css';
import Nav from './Navbar';
import Footer from '../../components/use/Footer';
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

import imgR1 from '../../assets/Fondos/Cabaña estandar.jpg';
import imgR2 from '../../assets/Fondos/refcamping.jpg';
import { AuthContext } from '../../AuthContext';

const ACTIVITIES = [
    { name: 'Caminata a la cascada', tooltip: 'Disfruta de una hermosa caminata junto a la cascada.' },
    { name: 'Caminata Puente Amarillo', tooltip: 'Explora el Puente Amarillo con vistas espectaculares.' },
    { name: 'Avistamiento de aves', tooltip: 'Observa aves exóticas en su hábitat natural.' },
    { name: 'Zona de motocross', tooltip: 'Zona para los amantes del motocross y la aventura.' },
    { name: 'Día de sol', tooltip: 'Relájate y disfruta del sol en áreas designadas.' },
    { name: 'Charco', tooltip: 'Zona natural para refrescarse y divertirse.' },
    { name: 'Cabalgatas', tooltip: 'Paseos a caballo por senderos naturales.' }
];

const MEALS = ['Desayuno', 'Almuerzo', 'Cena'];

const normalizarFecha = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-");
    return new Date(year, month - 1, day);
};

const Reserva = () => {
    const [accommodationType, setAccommodationType] = useState('cabin');
    const [allInclusive, setAllInclusive] = useState(true);
    const [activities, setActivities] = useState(ACTIVITIES.map(a => a.name));
    const [meals, setMeals] = useState([...MEALS]);
    const [summaryData, setSummaryData] = useState(null);

    const handleAccommodationSelect = (type) => {
        setAccommodationType(type);
    };
    const handleAllInclusiveChange = () => {
        if (!allInclusive) {
            setActivities(ACTIVITIES.map(a => a.name));
        } else {
            setActivities([]);
        }
        setAllInclusive(!allInclusive);
    };

    const handleActivityChange = (e) => {
        const { value, checked } = e.target;
        setActivities((prev) => {
            let newActivities;
            if (checked) {
                newActivities = [...prev, value];
            } else {
                newActivities = prev.filter((activity) => activity !== value);
            }

            if (newActivities.length < ACTIVITIES.length) {
                setAllInclusive(false);
            }
            if (newActivities.length === ACTIVITIES.length) {
                setAllInclusive(true);
            }

            return newActivities;
        });
    };

    const handleMealSelect = (meal) => {
        setMeals((prev) =>
            prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
        );
    };

    const handleBookNow = (e) => {
        e.preventDefault();

        const dateS = e.target.elements["reservation-date-start"].value;
        const dateE = e.target.elements["reservation-date-end"].value;
        const adults = e.target.elements['adults'].value;
        const children = e.target.elements['children'].value;

        if (!dateS) return alert('Seleccione una fecha de inicio de reserva');
        if (!dateE) return alert('Seleccione una fecha de fin de reserva');
        if (meals.length === 0) return alert('Debe seleccionar al menos una opción de comida');

        const fechaInicio = normalizarFecha(dateS);
        const fechaFinal = normalizarFecha(dateE);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaInicio < hoy) return alert('La fecha de inicio no puede ser anterior al día actual');
        if (fechaFinal <= fechaInicio) return alert('La fecha de salida debe ser posterior a la de entrada');

        setSummaryData({
            dateS: fechaInicio.toLocaleDateString(),
            dateE: fechaFinal.toLocaleDateString(),
            adults,
            children,
            accommodation: accommodationType === 'cabin' ? 'Cabañas' : 'Zona de camping',
            activities: allInclusive ? 'Todo incluido' : activities.join(', ') || 'Ninguno',
            meals: meals.join(', ') || 'Ninguna'
        });
    };

    const handleCloseModal = () => {
        setSummaryData(null);
    };

    const handleSendAndSave = () => {
        alert("Reserva enviada y guardada");
        setSummaryData(null);
    };

    const { user } = useContext(AuthContext);

    const handleGeneratePDF = () => {
        if (!summaryData) return;

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Confirmación de Reserva", 20, 20);

        doc.setFontSize(12);
        doc.text(`Nombre: ${user?.nombre || "No disponible"}`, 20, 40);
        doc.text(`Correo: ${user?.correo || user?.email || "No disponible"}`, 20, 50);

        doc.text(`Fecha inicio: ${summaryData.dateS}`, 20, 70);
        doc.text(`Fecha de Salida: ${summaryData.dateE}`, 20, 80);
        doc.text(`Cantidad: ${summaryData.adults} adulto(s), ${summaryData.children} niño(s)`, 20, 90);
        doc.text(`Alojamiento: ${summaryData.accommodation}`, 20, 100);
        doc.text(`Actividades: ${summaryData.activities}`, 20, 110);
        doc.text(`Comidas: ${summaryData.meals}`, 20, 120);

        doc.save("reserva.pdf");
    };

    return (
        <div className="reserva-page">
            <Nav />
            <div className="reserva-wrapper">
                <div className="reserva-container">
                    <form onSubmit={handleBookNow}>
                        <div className="reserva-top-sections">
                            <div className="reserva-section reserva-section-half">
                                <h3 className="reserva-title">Seleccione fecha</h3>
                                <div className="reserva-people">
                                    <div className="reserva-group">
                                        <label htmlFor="reservation-date-start">Fecha de entrada</label>
                                        <input type="date" id="reservation-date-start" name="reservation-date-start" required />
                                    </div>
                                    <div className="reserva-group">
                                        <label htmlFor="reservation-date-end">Fecha de salida</label>
                                        <input type="date" id="reservation-date-end" name="reservation-date-end" required />
                                    </div>
                                </div>
                            </div>

                            <div className="reserva-section reserva-section-half">
                                <h3 className="reserva-title">Número de personas</h3>
                                <div className="reserva-people">
                                    <div className="reserva-group">
                                        <label htmlFor="adults">Adultos</label>
                                        <input type="number" id="adults" name="adults" min="1" max="4" defaultValue="1" required />
                                    </div>
                                    <div className="reserva-group">
                                        <label htmlFor="children">Niños</label>
                                        <input type="number" id="children" name="children" min="0" max="3" defaultValue="0" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="reserva-section">
                            <h3 className="reserva-title">Tipo de alojamiento</h3>
                            <div className="reserva-options">
                                <div
                                    className={`reserva-card ${accommodationType === 'cabin' ? 'selected' : ''}`}
                                    onClick={() => handleAccommodationSelect('cabin')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('cabin')}
                                >
                                    <img src={imgR1} alt="Cabaña estandar" />
                                    <h4>Cabañas</h4>
                                    <p>Disfruta de la comodidad en medio de la naturaleza.</p>
                                </div>
                                <div
                                    className={`reserva-card ${accommodationType === 'camping' ? 'selected' : ''}`}
                                    onClick={() => handleAccommodationSelect('camping')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('camping')}
                                >
                                    <img src={imgR2} alt="Zona de camping" />
                                    <h4>Zona de Camping</h4>
                                    <p>Vive la aventura al aire libre.</p>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="reserva-section">
                            <h3 className="reserva-title">Actividades y Servicios</h3>
                            <div className="reserva-checkbox-group">
                                <div className="reserva-checkbox-item">
                                    <input
                                        type="checkbox"
                                        id="all-inclusive"
                                        name="all-inclusive"
                                        checked={allInclusive}
                                        onChange={handleAllInclusiveChange}
                                        title="Selecciona todas las actividades y servicios disponibles."
                                    />
                                    <label htmlFor="all-inclusive">Todo incluido</label>
                                </div>
                                <div className="reserva-checkbox-subgroup">
                                    {ACTIVITIES.map(({ name, tooltip }) => (
                                        <div key={name} className="reserva-checkbox-item">
                                            <input
                                                type="checkbox"
                                                value={name}
                                                checked={activities.includes(name)}
                                                onChange={handleActivityChange}
                                                title={tooltip}
                                            />
                                            <label>{name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="reserva-section">
                            <h3 className="reserva-title">Opciones de comida</h3>
                            <div className="reserva-meal-options">
                                {MEALS.map((meal) => (
                                    <div
                                        key={meal}
                                        className={`reserva-meal-option ${meals.includes(meal) ? 'selected' : ''}`}
                                        onClick={() => handleMealSelect(meal)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && handleMealSelect(meal)}
                                    >
                                        {meal}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="reserva-btn">Reserva ahora</button>
                    </form>

                    {summaryData && (
                        <div className="reserva-modal-overlay">
                            <div className="reserva-modal-content">
                                <h2>Confirmar Reservación</h2>
                                <p><strong>Fecha inicio:</strong> {summaryData.dateS}</p>
                                <p><strong>Fecha final:</strong> {summaryData.dateE}</p>
                                <p><strong>Cantidad:</strong> {summaryData.adults} adulto(s), {summaryData.children} niño(s)</p>
                                <p><strong>Alojamiento:</strong> {summaryData.accommodation}</p>
                                <p><strong>Actividades y Servicios:</strong> {summaryData.activities}</p>
                                <p><strong>Opciones de comida:</strong> {summaryData.meals}</p>

                                <div className="reserva-modal-buttons">
                                    <button className="reserva-btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                                    <button className="reserva-btn-confirm" onClick={() => { handleSendAndSave(); handleGeneratePDF(); }}>Enviar y Guardar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Reserva;