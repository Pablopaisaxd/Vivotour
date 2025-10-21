import React, { useState, useEffect } from 'react';
import { apiConfig } from '../../../config/apiConfig';

const ReservationManagement = () => {
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filtros de fecha
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Cargar reservas al montar el componente
    useEffect(() => {
        fetchReservations();
    }, []);

    // Aplicar filtros cuando cambian las fechas
    useEffect(() => {
        applyFilters();
    }, [reservations, filterStartDate, filterEndDate]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No se encontró token de autenticación');
                setLoading(false);
                return;
            }

            // Obtener todas las reservas del backend
            const response = await fetch(`${apiConfig.baseUrl}/api/admin/reservas`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(`Error ${response.status}: ${errorData.mensaje || 'Error al obtener reservas'}`);
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.reservas)) {
                // Mapear datos del backend al formato del componente
                const formattedReservations = data.reservas.map(res => ({
                    id: res.IdReserva,
                    user: res.NombreUsuario || 'N/A',
                    email: res.EmailUsuario || 'N/A',
                    dateS: res.FechaIngreso,
                    dateE: res.FechaSalida,
                    adults: res.CantidadAdultos || 0,
                    children: res.CantidadNinos || 0,
                    accommodation: res.TipoAlojamiento || 'No especificado',
                    status: res.Monto > 0 ? 'confirmed' : 'pending',
                    informacion: res.InformacionReserva || '',
                    monto: res.Monto || 0
                }));
                setReservations(formattedReservations);
            } else {
                setError(data.mensaje || 'Error al obtener reservas');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión con el servidor: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reservations];

        if (filterStartDate) {
            filtered = filtered.filter(res => new Date(res.dateS) >= new Date(filterStartDate));
        }

        if (filterEndDate) {
            filtered = filtered.filter(res => new Date(res.dateE) <= new Date(filterEndDate));
        }

        setFilteredReservations(filtered);
    };

    const clearFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
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
        filterSection: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid var(--border-color-light)',
        },
        filterGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
        },
        filterLabel: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--rich-black)',
        },
        filterInput: {
            padding: '8px 12px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            fontSize: '0.95rem',
        },
        filterButtons: {
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
        },
        filterButton: {
            padding: '8px 16px',
            backgroundColor: '#2c5530',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
        },
        clearButton: {
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
        },
        errorMessage: {
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '5px',
            border: '1px solid #f5c2c7',
        },
        loadingMessage: {
            padding: '12px',
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            borderRadius: '5px',
            border: '1px solid #bee5eb',
            textAlign: 'center',
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
        noData: {
            textAlign: 'center',
            padding: '20px',
            color: '#6c757d',
            fontSize: '1rem',
        },
    };

    return (
        <div style={styles.container} className="reservation-management-container">
            <h2 style={styles.title}>Gestión de Reservas</h2>

            {error && <div style={styles.errorMessage}>{error}</div>}
            {loading && <div style={styles.loadingMessage}>Cargando reservas...</div>}

            {/* Filtro de fechas */}
            {!loading && (
                <div style={styles.filterSection}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Desde:</label>
                        <input
                            type="date"
                            style={styles.filterInput}
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Hasta:</label>
                        <input
                            type="date"
                            style={styles.filterInput}
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                    <div style={styles.filterButtons}>
                        <button
                            style={styles.clearButton}
                            onClick={clearFilters}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de reservas */}
            <div style={styles.section}>
                <h3 style={styles.subtitle}>
                    Reservas ({filteredReservations.length})
                </h3>
                {filteredReservations.length === 0 ? (
                    <div style={styles.noData}>
                        {reservations.length === 0 ? 'No hay reservas disponibles' : 'No hay reservas que coincidan con el filtro'}
                    </div>
                ) : (
                    <div style={styles.reservationList}>
                        {filteredReservations.map(res => (
                            <div key={res.id} style={styles.reservationItem}>
                                <p style={styles.reservationDetail}><strong>Usuario:</strong> {res.user} ({res.email})</p>
                                <p style={styles.reservationDetail}><strong>Fechas:</strong> {new Date(res.dateS).toLocaleDateString()} - {new Date(res.dateE).toLocaleDateString()}</p>
                                <p style={styles.reservationDetail}><strong>Alojamiento:</strong> {res.accommodation}</p>
                                {res.informacion && (
                                    <p style={styles.reservationDetail}><strong>Información:</strong> {res.informacion}</p>
                                )}
                                {res.monto > 0 && (
                                    <p style={styles.reservationDetail}><strong>Monto:</strong> ${res.monto.toLocaleString()} COP</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationManagement;