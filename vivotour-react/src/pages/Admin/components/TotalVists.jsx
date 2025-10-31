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
                setStats(result.data || {});
                setError(null);
            } else {
                setError('Error al obtener datos del servidor');
            }
        } catch (error) {
            setError('Sin conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTotalStats();
    }, []);

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

    const createChartData = () => {
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
    const borderColor = "var(--golden-yellow)";
    const backgroundColor = "rgba(255, 201, 20, 0.2)";
    const color = { borderColor, backgroundColor };
    const height = "100px";
    const width = "220px";

    if (loading) {
        return (
            <div className="total-visits">
                <p className="metric-title">RESERVAS ESTE MES</p>
                <p className="metric-value">—</p>
                <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: 'var(--alice-blue)', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--forest-green), var(--golden-yellow))',
                        animation: 'loading 1.5s infinite'
                    }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="total-visits">
                <p className="metric-title">RESERVAS ESTE MES</p>
                <p className="metric-value" style={{ color: 'var(--error-color)', fontSize: '16px' }}>
                     Error
                </p>
                <small style={{ color: 'var(--text-color-secondary)' }}>
                    {error}
                </small>
            </div>
        );
    }

    return (
        <div className="total-visits">
            <p className="metric-title">RESERVAS ESTE MES</p>
            <p className="metric-value">{stats.reservasMesActual.toLocaleString()}</p>
            <p className={`metric-percentage ${change.isPositive ? 'up' : 'down'}`}>
                {change.isPositive ? '' : ''} {change.isPositive ? '+' : '-'}{change.percentage}% 
                <span className="metric-launch">
                    <LaunchIcon sx={{ 
                        fontSize: 14,
                        transform: change.isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'var(--transition)'
                    }}/>
                </span>
            </p>
            <MyLine color={color} height={height} width={width} data={chartData} />
        </div>
    );
}

export default TotalVisits;