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

// Resolve CSS variables at runtime and set ChartJS defaults for consistent theme
let RESOLVED_CHART_COLORS = {
  richBlack: '#1A181B',
  aliceBlue: '#F0F8FF',
  forestGreen: '#4BAC35',
};

if (typeof window !== 'undefined' && window.getComputedStyle) {
  try {
    const root = window.getComputedStyle(document.documentElement);
    const richBlack = (root.getPropertyValue('--rich-black') || RESOLVED_CHART_COLORS.richBlack).trim();
    const aliceBlue = (root.getPropertyValue('--alice-blue') || RESOLVED_CHART_COLORS.aliceBlue).trim();
    const forestGreen = (root.getPropertyValue('--forest-green') || RESOLVED_CHART_COLORS.forestGreen).trim();
    RESOLVED_CHART_COLORS = { richBlack, aliceBlue, forestGreen };

    ChartJS.defaults.color = richBlack;
    ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(240, 248, 255, 0.95)';
    ChartJS.defaults.plugins.tooltip.titleColor = richBlack;
    ChartJS.defaults.plugins.tooltip.bodyColor = richBlack;
    ChartJS.defaults.plugins.tooltip.borderColor = forestGreen;
    ChartJS.defaults.plugins.tooltip.borderWidth = 2;
  } catch (e) {
    // ignore failures silently
  }
}

// small helper to darken a hex color by percent (0-100)
function darkenColor(hex, percent) {
  try {
    const cleaned = hex.replace('#', '');
    const num = parseInt(cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned, 16);
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    const factor = (100 - percent) / 100;
    const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
    const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
    const nb = Math.max(0, Math.min(255, Math.round(b * factor)));
    return `#${(nr << 16 | ng << 8 | nb).toString(16).padStart(6, '0')}`;
  } catch (e) {
    return hex;
  }
}

const MyChart = ({ month, year, dailyData }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fg = RESOLVED_CHART_COLORS.forestGreen;
    const fgDark = darkenColor(fg, 12);

    if (!dailyData || dailyData.length === 0) {
      setChartData({
        labels: [],
        datasets: [
          {
            label: "Llegadas",
            data: [],
            backgroundColor: fg,
            hoverBackgroundColor: fgDark,
            barThickness: 9,
            minBarLength: 1,
          },
        ],
      });
      return;
    }

    const processedData = processReservationData(dailyData, month, year);
    
    setChartData({
      labels: processedData.labels,
      datasets: [
        {
          label: "Llegadas",
          data: processedData.data,
          backgroundColor: fg,
          hoverBackgroundColor: fgDark,
          barThickness: 9,
          minBarLength: 1,
        },
      ],
    });
  }, [month, year, dailyData]);

  const processReservationData = (data, selectedMonth, selectedYear) => {
    const monthNames = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
      'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    
    const selectedMonthNum = monthNames[selectedMonth];
    const selectedYearNum = parseInt(selectedYear);
    
    const monthData = data.filter(item => {
      const date = new Date(item.fecha);
      return date.getMonth() + 1 === selectedMonthNum && date.getFullYear() === selectedYearNum;
    });
    
    const daysInMonth = new Date(selectedYearNum, selectedMonthNum, 0).getDate();
    
    const labels = [];
    const reservationCounts = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      labels.push(day.toString());
      
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
    height: "280px",
    width: "95%",
    margin: "1rem auto",
    padding: "1rem",
    background: "linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.05) 100%)",
    borderRadius: "12px",
    boxShadow: "0 4px 15px var(--shadow-light)",
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
              font: { 
                size: 18, 
                weight: '600',
              },
              color: 'var(--rich-black)',
              padding: {
                top: 10,
                bottom: 20
              }
            },
            legend: {
              display: true,
              position: "top",
              labels: {
                color: 'var(--rich-black)',
                font: {
                  size: 14,
                  weight: '500'
                },
                padding: 15,
              }
            },
            tooltip: {
              backgroundColor: RESOLVED_CHART_COLORS.aliceBlue,
              borderColor: RESOLVED_CHART_COLORS.forestGreen,
              borderWidth: 2,
              titleColor: RESOLVED_CHART_COLORS.richBlack,
              titleAlign: "center",
              titleFont: {
                size: 14,
                weight: '600'
              },
              bodyColor: RESOLVED_CHART_COLORS.richBlack,
              bodyFont: {
                size: 13
              },
              caretPadding: 15,
              cornerRadius: 8,
              padding: 12,
              displayColors: true,
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
              },
            },
          },
          scales: {
            x: {
              grid: { 
                display: false 
              },
              ticks: {
                color: 'var(--rich-black)',
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'var(--input-border)',
                lineWidth: 1
              },
              ticks: { 
                display: true,
                color: 'var(--rich-black)',
                stepSize: 1,
                font: {
                  size: 12,
                  weight: '500'
                },
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