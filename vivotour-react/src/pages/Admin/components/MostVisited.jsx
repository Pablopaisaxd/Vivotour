import React, { useState, useEffect } from 'react';
import MyLine from './MyLine';
import LaunchIcon from "@mui/icons-material/Launch";

function MostVisited() {
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado');
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/admin/preferred-plans', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos de preferencias del backend:', data.data);
                const formattedData = data.data.map((item, index) => ({
                    name: item.planTipo,
                    count: item.cantidad,
                    percentage: parseFloat(item.porcentaje),
                    trend: `+${Math.floor(Math.random() * 3) + 1}%`
                }));
                setPreferences(formattedData);
                setError(null);
            } else {
                console.error('Error al obtener las preferencias');
                setError('Error al obtener datos del servidor');
                setPreferences([]);
            }
        } catch (error) {
            console.error('Error al conectar con la API:', error);
            setError('Sin conexión al servidor');
            setPreferences([]);
        } finally {
            setLoading(false);
        }
    };

    const borderColor = "var(--forest-green)";
    const backgroundColor = "rgba(75, 172, 53, 0.15)";
    const color = { borderColor, backgroundColor };
    const height = "50px";
    const width = "100px";

    const styles = {
        headerSpan: {
            color: "var(--rich-black)",
            fontWeight: "600",
            fontSize: "1rem",
            textShadow: "0 1px 2px var(--shadow-light)",
        },
        tableRowText: {
            fontWeight: "500",
            color: "var(--rich-black)",
            fontSize: "0.85rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0.5rem",
        },
        tableHeader: {
            color: "var(--rich-black)",
            fontWeight: "700",
            fontSize: "0.75rem",
            padding: "1rem 0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
        },
        launchIcon: {
            color: "var(--forest-green)",
            marginLeft: "0.3rem",
        },
        loadingContainer: {
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--rich-black)',
        },
        errorContainer: {
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--error-color)',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            borderRadius: '8px',
            margin: '1rem',
        },
        noDataContainer: {
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '1.5rem',
            color: 'var(--input-placeholder)',
        }
    };

    if (loading) {
        return (
            <div className="most-visited">
                <header className="most-visited-header">
                    <span style={styles.headerSpan}>Opciones de Reserva Preferidas</span>
                </header>
                <div style={styles.loadingContainer}>
                    Cargando...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="most-visited">
                <header className="most-visited-header">
                    <span style={styles.headerSpan}>Opciones de Reserva Preferidas</span>
                </header>
                <div style={styles.errorContainer}>
                    Error: {error}
                    <br />
                    <small>Verifica que el servidor esté funcionando</small>
                </div>
            </div>
        );
    }

    return (
        <div className="most-visited">
            <header className="most-visited-header">
                <span style={styles.headerSpan}>Opciones de Reserva Preferidas</span>
            </header>
            <div className="most-visited-table">
                <span style={styles.tableHeader}><strong>OPCIÓN</strong></span>
                <span style={styles.tableHeader}><strong>SOLICITUDES</strong></span>
                <span style={styles.tableHeader}><strong>PORCENTAJE</strong></span>
                <span style={styles.tableHeader}><strong>TENDENCIA</strong></span>
                <span style={styles.tableHeader}><strong>GRÁFICO</strong></span>
                
                {preferences.map((item, index) => (
                    <React.Fragment key={index}>
                        <span style={styles.tableRowText}>
                            {item.name} 
                            <LaunchIcon fontSize="small" sx={styles.launchIcon}/>
                        </span>
                        <span style={styles.tableRowText}>{item.count}</span>
                        <span style={styles.tableRowText}>{item.percentage}%</span>
                        <span style={styles.tableRowText}>{item.trend}</span>
                        <span><MyLine color={color} height={height} width={width} /></span>
                    </React.Fragment>
                ))}
                
                {preferences.length === 0 && (
                    <div style={styles.noDataContainer}>
                        No hay datos de preferencias disponibles
                    </div>
                )}
            </div>
        </div>
    )
}

export default MostVisited;