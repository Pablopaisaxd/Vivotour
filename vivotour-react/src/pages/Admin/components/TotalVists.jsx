import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";
import '../style/Metrics.css';

function TotalVisits() {
    const borderColor = "#FFC914";
    const backgroundColor = "rgba(255, 201, 20, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

  const valueClass = "metric-value";

  return (
    <div className="total-visits">
      <p className="metric-title">VISITAS TOTALES</p>
      <p className={valueClass}>54,598</p>
      <p className="metric-percentage down">-11.9% <span className="metric-launch" style={{paddingLeft:0,paddingRight:'10px',transform:'rotate(180deg)'}}><LaunchIcon/></span></p>
      <MyLine color={color} height={height} width={width} />
    </div>
  );
}

export default TotalVisits;