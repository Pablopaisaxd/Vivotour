import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";
import '../style/Metrics.css';

function VisitDuration() {
    const borderColor = "var(--golden-yellow)";
    const backgroundColor = "rgba(255, 201, 20, 0.15)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

    const valueClass = "metric-value";

    return (
        <div className="visit-duration">
            <p className="metric-title">DURACIÓN DE VISITA</p>
            <p className={valueClass}>1m 4s</p>
            <p className="metric-percentage up">
                +19.6% 
                <span className="metric-launch">
                    <LaunchIcon/>
                </span>
            </p>
            <MyLine color={color} height={height} width={width} />
        </div>
    );
}

export default VisitDuration;