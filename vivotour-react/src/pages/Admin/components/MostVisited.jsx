import React from 'react';
import MyLine from './MyLine';
import LaunchIcon from "@mui/icons-material/Launch";

function MostVisited() {
    const borderColor = "#4BAC35";
    const backgroundColor = "rgba(75, 172, 53, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "50px";
    const width = "100px";

    const styles = {
        headerSpan: {
            filter: 'drop-shadow(0 0 0.25rem rgba(0,0,0,0.05))',
            color: "var(--rich-black)",
        },
        tableRowText: {
            fontWeight: "700",
            color: "var(--rich-black)",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
        },
        tableHeader: {
            color: "var(--rich-black)",
            fontWeight: "600",
            fontSize: "13px",
            padding: "15px 15px",
        },
        launchIcon: {
            color: "var(--forest-green)",
        }
    };

    return (
        <div className="most-visited">
            <header className="most-visited-header">
                <span style={styles.headerSpan}>Opciones de Reserva Preferidas</span>
            </header>
            <div className="most-visited-table">
                <span style={styles.tableHeader}><strong>OPCIÓN</strong></span>
                <span style={styles.tableHeader}><strong>PREFERENCIA</strong></span>
                <span style={styles.tableHeader}><strong>PORCENTAJE</strong></span>
                <span style={styles.tableHeader}><strong>TENDENCIA</strong></span>
                <span></span>
                <span style={styles.tableRowText}>Cabañas <LaunchIcon fontSize="small" sx={styles.launchIcon}/></span>
                <span style={styles.tableRowText}>4,890</span>
                <span style={styles.tableRowText}>81.56%</span>
                <span style={styles.tableRowText}>+5%</span>
                <span><MyLine color={color} height={height} width={width} /></span>
                <span style={styles.tableRowText}>Zona de Camping <LaunchIcon fontSize="small" sx={styles.launchIcon}/></span>
                <span style={styles.tableRowText}>3,785</span>
                <span style={styles.tableRowText}>62.56%</span>
                <span style={styles.tableRowText}>+2%</span>
                <span><MyLine color={color} height={height} width={width} /></span>
                <span style={styles.tableRowText}>Cabalgatas <LaunchIcon fontSize="small" sx={styles.launchIcon}/></span>
                <span style={styles.tableRowText}>2,985</span>
                <span style={styles.tableRowText}>58.76%</span>
                <span style={styles.tableRowText}>+3%</span>
                <span><MyLine color={color} height={height} width={width} /></span>
                <span style={styles.tableRowText}>Caminata a la cascada <LaunchIcon fontSize="small" sx={styles.launchIcon}/></span>
                <span style={styles.tableRowText}>2,440</span>
                <span style={styles.tableRowText}>39.59%</span>
                <span style={styles.tableRowText}>+1%</span>
                <span><MyLine color={color} height={height} width={width} /></span>
            </div>
        </div>
    )
}

export default MostVisited;