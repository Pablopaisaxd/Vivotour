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
          label: "Visitors",
          data: [3,1,4,2,1,2,1,3,1,4,2,3,4,1,2,4,2,1,2,3,2,1,4,3,1,3,2,1,4,1,2],
          backgroundColor: "rgb(31, 110, 215)",
          hoverBackgroundColor: "#1a5199",
          barThickness: 9,
          minBarLength: 1,
        },
      ],
    });
  }, [month, year]);

  return (
    <div
      style={{
        position: "relative",
        height: "250px",
        width: "90%",
        margin: "0 auto",
        filter: "drop-shadow(0 0 0.15rem #ddddf0)",
      }}
    >
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${month} ${year}`,
              font: { size: 16 },
            },
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              backgroundColor: "rgb(255, 255, 255)",
              borderColor: "rgb(156, 174, 211)",
              borderWidth: 1,
              titleColor: "#5f5b66",
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
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
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
