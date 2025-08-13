import { useState, useEffect } from 'react';
import { CryptoChart } from './components/CryptoChart';
import { CryptoSelector } from './components/CryptoSelector';
import { PriceAlerts } from './components/PriceAlerts';
import { CacheStatus } from './components/CacheStatus';
import { CryptoService, CRYPTOCURRENCIES } from './services/cryptoService';
import type { CryptoInfo, CryptoPriceData } from './services/cryptoService';
import './App.css';

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoInfo>(CRYPTOCURRENCIES[0]);
  const [chartData, setChartData] = useState<CryptoPriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await CryptoService.fetchHistoricalData(selectedCrypto.coingeckoId);
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCrypto]);

  const handleSelectCrypto = (crypto: CryptoInfo) => {
    setSelectedCrypto(crypto);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cryptocurrency Price Tracker
          </h1>
        </header>

        <div className="space-y-6">
          <CacheStatus />
          
          <CryptoSelector 
            selectedCrypto={selectedCrypto}
            onSelectCrypto={handleSelectCrypto}
          />

          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading {selectedCrypto.name} data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error loading data:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && chartData.length > 0 && (
            <>
              <CryptoChart 
                data={chartData}
                symbol={selectedCrypto.symbol}
                name={selectedCrypto.name}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceAlerts selectedCrypto={selectedCrypto} />
                
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Data Points:</span>
                      <span className="font-medium">{chartData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Range:</span>
                      <span className="font-medium">
                        {chartData[0]?.date} to {chartData[chartData.length - 1]?.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest Price:</span>
                      <span className="font-medium">
                        ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lowest Price:</span>
                      <span className="font-medium">
                        ${Math.min(...chartData.map(d => d.price)).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
