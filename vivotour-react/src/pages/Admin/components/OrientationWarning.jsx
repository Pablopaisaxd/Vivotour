import React from 'react';

const OrientationWarning = () => {
  return (
    <div className="orientation-warning">
      <div className="orientation-warning-content">
        <div className="rotate-icon">📱</div>
        <h2>Panel Optimizado para Vista Horizontal</h2>
        <p>Este panel está optimizado para vista horizontal. Gira tu dispositivo para continuar.</p>
      </div>
    </div>
  );
};

export default OrientationWarning;