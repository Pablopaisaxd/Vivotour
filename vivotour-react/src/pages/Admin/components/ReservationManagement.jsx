import React, { useState } from 'react';

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

const ReservationManagement = () => {
    const [reservations, setReservations] = useState([
        {
            id: 1,
            user: 'Juan Pérez',
            email: 'juan.perez@example.com',
            dateS: '2024-08-10',
            dateE: '2024-08-12',
            adults: 2,
            children: 1,
            accommodation: 'Cabañas',
            activities: ['Caminata a la cascada', 'Día de sol'],
            meals: ['Desayuno', 'Almuerzo', 'Cena'],
            status: 'pending'
        },
        {
            id: 2,
            user: 'María García',
            email: 'maria.garcia@example.com',
            dateS: '2024-09-01',
            dateE: '2024-09-05',
            adults: 4,
            children: 0,
            accommodation: 'Zona de camping',
            activities: ['Avistamiento de aves', 'Cabalgatas'],
            meals: ['Almuerzo', 'Cena'],
            status: 'confirmed'
        },
        {
            id: 3,
            user: 'Carlos Ruiz',
            email: 'carlos.ruiz@example.com',
            dateS: '2024-09-15',
            dateE: '2024-09-17',
            adults: 3,
            children: 2,
            accommodation: 'Cabañas',
            activities: ['Charco'],
            meals: ['Desayuno', 'Almuerzo'],
            status: 'pending'
        }
    ]);

    const handleStatusChange = (id, newStatus) => {
        setReservations(prevReservations =>
            prevReservations.map(res =>
                res.id === id ? { ...res, status: newStatus } : res
            )
        );
    };

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: 'var(--card-background)',
            borderRadius: '8px',
            boxShadow: '0 5px 15px var(--shadow-light)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        title: {
            fontSize: '1.5rem',
            color: 'var(--rich-black)',
            marginBottom: '15px',
            fontWeight: '600',
        },
        section: {
            marginBottom: '20px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '15px',
        },
        subtitle: {
            fontSize: '1.2rem',
            color: 'var(--rich-black)',
            marginBottom: '10px',
            fontWeight: '500',
        },
        reservationList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        reservationItem: {
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: 'var(--alice-blue)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
        },
        reservationDetail: {
            color: 'var(--rich-black)',
            fontSize: '0.95rem',
        },
        statusButtons: {
            marginTop: '10px',
            display: 'flex',
            gap: '10px',
        },
        statusButton: {
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'white',
        },
        pendingButton: {
            backgroundColor: '#ffc107',
        },
        confirmedButton: {
            backgroundColor: '#28a745',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Reservas</h2>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Reservas Recientes</h3>
                <div style={styles.reservationList}>
                    {reservations.map(res => (
                        <div key={res.id} style={styles.reservationItem}>
                            <p style={styles.reservationDetail}><strong>Usuario:</strong> {res.user} ({res.email})</p>
                            <p style={styles.reservationDetail}><strong>Fechas:</strong> {res.dateS} - {res.dateE}</p>
                            <p style={styles.reservationDetail}><strong>Personas:</strong> {res.adults} adultos, {res.children} niños</p>
                            <p style={styles.reservationDetail}><strong>Alojamiento:</strong> {res.accommodation}</p>
                            <p style={styles.reservationDetail}><strong>Actividades:</strong> {Array.isArray(res.activities) ? res.activities.join(', ') : res.activities}</p>
                            <p style={styles.reservationDetail}><strong>Comidas:</strong> {Array.isArray(res.meals) ? res.meals.join(', ') : res.meals}</p>
                            <p style={styles.reservationDetail}><strong>Estado:</strong> {res.status === 'pending' ? 'Pendiente' : 'Confirmado'}</p>
                            <div style={styles.statusButtons}>
                                <button
                                    style={{ ...styles.statusButton, ...styles.pendingButton }}
                                    onClick={() => handleStatusChange(res.id, 'pending')}
                                >
                                    Pendiente
                                </button>
                                <button
                                    style={{ ...styles.statusButton, ...styles.confirmedButton }}
                                    onClick={() => handleStatusChange(res.id, 'confirmed')}
                                >
                                    Confirmado
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReservationManagement;