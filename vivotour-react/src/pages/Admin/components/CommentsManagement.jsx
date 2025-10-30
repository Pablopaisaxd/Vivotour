import React, { useState, useEffect } from 'react';

const CommentsManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch('http://localhost:5000/opiniones');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setComments(data.opiniones);
                } else {
                    setError(data.mensaje || 'Error al cargar los comentarios.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, []);

    const handleDeleteComment = async (id) => {
        try {
            setDeletingId(id);
            const response = await fetch(`http://localhost:5000/opiniones/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.status === 204) {
                setComments((prev) => prev.filter((comment) => comment.id !== id));
                return;
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.mensaje || `No se pudo eliminar (HTTP ${response.status})`);
                }
                setComments((prev) => prev.filter((comment) => comment.id !== id));
            } else {
                const text = await response.text();
                throw new Error(text?.slice(0, 200) || `Respuesta no válida del servidor (HTTP ${response.status})`);
            }
        } catch (err) {
            setError(err.message);
            alert(`Error al eliminar: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const requestDelete = (id) => {
        setConfirmId(id);
        setConfirmOpen(true);
    };

    const cancelConfirm = () => {
        setConfirmOpen(false);
        setConfirmId(null);
    };

    const confirmDelete = async () => {
        if (confirmId == null) return;
        const id = confirmId;
        setConfirmOpen(false);
        setConfirmId(null);
        await handleDeleteComment(id);
    };

    const styles = {
        container: {
            padding: '1.5rem',
            background: 'var(--alice-blue)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px var(--shadow-light)',
            gridColumn: '1 / -1',
            width: '100%', 
            minHeight: '100vh',
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
        commentList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        commentItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--input-border)',
            borderRadius: '12px',
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px var(--shadow-light)',
        },
        commentText: {
            flexGrow: '1',
            marginRight: '1rem',
            color: 'var(--rich-black)',
            fontSize: '1rem',
            lineHeight: '1.5',
        },
        deleteButton: {
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        },
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 24, 27, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(5px)',
        },
        modalContent: {
            width: 'min(90vw, 420px)',
            background: 'var(--alice-blue)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(26, 24, 27, 0.3)',
            padding: '2rem',
            border: '1px solid var(--input-border)',
        },
        modalTitle: {
            margin: 0,
            marginBottom: '1rem',
            fontSize: '1.3rem',
            color: 'var(--rich-black)',
            fontWeight: '700',
            textAlign: 'center',
        },
        modalText: {
            margin: 0,
            color: 'var(--rich-black)',
            fontSize: '1rem',
            lineHeight: '1.5',
            textAlign: 'center',
            marginBottom: '1.5rem',
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
        },
        modalButton: {
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'var(--transition)',
            minWidth: '100px',
        },
        cancelButton: {
            background: 'rgba(255, 255, 255, 0.8)',
            color: 'var(--rich-black)',
            border: '1px solid var(--input-border)',
            boxShadow: '0 2px 8px var(--shadow-light)',
        },
        confirmButton: {
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        },
        loadingText: {
            color: 'var(--rich-black)',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: '500',
            padding: '2rem',
        },
        errorText: {
            color: '#dc3545',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: '500',
            padding: '2rem',
            background: 'rgba(220, 53, 69, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
        },
        noComments: {
            textAlign: 'center',
            color: 'var(--input-placeholder)',
            fontSize: '1.1rem',
            fontStyle: 'italic',
            padding: '2rem',
        }
    };

    if (loading) return <p style={styles.loadingText}>Cargando comentarios...</p>;
    if (error) return <p style={styles.errorText}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Comentarios</h2>
            <div style={styles.commentList}>
                {comments.length === 0 ? (
                    <p style={styles.noComments}>No hay comentarios para mostrar.</p>
                ) : (
                    comments.map((comment) => (
                        <div 
                            key={comment.id} 
                            style={styles.commentItem}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px var(--shadow-medium)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-light)';
                            }}
                        >
                            <p style={styles.commentText}>
                                <strong style={{ color: 'var(--forest-green)' }}>{comment.nombre}:</strong> {comment.opinion}
                            </p>
                            <button
                                style={styles.deleteButton}
                                onClick={() => requestDelete(comment.id)}
                                disabled={deletingId === comment.id}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                }}
                            >
                                {deletingId === comment.id ? 'Eliminando…' : '🗑️ Eliminar'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {confirmOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <h3 id="confirm-title" style={styles.modalTitle}>Confirmar eliminación</h3>
                        <p style={styles.modalText}>¿Seguro que deseas eliminar este comentario? Esta acción no se puede deshacer.</p>
                        <div style={styles.modalActions}>
                            <button
                                type="button"
                                onClick={cancelConfirm}
                                style={{ ...styles.modalButton, ...styles.cancelButton }}
                                disabled={deletingId != null}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 15px var(--shadow-medium)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px var(--shadow-light)';
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{ ...styles.modalButton, ...styles.confirmButton }}
                                disabled={deletingId != null}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentsManagement;