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
                // Usar directamente los datos del backend, ya procesados
                const formattedData = data.data.map((item, index) => ({
                    name: item.planTipo,
                    count: item.cantidad,
                    percentage: parseFloat(item.porcentaje),
                    trend: `+${Math.floor(Math.random() * 3) + 1}%` // Tendencia simulada
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

    const setFallbackData = () => {
        // Eliminamos los datos de respaldo para mostrar solo datos reales
        setPreferences([]);
    };

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
            fontWeight: "600",
            color: "var(--rich-black)",
            fontSize: "13px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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

    if (loading) {
        return (
            <div className="most-visited">
                <header className="most-visited-header">
                    <span style={styles.headerSpan}>Opciones de Reserva Preferidas</span>
                </header>
                <div style={{ padding: '20px', textAlign: 'center' }}>
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
                <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
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
                            {item.name} <LaunchIcon fontSize="small" sx={styles.launchIcon}/>
                        </span>
                        <span style={styles.tableRowText}>{item.count}</span>
                        <span style={styles.tableRowText}>{item.percentage}%</span>
                        <span style={styles.tableRowText}>{item.trend}</span>
                        <span><MyLine color={color} height={height} width={width} /></span>
                    </React.Fragment>
                ))}
                
                {preferences.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                        No hay datos de preferencias disponibles
                    </div>
                )}
            </div>
        </div>
    )
}

export default MostVisited;