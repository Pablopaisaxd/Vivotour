import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

function SocialMediaTraffic() {
    const [socialData, setSocialData] = useState({
        facebook: { name: 'Facebook', followers: 0, url: 'https://www.facebook.com/ventanadelmelcocho' },
        instagram: { name: 'Instagram', followers: 0, url: 'https://www.instagram.com/ventanadelmelcocho/' }
    });

    useEffect(() => {
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
            color: "var(--rich-black)",
            fontWeight: "600",
            fontSize: "1rem",
            textShadow: "0 1px 2px var(--shadow-light)",
        },
        tableHeader: {
            fontWeight: "700",
            color: "var(--rich-black)",
            fontSize: "0.75rem",
            padding: "1rem 0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        tableDataText: {
            fontWeight: "500",
            color: "var(--rich-black)",
            cursor: "pointer",
            transition: "var(--transition)",
            padding: "0.5rem",
            borderRadius: "4px",
        },
        tableDataValue: {
            fontWeight: "700",
            color: "var(--forest-green)",
            fontSize: "0.9rem",
            padding: "0.5rem",
        },
        progressBarContainer: {
            paddingTop: "1.5rem",
            paddingBottom: "0.5rem",
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
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--input-bg)';
                        e.target.style.color = 'var(--forest-green)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--rich-black)';
                    }}
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
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--input-bg)';
                        e.target.style.color = 'var(--forest-green)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--rich-black)';
                    }}
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