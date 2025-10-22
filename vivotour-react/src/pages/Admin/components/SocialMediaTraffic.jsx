import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

function SocialMediaTraffic() {
  const [socialData, setSocialData] = useState({
    facebook: { name: 'Facebook', followers: 0, url: 'https://www.facebook.com/ventanadelmelcocho' },
    instagram: { name: 'Instagram', followers: 0, url: 'https://www.instagram.com/ventanadelmelcocho/' }
  });

  // Simulamos datos de seguidores (en una aplicación real, estos vendrían de APIs de las redes sociales)
  useEffect(() => {
    // Datos simulados más realistas para una empresa turística pequeña
    setSocialData({
      facebook: { name: 'Facebook', followers: 848, url: 'https://www.facebook.com/ventanadelmelcocho' },
      instagram: { name: 'Instagram', followers: 909, url: 'https://www.instagram.com/ventanadelmelcocho/' }
    });
  }, []);

  const maxFollowers = Math.max(socialData.facebook.followers, socialData.instagram.followers);
  
  const calculatePercentage = (followers) => {
    return maxFollowers > 0 ? Math.round((followers / maxFollowers) * 100) : 0;
  };

  const styles = {
    headerSpan: {
      filter: 'drop-shadow(0 0 0.25rem rgba(0,0,0,0.05))',
      color: "var(--rich-black)",
    },
    tableHeader: {
      fontWeight: "600",
      color: "var(--rich-black)",
      fontSize: "13px",
      padding: "15px 15px",
    },
    tableDataText: {
      fontWeight: "600",
      color: "var(--rich-black)",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
    tableDataValue: {
      fontWeight: "700",
      color: "var(--forest-green)",
      fontSize: "14px",
    },
    progressBarContainer: {
      paddingTop: "27px",
    }
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="social-media">
      <header className="social-media-header">
        <span style={styles.headerSpan}>Seguidores en Redes Sociales</span>
      </header>
      <div className="social-media-table">
        <span style={styles.tableHeader}>
          <strong>RED</strong>
        </span>
        <span style={styles.tableHeader} className="visitors">
          <strong>SEGUIDORES</strong>
        </span>
        <span style={styles.tableHeader}>
          <strong>PROGRESO</strong>
        </span>
        
        <span 
          style={styles.tableDataText}
          onClick={() => handleSocialClick(socialData.instagram.url)}
          title="Visitar Instagram"
        >
          Instagram
        </span>
        <span style={styles.tableDataValue} className="border-issue">
          {socialData.instagram.followers.toLocaleString()}
        </span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage={`${calculatePercentage(socialData.instagram.followers)}%`} />
        </span>
        
        <span 
          style={styles.tableDataText}
          onClick={() => handleSocialClick(socialData.facebook.url)}
          title="Visitar Facebook"
        >
          Facebook
        </span>
        <span style={styles.tableDataValue}>
          {socialData.facebook.followers.toLocaleString()}
        </span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage={`${calculatePercentage(socialData.facebook.followers)}%`} />
        </span>
      </div>
    </div>
  );
}

export default SocialMediaTraffic;