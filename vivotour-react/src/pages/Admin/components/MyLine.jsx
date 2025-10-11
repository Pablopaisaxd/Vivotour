import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MyLine = ({ color, height, width, data: chartInputData }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Si se proporcionan datos reales, usarlos
    if (chartInputData && chartInputData.labels && chartInputData.data) {
      setData({
        labels: chartInputData.labels,
        datasets: [
          {
            data: chartInputData.data,
            fill: true,
            backgroundColor: color.backgroundColor,
            borderColor: color.borderColor,
            borderWidth: 2,
            pointBorderColor: "#4BAC35",
            pointBackgroundColor: "#fff",
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#4BAC35",
            pointHoverBorderColor: "rgba(75, 172, 53, 0.5)",
            pointHoverBorderWidth: 7,
            pointRadius: 0,
            pointHitRadius: 30,
            tension: 0.4,
          },
        ],
      });
    } else {
      // Datos por defecto
      setData({
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [
          {
            data: [3, 2, 3, 2, 2, 3, 1, 2, 2, 4],
            fill: true,
            backgroundColor: color.backgroundColor,
            borderColor: color.borderColor,
            borderWidth: 2,
            pointBorderColor: "#4BAC35",
            pointBackgroundColor: "#fff",
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#4BAC35",
            pointHoverBorderColor: "rgba(75, 172, 53, 0.5)",
            pointHoverBorderWidth: 7,
            pointRadius: 0,
            pointHitRadius: 30,
            tension: 0.4,
          },
        ],
      });
    }
  }, [color, chartInputData]);

  const chartContainerStyle = {
    height: height,
    width: width,
    filter: 'drop-shadow(0 0 0.15rem rgba(0,0,0,0.05))',
  };

  return (
    <div style={chartContainerStyle}>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              titleAlign: "center",
              caretPadding: 5,
              cornerRadius: 5,
              padding: 10,
              position: "nearest",
              bodyAlign: "center",
              bodyFont: { weight: 'bold', color: 'var(--rich-black)' },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderColor: "rgba(75, 172, 53, 0.5)",
              borderWidth: 1,
              titleColor: "var(--rich-black)",
              labelTextColor: function(tooltipItem, chart) {
                  return 'var(--rich-black)';
              }
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { display: false },
              grid: { display: false },
            },
            x: {
              ticks: { display: false },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
};

export default MyLine;