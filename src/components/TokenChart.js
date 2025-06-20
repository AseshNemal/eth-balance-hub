import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TokenChart = ({ tokenSymbol, priceHistory }) => {
  // priceHistory is expected to be an array of { date: string, price: number }
  const data = {
    labels: priceHistory.map((entry) => entry.date),
    datasets: [
      {
        label: `${tokenSymbol} Price (USD)`,
        data: priceHistory.map((entry) => entry.price),
        fill: true,
        borderColor: 'rgb(37 99 235)', // Tailwind blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `${tokenSymbol} Price Chart`,
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          font: {
            size: 12,
          },
          beginAtZero: true,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default TokenChart;
