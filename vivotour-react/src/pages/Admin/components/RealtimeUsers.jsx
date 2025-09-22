import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";

function RealtimeUsers() {
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
            fontSize: "29px",
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
    <div className="realtime-users">
      <p style={styles.title}>
        USUARIOS EN TIEMPO REAL
      </p>
      <p style={styles.value}>56</p>
      <p style={styles.percentage}>
        +9.8% <LaunchIcon sx={styles.launchIcon} />
      </p>
      <MyLine color={color} height={height} width={width}/>
    </div>
  );
}

export default RealtimeUsers;