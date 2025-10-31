import React, { useState, useEffect } from 'react';

const CommentsManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
        const response = await fetch('http://localhost:5000/opiniones', { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.opiniones)) {
          // Normalize opinion objects to use `id` and consistent keys
          const normalized = data.opiniones.map(o => ({
            id: o.IdOpinion || o.id || o.IdOpinion || null,
            nombre: o.nombre || o.Nombre || o.nombre_usuario || 'Anónimo',
            email: o.email || o.Email || '',
            opinion: o.opinion || o.Opinion || '',
            id_usuario: o.id_usuario || null,
            IdAccount: o.IdAccount || null,
          }));
          setComments(normalized);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [comments]);

  const handleDeleteComment = async (id) => {
    try {
      setDeletingId(id);
      const token = localStorage.getItem('token');
      const headers = token ? { Accept: 'application/json', Authorization: `Bearer ${token}` } : { Accept: 'application/json' };
      const response = await fetch(`http://localhost:5000/opiniones/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.status === 204) {
        setComments((prev) => prev.filter((comment) => comment.id !== id));
        return;
      }

      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (e) { body = { message: text }; }
      if (!response.ok) throw new Error(body?.mensaje || body?.message || `HTTP ${response.status}`);
      if (body && 'success' in body && !body.success) throw new Error(body.mensaje || 'El servidor rechazó la operación');
      setComments((prev) => prev.filter((comment) => comment.id !== id));
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
    if (!confirmId) return;
    const id = confirmId;
    setConfirmOpen(false);
    setConfirmId(null);
    await handleDeleteComment(id);
  };

  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentComments = comments.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const styles = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(180deg, #ffffff 0%, #f3f9f3 100%)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: '100%',
      minHeight: '100vh',
    },
    title: {
      fontSize: '1.8rem',
      textAlign: 'center',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #4BAC35, #FFC914)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
    },
    commentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#fff',
      borderRadius: '10px',
      padding: '1rem 1.5rem',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    },
    commentText: {
      flexGrow: 1,
      color: '#222',
      fontSize: '1rem',
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #dc3545, #b02a37)',
      color: 'white',
      padding: '0.6rem 1rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '2rem',
      padding: '1rem',
      background: 'linear-gradient(90deg, rgba(75,172,53,0.1), rgba(255,201,20,0.1))',
      borderRadius: '10px',
      border: '1px solid rgba(0,0,0,0.1)',
    },
    pageButton: {
      padding: '0.6rem 1rem',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #4BAC35, #6fdc52)',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    pageButtonDisabled: {
      background: 'linear-gradient(135deg, #ccc, #999)',
      cursor: 'not-allowed',
    },
    pageInfo: {
      fontWeight: '600',
      color: '#333',
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '8px',
      border: '1px solid rgba(0,0,0,0.1)',
    },
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando comentarios...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Comentarios</h2>

      {comments.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No hay comentarios para mostrar.</p>
      ) : (
        <>
          {currentComments.map((comment) => (
            <div key={comment.id} style={styles.commentItem}>
              <p style={styles.commentText}>
                <strong style={{ color: '#4BAC35' }}>{comment.nombre}:</strong> {comment.opinion}
              </p>
              <button
                style={styles.deleteButton}
                onClick={() => requestDelete(comment.id)}
                disabled={deletingId === comment.id}
              >
                {deletingId === comment.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                }}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>

              <span style={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>

              <button
                style={{
                  ...styles.pageButton,
                  ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                }}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {confirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '2rem',
              width: 'min(90%, 400px)',
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            }}
          >
            <h3>Confirmar eliminación</h3>
            <p>¿Deseas eliminar este comentario?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                style={{
                  ...styles.pageButton,
                  background: 'linear-gradient(135deg, #dc3545, #b02a37)',
                }}
                onClick={confirmDelete}
              >
                Eliminar
              </button>
              <button
                style={{
                  ...styles.pageButton,
                  background: 'linear-gradient(135deg, #ccc, #999)',
                }}
                onClick={cancelConfirm}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
