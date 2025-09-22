import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";

function TotalVisits() {
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
            color: "red",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
        },
        launchIcon: {
            paddingRight: "10px",
            transform: "rotate(180deg)",
            color: "red",
        }
    };

  return (
    <div className="total-visits">
      <p style={styles.title}>
        VISITAS TOTALES
      </p>
      <p style={styles.value}>54,598</p>
      <p style={styles.percentage}>
        -11.9%{" "}
        <LaunchIcon sx={styles.launchIcon} />
      </p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default TotalVisits;