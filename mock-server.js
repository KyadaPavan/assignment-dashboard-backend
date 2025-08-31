// Demo script to show real-time updates with mock changing prices
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock portfolio with prices that change
let mockPrices = {
  'RELIANCE.NS': 1357.2,
  'TCS.NS': 3084.7,
  'INFY.NS': 1469.6,
  'HDFCBANK.NS': 951.6,
  'ICICIBANK.NS': 1397.8
};

// Simulate price changes every few seconds
setInterval(() => {
  Object.keys(mockPrices).forEach(symbol => {
    // Random price change between -2% to +2%
    const changePercent = (Math.random() - 0.5) * 0.04;
    mockPrices[symbol] = Math.round(mockPrices[symbol] * (1 + changePercent) * 100) / 100;
  });
  console.log('📈 Mock prices updated:', new Date().toLocaleTimeString());
  Object.entries(mockPrices).forEach(([symbol, price]) => {
    console.log(`💰 ${symbol}: ₹${price}`);
  });
  console.log('---');
}, 8000); // Change prices every 8 seconds

// API endpoint that returns changing prices
app.get('/api/mock-portfolio', (req, res) => {
  const portfolioData = [
    {
      stockName: "Reliance Industries",
      symbol: "RELIANCE.NS",
      purchasePrice: 2100,
      quantity: 50,
      currentPrice: mockPrices['RELIANCE.NS'],
      sector: "Oil & Gas"
    },
    {
      stockName: "TCS",
      symbol: "TCS.NS",
      purchasePrice: 3200,
      quantity: 30,
      currentPrice: mockPrices['TCS.NS'],
      sector: "IT Services"
    },
    {
      stockName: "Infosys",
      symbol: "INFY.NS",
      purchasePrice: 1450,
      quantity: 70,
      currentPrice: mockPrices['INFY.NS'],
      sector: "IT Services"
    }
  ];

  // Calculate metrics for each stock
  const enrichedData = portfolioData.map(stock => {
    const investment = stock.purchasePrice * stock.quantity;
    const presentValue = stock.currentPrice * stock.quantity;
    const gainLoss = presentValue - investment;
    const gainLossPercentage = ((gainLoss / investment) * 100);

    return {
      ...stock,
      investment: investment,
      presentValue: presentValue,
      gainLoss: gainLoss,
      gainLossPercentage: gainLossPercentage
    };
  });

  const totalInvestment = enrichedData.reduce((sum, stock) => sum + stock.investment, 0);
  const totalPresentValue = enrichedData.reduce((sum, stock) => sum + stock.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercentage = ((totalGainLoss / totalInvestment) * 100);

  res.json({
    success: true,
    cached: false,
    timestamp: new Date().toISOString(),
    summary: {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      totalStocks: enrichedData.length
    },
    stocks: enrichedData,
    lastUpdated: new Date().toISOString()
  });
});

app.listen(5001, () => {
  console.log('🎭 Mock server running on port 5001');
  console.log('📊 Mock API: http://localhost:5001/api/mock-portfolio');
  console.log('🔄 Prices change every 8 seconds to simulate real-time updates');
});
