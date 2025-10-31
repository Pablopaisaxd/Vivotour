import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';

const PlansManagement = () => {
    const [plans, setPlans] = useState([
        {
            id: 'ventana-rio',
            title: 'Plan Amanecer Ventana del Río Melcocho',
            price: 200000,
            priceType: 'perPerson',
            capacity: { min: 1, max: 6 },
            fixedNights: 1,
            description: 'Incluye reserva y seguro, cena del día de llegada, desayuno y fiambre al día siguiente, transporte en mula para entrar (1.5h aprox) y tour al río Melcocho con guía al día siguiente.',
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        price: '',
        priceType: 'perPerson',
        capacity: { min: 1, max: 6 },
        fixedNights: 1,
        IdAlojamiento: '',
    });

    const handleEdit = (plan) => {
        // Ensure formData has all fields defined to avoid controlled/uncontrolled warnings
        setEditingId(plan.id);
        setFormData({
            id: plan.id || '',
            title: plan.title || plan.name || '',
            description: plan.description || '',
            price: plan.price ?? '',
            priceType: plan.priceType || 'perPerson',
            capacity: plan.capacity || { min: 1, max: plan.maxPersons || 6 },
            fixedNights: plan.fixedNights ?? plan.duration ?? 1,
            IdAlojamiento: plan.IdAlojamiento ?? ''
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const payload = {
                name: formData.title || formData.name,
                description: formData.description || '',
                price: Number(formData.price) || 0,
                duration: formData.fixedNights ?? 1,
                maxPersons: formData.capacity?.max ?? (formData.maxPersons || 1),
                IdAlojamiento: formData.IdAlojamiento || null
            };

            if (editingId) {
                const res = await fetch(`${API_BASE_URL}/admin/planes/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(`Error HTTP ${res.status} ${text}`);
                }
                setPlans(plans.map(plan => plan.id === editingId ? { ...plan, ...formData } : plan));
            } else {
                const res = await fetch(`${API_BASE_URL}/admin/planes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    let errText = '';
                    try { errText = JSON.stringify(await res.json()); } catch (e) { errText = await res.text().catch(() => ''); }
                    throw new Error(`Error HTTP ${res.status} ${errText}`);
                }

                const data = await res.json();
                if (data && data.plan) {
                    const p = data.plan;
                    const mapped = {
                        id: p.id || String(p.id || Date.now()),
                        title: p.name || p.title || '',
                        description: p.description || '',
                        price: Number(p.price) || 0,
                        priceType: p.priceType || 'perPerson',
                        capacity: { min: 1, max: p.maxPersons || 6 },
                        fixedNights: p.duration || 1,
                        IdAlojamiento: p.IdAlojamiento || null
                    };
                    setPlans([mapped, ...plans]);
                } else {
                    const newPlan = { ...formData, id: (formData.title || 'plan').toLowerCase().replace(/\s+/g, '-') };
                    setPlans([newPlan, ...plans]);
                }
            }
        } catch (err) {
            console.error('Error guardando plan:', err);
            alert('Error guardando plan: ' + err.message);
        } finally {
            setShowForm(false);
            setEditingId(null);
            resetForm();
            setLoading(false);
        }
    };

    const handleDelete = (planId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este plan?')) return;
        const token = localStorage.getItem('token');
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/planes/${planId}`, {
                    method: 'DELETE',
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
                setPlans(plans.filter(plan => plan.id !== planId));
            } catch (err) {
                console.error('Error eliminando plan:', err);
                alert('Error eliminando plan: ' + err.message);
            }
        })();
    };

    // Load plans from server if available
    useEffect(() => {
        const token = localStorage.getItem('token');
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/planes`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (!res.ok) return; // keep local defaults if unauthenticated
                const data = await res.json();
                if (data && data.success && Array.isArray(data.planes)) {
                    // Map backend plan rows to the client shape expected by this component
                    const mapped = data.planes.map(p => ({
                        id: p.id || (p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : String(p.id)),
                        title: p.name || p.title || '',
                        description: p.description || '',
                        price: Number(p.price) || 0,
                        priceType: p.priceType || 'perPerson',
                        capacity: p.capacity || { min: 1, max: (p.maxPersons ? Number(p.maxPersons) : 6) },
                        fixedNights: p.duration ?? p.fixedNights ?? 1,
                        IdAlojamiento: p.IdAlojamiento ?? p.IdAlojamiento ?? null
                    }));
                    setPlans(mapped);
                }
            } catch (err) {
                console.warn('No se pudieron cargar planes del servidor:', err.message);
            }
        })();
    }, []);

    const resetForm = () => {
        setFormData({
            id: '',
            title: '',
            description: '',
            price: '',
            priceType: 'perPerson',
            capacity: { min: 1, max: 6 },
            fixedNights: 1,
            IdAlojamiento: '',
        });
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
        addButton: {
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: '0 4px 15px var(--shadow-strong)',
            transition: 'var(--transition)',
            alignSelf: 'flex-start',
        },
        plansList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
        },
        planCard: {
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--input-border)',
            boxShadow: '0 4px 20px var(--shadow-light)',
            transition: 'var(--transition)',
            backdropFilter: 'blur(10px)',
        },
        planTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: 'var(--rich-black)',
            marginBottom: '1rem',
            lineHeight: '1.3',
        },
        planPrice: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: 'var(--forest-green)',
            marginBottom: '0.75rem',
        },
        planDescription: {
            color: 'var(--rich-black)',
            lineHeight: '1.6',
            marginBottom: '1.25rem',
            fontSize: '0.95rem',
        },
        planDetails: {
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            color: 'var(--input-placeholder)',
            fontWeight: '500',
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
        },
        editButton: {
            background: 'linear-gradient(135deg, var(--golden-yellow), #e6b412)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px rgba(255, 201, 20, 0.3)',
        },
        deleteButton: {
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 24, 27, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
        },
        modalContent: {
            background: 'var(--alice-blue)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(26, 24, 27, 0.3)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--input-border)',
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'var(--rich-black)',
            fontSize: '0.95rem',
        },
        input: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            background: 'var(--input-bg)',
            color: 'var(--rich-black)',
            transition: 'var(--transition)',
            boxSizing: 'border-box',
        },
        textarea: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            background: 'var(--input-bg)',
            color: 'var(--rich-black)',
            minHeight: '120px',
            resize: 'vertical',
            transition: 'var(--transition)',
            boxSizing: 'border-box',
            lineHeight: '1.5',
        },
        select: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            background: 'var(--input-bg)',
            color: 'var(--rich-black)',
            transition: 'var(--transition)',
            boxSizing: 'border-box',
        },
        modalButtons: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
        },
        saveButton: {
            background: 'linear-gradient(135deg, var(--forest-green), var(--golden-yellow))',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem',
            transition: 'var(--transition)',
            boxShadow: '0 4px 15px var(--shadow-strong)',
        },
        cancelButton: {
            background: 'rgba(255, 255, 255, 0.8)',
            color: 'var(--rich-black)',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: '1px solid var(--input-border)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'var(--transition)',
        },
        modalTitle: {
            color: 'var(--rich-black)',
            marginBottom: '1.5rem',
            fontWeight: '700',
            fontSize: '1.4rem',
            textAlign: 'center',
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Planes</h2>
            
            <button 
                style={styles.addButton}
                onClick={() => {
                    resetForm();
                    setEditingId(null);
                    setShowForm(true);
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px var(--shadow-strong)';
                }}
            >
                Agregar Nuevo Plan
            </button>

            <div style={styles.plansList}>
                {plans.map(plan => (
                    <div 
                        key={plan.id}
                        style={styles.planCard}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 30px var(--shadow-medium)';
                            e.currentTarget.style.borderColor = 'var(--forest-green)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow-light)';
                            e.currentTarget.style.borderColor = 'var(--input-border)';
                        }}
                    >
                        <h3 style={styles.planTitle}>{plan.title}</h3>
                        <p style={styles.planPrice}>
                            ${plan.price.toLocaleString()} COP {plan.priceType === 'perPerson' ? 'por persona' : 'por pareja'}
                        </p>
                        <p style={styles.planDescription}>{plan.description}</p>
                        <div style={styles.planDetails}>
                            <span>Capacidad: {plan.capacity?.min ?? 1}-{plan.capacity?.max ?? 'N/A'} personas</span>
                            <span>Noches: {plan.fixedNights ?? plan.duration ?? 'N/A'}</span>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button 
                                style={styles.editButton}
                                onClick={() => handleEdit(plan)}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(255, 201, 20, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(255, 201, 20, 0.3)';
                                }}
                            >
                                Editar
                            </button>
                            <button 
                                style={styles.deleteButton}
                                onClick={() => handleDelete(plan.id)}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>
                            {editingId ? 'Editar Plan' : 'Agregar Nuevo Plan'}
                        </h3>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Título del Plan</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Nombre del plan"
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Descripción</label>
                            <textarea
                                style={styles.textarea}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Descripción detallada del plan"
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Precio (COP)</label>
                            <input
                                type="number"
                                style={styles.input}
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                                placeholder="Precio en pesos colombianos"
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tipo de Precio</label>
                            <select
                                style={styles.select}
                                value={formData.priceType}
                                onChange={(e) => setFormData({...formData, priceType: e.target.value})}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            >
                                <option value="perPerson">Por Persona</option>
                                <option value="perCouple">Por Pareja</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Noches Incluidas</label>
                            <input
                                type="number"
                                style={styles.input}
                                value={formData.fixedNights}
                                onChange={(e) => setFormData({...formData, fixedNights: parseInt(e.target.value) || 0})}
                                min="0"
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Id del Alojamiento (IdAlojamiento)</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.IdAlojamiento}
                                onChange={(e) => setFormData({...formData, IdAlojamiento: e.target.value})}
                                placeholder="IdAlojamiento (número entero o identificador)"
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--forest-green)';
                                    e.target.style.background = 'var(--input-bg-focus)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--input-border)';
                                    e.target.style.background = 'var(--input-bg)';
                                }}
                            />
                        </div>

                        <div style={styles.modalButtons}>
                            <button 
                                style={styles.cancelButton}
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 15px var(--shadow-medium)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px var(--shadow-light)';
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                style={styles.saveButton}
                                onClick={handleSave}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px var(--shadow-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px var(--shadow-strong)';
                                }}
                            >
                                {editingId ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansManagement;