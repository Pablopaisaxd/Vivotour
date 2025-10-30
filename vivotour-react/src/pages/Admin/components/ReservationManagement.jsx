import React, { useState, useEffect } from 'react';
import { apiConfig } from '../../../config/apiConfig';

const ReservationManagement = () => {
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

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
            padding: '1.5rem',
            background: 'linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.05) 100%)',
            borderRadius: '12px',
            boxShadow: '0 8px 25px var(--shadow-medium)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        title: {
            fontSize: '1.8rem',
            color: 'var(--rich-black)',
            marginBottom: '1rem',
            fontWeight: '700',
            textShadow: '0 2px 4px var(--shadow-light)',
        },
        filterSection: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.2rem',
            padding: '1.5rem',
            background: 'var(--input-bg)',
            borderRadius: '12px',
            border: '2px solid var(--input-border)',
            boxShadow: '0 4px 15px var(--shadow-light)',
        },
        filterGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        filterLabel: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: 'var(--rich-black)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        filterInput: {
            padding: '0.8rem 1rem',
            border: '2px solid var(--input-border)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            background: 'var(--alice-blue)',
            color: 'var(--rich-black)',
            transition: 'var(--transition)',
        },
        filterButtons: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
        },
        clearButton: {
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #6c757d, #5a6268)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
            transition: 'var(--transition)',
        },
        errorMessage: {
            padding: '1rem 1.2rem',
            background: 'var(--error-bg)',
            color: 'var(--error-color)',
            borderRadius: '8px',
            border: '2px solid var(--error-border)',
            fontWeight: '500',
        },
        loadingMessage: {
            padding: '1.5rem',
            background: 'var(--input-bg)',
            color: 'var(--rich-black)',
            borderRadius: '8px',
            border: '2px solid var(--input-border)',
            textAlign: 'center',
            fontSize: '1.1rem',
        },
        section: {
            marginBottom: '1.5rem',
            border: '2px solid var(--input-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            background: 'var(--alice-blue)',
            boxShadow: '0 4px 15px var(--shadow-light)',
        },
        subtitle: {
            fontSize: '1.3rem',
            color: 'var(--rich-black)',
            marginBottom: '1rem',
            fontWeight: '600',
            textShadow: '0 1px 2px var(--shadow-light)',
        },
        reservationList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        reservationItem: {
            border: '2px solid var(--input-border)',
            borderRadius: '10px',
            padding: '1.2rem',
            background: 'linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.03) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            transition: 'var(--transition)',
            boxShadow: '0 2px 8px var(--shadow-light)',
        },
        reservationDetail: {
            color: 'var(--rich-black)',
            fontSize: '0.95rem',
            lineHeight: '1.4',
        },
        noData: {
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--input-placeholder)',
            fontSize: '1.1rem',
            fontWeight: '500',
        },
    };

    return (
        <div style={styles.container} className="reservation-management-container">
            <h2 style={styles.title}>Gestión de Reservas</h2>

            {error && <div style={styles.errorMessage}>{error}</div>}
            {loading && <div style={styles.loadingMessage}>Cargando reservas...</div>}

            {!loading && (
                <div style={styles.filterSection}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Desde:</label>
                        <input
                            type="date"
                            style={styles.filterInput}
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--forest-green)';
                                e.target.style.background = 'var(--input-bg-focus)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--input-border)';
                                e.target.style.background = 'var(--alice-blue)';
                            }}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Hasta:</label>
                        <input
                            type="date"
                            style={styles.filterInput}
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--forest-green)';
                                e.target.style.background = 'var(--input-bg-focus)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--input-border)';
                                e.target.style.background = 'var(--alice-blue)';
                            }}
                        />
                    </div>
                    <div style={styles.filterButtons}>
                        <button
                            style={styles.clearButton}
                            onClick={clearFilters}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                            }}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            )}

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
                            <div key={res.id} style={styles.reservationItem}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px var(--shadow-medium)';
                                    e.currentTarget.style.borderColor = 'var(--forest-green)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-light)';
                                    e.currentTarget.style.borderColor = 'var(--input-border)';
                                }}
                            >
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