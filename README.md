# Cryptocurrency Dashboard

This is a cryptocurrency dashboard that tracks the prices of various cryptocurrencies in real-time. It also provides historical data visualization and price alerts.

<img src="https://uca8d88c65424d153fa290304ea5.dl.dropboxusercontent.com/cd/0/inline/CvUtJk_s_GJGcyF3adWIPren_wFpaWinhPiKp6-UMXEIfMMhycwCjYEQ37MUAJZQU6lUFxb67CnzN5NHA9Q3HUX2P0Lfg_u05nP4ZZ1rYYYdSgZoyVfvd4SpjnGKSfm8gxVt7qeVOxX4MuIifVSs11eR/file#" alt="Demo" width="600" height="800">

### Note
Educational project for practicing Service Worker caching and notifications.

## 🚀 Features

- **Real-time Price Tracking** - Live cryptocurrency prices with 30-second updates
- **Historical Data Charts** - Interactive Chart.js visualizations with logarithmic scaling (fallback to mockdata when CORS error)
- **Price Alerts** - Browser notifications when price thresholds are met
- **Service Worker Caching** - Offline-capable historical data caching (1-hour duration)
- **Multi-crypto Support** - Bitcoin, Ethereum, Cardano, Solana, and Snek

## 🛠️ Tech Stack

- **Frontend:** React 19.1.1, TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **Styling:** Tailwind CSS 4.1.11
- **Charts:** Chart.js 4.5.0 with react-chartjs-2
- **HTTP Client:** Axios 1.11.0
- **Service Worker:** Custom caching for historical data
- **Notifications:** Browser Notification API
- **Data Source:** CoinGecko API with proxy fallback

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation option 1
```bash
git clone https://github.com/ZurichParis/price_alert_dashboard.git
cd price_alert_dashboard
```
```bash
npm install
```
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Installation option 2
```bash
git clone https://github.com/ZurichParis/price_alert_dashboard.git
cd price_alert_dashboard
```

```bash
docker build -t price_alert_dashboard .
```

```bash
docker run -d -p 8080:80 price_alert_dashboard
```

Access the app at `http://localhost:8080`


## 📊 Service Worker Caching

The app implements intelligent caching:
- **Historical data** - Cached for 1 hour (doesn't change frequently)
- **Current prices** - Always fetched fresh (real-time updates)
- **Offline fallback** - Serves stale cache data when network is unavailable
- **Cache management** - Built-in tools to inspect and clear cache

## 🔔 Price Alerts

- Set price thresholds (above/below)
- Browser notifications when triggered
- Alerts pause automatically after triggering
- Works only when browser tab is open (no service worker background sync)


## 📄 License

MIT License - see LICENSE file for details.
