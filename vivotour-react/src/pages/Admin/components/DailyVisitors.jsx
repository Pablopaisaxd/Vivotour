import React, { useState, useEffect } from 'react';
import CustomSelect from "./reusable/CustomSelect";
import MyChart from "./MyChart";

function DailyVisitors() {
    const [monthValue, setMonthValue] = useState("Octubre");
    const [yearValue, setYearValue] = useState("2025");
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener datos de reservas diarias
    const fetchDailyStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/admin/daily-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Datos del backend:', result.data);
                setDailyData(result.data || []);
                setError(null);
            } else {
                console.error('Error obteniendo estadísticas diarias');
                setError('Error al obtener datos del servidor');
                setDailyData([]);
            }
        } catch (error) {
            console.error('Error conectando con el servidor:', error);
            setError('Sin conexión al servidor');
            setDailyData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyStats();
    }, []);

    const data_1 = [
        { id: "Enero", name: "Enero" },
        { id: "Febrero", name: "Febrero" },
        { id: "Marzo", name: "Marzo" },
        { id: "Abril", name: "Abril" },
        { id: "Mayo", name: "Mayo" },
        { id: "Junio", name: "Junio" },
        { id: "Julio", name: "Julio" },
        { id: "Agosto", name: "Agosto" },
        { id: "Septiembre", name: "Septiembre" },
        { id: "Octubre", name: "Octubre" },
        { id: "Noviembre", name: "Noviembre" },
        { id: "Diciembre", name: "Diciembre" }
    ];

    const data_2 = [
        { id: "2025", name: "2025" }
    ];

    const setMonth = (value) => {
        setMonthValue(value);
    }

    const setYear = (value) => {
        setYearValue(value);
    }

    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1em",
            borderBottom: "1px solid var(--border-color-light)",
        },
        title: {
            filter: 'drop-shadow(0 0 0.25rem rgba(0,0,0,0.05))',
            fontSize: '16px',
            fontWeight: '600',
            color: "var(--rich-black)",
        },
        selectContainer: {
            display: "flex",
            justifyContent: "flex-end",
        },
        selectPaddingRight: {
            paddingRight: "0",
        },
        selectPaddingLeft: {
            paddingLeft: "0",
        }
    };

    return (
        <div className="daily-visitors">
            <header style={styles.header}>
                <p style={styles.title}>Llegadas de Huéspedes por Día</p>
                <div style={styles.selectContainer}>
                    <CustomSelect style={styles.selectPaddingRight} data={data_1} setMonth={setMonth}/>
                    <CustomSelect style={styles.selectPaddingLeft} data={data_2} setYear={setYear} />
                </div>
            </header>
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
            ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                    Error: {error}
                    <br />
                    <small>Verifica que el servidor esté funcionando y la base de datos conectada</small>
                </div>
            ) : dailyData.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    No hay reservas en el rango de fechas seleccionado
                </div>
            ) : (
                <MyChart month={monthValue} year={yearValue} dailyData={dailyData}/>
            )}
        </div>
    )
}

export default DailyVisitors;