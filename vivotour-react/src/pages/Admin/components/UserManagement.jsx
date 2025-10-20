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

    // Cargar usuarios cuando cambia la búsqueda - reinicia a página 1
    useEffect(() => {
        if (token) {
            console.log('[USERMANAGEMENT] searchTerm cambió a:', searchTerm);
            setCurrentPage(1); // Volver a página 1 cuando busca
        }
    }, [searchTerm, token]);

    // Cargar usuarios cuando cambia la página
    useEffect(() => {
        if (token) {
            console.log('[USERMANAGEMENT] currentPage cambió a:', currentPage, 'searchTerm:', searchTerm);
            loadUsers(currentPage);
        }
    }, [currentPage, searchTerm, token]);

    const loadUsers = async (page) => {
        setLoading(true);
        setError('');
        try {
            console.log('[USERMANAGEMENT] Token:', token);
            console.log('[USERMANAGEMENT] API_BASE_URL:', API_BASE_URL);
            
            // Construir URL con parámetros de búsqueda
            const params = new URLSearchParams();
            params.append('page', page);
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            const url = `${API_BASE_URL}/admin/usuarios?${params.toString()}`;
            console.log('[USERMANAGEMENT] URL completa:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('[USERMANAGEMENT] Response status:', response.status);
            console.log('[USERMANAGEMENT] Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[USERMANAGEMENT] Respuesta:', data);
            
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

    // Ya no necesitamos filtrar localmente - el servidor lo hace
    const filteredUsers = users;

    const handleAddUser = async (newUser) => {
        try {
            // Por ahora, agregar usuario es local. Si quieres persistencia, necesitarías un endpoint POST
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
                // Actualizar la lista local
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
                
                if (!response.ok) {
                    throw new Error('Error al eliminar usuario');
                }
                
                const data = await response.json();
                if (data.success) {
                    setUsers(users.filter(user => user.id !== id));
                } else {
                    setError(data.mensaje);
                }
            } catch (err) {
                console.error('Error eliminando usuario:', err);
                setError('Error al eliminar usuario');
            }
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setShowEditUserModal(true);
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
        headerControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px',
        },
        searchInput: {
            padding: '10px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            width: '300px',
            color: 'var(--rich-black)',
        },
        addButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
        },
        userTable: {
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'var(--alice-blue)',
            borderRadius: '8px',
            overflow: 'hidden',
        },
        tableHeader: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            textAlign: 'left',
            padding: '12px 15px',
        },
        tableRow: {
            borderBottom: '1px solid var(--border-color-light)',
        },
        tableCell: {
            padding: '12px 15px',
            color: 'var(--rich-black)',
        },
        actionButton: {
            padding: '6px 10px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginRight: '5px',
            color: 'white',
        },
        editButton: {
            backgroundColor: 'var(--golden-yellow)',
        },
        deleteButton: {
            backgroundColor: 'var(--error-main)',
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
        },
        modalInput: {
            padding: '10px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            color: 'var(--rich-black)',
        },
        modalSelect: {
            padding: '10px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            color: 'var(--rich-black)',
            backgroundColor: 'white',
        },
        modalButtonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px',
        },
        modalSaveButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
        },
        modalCancelButton: {
            backgroundColor: 'var(--error-main)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
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
                    <h3>{initialData ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h3>
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
            gap: '10px',
            marginTop: '20px',
            flexWrap: 'wrap'
        },
        button: {
            padding: '8px 12px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            backgroundColor: 'var(--alice-blue)',
            color: 'var(--rich-black)',
            cursor: 'pointer',
            fontSize: '0.9rem'
        },
        buttonActive: {
            backgroundColor: 'var(--forest-green)',
            color: 'white'
        },
        buttonDisabled: {
            opacity: '0.5',
            cursor: 'not-allowed'
        },
        info: {
            fontSize: '0.9rem',
            color: 'var(--rich-black)'
        }
    };

    const errorMessageStyles = {
        padding: '12px 15px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '5px',
        color: '#721c24',
        marginBottom: '15px'
    };

    const loadingStyles = {
        textAlign: 'center',
        padding: '20px',
        color: 'var(--rich-black)'
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
                />
                <button onClick={() => setShowAddUserModal(true)} style={styles.addButton}>Agregar Usuario</button>
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
                                    <tr key={user.id} style={styles.tableRow}>
                                        <td style={styles.tableCell} data-label="Nombre">{user.name}</td>
                                        <td style={styles.tableCell} data-label="Email">{user.email}</td>
                                        <td style={styles.tableCell} data-label="Teléfono">{user.phone}</td>
                                        <td style={styles.tableCell} data-label="Documento">{user.docType} {user.docNumber}</td>
                                        <td style={styles.tableCell} data-label="Acciones">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                style={{ ...styles.actionButton, ...styles.editButton }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ ...styles.actionButton, ...styles.deleteButton }}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ ...styles.tableCell, textAlign: 'center' }}>
                                        No hay usuarios disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Controles de paginación */}
                    <div style={paginationStyles.container}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{
                                ...paginationStyles.button,
                                ...(currentPage === 1 ? paginationStyles.buttonDisabled : {})
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