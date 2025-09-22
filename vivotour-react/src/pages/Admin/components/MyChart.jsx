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

const MyChart = ({ month, year }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setChartData({
      labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
      datasets: [
        {
          label: "Visitantes",
          data: [3,1,4,2,1,2,1,3,1,4,2,3,4,1,2,4,2,1,2,3,2,1,4,3,1,3,2,1,4,1,2],
          backgroundColor: "#4BAC35",
          hoverBackgroundColor: "#3d9129",
          barThickness: 9,
          minBarLength: 1,
        },
      ],
    });
  }, [month, year]);

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
                  label += Math.round(tooltipItem.raw * 100) / 100;
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
              ticks: { display: false },
            },
          },
        }}
      />
    </div>
  );
};

export default MyChart;