import React from 'react'
import MostVisited from "./MostVisited";
import SocialMediaTraffic from "./SocialMediaTraffic";

function Footer() {
    const footerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.05) 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 15px var(--shadow-light)',
        marginTop: '1rem',
    };

    return (
        <div className="footer" style={footerStyle}>
            <MostVisited />
            <SocialMediaTraffic />
        </div>
    )
}

export default Footer;