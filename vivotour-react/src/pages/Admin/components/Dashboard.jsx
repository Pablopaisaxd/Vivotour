import React from "react";
import logo from '../../../assets/Logos/new vivo contorno2.png';

function Dashboard() {
  return (
    <div className="dashboard-branding">
      <h3 className="dashboard-title" title="Vista Administrador">Vista Administrador</h3>
      <img className="dashboard-logo" src={logo} alt="Logo Vivo" />
    </div>
  );
}

export default Dashboard;