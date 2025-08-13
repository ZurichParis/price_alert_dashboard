import React from 'react';
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
import type { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { CryptoPriceData } from '../services/cryptoService';
import { generateChartData, formatTooltipPrice } from '../utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoChartProps {
  data: CryptoPriceData[];
  symbol: string;
  name: string;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ data, symbol, name }) => {
  const chartData = generateChartData(data, `${name} (${symbol})`);

  // Calculate better Y-axis bounds for log scale
  const allPrices = data.map(d => d.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const minLog = Math.log2(minPrice);
  const maxLog = Math.log2(maxPrice);
  
  // Log₂ scale bounds for Y-axis

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${name} (${symbol}) - Daily Open Prices (Log₂ Scale)`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const dataset = context.chart.data.datasets[datasetIndex];
            const originalPrice = (dataset as unknown as { originalData: number[] }).originalData[dataIndex];
            const logPrice = context.parsed.y;
            
            return formatTooltipPrice(originalPrice, logPrice);
          },
          title: function(tooltipItems: TooltipItem<'line'>[]) {
            return `Date: ${tooltipItems[0]?.label || 'Unknown'}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'log₂(Daily Open Price)',
        },
        min: minLog - (maxLog - minLog) * 0.05,  // Add 5% padding
        max: maxLog + (maxLog - minLog) * 0.05,  // Add 5% padding
        ticks: {
          stepSize: (maxLog - minLog) / 8,  // Approximately 8 ticks
          callback: function(value: number | string) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toFixed(2);  // Show log₂ values with 2 decimal places
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-lg shadow-lg mt-4 py-4 px-8">
      <Line data={chartData} options={options} />
    </div>
  );
};