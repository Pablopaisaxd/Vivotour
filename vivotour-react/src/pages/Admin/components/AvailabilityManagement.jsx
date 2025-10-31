import React, { useState, useEffect } from 'react';
import apiConfig from '../../../config/apiConfig';

const AvailabilityManagement = () => {
    const [plans, setPlans] = useState([]);
    const [extraServices, setExtraServices] = useState([]);
    const [planUnavailability, setPlanUnavailability] = useState({});
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

    useEffect(() => {
        loadPlansAndServices();
    }, []);

    const loadPlansAndServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const plansResponse = await fetch(`${apiConfig.baseUrl}/api/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                setPlans(plansData.plans || []);

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
            padding: '1.5rem',
            background: 'var(--alice-blue)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px var(--shadow-light)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            border: '1px solid var(--input-border)',
        },
        title: {
            fontSize: '1.75rem',
            color: 'var(--rich-black)',
            marginBottom: '1rem',
            fontWeight: '700',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        section: {
            marginBottom: '1.5rem',
            border: '1px solid var(--input-border)',
            borderRadius: '12px',
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'var(--transition)',
        },
        subtitle: {
            fontSize: '1.3rem',
            color: 'var(--rich-black)',
            marginBottom: '1rem',
            fontWeight: '600',
            borderBottom: '2px solid var(--forest-green)',
            paddingBottom: '0.5rem',
        },
        inputContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
        },
        input: {
            padding: '0.75rem',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--rich-black)',
            fontSize: '0.95rem',
            background: 'var(--input-bg)',
            transition: 'var(--transition)',
        },
        addButton: {
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            gridColumn: '1 / -1',
            fontSize: '1rem',
            boxShadow: '0 4px 15px var(--shadow-strong)',
            transition: 'var(--transition)',
        },
        unavailabilityList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '1rem',
        },
        unavailabilityItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
            borderRadius: '12px',
            border: '1px solid var(--golden-yellow)',
            boxShadow: '0 4px 12px rgba(255, 201, 20, 0.2)',
            transition: 'var(--transition)',
        },
        unavailabilityText: {
            color: 'var(--rich-black)',
            fontSize: '1rem',
            flex: 1,
            fontWeight: '500',
        },
        removeButton: {
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginLeft: '1rem',
            transition: 'var(--transition)',
            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
        },
        message: {
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: message ? 'block' : 'none',
            fontWeight: '500',
            textAlign: 'center',
        },
        successMessage: {
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
            color: '#155724',
            border: '1px solid var(--forest-green)',
        },
        errorMessage: {
            background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
            color: '#721c24',
            border: '1px solid #dc3545',
        },
        loadingText: {
            textAlign: 'center',
            color: 'var(--rich-black)',
            padding: '2rem',
            fontSize: '1.1rem',
            fontWeight: '500',
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
                    <button 
                        onClick={handleAddUnavailability} 
                        style={styles.addButton}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px var(--shadow-strong)';
                        }}
                    >
                        Agregar No Disponibilidad
                    </button>
                </div>
            </div>

            {plans.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.subtitle}>Planes Disponibles</h3>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ 
                            marginBottom: '1.25rem', 
                            paddingBottom: '1.25rem', 
                            borderBottom: '1px solid var(--input-border)' 
                        }}>
                            <h4 style={{ 
                                color: 'var(--rich-black)', 
                                marginBottom: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                            }}>
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
                                                onMouseEnter={(e) => {
                                                    setHoveredButton(`${plan.id}-${period.id}`);
                                                    e.target.style.transform = 'scale(1.05)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    setHoveredButton(null);
                                                    e.target.style.transform = 'scale(1)';
                                                    e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                                                }}
                                                style={styles.removeButton}
                                            >
                                                 Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ 
                                    color: 'var(--input-placeholder)', 
                                    fontSize: '0.95rem',
                                    fontStyle: 'italic'
                                }}>
                                    Sin periodos de no disponibilidad
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {extraServices.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.subtitle}>Servicios Extra</h3>
                    <p style={{ 
                        color: 'var(--input-placeholder)', 
                        fontSize: '0.95rem', 
                        marginBottom: '1rem',
                        fontStyle: 'italic'
                    }}>
                        Los servicios extra no requieren gestión de disponibilidad.
                    </p>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '1rem' 
                    }}>
                        {extraServices.map(service => (
                            <div key={service.id} style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid var(--input-border)',
                                borderRadius: '8px',
                                transition: 'var(--transition)',
                            }}>
                                <strong style={{ color: 'var(--rich-black)' }}>{service.name}</strong>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'var(--forest-green)', 
                                    margin: '0.5rem 0',
                                    fontWeight: '600'
                                }}>
                                    {service.category} - ${service.price}
                                </p>
                                {service.description && (
                                    <p style={{ 
                                        fontSize: '0.85rem', 
                                        color: 'var(--input-placeholder)',
                                        lineHeight: '1.4'
                                    }}>
                                        {service.description}
                                    </p>
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