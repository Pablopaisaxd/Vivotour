import React from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";
import '../style/Metrics.css';

function RealtimeUsers() {
    const borderColor = "var(--forest-green)";
    const backgroundColor = "rgba(75, 172, 53, 0.15)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

    const valueClass = "metric-value";

    return (
        <div className="realtime-users">
            <p className="metric-title">USUARIOS EN TIEMPO REAL</p>
            <p className={valueClass}>56</p>
            <p className="metric-percentage up">
                +9.8% 
                <span className="metric-launch">
                    <LaunchIcon/>
                </span>
            </p>
            <MyLine color={color} height={height} width={width}/>
        </div>
    );
}

export default RealtimeUsers;