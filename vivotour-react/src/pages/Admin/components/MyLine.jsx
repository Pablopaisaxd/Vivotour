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
// Resolve CSS variables once and set ChartJS defaults for tooltip/readability
let RESOLVED_LINE_COLORS = {
  richBlack: '#1A181B',
  aliceBlue: '#F0F8FF',
  forestGreen: '#4BAC35',
};

if (typeof window !== 'undefined' && window.getComputedStyle) {
  try {
    const root = window.getComputedStyle(document.documentElement);
    const richBlack = (root.getPropertyValue('--rich-black') || RESOLVED_LINE_COLORS.richBlack).trim();
    const aliceBlue = (root.getPropertyValue('--alice-blue') || RESOLVED_LINE_COLORS.aliceBlue).trim();
    const forestGreen = (root.getPropertyValue('--forest-green') || RESOLVED_LINE_COLORS.forestGreen).trim();
    RESOLVED_LINE_COLORS = { richBlack, aliceBlue, forestGreen };

    ChartJS.defaults.color = richBlack;
    ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(240, 248, 255, 0.95)';
    ChartJS.defaults.plugins.tooltip.titleColor = richBlack;
    ChartJS.defaults.plugins.tooltip.bodyColor = richBlack;
    ChartJS.defaults.plugins.tooltip.borderColor = forestGreen;
    ChartJS.defaults.plugins.tooltip.borderWidth = 2;
  } catch (e) {
    // noop
  }
}

function resolveColorValue(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'string' && val.includes('var(')) {
    try {
      const match = val.match(/--[a-zA-Z0-9-_]+/);
      if (match) {
        const computed = window.getComputedStyle(document.documentElement).getPropertyValue(match[0]);
        if (computed) return computed.trim();
      }
    } catch (e) {
      return fallback;
    }
    return fallback;
  }
  return val;
}

const MyLine = ({ color, height, width, data: chartInputData }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (chartInputData && chartInputData.labels && chartInputData.data) {
      const resolvedBorder = resolveColorValue(color.borderColor, RESOLVED_LINE_COLORS.forestGreen);
      const resolvedBg = resolveColorValue(color.backgroundColor, 'rgba(75, 172, 53, 0.08)');
      setData({
        labels: chartInputData.labels,
        datasets: [
          {
            data: chartInputData.data,
            fill: true,
            backgroundColor: resolvedBg,
            borderColor: resolvedBorder,
            borderWidth: 2.5,
            pointBorderColor: resolvedBorder,
            pointBackgroundColor: RESOLVED_LINE_COLORS.aliceBlue,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: resolvedBorder,
            pointHoverBorderColor: 'rgba(75, 172, 53, 0.3)',
            pointHoverBorderWidth: 8,
            pointRadius: 0,
            pointHitRadius: 35,
            tension: 0.4,
          },
        ],
      });
    } else {
      const resolvedBorder = resolveColorValue(color.borderColor, RESOLVED_LINE_COLORS.forestGreen);
      const resolvedBg = resolveColorValue(color.backgroundColor, 'rgba(75, 172, 53, 0.08)');
      setData({
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [
          {
            data: [3, 2, 3, 2, 2, 3, 1, 2, 2, 4],
            fill: true,
            backgroundColor: resolvedBg,
            borderColor: resolvedBorder,
            borderWidth: 2.5,
            pointBorderColor: resolvedBorder,
            pointBackgroundColor: RESOLVED_LINE_COLORS.aliceBlue,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: resolvedBorder,
            pointHoverBorderColor: 'rgba(75, 172, 53, 0.3)',
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