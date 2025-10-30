import React, { useState, useEffect } from 'react'

function ProgressBar({ percentage }) {
    const [widths, setWidths] = useState(0);

    useEffect(() => {
        requestAnimationFrame(() => {
            setWidths(percentage);
        });
    }, [percentage]);

    const progressBarStyle = {
        width: '100%',
        height: '8px',
        background: 'var(--input-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px var(--shadow-light)',
        position: 'relative',
    };

    const fillerStyle = {
        height: '100%',
        background: 'linear-gradient(90deg, var(--forest-green), var(--golden-yellow))',
        borderRadius: '12px',
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        width: widths,
        boxShadow: '0 2px 6px var(--shadow-strong)',
        position: 'relative',
    };

    const glowStyle = {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        borderRadius: '12px',
        animation: 'shimmer 2s infinite',
    };

    return (
        <div style={progressBarStyle} className="progress-bar">
            <div style={fillerStyle} className="filler">
                <div style={glowStyle}></div>
            </div>
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}

export default ProgressBar;