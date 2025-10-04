import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";
import '../style/Metrics.css';

function BounceRate() {
    const borderColor = "#4BAC35";
    const backgroundColor = "rgba(75, 172, 53, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

  const valueClass = "metric-value";

  return (
    <div className="bounce-rate">
      <p className="metric-title">TASA DE REBOTE</p>
      <p className={valueClass}>73.67%</p>
      <p className="metric-percentage up">+12.2% <span className="metric-launch"><LaunchIcon/></span></p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default BounceRate;