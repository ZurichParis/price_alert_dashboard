import React from 'react';
import { CRYPTOCURRENCIES } from '../services/cryptoService';
import type { CryptoInfo } from '../services/cryptoService';

interface CryptoSelectorProps {
  selectedCrypto: CryptoInfo;
  onSelectCrypto: (crypto: CryptoInfo) => void;
}

export const CryptoSelector: React.FC<CryptoSelectorProps> = ({ 
  selectedCrypto, 
  onSelectCrypto 
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-lg mb-8 justify-center">
      <p className="w-full font-semibold text-red-500 text-center">
        Select Cryptocurrency:
      </p>
      {CRYPTOCURRENCIES.map((crypto) => (
        <button
          key={crypto.symbol}
          onClick={() => onSelectCrypto(crypto)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            selectedCrypto.symbol === crypto.symbol
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-bold">{crypto.symbol}</div>
            <div className="text-xs opacity-80">{crypto.name}</div>
          </div>
        </button>
      ))}
    </div>
  );
};