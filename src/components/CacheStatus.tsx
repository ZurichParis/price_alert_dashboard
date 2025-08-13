import React, { useState, useEffect } from 'react';
import { isServiceWorkerActive, getCacheInfo, clearHistoricalDataCache } from '../utils/serviceWorkerUtils';

export const CacheStatus: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setIsActive(isServiceWorkerActive());
    
    // Check for service worker updates
    const interval = setInterval(() => {
      setIsActive(isServiceWorkerActive());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGetCacheInfo = async () => {
    const info = await getCacheInfo();
    setCacheInfo(info);
  };

  const handleClearCache = async () => {
    const success = await clearHistoricalDataCache();
    if (success) {
      setCacheInfo(null);
      console.log('Cache cleared successfully');
    }
  };

  if (!isActive) {
    return (
      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        🔄 Service Worker not active yet - caching disabled
      </div>
    );
  }

  return (
    <div className="p-2 bg-green-50 border border-green-200 rounded">
      <div className="flex items-center justify-between">
        <span className="text-xs text-green-800 flex items-center">
          ✅ Service Worker active - Historical data caching enabled
        </span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-green-600 hover:text-green-800 underline"
        >
          {showDetails ? 'Hide' : 'Show'} details
        </button>
      </div>

      {showDetails && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleGetCacheInfo}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Check Cache
            </button>
            <button
              onClick={handleClearCache}
              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Clear Cache
            </button>
          </div>

          {cacheInfo && (
            <div className="text-xs text-gray-600">
              <p><strong>Cached entries:</strong> {cacheInfo.totalEntries}</p>
              {cacheInfo.entries.map((entry: any, index: number) => (
                <p key={index} className="truncate">• {new URL(entry.url).pathname}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};