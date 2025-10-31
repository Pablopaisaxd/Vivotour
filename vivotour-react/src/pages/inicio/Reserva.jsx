import React, { useState, useContext, useMemo, useEffect } from 'react';
import './style/Reserva.css';
import Nav from './Navbar';
import Footer from '../../components/use/Footer';
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import imgR1 from '../../assets/Fondos/Cabaña estandar.jpg';
import imgR2 from '../../assets/Fondos/refcamping.jpg';
import logoVivoTour from "../../assets/Logos/new vivo contorno2.png";
import { AuthContext } from '../../AuthContext';
import apiConfig from '../../config/apiConfig';
const imgsRio = Object.values(import.meta.glob('../../assets/imgs/rio/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaFenix = Object.values(import.meta.glob('../../assets/imgs/cabañas/Cabaña_fenix/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCabanaAventureros = Object.values(import.meta.glob('../../assets/imgs/cabañas/Cabaña_los_aventureros/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));
const imgsCamping = Object.values(import.meta.glob('../../assets/imgs/zona_camping/*.{jpg,jpeg,png}', { eager: true, as: 'url' }));


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
        price: 600000,
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
        price: 200000,
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
        price: 40000,
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

// Función para formatear fecha para mostrar al usuario
const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
};

// Función para formatear fechas para PDF (evita desfase de zona horaria)
const formatDateForPDF = (dateStr) => {
    try {
        // Usar la fecha tal como viene, sin conversión de zona horaria
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
};

const Reserva = () => {
    const SAVE_ENABLED = true; // Habilitar guardado ahora que el backend está funcionando
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [modalPlan, setModalPlan] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [addonsState, setAddonsState] = useState({}); // { [key]: boolean }
    const [extraServices, setExtraServices] = useState([]); // Servicios extra desde BD
    const [reservedAlojamientos, setReservedAlojamientos] = useState({}); // { [planId]: { status, razon } }
    const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
    const [formError, setFormError] = useState(null);

    // Cargar servicios extra desde la API
    useEffect(() => {
        const loadExtraServices = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn('No token available for loading extra services');
                    return;
                }

                const response = await fetch(`${apiConfig.baseUrl}/api/extra-services`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.services && Array.isArray(data.services)) {
                        setExtraServices(data.services);
                    }
                }
            } catch (err) {
                console.error('Error loading extra services:', err);
            }
        };

        loadExtraServices();
    }, []);

    // Función para cargar reservas y no disponibilidad de un alojamiento en un rango de fechas
    const loadReservationsForDateRange = async (startDate, endDate) => {
        if (!startDate || !endDate) {
            setReservedAlojamientos({});
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token available for loading reservations');
                return;
            }

            // Mapeo de planes a alojamientos (para compatibilidad con planes locales)
            const planToAlojamientoMap = {
                1: 1, // Plan ID numérico -> Alojamiento ID
                2: 2,
                3: 3,
                4: 4,
                'ventana-rio': 1,      // Plan ID string -> Alojamiento ID
                'cabana-fenix': 2,
                'cabana-aventureros': 3,
                'dia-de-sol': 4,
            };

            const reserved = {}; // { planId: { status: 'reserved' | 'unavailable', razon: '' } }
            
            // Obtener reservas Y no disponibilidad para cada alojamiento en los planes actuales
            // Solo procesar planes que tengan alojamiento (planes principales, no extras)
            const reservationPromises = plansToUse.map(async (plan) => {
                try {
                    // Intentar usar IdAlojamiento del servidor primero, luego el mapeo
                    let alojamientoId = plan.IdAlojamiento || planToAlojamientoMap[plan.id] || planToAlojamientoMap[plan.stringId];
                    
                    // Si no hay alojamiento asociado, no marcar como reservado
                    // (esto permite que planes "extra" no se marquen)
                    if (!alojamientoId) {
                        // debug: removed console.log for production
                        return;
                    }
                    
                    // 1. Verificar reservas
                    const reservasResponse = await fetch(
                        `${apiConfig.baseUrl}/api/alojamientos/${alojamientoId}/reservas?fechaInicio=${startDate}&fechaFin=${endDate}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (reservasResponse.ok) {
                        const reservasData = await reservasResponse.json();
                        if (reservasData.reservas && reservasData.reservas.length > 0) {
                            reserved[plan.id] = { status: 'reserved', razon: 'RESERVADO' };
                            // debug: removed console.log for production
                        }
                    }

                    // 2. Verificar no disponibilidad
                    const unavailResponse = await fetch(
                        `${apiConfig.baseUrl}/api/plans/${plan.id}/unavailability`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (unavailResponse.ok) {
                        const unavailData = await unavailResponse.json();
                            if (unavailData.unavailablePeriods && unavailData.unavailablePeriods.length > 0) {
                            
                            
                            // Función para comparar fechas en formato YYYY-MM-DD
                            const dateComparison = (dateStr1, dateStr2) => {
                                // Retorna: -1 si dateStr1 < dateStr2, 0 si son iguales, 1 si dateStr1 > dateStr2
                                return dateStr1 < dateStr2 ? -1 : dateStr1 > dateStr2 ? 1 : 0;
                            };
                            
                            for (const period of unavailData.unavailablePeriods) {
                                
                                
                                // Solapamiento: start <= periodEnd AND end >= periodStart
                                const startsBeforeOrOn = dateComparison(startDate, period.fecha_fin) <= 0;
                                const endsOnOrAfter = dateComparison(endDate, period.fecha_inicio) >= 0;
                                
                                
                                
                                if (startsBeforeOrOn && endsOnOrAfter) {
                                    if (!reserved[plan.id] || reserved[plan.id].status !== 'reserved') {
                                        // Usar la razón de no disponibilidad si existe
                                        const razon = period.razon || 'NO DISPONIBLE TEMPORALMENTE';
                                        reserved[plan.id] = { status: 'unavailable', razon };
                                    }
                                    break;
                                }
                            }
                        }
                    } else {
                        console.warn(`Error fetching unavailability for plan ${plan.id}:`, unavailResponse.status);
                    }
                } catch (err) {
                    console.error(`Error loading data for plan ${plan.id}:`, err);
                }
            });

            await Promise.all(reservationPromises);
            setReservedAlojamientos(reserved);
        } catch (err) {
            console.error('Error loading reservations:', err);
        }
    };

    // Cargar planes con imágenes desde el servidor
    const loadPlansWithImages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token available for loading plans');
                return null;
            }

            const response = await fetch(`${apiConfig.baseUrl}/api/plans`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.plans && Array.isArray(data.plans)) {
                    // Mapear y cargar imágenes para cada plan
                    const plansWithImages = await Promise.all(
                        data.plans.map(async (plan) => {
                            try {
                                // Mapear ID numérico a ID string para encontrar plan por defecto
                                const stringId = plan.id === 1 ? 'ventana-rio' : 
                                                plan.id === 2 ? 'cabana-fenix' : 
                                                plan.id === 3 ? 'cabana-aventureros' : 
                                                plan.id === 4 ? 'dia-de-sol' : null;
                                
                                // Obtener las imágenes antiguas por defecto del plan
                                const planDefecto = stringId ? PLANS.find(p => p.id === stringId) : null;
                                const imagenesAntiguas = planDefecto?.images || [];

                                // Intentar cargar imágenes legacy primero del nuevo endpoint
                                let images = [...imagenesAntiguas]; // Comenzar con las antiguas
                                
                                try {
                                    const legacyResponse = await fetch(`${apiConfig.baseUrl}/api/plans/${plan.id}/images-with-legacy`, {
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                        }
                                    });
                                    
                                    if (legacyResponse.ok) {
                                        const legacyData = await legacyResponse.json();
                                        if (legacyData.images && Array.isArray(legacyData.images)) {
                                            
                                            // Convertir imágenes legacy y nuevas
                                            images = legacyData.images.map(img => {
                                                // Si es una URL de assets, devolverla tal cual para que el frontend la resuelva
                                                if (img.url && img.url.startsWith('/src/assets/imgs')) {
                                                    return img.url.replace('/src', '');
                                                }
                                                // Si es una URL del servidor, agregar la URL base
                                                if (img.url && img.url.startsWith('/uploads')) {
                                                    return `${apiConfig.baseUrl}${img.url}`;
                                                }
                                                return img.url || img.filename;
                                            });
                                            
                                        } else {
                                            // Si el servidor retorna array vacío, usar imágenes antiguas como fallback
                                            
                                            images = imagenesAntiguas;
                                        }
                                    } else {
                                        // Si falla la llamada, usar imágenes antiguas
                                        console.warn(`Plan ${plan.id}: Failed to fetch images, using defaults`);
                                        images = imagenesAntiguas;
                                    }
                                } catch (legacyErr) {
                                    console.warn('Error fetching images, using defaults:', legacyErr);
                                    // Si falla el endpoint, usar las antiguas por defecto
                                    images = imagenesAntiguas;
                                }
                                
                                return {
                                    id: plan.id,
                                    title: plan.name,
                                    description: plan.description,
                                    price: plan.price,
                                    duration: plan.duration,
                                    maxPersons: plan.maxPersons,
                                    priceType: 'perPerson', // Por defecto
                                    capacity: {
                                        min: 1,
                                        max: plan.maxPersons || 6
                                    },
                                    fixedNights: plan.duration || 1,
                                    images: images.length > 0 ? images : [],
                                    addons: [] // Los addons se definirán localmente por ahora
                                };
                            } catch (err) {
                                console.error('Error loading images for plan:', plan.id, err);
                                return null;
                            }
                        })
                    );
                    return plansWithImages.filter(p => p !== null);
                }
            }
        } catch (err) {
            console.error('Error loading plans:', err);
        }
        return null;
    };

    // Usar planes del servidor si están disponibles, si no usar los por defecto
    const [serverPlans, setServerPlans] = useState(PLANS); // Iniciar con PLANS
    useEffect(() => {
        const loadPlans = async () => {
            // Cargar planes del servidor con sus imágenes
            const plans = await loadPlansWithImages();
            // Si no hay planes del servidor, usar los por defecto
            const plansToUse = (plans && plans.length > 0) ? plans : PLANS;
            
            // Agregar los addons que se definen localmente
            const plansWithAddons = plansToUse.map(p => {
                const addonsMap = {
                    'ventana-rio': [
                        { key: 'muleExit', label: 'Mula de salida', pricePerPerson: 30000 },
                        { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
                        { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
                    ],
                    'cabana-fenix': [
                        { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
                        { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
                    ],
                    'cabana-aventureros': [
                        { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
                        { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
                    ],
                    'dia-de-sol': [
                        { key: 'campingExtra', label: 'Camping extra', pricePerPerson: 25000 },
                        { key: 'breakfastExtra', label: 'Desayuno extra', pricePerPerson: 12000 },
                    ]
                };
                // Usar stringId si existe (planes del servidor), sino usar plan.id (planes locales)
                const planKey = p.stringId || p.id;
                return {
                    ...p,
                    addons: addonsMap[planKey] || (p.addons && p.addons.length > 0 ? p.addons : [])
                };
            });
            setServerPlans(plansWithAddons);
        };
        loadPlans();
    }, []);

    // Cargar reservas cuando cambian las fechas
    useEffect(() => {
        if (selectedDateRange.start && selectedDateRange.end) {
            loadReservationsForDateRange(selectedDateRange.start, selectedDateRange.end);
        }
    }, [selectedDateRange]);

    // Usar los planes del servidor (que siempre está inicializado)
    const plansToUse = serverPlans;
    
    const getCoverImage = (plan) => {
        if (!plan?.images?.length) return imgR1;
        // Devolver la primera imagen del plan como portada
        return plan.images[0];
    };

    const handleBookNow = (e) => {
        e.preventDefault();
        setFormError(null);
        const dateS = e.target.elements["reservation-date-start"].value;
        const dateE = e.target.elements["reservation-date-end"].value;
        const adults = Number(e.target.elements['adults'].value);
        const children = Number(e.target.elements['children'].value);

        if (!selectedPlan) {
            setFormError('Seleccione un plan.');
            return;
        }

        if (!dateS) {
            setFormError('Seleccione una fecha de inicio de reserva');
            return;
        }
        if (!dateE && selectedPlan.fixedNights !== 0) {
            setFormError('Seleccione una fecha de fin de reserva');
            return;
        }

        const fechaInicio = normalizarFecha(dateS);
        const fechaFinal = selectedPlan.fixedNights === 0 && !dateE ? fechaInicio : normalizarFecha(dateE);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaInicio < hoy) {
            setFormError('La fecha de inicio no puede ser anterior al día actual');
            return;
        }
        if (selectedPlan.fixedNights !== 0 && fechaFinal <= fechaInicio) {
            setFormError('La fecha de salida debe ser posterior a la de entrada');
            return;
        }

        // Calcular noches
        const nights = selectedPlan.fixedNights !== undefined
            ? selectedPlan.fixedNights
            : Math.ceil((fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24));

        // Validar capacidad
        const people = adults + children;
        const minCap = selectedPlan?.capacity?.min ?? 1;
        const maxCap = selectedPlan?.capacity?.max ?? selectedPlan?.maxPersons ?? null;
        if (minCap && people < minCap) {
            setFormError(`El mínimo para este plan es ${minCap} persona(s).`);
            return;
        }
        if (maxCap && people > maxCap) {
            setFormError(`El máximo para este plan es ${maxCap} persona(s).`);
            return;
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
        
        // Addons del plan
        selectedPlan.addons?.forEach(a => {
            if (addonsState[a.key]) {
                const unit = a.pricePerPerson;
                const persons = people;
                const addonCost = unit * persons;
                addonsTotal += addonCost;
                addonsDetailed.push({ label: a.label, unit, persons, total: addonCost });
            }
        });

        // Servicios extras desde BD
        extraServices.forEach(service => {
            if (addonsState[`extra-${service.id}`]) {
                const unit = service.price;
                const persons = 1; // Los servicios extras se cobran como unidad
                const addonCost = unit;
                addonsTotal += addonCost;
                addonsDetailed.push({ label: service.name, unit, persons, total: addonCost });
            }
        });

        // Asegurarnos de que todos los valores son números (no strings con formato)
        const subtotalRaw = Number(planBase || 0) + Number(addonsTotal || 0);
        const insuranceRaw = Math.round(Number(subtotalRaw) * 0.10);
        const totalRaw = Number(subtotalRaw) + Number(insuranceRaw);

        const planBaseNum = Number(planBase || 0);
        const addonsTotalNum = Number(addonsTotal || 0);

        setSummaryData({
            dateS: fechaInicio.toISOString().split('T')[0],
            dateE: fechaFinal.toISOString().split('T')[0],
            adults,
            children,
            plan: selectedPlan,
            nights,
            addons: addonsDetailed,
            totals: {
                planBase: planBaseNum,
                addonsTotal: addonsTotalNum,
                insurance: insuranceRaw,
                subtotal: subtotalRaw,
                total: totalRaw,
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
            setSummaryData(null);
            return;
        }
        try {
            // Obtener token de autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                setFormError('Debe iniciar sesión para realizar una reserva');
                return;
            }

            // Crear información de la reserva como texto
            const informacionReserva = `
Plan: ${summaryData.plan.title}
Adultos: ${summaryData.adults}
Niños: ${summaryData.children}
Noches: ${summaryData.nights}
Fecha inicio: ${formatDateForDisplay(summaryData.dateS)}
Fecha fin: ${formatDateForDisplay(summaryData.dateE)}
Addons: ${summaryData.addons && summaryData.addons.length > 0 ? summaryData.addons.map(a => `${a.label} (${formatCOP(a.unit)} x ${a.persons}) = ${formatCOP(a.total)}`).join(' • ') : 'Ninguno'}
Total: ${formatCOP(summaryData.totals?.total || 0)}
            `.trim();

            const payload = {
                IdAlojamiento: 1, // Por ahora usamos el primer alojamiento, más adelante se puede hacer dinámico
                FechaIngreso: summaryData.dateS,
                FechaSalida: summaryData.dateE,
                CantidadAdultos: summaryData.adults,
                CantidadNinos: summaryData.children,
                InformacionReserva: informacionReserva,
                Monto: summaryData.totals?.total || 0
            };

            

            const res = await fetch('http://localhost:5000/api/reservas', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.mensaje || 'No se pudo guardar la reserva');
            
            // Redirigir directamente al checkout con el ID de la reserva
            navigate(`/checkout/${data.reservaId}`);
        } catch (err) {
            setFormError(`Error al guardar la reserva: ${err.message}`);
        } finally {
            setSummaryData(null);
        }
    };

    const { user } = useContext(AuthContext);

    const handleGeneratePDF = async () => {
        if (!summaryData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Colores del tema VivoTour
        const colorPrimario = [75, 172, 53]; // Verde VivoTour
        const colorSecundario = [255, 201, 20]; // Amarillo VivoTour
        const colorTexto = [45, 45, 45]; // Gris oscuro
        
        try {
            // Header con fondo verde
            doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.rect(0, 0, pageWidth, 35, 'F');
            // Intentar cargar y dibujar el logo en la esquina superior derecha
            try {
                const logoObj = await fetchImageAsDataURL(logoVivoTour);
                // Obtener dimensiones reales de la imagen para mantener proporción
                const getImageDimensions = (dataUrl) => new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
                    img.onerror = () => resolve(null);
                    img.src = dataUrl;
                });

                if (logoObj && logoObj.dataUrl) {
                    const dims = await getImageDimensions(logoObj.dataUrl);
                    if (dims) {
                        const desiredW = 36; // ancho en puntos
                        const scale = desiredW / dims.w;
                        const desiredH = dims.h * scale;
                        const xPos = pageWidth - 15 - desiredW; // margen derecho 15
                        const yPos = Math.max(4, (35 - desiredH) / 2); // centrar vertical dentro del header
                        doc.addImage(logoObj.dataUrl, logoObj.format, xPos, yPos, desiredW, desiredH);
                    }
                }
            } catch (logoErr) {
                // No bloquear la generación del PDF si falla el logo
                console.warn('No se pudo cargar el logo para el PDF:', logoErr);
            }

            // Título principal en blanco
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("CONFIRMACIÓN DE RESERVA", pageWidth / 2, 20, { align: 'center' });
            
            // Subtítulo
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("La Ventana del Río Melcocho", pageWidth / 2, 28, { align: 'center' });
            
            // Reset color para el contenido
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            
            // Sección de información del cliente
            let yPos = 50;
            doc.setFillColor(240, 248, 255);
            doc.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.text("INFORMACIÓN DEL CLIENTE", 20, yPos + 5);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.text(`Nombre: ${user?.nombre || "No disponible"}`, 20, yPos + 15);
            doc.text(`Correo: ${user?.correo || user?.email || "No disponible"}`, 20, yPos + 22);
            
            // Sección de detalles de la reserva
            yPos += 40;
            doc.setFillColor(255, 249, 230);
            doc.rect(15, yPos - 5, pageWidth - 30, 45, 'F');
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
            doc.text("DETALLES DE LA RESERVA", 20, yPos + 5);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            // Se quitan las líneas de Check-in/Check-out por petición
            doc.text(`Noches: ${summaryData.nights}`, 20, yPos + 29);
            doc.text(`Huéspedes: ${summaryData.adults} adulto(s), ${summaryData.children} niño(s)`, 20, yPos + 36);
            
            // Plan seleccionado
            yPos += 60;
            doc.setFillColor(250, 255, 250);
            doc.rect(15, yPos - 5, pageWidth - 30, 20, 'F');
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.text("PLAN SELECCIONADO", 20, yPos + 5);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.text(`${summaryData.plan.title}`, 20, yPos + 15);
            
            // Tabla de costos
            yPos += 30;
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
                startY: yPos,
                head: [['Concepto', 'Precio']],
                body: rows,
                styles: { 
                    fontSize: 10,
                    cellPadding: 4
                },
                headStyles: {
                    fillColor: colorPrimario,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250]
                },
                theme: 'striped'
            });
            
            // Totales
            const afterTableY = doc.lastAutoTable?.finalY || yPos + 40;
            yPos = afterTableY + 15;
            
            doc.setFillColor(255, 245, 238);
            doc.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.text(`Subtotal: ${formatCOP(summaryData.totals.subtotal)}`, 20, yPos + 8);
            doc.text(`Seguro (10%): ${formatCOP(summaryData.totals.insurance)}`, 20, yPos + 18);
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.text(`TOTAL: ${formatCOP(summaryData.totals.total)}`, 20, yPos + 28);
            
            // Footer decorativo
            const footerY = pageHeight - 30;
            doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.rect(0, footerY, pageWidth, 30, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("VivoTour - La Ventana del Río Melcocho", pageWidth / 2, footerY + 10, { align: 'center' });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("Cocorná, Antioquia - Colombia", pageWidth / 2, footerY + 16, { align: 'center' });
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, footerY + 22, { align: 'center' });
            
            doc.save(`VivoTour_Confirmacion_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            setFormError('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
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
                        {formError && (
                            <div className="form-error" role="alert">
                                <p>{formError}</p>
                            </div>
                        )}
                        <div className="reserva-top-sections">
                            <div className="reserva-section reserva-section-half">
                                <h3 className="reserva-title">Seleccione fecha</h3>
                                <div className="reserva-people">
                                    <div className="reserva-group">
                                        <label htmlFor="reservation-date-start">Fecha de entrada</label>
                                        <input 
                                            type="date" 
                                            id="reservation-date-start" 
                                            name="reservation-date-start" 
                                            required 
                                            onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        />
                                    </div>
                                    <div className="reserva-group">
                                        <label htmlFor="reservation-date-end">Fecha de salida</label>
                                        <input 
                                            type="date" 
                                            id="reservation-date-end" 
                                            name="reservation-date-end" 
                                            required 
                                            onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        />
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
                                {plansToUse.map((p) => (
                                    <div key={p.id} className={`reserva-card ${selectedPlan?.id === p.id ? 'selected' : ''} ${reservedAlojamientos[p.id]?.status === 'reserved' ? 'reserved' : ''} ${reservedAlojamientos[p.id]?.status === 'unavailable' ? 'unavailable' : ''}`} data-razon={reservedAlojamientos[p.id]?.razon || ''}>
                                        <img src={getCoverImage(p)} alt={p.title} />
                                        <h4>{p.title}</h4>
                                        <p>
                                            {p.priceType === 'perPerson' ? `${formatCOP(p.price)} por persona` : `${formatCOP(p.price)} por pareja`}
                                        </p>
                                        <p>Capacidad: {p.capacity?.min ?? 1} - {p.capacity?.max ?? p.maxPersons ?? 'N/A'} personas</p>
                                        <div className="plan-actions">
                                            <button type="button" className="btn-secondary" onClick={() => { setModalPlan(p); setPlanModalOpen(true); setCarouselIndex(0); }} disabled={!!reservedAlojamientos[p.id]}>Ver detalles</button>
                                            <button type="button" className="btn-primary" onClick={() => setSelectedPlan(p)} disabled={!!reservedAlojamientos[p.id]}>Seleccionar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr />

                        {/* Sección de Extras - Mostrar siempre, no solo cuando hay plan seleccionado */}
                        <div className="reserva-section">
                            <h3 className="reserva-title">Extras opcionales</h3>
                            <div className="reserva-meal-options">
                                {extraServices.length > 0 ? (
                                    extraServices.map(service => (
                                        <div
                                            key={service.id}
                                            className={`reserva-meal-option ${addonsState[`extra-${service.id}`] ? 'selected' : ''}`}
                                            onClick={() => setAddonsState({...addonsState, [`extra-${service.id}`]: !addonsState[`extra-${service.id}`]})}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && setAddonsState({...addonsState, [`extra-${service.id}`]: !addonsState[`extra-${service.id}`]})}
                                            title={service.description}
                                        >
                                            <div>
                                                <strong>{service.name}</strong>
                                                {service.category && <span style={{marginLeft: '10px', fontSize: '12px', color: '#666'}}>({service.category})</span>}
                                            </div>
                                            {formatCOP(service.price)}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{color: '#999'}}>No hay extras disponibles en este momento</p>
                                )}
                            </div>
                        </div>

                        <hr />

                        {selectedPlan && (
                            <div className="reserva-section">
                                <h3 className="reserva-title">Extras incluidos en el plan</h3>
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
                                <p><strong>Fecha inicio:</strong> {formatDateForDisplay(summaryData.dateS)}</p>
                                <p><strong>Fecha final:</strong> {formatDateForDisplay(summaryData.dateE)}</p>
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
                                    <div><strong>Capacidad:</strong> {modalPlan.capacity?.min ?? 1} - {modalPlan.capacity?.max ?? modalPlan.maxPersons ?? 'N/A'} personas</div>
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