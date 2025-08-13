export interface CryptoPriceData {
  date: string;
  price: number;
}

export interface CryptoInfo {
  symbol: string;
  name: string;
  yahooSymbol: string;
  coingeckoId: string;
}

export const CRYPTOCURRENCIES: CryptoInfo[] = [
  { symbol: 'BTC', name: 'Bitcoin', yahooSymbol: 'BTC-USD', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', yahooSymbol: 'ETH-USD', coingeckoId: 'ethereum' },
  { symbol: 'ADA', name: 'Cardano', yahooSymbol: 'ADA-USD', coingeckoId: 'cardano' },
  { symbol: 'SOL', name: 'Solana', yahooSymbol: 'SOL-USD', coingeckoId: 'solana' },
  { symbol: 'SNEK', name: 'Snek (ADA)', yahooSymbol: 'SNEK-USD' , coingeckoId: 'snek'},
];

export class CryptoService {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3/coins/';
  private static readonly PROXY_URL = 'https://api.allorigins.win/raw?url=';

  static async fetchHistoricalData(coingeckoId: string): Promise<CryptoPriceData[]> {
    try {
      // Service worker will automatically cache this request
      console.log(`Fetching historical data for ${coingeckoId}...`);
      
      // Try direct fetch first, then fall back to proxy or mock data
      let response;
      let data;
      // Example url for btc
      // https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily
      
      try {
        let days = 30;

        const url = `${this.BASE_URL}${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
        response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Direct fetch failed');
        }
        
        data = await response.json();
        console.log('get data for', data.prices.length, 'days');
      } catch (directError) {
        console.warn('Direct API fetch failed, trying proxy...', directError);
        
        try {
          let days = 30;
          const proxyUrl = `${this.PROXY_URL}${encodeURIComponent(`${this.BASE_URL}${coingeckoId}/market_chart/range?vs_currency=usd&days=${days}&interval=1d`)}`;
          response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error('Proxy fetch failed');
          }
          
          data = await response.json();
        } catch (proxyError) {
          console.warn('Proxy fetch also failed, using mock data...', proxyError);
          return this.generateMockData(coingeckoId);
        }
      }

      const result = data.prices;
      
      if (!result || !result.length) {
        console.warn('No real data available, using mock data...');
        return this.generateMockData(coingeckoId);
      }

      
      return result.map((dailyPrice: number[]) => ({
        date: new Date(dailyPrice[0]).toISOString().split('T')[0],
        price: dailyPrice[1],
      }));
      
    } catch (error) {
      console.error(`Error fetching data for ${coingeckoId}:`, error);
      console.log('Falling back to mock data...');
      return this.generateMockData(coingeckoId);
    }
  }

  static async getCurrentPrice(coingeckoId: string): Promise<number> {
    let baseurl = 'https://api.coingecko.com/api/v3/simple/price?ids=' + coingeckoId + '&vs_currencies=usd'
    try {
      let response;
      let data;
      
      try {
        response = await fetch(baseurl);
        
        if (!response.ok) {
          throw new Error('Direct fetch failed');
        }
        
        data = await response.json();
      } catch {
        try {
          const proxyUrl = `${this.PROXY_URL}${encodeURIComponent(baseurl)}`;
          response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error('Proxy fetch failed');
          }
          
          data = await response.json();
        } catch {
          // Return mock current price
          return this.getMockCurrentPrice(coingeckoId);
        }
      }

      const result = data[coingeckoId].usd;
      const currentPrice = result;
      
      return currentPrice;
    } catch (error) {
      console.error(`Error fetching current price for ${coingeckoId}:`, error);
      return this.getMockCurrentPrice(coingeckoId);
    }
  }

  private static generateMockData(symbol: string): CryptoPriceData[] {
    const startPrice = this.getStartPrice(symbol);
    const data: CryptoPriceData[] = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date();
    
    let currentPrice = startPrice;
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add some realistic price movement
      const volatility = 0.05; // 5% daily volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const trend = Math.sin((i / totalDays) * Math.PI * 4) * 0.001; // Long-term trend
      
      currentPrice = currentPrice * (1 + randomChange + trend);
      
      const open = currentPrice;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(0.0001, open),
      });
    }
    
    return data;
  }

  private static getStartPrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC-USD': 7000,
      'ETH-USD': 140,
      'ADA-USD': 0.045,
      'SOL-USD': 1.5,
      'SNEK-USD': 0.001,
    };
    return prices[symbol] || 100;
  }

  private static getMockCurrentPrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTC-USD': 42000,
      'ETH-USD': 2500,
      'ADA-USD': 0.35,
      'SOL-USD': 85,
      'SNEK-USD': 0.002,
    };
    return prices[symbol] || 1000;
  }
}