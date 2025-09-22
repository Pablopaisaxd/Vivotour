import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";

function VisitDuration() {
    const borderColor = "#FFC914";
    const backgroundColor = "rgba(255, 201, 20, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

    const styles = {
        title: {
            fontSize: "12px",
            color: "var(--rich-black)",
            fontWeight: "600",
        },
        value: {
            fontSize: "28px",
            color: "var(--rich-black)",
        },
        percentage: {
            color: "var(--forest-green)",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
        },
        launchIcon: {
            paddingLeft: "10px",
            color: "var(--forest-green)",
        }
    };

  return (
    <div className="visit-duration">
      <p style={styles.title}>
        DURACIÓN DE VISITA
      </p>
      <p style={styles.value}>1m 4s</p>
      <p style={styles.percentage}>
        +19.6% <LaunchIcon sx={styles.launchIcon} />
      </p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default VisitDuration;