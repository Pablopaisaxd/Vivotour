import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

const AvailabilityManagement = () => {
    const [plans, setPlans] = useState([]);
    const [extraServices, setExtraServices] = useState([]);
    const [planUnavailability, setPlanUnavailability] = useState({}); // { planId: [{ id, fecha_inicio, fecha_fin, razon }] }
    const [newUnavailability, setNewUnavailability] = useState({
        planId: '',
        fecha_inicio: '',
        fecha_fin: '',
        razon: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [hoveredButton, setHoveredButton] = useState(null);

    // Cargar planes y servicios extra al montar
    useEffect(() => {
        loadPlansAndServices();
    }, []);

    const loadPlansAndServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Cargar planes
            const plansResponse = await fetch(`${apiConfig.baseUrl}/api/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                setPlans(plansData.plans || []);

                // Cargar no disponibilidad para cada plan
                const unavailabilityMap = {};
                for (const plan of (plansData.plans || [])) {
                    const unavailResponse = await fetch(
                        `${apiConfig.baseUrl}/api/plans/${plan.id}/unavailability`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (unavailResponse.ok) {
                        const unavailData = await unavailResponse.json();
                        unavailabilityMap[plan.id] = unavailData.unavailablePeriods || [];
                    }
                }
                setPlanUnavailability(unavailabilityMap);
            }

            // Cargar servicios extra
            const servicesResponse = await fetch(`${apiConfig.baseUrl}/api/extra-services`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (servicesResponse.ok) {
                const servicesData = await servicesResponse.json();
                setExtraServices(servicesData.services || []);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setMessage('Error al cargar planes y servicios');
            setLoading(false);
        }
    };

    const handleAddUnavailability = async () => {
        try {
            if (!newUnavailability.planId || !newUnavailability.fecha_inicio || !newUnavailability.fecha_fin) {
                setMessage('Por favor completa todos los campos requeridos');
                return;
            }

            if (new Date(newUnavailability.fecha_fin) <= new Date(newUnavailability.fecha_inicio)) {
                setMessage('La fecha fin debe ser posterior a la fecha inicio');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${apiConfig.baseUrl}/api/plans/${newUnavailability.planId}/unavailability`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fecha_inicio: newUnavailability.fecha_inicio,
                        fecha_fin: newUnavailability.fecha_fin,
                        razon: newUnavailability.razon
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessage('No disponibilidad creada exitosamente');

                // Actualizar el estado local
                setPlanUnavailability(prev => ({
                    ...prev,
                    [newUnavailability.planId]: [
                        ...(prev[newUnavailability.planId] || []),
                        {
                            id: data.id,
                            fecha_inicio: newUnavailability.fecha_inicio,
                            fecha_fin: newUnavailability.fecha_fin,
                            razon: newUnavailability.razon
                        }
                    ]
                }));

                setNewUnavailability({ planId: '', fecha_inicio: '', fecha_fin: '', razon: '' });
            } else {
                const errorData = await response.json();
                setMessage(errorData.mensaje || 'Error al crear no disponibilidad');
            }
        } catch (err) {
            console.error('Error:', err);
            setMessage('Error al crear no disponibilidad');
        }
    };

    const handleRemoveUnavailability = async (planId, unavailabilityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${apiConfig.baseUrl}/api/plans/${planId}/unavailability/${unavailabilityId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                setMessage('Periodo eliminado exitosamente');
                setPlanUnavailability(prev => ({
                    ...prev,
                    [planId]: prev[planId].filter(u => u.id !== unavailabilityId)
                }));
            } else {
                setMessage('Error al eliminar periodo');
            }
        } catch (err) {
            console.error('Error:', err);
            setMessage('Error al eliminar periodo');
        }
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
        inputContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '10px',
        },
        input: {
            padding: '8px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            color: 'var(--rich-black)',
            fontSize: '0.9rem',
        },
        addButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            gridColumn: '1 / -1',
        },
        unavailabilityList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '10px',
        },
        unavailabilityItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107',
            boxShadow: '0 2px 4px rgba(255, 193, 7, 0.1)',
        },
        unavailabilityText: {
            color: 'var(--rich-black)',
            fontSize: '0.95rem',
            flex: 1,
        },
        removeButton: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginLeft: '10px',
            transition: 'all 0.3s ease',
        },
        message: {
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '10px',
            display: message ? 'block' : 'none',
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
        },
        errorMessage: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
        },
        loadingText: {
            textAlign: 'center',
            color: 'var(--rich-black)',
            padding: '20px',
        }
    };

    if (loading) {
        return <div style={styles.loadingText}>Cargando planes y servicios...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de No Disponibilidad</h2>

            {message && (
                <div style={{
                    ...styles.message,
                    ...(message.includes('Error') || message.includes('Por favor') ? styles.errorMessage : styles.successMessage)
                }}>
                    {message}
                </div>
            )}

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Marcar Plan como No Disponible</h3>
                <div style={styles.inputContainer}>
                    <select
                        value={newUnavailability.planId}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, planId: e.target.value })}
                        style={styles.input}
                    >
                        <option value="">-- Selecciona un Plan --</option>
                        {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={newUnavailability.fecha_inicio}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, fecha_inicio: e.target.value })}
                        style={styles.input}
                        placeholder="Fecha inicio"
                    />
                    <input
                        type="date"
                        value={newUnavailability.fecha_fin}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, fecha_fin: e.target.value })}
                        style={styles.input}
                        placeholder="Fecha fin"
                    />
                    <input
                        type="text"
                        value={newUnavailability.razon}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, razon: e.target.value })}
                        style={styles.input}
                        placeholder="Razón (opcional)"
                    />
                    <button onClick={handleAddUnavailability} style={styles.addButton}>
                        Agregar No Disponibilidad
                    </button>
                </div>
            </div>

            {plans.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.subtitle}>Planes Disponibles</h3>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color-light)' }}>
                            <h4 style={{ color: 'var(--rich-black)', marginBottom: '10px' }}>
                                {plan.name} {plan.IdAlojamiento && `(Alojamiento: ${plan.IdAlojamiento})`}
                            </h4>
                            {planUnavailability[plan.id] && planUnavailability[plan.id].length > 0 ? (
                                <div style={styles.unavailabilityList}>
                                    {planUnavailability[plan.id].map(period => (
                                        <div key={period.id} style={styles.unavailabilityItem}>
                                            <div style={styles.unavailabilityText}>
                                                <strong>{new Date(period.fecha_inicio).toLocaleDateString()}</strong> a <strong>{new Date(period.fecha_fin).toLocaleDateString()}</strong>
                                                {period.razon && ` - ${period.razon}`}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveUnavailability(plan.id, period.id)}
                                                onMouseEnter={() => setHoveredButton(`${plan.id}-${period.id}`)}
                                                onMouseLeave={() => setHoveredButton(null)}
                                                style={{
                                                    ...styles.removeButton,
                                                    backgroundColor: hoveredButton === `${plan.id}-${period.id}` ? '#bb2d3b' : '#dc3545',
                                                    transform: hoveredButton === `${plan.id}-${period.id}` ? 'scale(1.05)' : 'scale(1)',
                                                }}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999', fontSize: '0.9rem' }}>Sin periodos de no disponibilidad</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {extraServices.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.subtitle}>Servicios Extra (No tienen disponibilidad configurable)</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
                        Los servicios extra no requieren gestión de disponibilidad.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                        {extraServices.map(service => (
                            <div key={service.id} style={{
                                padding: '10px',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid var(--border-color-light)',
                                borderRadius: '5px'
                            }}>
                                <strong>{service.name}</strong>
                                <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0' }}>
                                    {service.category} - ${service.price}
                                </p>
                                {service.description && (
                                    <p style={{ fontSize: '0.8rem', color: '#999' }}>{service.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManagement;