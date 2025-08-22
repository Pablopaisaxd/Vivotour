import React, { useState } from 'react';
import './style/Reserva.css';
import Footer from '../../components/use/Footer';

import imgR1 from '../../assets/Fondos/Cabaña estandar.jpg';
import imgR2 from '../../assets/Fondos/refcamping.jpg';

const ACTIVITIES = [
    'Caminata a la cascada',
    'Caminata Puente Amarillo',
    'Avistamiento de aves',
    'Zona de motocross',
    'Día de sol',
    'Charco',
    'Cabalgatas'
];

const MEALS = ['Desayuno', 'Almuerzo', 'Cena'];

const normalizarFecha = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-");
    return new Date(year, month - 1, day);
};

const Reserva = () => {
    const [accommodationType, setAccommodationType] = useState('cabin');
    const [allInclusive, setAllInclusive] = useState(true);
    const [activities, setActivities] = useState([...ACTIVITIES]);
    const [meals, setMeals] = useState([...MEALS]);
    const [summaryData, setSummaryData] = useState(null);

    const handleAccommodationSelect = (type) => {
        setAccommodationType(type);
    };

    const handleAllInclusiveChange = () => {
        if (!allInclusive) {
            setActivities([...ACTIVITIES]);
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

    return (
        <div className="maindiv">
            <div className="divreserv">
                <div className="divcontainer">
                    <form onSubmit={handleBookNow}>
                        <div className="booking-section">
                            <div className="section-title">
                                <span>Seleccione fecha</span>
                            </div>
                            <div className="people-group">
                                <div className="form-group">
                                    <label htmlFor="reservation-date-start">Fecha de entrada</label>
                                    <input type="date" id="reservation-date-start" name="reservation-date-start" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="reservation-date-end">Fecha de salida</label>
                                    <input type="date" id="reservation-date-end" name="reservation-date-end" required />
                                </div>
                            </div>
                        </div>
                        <hr />

                        <div className="booking-section">
                            <div className="section-title">
                                <span>Número de personas</span>
                            </div>
                            <div className="people-group">
                                <div className="form-group">
                                    <label htmlFor="adults">Adultos</label>
                                    <input type="number" id="adults" name="adults" min="1" max="4" defaultValue="1" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="children">Niños</label>
                                    <input type="number" id="children" name="children" min="0" max="3" defaultValue="0" required />
                                </div>
                            </div>
                        </div>
                        <hr />

                        <div className="booking-section">
                            <div className="section-title">
                                <span>Tipo de alojamiento</span>
                            </div>
                            <div className="option-group">
                                <div
                                    className={`option-card ${accommodationType === 'cabin' ? 'selected' : ''}`}
                                    onClick={() => handleAccommodationSelect('cabin')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('cabin')}
                                >
                                    <img src={imgR1} alt="Cabaña estandar" />
                                    <h2>Cabañas</h2>
                                    <p>Disfruta de la comodidad en medio de la naturaleza.</p>
                                </div>
                                <div
                                    className={`option-card ${accommodationType === 'camping' ? 'selected' : ''}`}
                                    onClick={() => handleAccommodationSelect('camping')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('camping')}
                                >
                                    <img src={imgR2} alt="Zona de camping" />
                                    <h2>Zona de Camping</h2>
                                    <p>Vive la aventura al aire libre.</p>
                                </div>
                            </div>
                        </div>
                        <hr />

                        <div className="booking-section">
                            <div className="section-title">
                                <span>Actividades y Servicios</span>
                            </div>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id="all-inclusive"
                                        name="all-inclusive"
                                        checked={allInclusive}
                                        onChange={handleAllInclusiveChange}
                                    />
                                    <label htmlFor="all-inclusive">Todo incluido</label>
                                </div>
                                <div className="checkbox-subgroup">
                                    {ACTIVITIES.map((activity) => (
                                        <div key={activity} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                value={activity}
                                                checked={activities.includes(activity)}
                                                onChange={handleActivityChange}
                                            />
                                            <label>{activity}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="booking-section">
                            <div className="section-title">
                                <span>Opciones de comida</span>
                            </div>
                            <div className="meal-options">
                                {MEALS.map((meal) => (
                                    <div
                                        key={meal}
                                        className={`meal-option ${meals.includes(meal) ? 'selected' : ''}`}
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

                        <button type="submit">Reserva ahora</button>
                    </form>

                    {/* Modal de confirmación */}
                    {summaryData && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2>Confirmar Reservación</h2>
                                <p><strong>Fecha inicio:</strong> {summaryData.dateS}</p>
                                <p><strong>Fecha final:</strong> {summaryData.dateE}</p>
                                <p><strong>Cantidad:</strong> {summaryData.adults} adulto(s), {summaryData.children} niño(s)</p>
                                <p><strong>Alojamiento:</strong> {summaryData.accommodation}</p>
                                <p><strong>Actividades y Servicios:</strong> {summaryData.activities}</p>
                                <p><strong>Opciones de comida:</strong> {summaryData.meals}</p>

                                <div className="modal-buttons">
                                    <button className="btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                                    <button className="btn-confirm" onClick={handleSendAndSave}>Enviar y Guardar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Reserva;
