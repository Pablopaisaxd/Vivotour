import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch"; // Importación de MUI v5

function TotalVisits() {
    const borderColor = "rgb(117, 198, 130)";
    const backgroundColor = "rgb(215, 238, 220)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

  return (
    <div className="total-visits">
      <p style={{ fontSize: "12px", color: "#5f5b66", fontWeight: "600" }}>
        TOTAL VISITS
      </p>
      <p style={{ fontSize: "28px", color: "#535457" }}>54,598</p>
      <p
        style={{
          color: "red",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
        }}
      >
        -11.9%{" "}
        <LaunchIcon
          sx={{ paddingRight: "10px", transform: "rotate(180deg)" }} // Usar sx prop
        />
      </p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default TotalVisits;