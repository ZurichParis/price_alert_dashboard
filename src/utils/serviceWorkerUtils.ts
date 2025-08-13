// Service Worker utility functions

export const clearHistoricalDataCache = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };
      
      navigator.serviceWorker.controller!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  return false;
};

export const getCacheInfo = async (): Promise<any> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.cacheInfo || null);
      };
      
      navigator.serviceWorker.controller!.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
    });
  }
  return null;
};

export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

export const isServiceWorkerActive = (): boolean => {
  return 'serviceWorker' in navigator && 
         navigator.serviceWorker.controller !== null;
};