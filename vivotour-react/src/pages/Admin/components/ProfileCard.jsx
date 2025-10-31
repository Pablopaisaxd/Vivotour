import React, { useContext, useState } from 'react'
import SettingsIcon from "@mui/icons-material/Settings";
import { AuthContext } from '../../../AuthContext';

function ProfileCard() {
    const { user, setUser } = useContext(AuthContext);
    const [avatar, setAvatar] = useState(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
    const [fileError, setFileError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFileError("Por favor selecciona un archivo de imagen válido (png, jpg, jpeg, gif).");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFileError("La imagen no puede ser mayor a 5MB");
            return;
        }

        try {
            // Preview inmediato
            const reader = new FileReader();
            reader.onload = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);

            // Subida al servidor
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setAvatar(result.avatarUrl);
                localStorage.setItem('token', result.token);
                setUser(result.user);
                setFileError('');
            } else {
                setAvatar(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
                setFileError(result.mensaje || 'Error al subir la imagen');
            }
        } catch (error) {
            setAvatar(user?.avatar || "https://www.w3schools.com/howto/img_avatar.png");
            setFileError('Error de conexión al subir la imagen');
        }
    };

    const profileStyles = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 15px",
        backgroundColor: "var(--card-background)",
        borderBottom: "1px solid var(--border-color-light)",
        position: "relative",
        background: "linear-gradient(135deg, var(--alice-blue), rgba(75, 172, 53, 0.05))",
    };

    const avatarContainerStyles = {
        position: "relative",
        paddingBottom: "10px",
        cursor: "pointer",
    };

    const pictureStyles = {
        height: "90px",
        width: "90px",
        borderRadius: "50%",
        objectFit: "cover",
        filter: "drop-shadow(0 0 0.45rem var(--shadow-light))",
        border: "3px solid var(--golden-yellow)",
        transition: "var(--transition)",
        cursor: "pointer",
    };

    const editOverlayStyles = {
        position: "absolute",
        bottom: "8px",
        right: "8px",
        background: "var(--forest-green)",
        borderRadius: "50%",
        padding: "6px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 0 8px var(--forest-green)",
        transition: "var(--transition)",
        cursor: "pointer",
        width: "24px",
        height: "24px",
    };

    const editIconStyles = {
        width: "12px",
        height: "12px",
        stroke: "white",
        strokeWidth: "2",
        fill: "none",
    };

    const nameStyles = {
        color: 'var(--rich-black)',
        margin: "10px 0 5px 0",
        fontSize: "1.1rem",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    };

    const roleStyles = {
        color: 'var(--text-color-secondary)',
        margin: "0",
        fontSize: "0.9rem",
        fontWeight: "500",
        padding: "4px 12px",
        background: "rgba(75, 172, 53, 0.1)",
        borderRadius: "12px",
        border: "1px solid rgba(75, 172, 53, 0.2)",
    };

    const errorStyles = {
        color: "#c0392b",
        fontSize: "0.8rem",
        marginTop: "5px",
        textAlign: "center",
    };

    const hiddenInputStyles = {
        display: "none",
    };

    return (
        <div className="admin-profile" style={profileStyles}>
            <div style={avatarContainerStyles} onClick={() => document.getElementById('avatar-input').click()}>
                <img 
                    src={avatar}
                    alt="Avatar del administrador" 
                    className="picture"
                    style={pictureStyles}
                />
                <div style={editOverlayStyles}>
                    <svg style={editIconStyles} viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </div>
                <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={hiddenInputStyles}
                />
            </div>
            {fileError && <div style={errorStyles}>{fileError}</div>}
            <h4 style={nameStyles}>
                {user?.nombre || "Administrador"}
                <div className="online"></div>
            </h4>
            <p style={roleStyles}>Panel de Control</p>
        </div>
    )
}

export default ProfileCard;