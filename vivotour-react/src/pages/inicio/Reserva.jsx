import React, { useState, useContext } from 'react';
import './style/Reserva.css';
import Nav from './Navbar';
import Footer from '../../components/use/Footer';
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import imgR1 from '../../assets/Fondos/Cabaña estandar.jpg';
import imgR2 from '../../assets/Fondos/refcamping.jpg';
import { AuthContext } from '../../AuthContext';
import { Cabanas } from '../../components/Cabanas';
import { ZonaCamping } from '../../components/ZonaCamping';


const ACTIVITIES = [
    { name: 'Caminata a la cascada', tooltip: 'Disfruta de una hermosa caminata junto a la cascada.', price: 20000 },
    { name: 'Caminata Puente Amarillo', tooltip: 'Explora el Puente Amarillo con vistas espectaculares.', price: 15000 },
    { name: 'Avistamiento de aves', tooltip: 'Observa aves exóticas en su hábitat natural.', price: 25000 },
    { name: 'Zona de motocross', tooltip: 'Zona para los amantes del motocross y la aventura.', price: 30000 },
    { name: 'Día de sol', tooltip: 'Relájate y disfruta del sol en áreas designadas.', price: 10000 },
    { name: 'Charco', tooltip: 'Zona natural para refrescarse y divertirse.', price: 8000 },
    { name: 'Cabalgatas', tooltip: 'Paseos a caballo por senderos naturales.', price: 40000 }
];

const MEALS = [
    { name: 'Desayuno', price: 12000 },
    { name: 'Almuerzo', price: 18000 },
    { name: 'Cena', price: 16000 },
];

const normalizarFecha = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-");
    return new Date(year, month - 1, day);
};

