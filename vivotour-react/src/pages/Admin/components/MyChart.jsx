import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MyChart = ({ month, year, dailyData }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (!dailyData || dailyData.length === 0) {
      // Si no hay datos, mostrar chart vacío
      setChartData({
        labels: [],
        datasets: [
          {
            label: "Llegadas",
            data: [],
            backgroundColor: "#4BAC35",
            hoverBackgroundColor: "#3d9129",
            barThickness: 9,
            minBarLength: 1,
          },
        ],
      });
      return;
    }

    // Procesar los datos de reservas por fecha
    const processedData = processReservationData(dailyData, month, year);
    
    setChartData({
      labels: processedData.labels,
      datasets: [
        {
          label: "Llegadas",
          data: processedData.data,
          backgroundColor: "#4BAC35",
          hoverBackgroundColor: "#3d9129",
          barThickness: 9,
          minBarLength: 1,
        },
      ],
    });
  }, [month, year, dailyData]);

  const processReservationData = (data, selectedMonth, selectedYear) => {
    // Convertir nombres de meses a números
    const monthNames = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
      'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    
    const selectedMonthNum = monthNames[selectedMonth];
    const selectedYearNum = parseInt(selectedYear);
    
    // Filtrar datos para el mes/año seleccionado
    const monthData = data.filter(item => {
      const date = new Date(item.fecha);
      return date.getMonth() + 1 === selectedMonthNum && date.getFullYear() === selectedYearNum;
    });
    
    // Obtener número de días en el mes
    const daysInMonth = new Date(selectedYearNum, selectedMonthNum, 0).getDate();
    
    // Crear array para todos los días del mes
    const labels = [];
    const reservationCounts = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      labels.push(day.toString());
      
      // Buscar reservas para este día específico
      const dayData = monthData.find(item => {
        const date = new Date(item.fecha);
        return date.getDate() === day;
      });
      
      reservationCounts.push(dayData ? dayData.reservas : 0);
    }
    
    return {
      labels: labels,
      data: reservationCounts
    };
  };

  const chartContainerStyle = {
    position: "relative",
    height: "250px",
    width: "90%",
    margin: "0 auto",
    filter: "drop-shadow(0 0 0.15rem rgba(0,0,0,0.05))",
  };

  return (
    <div style={chartContainerStyle}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${month} ${year}`,
              font: { size: 16, color: 'var(--rich-black)' },
            },
            legend: {
              display: true,
              position: "top",
              labels: {
                color: 'var(--rich-black)',
              }
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(75, 172, 53, 0.5)",
              borderWidth: 1,
              titleColor: "var(--rich-black)",
              titleAlign: "center",
              caretPadding: 15,
              cornerRadius: 5,
              padding: 10,
              callbacks: {
                title: (tooltipItems) => {
                  const idx = tooltipItems[0].dataIndex;
                  const labels = tooltipItems[0].chart.data.labels;
                  return `${labels[idx]} ${month} ${year}`;
                },
                label: (tooltipItem) => {
                  let label = tooltipItem.dataset.label || "";
                  if (label) label += ": ";
                  const count = Math.round(tooltipItem.raw);
                  label += count;
                  label += count === 1 ? " reserva" : " reservas";
                  return label;
                },
                labelTextColor: function(tooltipItem, chart) {
                    return 'var(--rich-black)';
                }
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: 'var(--rich-black)',
              }
            },
            y: {
              beginAtZero: true,
              ticks: { 
                display: true,
                color: 'var(--rich-black)',
                stepSize: 1,
                callback: function(value) {
                  if (value % 1 === 0) {
                    return value;
                  }
                }
              },
            },
          },
        }}
      />
    </div>
  );
};

export default MyChart;