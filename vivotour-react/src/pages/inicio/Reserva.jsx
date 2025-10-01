import React, { useState, useContext, useMemo } from 'react';
import './style/Reserva.css';
import Nav from './Navbar';
import Footer from '../../components/use/Footer';
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import imgR1 from '../../assets/Fondos/Cabaña estandar.jpg';
import imgR2 from '../../assets/Fondos/refcamping.jpg';
import { AuthContext } from '../../AuthContext';
// Carga de imágenes para los modales (carruseles)
const imgsRio = Object.values(import.meta.glob('../../assets/imgs/rio/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaFenix = Object.values(import.meta.glob('../../assets/imgs/cabañas/Cabaña_fenix/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaAventureros = Object.values(import.meta.glob('../../assets/imgs/cabañas/Cabaña_los_aventureros/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCamping = Object.values(import.meta.glob('../../assets/imgs/zona_camping/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));


// Planes disponibles
const PLANS = [
    {
        id: 'ventana-rio',
        title: 'Plan Amanecer Ventana del Río Melcocho',
        price: 200000, // por persona
        priceType: 'perPerson',
        capacity: { min: 1, max: 6 },
        fixedNights: 1,
        images: imgsRio.slice(0, 8),
        description: 'Incluye reserva y seguro, cena del día de llegada, desayuno y fiambre al día siguiente, transporte en mula para entrar (1.5h aprox) y tour al río Melcocho con guía al día siguiente. La mula de salida es opcional (+$30.000 por persona). Comodidades: baño con agua caliente, jacuzzi climatizado al aire libre, malla catamarán y hamacas. A 10 minutos a pie, hermoso charco en medio del bosque.',
        addons: [
            { key: 'muleExit', label: 'Mula de salida', pricePerPerson: 30000 },
            { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
            { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
        ],
    },
    {
        id: 'cabana-fenix',
        title: 'Cabaña Fénix (pareja)',
        price: 600000, // por pareja
        priceType: 'perCouple',
        capacity: { min: 2, max: 2 },
        fixedNights: 1,
        images: imgsCabanaFenix,
        description: 'Incluye reserva y seguro, tres comidas (cena, desayuno y fiambre), transporte en mula para entrar y salir, tour al río Melcocho. Comodidades exclusivas: baño con agua caliente, jacuzzi privado y malla catamarán. Charco a 10 minutos a pie.',
        addons: [
            { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
            { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
        ],
    },
    {
        id: 'cabana-aventureros',
        title: 'Cabaña de los Aventureros',
        price: 200000, // por persona
        priceType: 'perPerson',
        capacity: { min: 1, max: 8 },
        fixedNights: 1,
        images: imgsCabanaAventureros,
        description: '2 días, 1 noche. Incluye reserva, seguro, transporte en mula a la finca, cena de bienvenida, desayuno, fiambre y excursión guiada al río Melcocho. Comodidades: jacuzzi al aire libre, malla catamarán y hamacas.',
        addons: [
            { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
            { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
        ],
    },
    {
        id: 'dia-de-sol',
        title: 'Día de sol en el Río Melcocho',
        price: 40000, // por persona
        priceType: 'perPerson',
        capacity: { min: 1, max: 12 },
        fixedNights: 0,
        images: imgsRio.slice(10, 18),
        description: 'Incluye reserva, seguro y fiambre. Caminata de 20 a 60 minutos según el charco elegido. Ideal para disfrutar el día y conectar con la naturaleza.',
        addons: [
            { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
            { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
        ],
    },
];

const normalizarFecha = (fechaStr) => {
    const [year, month, day] = fechaStr.split("-");
    return new Date(year, month - 1, day);
};

const Reserva = () => {
    const SAVE_ENABLED = false; // Deshabilita guardado mientras el backend /reservas está comentado
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [modalPlan, setModalPlan] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [addonsState, setAddonsState] = useState({}); // { [key]: boolean }

    // Selecciona imagen de portada específica por plan
    const getCoverImage = (plan) => {
        if (!plan?.images?.length) return imgR1;
        // Reglas por id de plan
        if (plan.id === 'cabana-fenix') {
            // Buscar una imagen que contenga 'fenix' o 'IMG-202' como más representativa
            const fenix = plan.images.find(u => /portada_fenix/i.test(u));
            return fenix || plan.images[0];
        }
        if (plan.id === 'cabana-aventureros') {
            const avent = plan.images.find(u => /aventureros18/i.test(u));
            return avent || plan.images[0];
        }
        if (plan.id === 'ventana-rio') {
            // Usa una imagen con 'rio' si existe
            const rio = plan.images.find(u => /rio|río|melcocho/i.test(u));
            return rio || plan.images[0];
        }
        return plan.images[0];
    };

    const handleBookNow = (e) => {
        e.preventDefault();

        const dateS = e.target.elements["reservation-date-start"].value;
        const dateE = e.target.elements["reservation-date-end"].value;
        const adults = Number(e.target.elements['adults'].value);
        const children = Number(e.target.elements['children'].value);

        if (!selectedPlan) return alert('Seleccione un plan.');

        if (!dateS) return alert('Seleccione una fecha de inicio de reserva');
        if (!dateE && selectedPlan.fixedNights !== 0) return alert('Seleccione una fecha de fin de reserva');

        const fechaInicio = normalizarFecha(dateS);
        const fechaFinal = selectedPlan.fixedNights === 0 && !dateE ? fechaInicio : normalizarFecha(dateE);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaInicio < hoy) return alert('La fecha de inicio no puede ser anterior al día actual');
        if (selectedPlan.fixedNights !== 0 && fechaFinal <= fechaInicio) return alert('La fecha de salida debe ser posterior a la de entrada');

        // Calcular noches
        const nights = selectedPlan.fixedNights !== undefined
            ? selectedPlan.fixedNights
            : Math.ceil((fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24));

        // Validar capacidad
        const people = adults + children;
        if (selectedPlan.capacity?.min && people < selectedPlan.capacity.min) {
            return alert(`El mínimo para este plan es ${selectedPlan.capacity.min} persona(s).`);
        }
        if (selectedPlan.capacity?.max && people > selectedPlan.capacity.max) {
            return alert(`El máximo para este plan es ${selectedPlan.capacity.max} persona(s).`);
        }

        // Calcular costos base según tipo de plan
        let planBase = 0;
        if (selectedPlan.priceType === 'perPerson') {
            planBase = selectedPlan.price * people; // paquete por persona
        } else if (selectedPlan.priceType === 'perCouple') {
            const couples = Math.ceil(people / 2);
            planBase = selectedPlan.price * couples;
        }

        // Addons (detalle)
        let addonsTotal = 0;
        const addonsDetailed = [];
        selectedPlan.addons?.forEach(a => {
            if (addonsState[a.key]) {
                const unit = a.pricePerPerson;
                const persons = people;
                const addonCost = unit * persons;
                addonsTotal += addonCost;
                addonsDetailed.push({ label: a.label, unit, persons, total: addonCost });
            }
        });

        const subtotal = planBase + addonsTotal; // Comidas ya incluidas en plan, desayuno extra via addon
        const insurance = Math.round(subtotal * 0.10); // 10%
        const total = subtotal + insurance;

        setSummaryData({
            dateS: fechaInicio.toLocaleDateString(),
            dateE: fechaFinal.toLocaleDateString(),
            adults,
            children,
            plan: selectedPlan,
            nights,
            addons: addonsDetailed,
            totals: {
                planBase,
                addonsTotal,
                insurance,
                subtotal,
                total,
            }
        });
    };

    const handleCloseModal = () => {
        setSummaryData(null);
    };

    const handleSendAndSave = async () => {
        if (!summaryData) return;
        // Mientras el backend esté deshabilitado, solo generar PDF y cerrar
        if (!SAVE_ENABLED) {
            await handleGeneratePDF();
            alert('Guardado deshabilitado temporalmente. Se generó el PDF.');
            setSummaryData(null);
            return;
        }
        try {
            const payload = {
                userEmail: user?.email || user?.correo,
                userNombre: user?.nombre,
                planId: summaryData.plan.id,
                planTitulo: summaryData.plan.title,
                fechaInicio: summaryData.dateS,
                fechaFin: summaryData.dateE,
                adultos: Number(summaryData.adults),
                ninos: Number(summaryData.children),
                noches: Number(summaryData.nights),
                addons: summaryData.addons,
                totals: summaryData.totals,
            };
            const res = await fetch('http://localhost:5000/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.mensaje || 'No se pudo guardar la reserva');
            alert('Reserva guardada correctamente');
        } catch (err) {
            alert(`Error al guardar la reserva: ${err.message}`);
        } finally {
            setSummaryData(null);
        }
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
    doc.text(`Plan: ${summaryData.plan.title}`, 20, 102);

        // Imagen del alojamiento si existe
        let tableStartY = 120;

        // Detalle del plan y addons

        const rows = [];
        rows.push([`Base del plan`, formatCOP(summaryData.totals.planBase)]);
        if (summaryData.addons?.length) {
            summaryData.addons.forEach((a) => rows.push([
                `Extra: ${a.label} (${formatCOP(a.unit)} x ${a.persons})`,
                formatCOP(a.total)
            ]));
            rows.push([`Total extras`, formatCOP(summaryData.totals.addonsTotal)]);
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
        doc.text(`SUBTOTAL: ${formatCOP(summaryData.totals.subtotal)}`, 20, afterTableY + 10);
        doc.text(`SEGURO (10%): ${formatCOP(summaryData.totals.insurance)}`, 20, afterTableY + 18);
        doc.text(`TOTAL: ${formatCOP(summaryData.totals.total)}`, 20, afterTableY + 26);

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
                            <h3 className="reserva-title">Elige tu plan</h3>
                            <div className="reserva-options plans-grid">
                                {PLANS.map((p) => (
                                    <div key={p.id} className={`reserva-card ${selectedPlan?.id === p.id ? 'selected' : ''}`}>
                                        <img src={getCoverImage(p)} alt={p.title} />
                                        <h4>{p.title}</h4>
                                        <p>
                                            {p.priceType === 'perPerson' ? `${formatCOP(p.price)} por persona` : `${formatCOP(p.price)} por pareja`}
                                        </p>
                                        <p>Capacidad: {p.capacity.min} - {p.capacity.max} personas</p>
                                        <div className="plan-actions">
                                            <button type="button" className="btn-secondary" onClick={() => { setModalPlan(p); setPlanModalOpen(true); setCarouselIndex(0); }}>Ver detalles</button>
                                            <button type="button" className="btn-primary" onClick={() => setSelectedPlan(p)}>Seleccionar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr />

                        {selectedPlan && (
                            <div className="reserva-section">
                                <h3 className="reserva-title">Extras opcionales</h3>
                                <div className="reserva-meal-options">
                                    {selectedPlan.addons?.map(a => (
                                        <div
                                            key={a.key}
                                            className={`reserva-meal-option ${addonsState[a.key] ? 'selected' : ''}`}
                                            onClick={() => setAddonsState({...addonsState, [a.key]: !addonsState[a.key]})}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && setAddonsState({...addonsState, [a.key]: !addonsState[a.key]})}
                                        >
                                            {a.label} — {formatCOP(a.pricePerPerson)} por persona
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="reserva-btn">Reserva ahora</button>
                    </form>

                    {summaryData && (
                        <div className="reserva-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
                            <div className="reserva-modal-content" onClick={(e) => e.stopPropagation()}>
                                <h2>Confirmar Reservación</h2>
                                <p><strong>Fecha inicio:</strong> {summaryData.dateS}</p>
                                <p><strong>Fecha final:</strong> {summaryData.dateE}</p>
                                <p><strong>Cantidad:</strong> {summaryData.adults} adulto(s), {summaryData.children} niño(s)</p>
                                <p><strong>Plan:</strong> {summaryData.plan.title}</p>
                                {summaryData.addons?.length > 0 && (
                                    <div>
                                        <strong>Extras:</strong>
                                        <ul>
                                            {summaryData.addons.map((a, idx) => (
                                                <li key={idx}>{a.label} ({formatCOP(a.unit)} x {a.persons}) = {formatCOP(a.total)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {summaryData.totals && (
                                    <>
                                        <p><strong>Base del plan:</strong> {formatCOP(summaryData.totals.planBase)}</p>
                                        <p><strong>Extras:</strong> {formatCOP(summaryData.totals.addonsTotal)}</p>
                                        <p><strong>Seguro (10%):</strong> {formatCOP(summaryData.totals.insurance)}</p>
                                        <p style={{ fontSize: '1.1rem' }}><strong>Total:</strong> {formatCOP(summaryData.totals.total)}</p>
                                    </>
                                )}
                                <div className="reserva-modal-buttons">
                                    <button className="reserva-btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                                    <button className="reserva-btn-confirm" onClick={handleSendAndSave}>Enviar y Guardar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {planModalOpen && modalPlan && (
                        <div className="reserva-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setPlanModalOpen(false); setModalPlan(null); } }}>
                            <div className="reserva-modal-content plan-modal" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => { setPlanModalOpen(false); setModalPlan(null); }}>×</button>
                                <h2>{modalPlan.title}</h2>
                                <div className="carousel">
                                    {modalPlan.images?.length ? (
                                        <div className="carousel-viewport">
                                            <button type="button" className="carousel-nav left" onClick={() => setCarouselIndex((i) => (i - 1 + modalPlan.images.length) % modalPlan.images.length)} aria-label="Anterior">‹</button>
                                            <img className="carousel-image" src={modalPlan.images[carouselIndex]} alt={`Imagen ${carouselIndex + 1}`} />
                                            <button type="button" className="carousel-nav right" onClick={() => setCarouselIndex((i) => (i + 1) % modalPlan.images.length)} aria-label="Siguiente">›</button>
                                        </div>
                                    ) : (
                                        <p>Sin imágenes</p>
                                    )}
                                    <div className="carousel-thumbs">
                                        {modalPlan.images?.map((src, idx) => (
                                            <img key={idx} src={src} alt={`thumb-${idx}`} className={idx === carouselIndex ? 'active' : ''} onClick={() => setCarouselIndex(idx)} />
                                        ))}
                                    </div>
                                </div>
                                <div className="plan-description">
                                    <p>{modalPlan.description}</p>
                                </div>
                                <div className="plan-meta">
                                    <div><strong>Precio:</strong> {modalPlan.priceType === 'perPerson' ? `${formatCOP(modalPlan.price)} por persona` : `${formatCOP(modalPlan.price)} por pareja`}</div>
                                    <div><strong>Capacidad:</strong> {modalPlan.capacity.min} - {modalPlan.capacity.max} personas</div>
                                </div>
                                <div className="reserva-modal-buttons">
                                    <button className="btn-secondary" onClick={() => { setPlanModalOpen(false); setModalPlan(null); }}>Cerrar</button>
                                    <button className="btn-primary" onClick={() => { setSelectedPlan(modalPlan); setPlanModalOpen(false); }}>Seleccionar este plan</button>
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