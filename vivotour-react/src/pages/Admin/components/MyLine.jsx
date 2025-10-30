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
    if (chartInputData && chartInputData.labels && chartInputData.data) {
      setData({
        labels: chartInputData.labels,
        datasets: [
          {
            data: chartInputData.data,
            fill: true,
            backgroundColor: color.backgroundColor,
            borderColor: color.borderColor,
            borderWidth: 2.5,
            pointBorderColor: color.borderColor,
            pointBackgroundColor: "var(--alice-blue)",
            pointHoverRadius: 6,
            pointHoverBackgroundColor: color.borderColor,
            pointHoverBorderColor: "rgba(75, 172, 53, 0.3)",
            pointHoverBorderWidth: 8,
            pointRadius: 0,
            pointHitRadius: 35,
            tension: 0.4,
          },
        ],
      });
    } else {
      setData({
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [
          {
            data: [3, 2, 3, 2, 2, 3, 1, 2, 2, 4],
            fill: true,
            backgroundColor: color.backgroundColor,
            borderColor: color.borderColor,
            borderWidth: 2.5,
            pointBorderColor: color.borderColor,
            pointBackgroundColor: "var(--alice-blue)",
            pointHoverRadius: 6,
            pointHoverBackgroundColor: color.borderColor,
            pointHoverBorderColor: "rgba(75, 172, 53, 0.3)",
            pointHoverBorderWidth: 8,
            pointRadius: 0,
            pointHitRadius: 35,
            tension: 0.4,
          },
        ],
      });
    }
  }, [color, chartInputData]);

  const chartContainerStyle = {
    height: height,
    width: width,
    padding: "0.5rem",
    borderRadius: "8px",
    background: "linear-gradient(135deg, var(--alice-blue) 0%, rgba(75, 172, 53, 0.03) 100%)",
    boxShadow: "0 2px 8px var(--shadow-light)",
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
              caretPadding: 8,
              cornerRadius: 8,
              padding: 12,
              position: "nearest",
              bodyAlign: "center",
              bodyFont: { 
                weight: '600', 
                size: 13 
              },
              titleFont: {
                weight: '600',
                size: 14
              },
              backgroundColor: "rgba(240, 248, 255, 0.95)",
              borderColor: color.borderColor,
              borderWidth: 2,
              titleColor: "var(--rich-black)",
              bodyColor: "var(--rich-black)",
              displayColors: false,
              callbacks: {
                labelTextColor: function(tooltipItem, chart) {
                    return 'var(--rich-black)';
                }
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
              border: { display: false }
            },
            x: {
              ticks: { display: false },
              grid: { display: false },
              border: { display: false }
            },
          },
          elements: {
            point: {
              hoverRadius: 6,
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }}
      />
    </div>
  );
};

export default MyLine;