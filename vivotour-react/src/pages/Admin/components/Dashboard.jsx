import React from "react";
import logo from '../../../assets/Logos/new vivo contorno2.png';

function Dashboard() {
  const styles = {
    headerSecond: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      borderLeft: "1px solid var(--border-color-light)",
    },
    title: {
      paddingLeft: "20px",
      filter: "drop-shadow(0 0 0.25rem rgba(0,0,0,0.05))",
      color: "var(--rich-black)",
    },
    logoContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingRight: "20px",
    },
    logo: {
      height: "70px",
      width: "auto",
      margin: "0 1rem",
      filter: "drop-shadow(0 0 0.25rem rgba(0,0,0,0.1))",
    }
  };

  return (
    <div style={styles.headerSecond}>
      <h3 style={styles.title}>
        Vista Administrador
      </h3>
      <div style={styles.logoContainer}>
        <img src={logo} alt="Logo Vivo" style={styles.logo} />
      </div>
    </div>
  );
}

export default Dashboard;