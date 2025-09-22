import React from "react";
import ProgressBar from "./ProgressBar";

function SocialMediaTraffic() {
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
    },
    tableDataValue: {
      fontWeight: "700",
      color: "var(--rich-black)",
      fontSize: "14px",
    },
    progressBarContainer: {
      paddingTop: "27px",
    }
  };

  return (
    <div className="social-media">
      <header className="social-media-header">
        <span style={styles.headerSpan}>Tráfico de Redes Sociales</span>
      </header>
      <div className="social-media-table">
        <span style={styles.tableHeader}>
          <strong>RED</strong>
        </span>
        <span style={styles.tableHeader} className="visitors">
          <strong>VISITANTES</strong>
        </span>
        <span></span>
        <span style={styles.tableDataText}>Instagram</span>
        <span style={styles.tableDataValue} className="border-issue">
          3,550
        </span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage="50%" />
        </span>
        <span style={styles.tableDataText}>Facebook</span>
        <span style={styles.tableDataValue}>2,236</span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage="40%" />
        </span>
        <span style={styles.tableDataText}>Twitter</span>
        <span style={styles.tableDataValue}>1,795</span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage="30%" />
        </span>
        <span style={styles.tableDataText}>Linkedin</span>
        <span style={styles.tableDataValue}>62</span>
        <span style={styles.progressBarContainer}>
          <ProgressBar percentage="20%" />
        </span>
      </div>
    </div>
  );
}

export default SocialMediaTraffic;