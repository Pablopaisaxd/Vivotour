import React, { useContext } from 'react'
import SettingsIcon from "@mui/icons-material/Settings";
import { AuthContext } from '../../../AuthContext';

function ProfileCard() {
    const { user } = useContext(AuthContext);

    const styles = {
        profile: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "15px",
            backgroundColor: "var(--card-background)",
            borderBottom: "1px solid var(--border-color-light)",
        },
        pictureLink: {
            paddingBottom: "10px",
            position: "relative",
        },
        picture: {
            height: "90px",
            width: "90px",
            borderRadius: "50%",
            objectFit: "cover",
            filter: "drop-shadow(0 0 0.45rem var(--shadow-light))",
            border: "2px solid var(--golden-yellow)",
        },
        settings: {
            position: "absolute",
            padding: "8px",
            borderRadius: "50%",
            margin: "0 auto",
            left: "160px",
            backgroundColor: "var(--alice-blue)",
            filter: "opacity(80%) drop-shadow(0 0 0.45rem var(--shadow-light))",
        },
        name: {
            color: 'var(--rich-black)',
        },
        role: {
            paddingTop: "10px",
            color: 'var(--rich-black)',
        }
    };

    return (
        <div style={styles.profile}>
           <a style={styles.pictureLink}>
               <img src="https://www.w3schools.com/howto/img_avatar.png"
               alt="michael-dam-m-EZ3-Po-FGs-k-unsplash" border="0" style={styles.picture}/></a>
                       <div style={styles.settings}><SettingsIcon sx={{color: "secondary.main"}}/></div>
           <h4 style={styles.name}>{user?.nombre || "Anonimo"}  <div className="online space"></div></h4>

            <p style={styles.role}>Administrador</p>
        </div>
    )
}

export default ProfileCard;