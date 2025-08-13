import React, { useState, useEffect } from 'react';
import { CryptoService } from '../services/cryptoService';
import type { CryptoInfo } from '../services/cryptoService';
import { formatPrice } from '../utils/chartUtils';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

interface PriceAlertsProps {
  selectedCrypto: CryptoInfo;
}

if (Notification.permission === "granted") {
  console.log('notification permission', Notification.permission);
  new Notification("Test notification", {
      body: "If you see this, notifications are working!"
  });
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ selectedCrypto }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlertPrice, setNewAlertPrice] = useState<string>('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading] = useState(false);

  useEffect(() => {
    console.log('notification permission', Notification.permission);
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
        
      }
    };
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const price = await CryptoService.getCurrentPrice(selectedCrypto.coingeckoId);
        setCurrentPrice(price);
        console.log('current price', price);
      } catch (error) {
        console.error('Error fetching current price:', error);
      }
    };

    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  const triggerNotification = React.useCallback((alert: PriceAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `${alert.symbol} is now ${alert.condition} $${formatPrice(alert.targetPrice)}. Current price: $${formatPrice(currentPrice!)}`,
        icon: '/vite.svg',
      });
    }
  }, [currentPrice]);

  useEffect(() => {
    if (currentPrice === null) return;

    const checkAlerts = () => {
      alerts.forEach((alert) => {
        if (!alert.isActive || alert.symbol !== selectedCrypto.symbol) return;

        const shouldTrigger = 
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice);

        if (shouldTrigger) {
          triggerNotification(alert);
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? { ...a, isActive: false } : a
          ));
        }
      });
    };

    checkAlerts();
  }, [currentPrice, alerts, selectedCrypto, triggerNotification]);


  const addAlert = () => {
    const price = parseFloat(newAlertPrice);
    if (isNaN(price) || price <= 0) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedCrypto.symbol,
      targetPrice: price,
      condition: newAlertCondition,
      isActive: true,
    };

    setAlerts(prev => [...prev, newAlert]);
    setNewAlertPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const currentSymbolAlerts = alerts.filter(alert => alert.symbol === selectedCrypto.symbol);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Price Alerts for {selectedCrypto.name} ({selectedCrypto.symbol})
      </h3>

      {currentPrice && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Current Price:</p>
          <p className="text-xl font-bold text-blue-600">${formatPrice(currentPrice)}</p>
        </div>
      )}

      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Target price"
            value={newAlertPrice}
            onChange={(e) => setNewAlertPrice(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
          />
          <select
            value={newAlertCondition}
            onChange={(e) => setNewAlertCondition(e.target.value as 'above' | 'below')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <button
            onClick={addAlert}
            disabled={!newAlertPrice || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Alert
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {currentSymbolAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No alerts set for {selectedCrypto.symbol}</p>
        ) : (
          currentSymbolAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className={`font-medium ${alert.isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                  Alert when {alert.condition} ${formatPrice(alert.targetPrice)}
                </span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  alert.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {alert.isActive ? 'Active' : 'Triggered'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    alert.isActive 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {alert.isActive ? 'Pause' : 'Reactivate'}
                </button>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {Notification.permission !== 'granted' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100">
          <button 
            className="text-sm text-yellow-800 hover:text-yellow-600" 
            onClick={() => Notification.requestPermission()}
          >
            Click the tune/settings icon (⚙️) to enable notifications to receive price alerts.
          </button>
        </div>
      )}
    </div>
  );
};