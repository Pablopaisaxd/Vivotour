import React from 'react'
import SettingsIcon from "@mui/icons-material/Settings"; // Importación de MUI v5

function ProfileCard() {
    return (
        <div className="profile">
           <a href="https://ibb.co/xMfWZWL" style={{paddingBottom: "10px", position: "relative"}}>
               <img src="https://i.ibb.co/xMfWZWL/michael-dam-m-EZ3-Po-FGs-k-unsplash.jpg"
               alt="michael-dam-m-EZ3-Po-FGs-k-unsplash" border="0" className="picture"/></a>
                       <div className="settings"><SettingsIcon sx={{color: "#535457"}}/></div> {/* Usar sx prop */}
           <h4 style={{color: '#535457'}}>Martha Blair  <div className="online space"></div></h4>

            <p style={{paddingTop: "10px", color: '#535457'}}>Developer</p>
        </div>
    )
}

export default ProfileCard