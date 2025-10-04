import React, { useState } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', phone: '+573101234567', docType: 'CC', docNumber: '123456789' },
        { id: 2, name: 'María García', email: 'maria.garcia@example.com', phone: '+573209876543', docType: 'TI', docNumber: '987654321' },
        { id: 3, name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', phone: '+573001112233', docType: 'CE', docNumber: '112233445' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({ id: null, name: '', email: '', phone: '', docType: 'CC', docNumber: '' });

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.docNumber.includes(searchTerm)
    );

    const handleAddUser = (newUser) => {
        setUsers([...users, { ...newUser, id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1 }]);
        setShowAddUserModal(false);
    };

    const handleEditUser = (updatedUser) => {
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        setShowEditUserModal(false);
    };

    const handleDeleteUser = (id) => {
        setUsers(users.filter(user => user.id !== id));
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

    return (
        <div style={styles.container} className="user-management-container">
            <h2 style={styles.title}>Gestión de Usuarios</h2>

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
                    {filteredUsers.map(user => (
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
                    ))}
                </tbody>
            </table>

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