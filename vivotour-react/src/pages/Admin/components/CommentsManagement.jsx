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

            // Algunos servidores responden 204 No Content para DELETE
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
                // Lanza un error más claro cuando el servidor devuelve HTML (p. ej., una página de error)
                throw new Error(text?.slice(0, 200) || `Respuesta no válida del servidor (HTTP ${response.status})`);
            }
        } catch (err) {
            setError(err.message);
            alert(`Error al eliminar: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    // Abre el modal de confirmación
    const requestDelete = (id) => {
        setConfirmId(id);
        setConfirmOpen(true);
    };

    // Cierra el modal de confirmación sin eliminar
    const cancelConfirm = () => {
        setConfirmOpen(false);
        setConfirmId(null);
    };

    // Confirma y ejecuta la eliminación
    const confirmDelete = async () => {
        if (confirmId == null) return;
        const id = confirmId;
        setConfirmOpen(false);
        setConfirmId(null);
        await handleDeleteComment(id);
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
        commentList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        commentItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: 'var(--alice-blue)',
        },
        commentText: {
            flexGrow: '1',
            marginRight: '10px',
            color: 'var(--rich-black)',
        },
        deleteButton: {
            backgroundColor: 'var(--error-main)',
            color: '#ff0000ff',
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
        },
        // Modal de confirmación
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
        },
        modalContent: {
            width: 'min(90vw, 420px)',
            backgroundColor: 'var(--card-background, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            padding: '20px',
            border: '1px solid var(--border-color-light, #e5e7eb)',
        },
        modalTitle: {
            margin: 0,
            marginBottom: '8px',
            fontSize: '1.15rem',
            color: 'var(--rich-black, #111827)',
            fontWeight: 700,
        },
        modalText: {
            margin: 0,
            color: 'var(--rich-black, #111827)',
            opacity: 0.9,
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '18px',
        },
        modalButton: {
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
        },
        cancelButton: {
            backgroundColor: 'var(--alice-blue, #f3f4f6)',
            color: 'var(--rich-black, #111827)',
            border: '1px solid var(--border-color-light, #e5e7eb)',
        },
        confirmButton: {
            backgroundColor: 'var(--error-main, #dc2626)',
            color: '#fff',
        },
        loadingText: {
            color: 'var(--rich-black)',
        },
        errorText: {
            color: 'var(--error-main)',
        },
    };

    if (loading) return <p style={styles.loadingText}>Cargando comentarios...</p>;
    if (error) return <p style={styles.errorText}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Gestión de Comentarios</h2>
            <div style={styles.commentList}>
                {comments.length === 0 ? (
                    <p>No hay comentarios para mostrar.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} style={styles.commentItem}>
                            <p style={styles.commentText}><strong>{comment.nombre}:</strong> {comment.opinion}</p>
                            <button
                                style={styles.deleteButton}
                                onClick={() => requestDelete(comment.id)}
                                disabled={deletingId === comment.id}
                            >
                                {deletingId === comment.id ? 'Eliminando…' : 'Eliminar'}
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
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{ ...styles.modalButton, ...styles.confirmButton }}
                                disabled={deletingId != null}
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