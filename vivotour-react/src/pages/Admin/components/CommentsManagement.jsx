import React, { useState, useEffect } from 'react';

const CommentsManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleDeleteComment = (id) => {
        setComments(comments.filter(comment => comment.id !== id));
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
            color: 'red',
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
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
                                onClick={() => handleDeleteComment(comment.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsManagement;