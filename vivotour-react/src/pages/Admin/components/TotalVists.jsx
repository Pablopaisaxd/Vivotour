import React, { useState, useEffect } from "react";
import MyLine from "./MyLine";
import LaunchIcon from "@mui/icons-material/Launch";
import '../style/Metrics.css';

function TotalVisits() {
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalReservas: 0,
        reservasMesActual: 0,
        reservasMesAnterior: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener estadísticas totales
    const fetchTotalStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/admin/total-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Stats del backend:', result.data);
                setStats(result.data || {});
                setError(null);
            } else {
                console.error('Error obteniendo estadísticas totales');
                setError('Error al obtener datos del servidor');
            }
        } catch (error) {
            console.error('Error conectando con el servidor:', error);
            setError('Sin conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTotalStats();
    }, []);

    // Calcular el porcentaje de cambio
    const calculatePercentageChange = () => {
        if (stats.reservasMesAnterior === 0 && stats.reservasMesActual === 0) {
            return { percentage: 0, isPositive: true };
        }
        if (stats.reservasMesAnterior === 0) {
            return { percentage: 100, isPositive: true };
        }
        
        const change = ((stats.reservasMesActual - stats.reservasMesAnterior) / stats.reservasMesAnterior) * 100;
        return {
            percentage: Math.abs(change).toFixed(1),
            isPositive: change >= 0
        };
    };

    // Crear datos para la gráfica basados en las reservas del mes
    const createChartData = () => {
        // Generar datos simples basados en las reservas actuales
        const days = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        const values = [
            Math.max(1, Math.floor(stats.reservasMesActual * 0.15)),
            Math.max(1, Math.floor(stats.reservasMesActual * 0.25)),
            Math.max(1, Math.floor(stats.reservasMesActual * 0.35)),
            Math.max(1, Math.floor(stats.reservasMesActual * 0.25))
        ];
        
        return { labels: days, data: values };
    };

    const chartData = createChartData();
    const change = calculatePercentageChange();
    const borderColor = "#FFC914";
    const backgroundColor = "rgba(255, 201, 20, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";
    const valueClass = "metric-value";

    if (loading) {
        return (
            <div className="total-visits">
                <p className="metric-title">RESERVAS ESTE MES</p>
                <p className={valueClass}>Cargando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="total-visits">
                <p className="metric-title">RESERVAS ESTE MES</p>
                <p className={valueClass} style={{ color: 'red', fontSize: '14px' }}>
                    Error: {error}
                </p>
                <small>Verifica conexión del servidor</small>
            </div>
        );
    }

    return (
        <div className="total-visits">
            <p className="metric-title">RESERVAS ESTE MES</p>
            <p className={valueClass}>{stats.reservasMesActual.toLocaleString()}</p>
            <p className={`metric-percentage ${change.isPositive ? 'up' : 'down'}`}>
                {change.isPositive ? '+' : '-'}{change.percentage}% 
                <span 
                    className="metric-launch" 
                    style={{
                        paddingLeft: 0, 
                        paddingRight: '10px', 
                        transform: change.isPositive ? 'rotate(0deg)' : 'rotate(180deg)'
                    }}
                >
                    <LaunchIcon/>
                </span>
            </p>
            <MyLine color={color} height={height} width={width} data={chartData} />
        </div>
    );
}

export default TotalVisits;