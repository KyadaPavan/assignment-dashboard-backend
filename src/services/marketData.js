const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');
const cheerio = require('cheerio');
const { getCachedData, setCachedData } = require('../utils/cache');

// Yahoo Finance API calls
const getCurrentPrice = async (symbol) => {
  const cacheKey = `price_${symbol}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote.regularMarketPrice || quote.price || 0;

    setCachedData(cacheKey, price, 30); // Cache for 30 seconds
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    return 0;
  }
};

// Scrape P/E ratio from Google Finance
const getPERatio = async (symbol) => {
  const cacheKey = `pe_${symbol}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // Clean symbol for Google Finance (remove .NS, .BO etc)
    const cleanSymbol = symbol.replace(/\.(NS|BO|L|TO)$/, '');
    const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Look for P/E ratio in various possible locations
    let peRatio = 'N/A';

    // Try different selectors for P/E ratio
    const peSelectors = [
      '[data-last-value]',
      '.gyFHrc',
      '.P6K39c'
    ];

    for (const selector of peSelectors) {
      const peElement = $(selector).filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('p/e') || text.includes('pe ratio');
      }).next();

      if (peElement.length) {
        peRatio = peElement.text().trim();
        break;
      }
    }

    setCachedData(cacheKey, peRatio, 1800); // Cache for 30 minutes
    return peRatio;
  } catch (error) {
    console.error(`Error fetching P/E ratio for ${symbol}:`, error.message);
    return 'N/A';
  }
};

// Get latest earnings (mock implementation - would need specific scraping)
const getLatestEarnings = async (symbol) => {
  const cacheKey = `earnings_${symbol}`;
  const cached = getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    // For demo purposes, return mock data
    // In real implementation, you would scrape Google Finance or use a paid API
    const mockEarnings = {
      'RELIANCE.NS': '₹2,539 Cr',
      'TCS.NS': '₹11,342 Cr',
      'INFY.NS': '₹6,128 Cr',
      'HDFC.NS': '₹8,834 Cr',
      'ICICIBANK.NS': '₹7,558 Cr'
    };

    const earnings = mockEarnings[symbol] || 'N/A';
    setCachedData(cacheKey, earnings, 3600); // Cache for 1 hour
    return earnings;
  } catch (error) {
    console.error(`Error fetching earnings for ${symbol}:`, error.message);
    return 'N/A';
  }
};

// Get all market data for a symbol
const getMarketData = async (symbol) => {
  try {
    const [currentPrice, peRatio, latestEarnings] = await Promise.all([
      getCurrentPrice(symbol),
      getPERatio(symbol),
      getLatestEarnings(symbol)
    ]);

    return {
      currentPrice,
      peRatio,
      latestEarnings
    };
  } catch (error) {
    console.error(`Error fetching market data for ${symbol}:`, error.message);
    return {
      currentPrice: 0,
      peRatio: 'N/A',
      latestEarnings: 'N/A'
    };
  }
};

module.exports = {
  getCurrentPrice,
  getPERatio,
  getLatestEarnings,
  getMarketData
};
