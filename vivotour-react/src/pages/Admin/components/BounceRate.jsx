import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";

function BounceRate() {
    const borderColor = "#4BAC35";
    const backgroundColor = "rgba(75, 172, 53, 0.2)";
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
    <div className="bounce-rate">
      <p style={styles.title}>
        TASA DE REBOTE
      </p>
      <p style={styles.value}>73.67%</p>
      <p style={styles.percentage}>
        +12.2% <LaunchIcon sx={styles.launchIcon} />
      </p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default BounceRate;