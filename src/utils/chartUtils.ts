import type { CryptoPriceData } from '../services/cryptoService';

export const log2Scale = (value: number): number => {
  return Math.log2(value);
};

export const formatPrice = (price: number): string => {
  if (price < 1) {
    return price.toFixed(6);
  } else if (price < 100) {
    return price.toFixed(4);
  } else {
    return price.toFixed(2);
  }
};

export const formatLogPrice = (logPrice: number): string => {
  return logPrice.toFixed(4);
};

export const getTicksForLogScale = (minPrice: number, maxPrice: number): number[] => {
  const minLog = Math.floor(log2Scale(minPrice));
  const maxLog = Math.ceil(log2Scale(maxPrice));
  
  const ticks: number[] = [];
  for (let i = minLog; i <= maxLog; i++) {
    ticks.push(Math.pow(2, i));
  }
  
  return ticks;
};

export const formatTooltipPrice = (originalPrice: number, logPrice: number): string => {
  return `Price: $${formatPrice(originalPrice)} (log₂: ${formatLogPrice(logPrice)})`;
};

export const generateChartData = (data: CryptoPriceData[], label: string) => {
  return {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: label,
        data: data.map(item => log2Scale(item.price)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        originalData: data.map(item => item.price),
      },
    ],
  };
};