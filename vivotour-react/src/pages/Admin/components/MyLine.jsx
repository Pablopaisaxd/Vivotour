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
  Filler, // 👈 IMPORTANTE: importar Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // 👈 REGISTRAR Filler
);

const MyLine = ({ color, height, width }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setData({
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      datasets: [
        {
          data: [3, 2, 3, 2, 2, 3, 1, 2, 2, 4],
          fill: true, // 👈 ahora sí funciona con Filler registrado
          backgroundColor: color.backgroundColor,
          borderColor: color.borderColor,
          borderWidth: 2,
          pointBorderColor: "#2984c5",
          pointBackgroundColor: "#fff",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#2984c5",
          pointHoverBorderColor: "rgba(41, 132, 197, 0.5)",
          pointHoverBorderWidth: 7,
          pointRadius: 0,
          pointHitRadius: 30,
          tension: 0.4, // un poco de curvatura opcional
        },
      ],
    });
  }, [color]);

  return (
    <div style={{ height: height, width: width, filter: 'drop-shadow(0 0 0.15rem #d8d8e2)' }}>
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
              bodyFont: { weight: 'bold' },
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