const Reserva = () => {
    const [accommodationType, setAccommodationType] = useState('cabin');
    const [allInclusive, setAllInclusive] = useState(true);
    const [activities, setActivities] = useState(ACTIVITIES.map(a => a.name));
    const [meals, setMeals] = useState(MEALS.map(m => m.name));
    const [summaryData, setSummaryData] = useState(null);
    const [showCabanas, setShowCabana] = useState(false);
    const [showCamping, setShowCamping] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);
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

        // Calcular noches
        const nights = Math.ceil((fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24));

        // Precios
        const activityPriceMap = Object.fromEntries(ACTIVITIES.map(a => [a.name, a.price]));
        const mealPriceMap = Object.fromEntries(MEALS.map(m => [m.name, m.price]));

        const selectedActivities = allInclusive ? ACTIVITIES.map(a => a.name) : activities;
        const activitiesTotal = selectedActivities.reduce((sum, a) => sum + (activityPriceMap[a] || 0), 0);
        const mealsTotalPerPersonPerDay = meals.reduce((sum, m) => sum + (mealPriceMap[m] || 0), 0);
        const people = Number(adults) + Number(children);
        const mealsTotal = mealsTotalPerPersonPerDay * people * nights;
        const lodgingTotal = selectedAccommodation ? selectedAccommodation.precio * nights : 0;
        const total = lodgingTotal + activitiesTotal + mealsTotal;

        if (!selectedAccommodation) {
            return alert('Seleccione una cabaña o una zona de camping.');
        }

        setSummaryData({
            dateS: fechaInicio.toLocaleDateString(),
            dateE: fechaFinal.toLocaleDateString(),
            adults,
            children,
            accommodation: accommodationType === 'cabin' ? 'Cabañas' : 'Zona de camping',
            selectedAccommodation,
            nights,
            activities: allInclusive ? 'Todo incluido' : selectedActivities.join(', ') || 'Ninguno',
            meals: meals.join(', ') || 'Ninguna',
            totals: {
                lodgingTotal,
                activitiesTotal,
                mealsTotal,
                total,
            }
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

    const handleGeneratePDF = async () => {
        if (!summaryData) return;

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Confirmación de Reserva", 20, 20);

        doc.setFontSize(12);
        doc.text(`Nombre: ${user?.nombre || "No disponible"}`, 20, 40);
        doc.text(`Correo: ${user?.correo || user?.email || "No disponible"}`, 20, 50);

        doc.text(`Fecha inicio: ${summaryData.dateS}`, 20, 70);
        doc.text(`Fecha de Salida: ${summaryData.dateE}`, 20, 78);
        doc.text(`Noches: ${summaryData.nights}`, 20, 86);
        doc.text(`Personas: ${summaryData.adults} adulto(s), ${summaryData.children} niño(s)`, 20, 94);
        doc.text(`Alojamiento: ${summaryData.accommodation}`, 20, 102);

        // Imagen del alojamiento si existe
        let tableStartY = 120;
        if (summaryData.selectedAccommodation?.imagen) {
            try {
                const { dataUrl, format } = await fetchImageAsDataURL(summaryData.selectedAccommodation.imagen);
                // Ubicar imagen a la derecha del encabezado
                doc.addImage(dataUrl, format, 140, 58, 55, 40);
                doc.text(`Alojamiento seleccionado: ${summaryData.selectedAccommodation.nombre}`, 20, 110);
                tableStartY = 120; // mantener consistente tras la imagen
            } catch (err) {
                // Si falla la carga de la imagen, igual mostramos el texto
                doc.text(`Alojamiento seleccionado: ${summaryData.selectedAccommodation.nombre}`, 20, 110);
            }
        }

        // Detalle de actividades y comidas
        const selectedActivitiesList = allInclusive ? ACTIVITIES : ACTIVITIES.filter(a => activities.includes(a.name));
        const selectedMealsList = MEALS.filter(m => meals.includes(m.name));

        const rows = [];
        if (summaryData.selectedAccommodation) {
            rows.push([`Alojamiento (${summaryData.nights} noche(s)) - ${summaryData.selectedAccommodation.nombre}`, formatCOP(summaryData.totals.lodgingTotal)]);
        }
        if (selectedActivitiesList.length) {
            selectedActivitiesList.forEach(a => rows.push([`Actividad: ${a.name}`, formatCOP(a.price)]));
            rows.push([`Subtotal Actividades`, formatCOP(summaryData.totals.activitiesTotal)]);
        }
        if (selectedMealsList.length) {
            const people = Number(summaryData.adults) + Number(summaryData.children);
            const mealsLine = selectedMealsList.map(m => m.name).join(', ');
            rows.push([`Comidas (${people} pers x ${summaryData.nights} noches): ${mealsLine}`, formatCOP(summaryData.totals.mealsTotal)]);
        }

        autoTable(doc, {
            startY: tableStartY,
            head: [['Concepto', 'Precio']],
            body: rows,
            styles: { fontSize: 11 },
            theme: 'grid'
        });

        // Total
        const afterTableY = doc.lastAutoTable?.finalY || 140;
        doc.setFontSize(14);
        doc.text(`TOTAL: ${formatCOP(summaryData.totals.total)}`, 20, afterTableY + 10);

        doc.save("reserva.pdf");
    };

    // Utilidad para formato COP
    const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

    // Cargar imagen como dataURL para jsPDF
    const fetchImageAsDataURL = async (url) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        // Inferir formato por tipo MIME o extensión
        let format = 'JPEG';
        if (blob.type.includes('png') || url.toLowerCase().endsWith('.png')) format = 'PNG';
        return { dataUrl, format };
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
                                    onClick={() => {
                                        handleAccommodationSelect('cabin');
                                        setShowCabana(true);
                                        setShowCamping(false);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('cabin')}
                                >   
                                    <img src={imgR1} alt="Cabaña estándar" />
                                    <h4>Cabañas</h4>
                                    <p>Disfruta de la comodidad en medio de la naturaleza.</p>
                                </div>
                                <div
                                    className={`reserva-card ${accommodationType === 'camping' ? 'selected' : ''}`}
                                    onClick={() => {
                                        handleAccommodationSelect('camping');
                                        setShowCamping(true);
                                        setShowCabana(false);
                                    }}
                                    role="button"   
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAccommodationSelect('camping')}
                                >
                                    <img src={imgR2} alt="Zona de camping" />
                                    <h4>Zona de Camping</h4>
                                    <p>Vive la aventura al aire libre.</p>
                                </div>
                            </div>
                            <div className="reserva-alojamiento-detalles">
                                {showCabanas && <Cabanas onSelect={(item) => setSelectedAccommodation(item)} />}
                                {showCamping && <ZonaCamping onSelect={(item) => setSelectedAccommodation(item)} />}
                                {selectedAccommodation && (
                                    <p><strong>Seleccionado:</strong> {selectedAccommodation.nombre} — {formatCOP(selectedAccommodation.precio)}</p>
                                )}
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
                                    {ACTIVITIES.map(({ name, tooltip, price }) => (
                                        <div key={name} className="reserva-checkbox-item">
                                            <input
                                                type="checkbox"
                                                value={name}
                                                checked={activities.includes(name)}
                                                onChange={handleActivityChange}
                                                title={tooltip}
                                            />
                                            <label>{name} — {formatCOP(price)}</label>
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
                                        key={meal.name}
                                        className={`reserva-meal-option ${meals.includes(meal.name) ? 'selected' : ''}`}
                                        onClick={() => handleMealSelect(meal.name)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => e.key === 'Enter' && handleMealSelect(meal.name)}
                                    >
                                        {meal.name} — {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(meal.price)}
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

                                {summaryData.totals && (
                                    <>
                                        <p><strong>Alojamiento:</strong> {formatCOP(summaryData.totals.lodgingTotal)}</p>
                                        <p><strong>Actividades:</strong> {formatCOP(summaryData.totals.activitiesTotal)}</p>
                                        <p><strong>Comidas:</strong> {formatCOP(summaryData.totals.mealsTotal)}</p>
                                        <p style={{ fontSize: '1.1rem' }}><strong>Total:</strong> {formatCOP(summaryData.totals.total)}</p>
                                    </>
                                )}
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