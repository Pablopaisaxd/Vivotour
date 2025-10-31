import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../AuthContext';
import { API_BASE_URL } from '../../../config/apiConfig';

const UserManagement = () => {
    const authContext = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: null, name: '', email: '', phone: '', docType: 'CC', docNumber: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            setCurrentPage(1);
        }
    }, [searchTerm, token]);

    useEffect(() => {
        if (token) {
            loadUsers(currentPage);
        }
    }, [currentPage, searchTerm, token]);

    const loadUsers = async (page) => {
        setLoading(true);
        setError('');
        try {
            
            
            const params = new URLSearchParams();
            params.append('page', page);
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            const url = `${API_BASE_URL}/admin/usuarios?${params.toString()}`;
            
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            
            
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            
            if (data.success) {
                setUsers(data.usuarios);
                setTotalPages(data.pagination.totalPages);
            } else {
                setError(data.mensaje);
            }
        } catch (err) {
            console.error('[USERMANAGEMENT] Error cargando usuarios:', err);
            setError('Error al cargar los usuarios: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users;

    const handleAddUser = async (newUser) => {
        try {
            setUsers([...users, { ...newUser, id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1 }]);
            setShowAddUserModal(false);
        } catch (err) {
            console.error('Error agregando usuario:', err);
            setError('Error al agregar usuario');
        }
    };

    const handleEditUser = async (updatedUser) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/usuarios/${updatedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    docType: updatedUser.docType,
                    docNumber: updatedUser.docNumber
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar usuario');
            }
            
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
                setShowEditUserModal(false);
            } else {
                setError(data.mensaje);
            }
        } catch (err) {
            console.error('Error editando usuario:', err);
            setError('Error al editar usuario');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/usuarios/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const text = await response.text();
                let body = null;
                try { body = text ? JSON.parse(text) : null; } catch (e) { body = { message: text }; }

                if (!response.ok) {
                    const serverMsg = body && (body.mensaje || body.message || body.error) ? (body.mensaje || body.message || body.error) : `HTTP ${response.status}`;
                    throw new Error(`Error al eliminar usuario: ${serverMsg}`);
                }

                // If API returns JSON with success flag, honor it
                if (body && typeof body === 'object' && 'success' in body && !body.success) {
                    throw new Error(body.mensaje || 'El servidor rechazó la operación');
                }

                // Success: remove locally
                setUsers(users.filter(user => user.id !== id));
            } catch (err) {
                console.error('Error eliminando usuario:', err);
                setError(err.message || 'Error al eliminar usuario');
            }
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setShowEditUserModal(true);
    };

    const styles = {
        container: {
            padding: '1.5rem',
            background: 'linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.05) 100%)',
            borderRadius: '12px',
            boxShadow: '0 8px 25px var(--shadow-medium)',
            gridColumn: '1 / -1',
            display: 'flex',
            width: '100%', 
            height: '100vh',
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
        headerControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
        },
        searchInput: {
            padding: '0.8rem 1rem',
            border: '2px solid var(--input-border)',
            borderRadius: '8px',
            width: '350px',
            color: 'var(--rich-black)',
            background: 'var(--input-bg)',
            fontSize: '0.95rem',
            transition: 'var(--transition)',
        },
        addButton: {
            background: 'linear-gradient(135deg, var(--forest-green), #3d9129)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px var(--shadow-strong)',
            transition: 'var(--transition)',
        },
        userTable: {
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--alice-blue)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px var(--shadow-light)',
        },
        tableHeader: {
            background: 'linear-gradient(135deg, var(--forest-green), #3d9129)',
            color: 'white',
            textAlign: 'left',
            padding: '1rem 1.2rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        tableRow: {
            borderBottom: '1px solid var(--input-border)',
            transition: 'var(--transition)',
        },
        tableCell: {
            padding: '1rem 1.2rem',
            color: 'var(--rich-black)',
            fontSize: '0.9rem',
        },
        actionButton: {
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            marginRight: '0.5rem',
            color: 'white',
            fontWeight: '500',
            fontSize: '0.85rem',
            transition: 'var(--transition)',
        },
        editButton: {
            background: 'linear-gradient(135deg, var(--golden-yellow), #e6b412)',
            boxShadow: '0 2px 8px rgba(255, 201, 20, 0.3)',
        },
        deleteButton: {
            background: 'linear-gradient(135deg, var(--error-color), #c82333)',
            boxShadow: '0 2px 8px var(--error-border)',
        },
        modalOverlay: {
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
            backdropFilter: 'blur(4px)',
        },
        modalContent: {
            background: 'var(--alice-blue)',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(26, 24, 27, 0.3)',
            width: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
        },
        modalInput: {
            padding: '0.8rem 1rem',
            border: '2px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--rich-black)',
            background: 'var(--input-bg)',
            fontSize: '0.95rem',
            transition: 'var(--transition)',
        },
        modalSelect: {
            padding: '0.8rem 1rem',
            border: '2px solid var(--input-border)',
            borderRadius: '8px',
            color: 'var(--rich-black)',
            background: 'var(--input-bg)',
            fontSize: '0.95rem',
        },
        modalButtonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1rem',
        },
        modalSaveButton: {
            background: 'linear-gradient(135deg, var(--forest-green), #3d9129)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 15px var(--shadow-strong)',
        },
        modalCancelButton: {
            background: 'linear-gradient(135deg, var(--error-color), #c82333)',
            color: 'white',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
        },
    };

    const UserForm = ({ onSubmit, initialData, onClose }) => {
        const [formData, setFormData] = useState(initialData || { name: '', email: '', phone: '', docType: 'CC', docNumber: '' });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };

        return (
            <div style={styles.modalOverlay}>
                <form style={styles.modalContent} onSubmit={handleSubmit}>
                    <h3 style={{ color: 'var(--rich-black)', fontWeight: '700', fontSize: '1.3rem' }}>
                        {initialData ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
                    </h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre Completo"
                        value={formData.name}
                        onChange={handleChange}
                        style={styles.modalInput}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.modalInput}
                        required
                    />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Teléfono (+prefijo)"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.modalInput}
                        required
                    />
                    <select name="docType" value={formData.docType} onChange={handleChange} style={styles.modalSelect}>
                        <option value="CC">CC</option>
                        <option value="TI">TI</option>
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                        <option value="NIT">NIT</option>
                    </select>
                    <input
                        type="text"
                        name="docNumber"
                        placeholder="Número de Documento"
                        value={formData.docNumber}
                        onChange={handleChange}
                        style={styles.modalInput}
                        required
                    />
                    <div style={styles.modalButtonContainer}>
                        <button type="button" onClick={onClose} style={styles.modalCancelButton}>Cancelar</button>
                        <button type="submit" style={styles.modalSaveButton}>Guardar</button>
                    </div>
                </form>
            </div>
        );
    };

    const paginationStyles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
        },
        button: {
            padding: '0.6rem 1.2rem',
            border: '2px solid var(--input-border)',
            borderRadius: '8px',
            background: 'var(--alice-blue)',
            color: 'var(--rich-black)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'var(--transition)',
        },
        buttonActive: {
            background: 'var(--forest-green)',
            color: 'white',
            borderColor: 'var(--forest-green)',
        },
        buttonDisabled: {
            opacity: '0.5',
            cursor: 'not-allowed'
        },
        info: {
            fontSize: '0.9rem',
            color: 'var(--rich-black)',
            fontWeight: '500',
        }
    };

    const errorMessageStyles = {
        padding: '1rem 1.2rem',
        background: 'var(--error-bg)',
        border: '2px solid var(--error-border)',
        borderRadius: '8px',
        color: 'var(--error-color)',
        marginBottom: '1rem',
        fontWeight: '500',
    };

    const loadingStyles = {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--rich-black)',
        fontSize: '1.1rem',
    };

    return (
        <div style={styles.container} className="user-management-container">
            <h2 style={styles.title}>Gestión de Usuarios</h2>

            {error && (
                <div style={errorMessageStyles}>
                    {error}
                </div>
            )}

            <div style={styles.headerControls}>
                <input
                    type="text"
                    placeholder="Buscar usuario (nombre, email, teléfono, documento)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forest-green)';
                        e.target.style.background = 'var(--input-bg-focus)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--input-border)';
                        e.target.style.background = 'var(--input-bg)';
                    }}
                />
                <button 
                    onClick={() => setShowAddUserModal(true)} 
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
                    Agregar Usuario
                </button>
            </div>

            {loading ? (
                <div style={loadingStyles}>Cargando usuarios...</div>
            ) : (
                <>
                    <table style={styles.userTable}>
                        <thead>
                            <tr style={styles.tableRow}>
                                <th style={styles.tableHeader}>Nombre</th>
                                <th style={styles.tableHeader}>Email</th>
                                <th style={styles.tableHeader}>Teléfono</th>
                                <th style={styles.tableHeader}>Documento</th>
                                <th style={styles.tableHeader}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} style={styles.tableRow}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--input-bg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <td style={styles.tableCell} data-label="Nombre">{user.name}</td>
                                        <td style={styles.tableCell} data-label="Email">{user.email}</td>
                                        <td style={styles.tableCell} data-label="Teléfono">{user.phone}</td>
                                        <td style={styles.tableCell} data-label="Documento">{user.docType} {user.docNumber}</td>
                                        <td style={styles.tableCell} data-label="Acciones">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                style={{ ...styles.actionButton, ...styles.editButton }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ ...styles.actionButton, ...styles.deleteButton }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ ...styles.tableCell, textAlign: 'center', color: 'var(--input-placeholder)' }}>
                                        No hay usuarios disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div style={paginationStyles.container}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                                ...paginationStyles.button,
                                ...(currentPage === 1 ? paginationStyles.buttonDisabled : {})
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== 1) {
                                    e.target.style.background = 'var(--forest-green)';
                                    e.target.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== 1) {
                                    e.target.style.background = 'var(--alice-blue)';
                                    e.target.style.color = 'var(--rich-black)';
                                }
                            }}
                        >
                            ← Anterior
                        </button>

                        <span style={paginationStyles.info}>
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                ...paginationStyles.button,
                                ...(currentPage === totalPages ? paginationStyles.buttonDisabled : {})
                            }}
                            onMouseEnter={(e) => {
                                if (currentPage !== totalPages) {
                                    e.target.style.background = 'var(--forest-green)';
                                    e.target.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== totalPages) {
                                    e.target.style.background = 'var(--alice-blue)';
                                    e.target.style.color = 'var(--rich-black)';
                                }
                            }}
                        >
                            Siguiente →
                        </button>
                    </div>
                </>
            )}

            {showAddUserModal && (
                <UserForm onSubmit={handleAddUser} onClose={() => setShowAddUserModal(false)} />
            )}

            {showEditUserModal && (
                <UserForm onSubmit={handleEditUser} initialData={currentUser} onClose={() => setShowEditUserModal(false)} />
            )}
        </div>
    );
};

export default UserManagement;