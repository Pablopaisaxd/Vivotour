import React, { useContext } from 'react'
import SettingsIcon from "@mui/icons-material/Settings";
import { AuthContext } from '../../../AuthContext';

function ProfileCard() {
    const { user } = useContext(AuthContext);

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

    return (
        <div className="admin-profile" style={profileStyles}>
            <div style={{ paddingBottom: "10px", position: "relative" }}>
                <img 
                    src="https://www.w3schools.com/howto/img_avatar.png"
                    alt="Avatar del administrador" 
                    className="picture"
                    style={pictureStyles}
                />
                <SettingsIcon 
                    className="settings"
                    sx={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        padding: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--alice-blue)",
                        filter: "drop-shadow(0 0 0.45rem var(--shadow-light))",
                        cursor: "pointer",
                        transition: "var(--transition)",
                        "&:hover": {
                            backgroundColor: "var(--forest-green)",
                            color: "white",
                            transform: "scale(1.1) rotate(90deg)",
                        }
                    }}
                />
            </div>
            <h4 style={nameStyles}>
                {user?.nombre || "Administrador"}
                <div className="online"></div>
            </h4>
            <p style={roleStyles}>Panel de Control</p>
        </div>
    )
}

export default ProfileCard;