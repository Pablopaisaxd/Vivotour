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
      setChartData({
        labels: [],
        datasets: [
          {
            label: "Llegadas",
            data: [],
            backgroundColor: "var(--forest-green)",
            hoverBackgroundColor: "#3d9129",
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
          backgroundColor: "var(--forest-green)",
          hoverBackgroundColor: "#3d9129",
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
              backgroundColor: "rgba(240, 248, 255, 0.95)",
              borderColor: "var(--forest-green)",
              borderWidth: 2,
              titleColor: "var(--rich-black)",
              titleAlign: "center",
              titleFont: {
                size: 14,
                weight: '600'
              },
              bodyColor: "var(--rich-black)",
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
                labelTextColor: function(tooltipItem, chart) {
                    return 'var(--rich-black)';
                }
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