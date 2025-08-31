const express = require('express');
const router = express.Router();
const { getPortfolioData } = require('../services/portfolioData');
const { getMarketData } = require('../services/marketData');
const { getCachedData, setCachedData } = require('../utils/cache');

// Calculate portfolio metrics
const calculateMetrics = (stock, marketData) => {
  const investment = stock.purchasePrice * stock.quantity;
  const presentValue = marketData.currentPrice * stock.quantity;
  const gainLoss = presentValue - investment;
  const gainLossPercentage = investment > 0 ? ((gainLoss / investment) * 100) : 0;

  return {
    ...stock,
    currentPrice: marketData.currentPrice,
    investment: parseFloat(investment.toFixed(2)),
    presentValue: parseFloat(presentValue.toFixed(2)),
    gainLoss: parseFloat(gainLoss.toFixed(2)),
    gainLossPercentage: parseFloat(gainLossPercentage.toFixed(2)),
    peRatio: marketData.peRatio,
    latestEarnings: marketData.latestEarnings
  };
};

// Calculate portfolio percentages
const calculatePortfolioPercentages = (enrichedStocks) => {
  const totalInvestment = enrichedStocks.reduce((sum, stock) => sum + stock.investment, 0);

  return enrichedStocks.map(stock => ({
    ...stock,
    portfolioPercentage: totalInvestment > 0 ?
      parseFloat(((stock.investment / totalInvestment) * 100).toFixed(2)) : 0
  }));
};

// Group stocks by sector
const groupBySector = (stocks) => {
  const sectors = {};

  stocks.forEach(stock => {
    if (!sectors[stock.sector]) {
      sectors[stock.sector] = {
        sectorName: stock.sector,
        stocks: [],
        totalInvestment: 0,
        totalPresentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0
      };
    }

    sectors[stock.sector].stocks.push(stock);
    sectors[stock.sector].totalInvestment += stock.investment;
    sectors[stock.sector].totalPresentValue += stock.presentValue;
    sectors[stock.sector].totalGainLoss += stock.gainLoss;
  });

  // Calculate sector gain/loss percentages
  Object.keys(sectors).forEach(sectorName => {
    const sector = sectors[sectorName];
    sector.totalGainLossPercentage = sector.totalInvestment > 0 ?
      parseFloat(((sector.totalGainLoss / sector.totalInvestment) * 100).toFixed(2)) : 0;

    // Round values
    sector.totalInvestment = parseFloat(sector.totalInvestment.toFixed(2));
    sector.totalPresentValue = parseFloat(sector.totalPresentValue.toFixed(2));
    sector.totalGainLoss = parseFloat(sector.totalGainLoss.toFixed(2));
  });

  return sectors;
};

// GET /api/portfolio - Main portfolio endpoint
router.get('/portfolio', async (req, res) => {
  try {
    const cacheKey = 'enriched_portfolio';
    const forceRefresh = req.query.refresh === 'true';

    const cached = !forceRefresh ? getCachedData(cacheKey) : null;

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        timestamp: new Date().toISOString(),
        ...cached
      });
    }

    console.log('📊 Fetching portfolio data...');
    const portfolioStocks = getPortfolioData();

    if (!portfolioStocks || portfolioStocks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No portfolio data found'
      });
    }

    console.log('🔄 Enriching portfolio with market data...');

    // Fetch market data for all stocks in parallel
    const marketDataPromises = portfolioStocks.map(stock =>
      getMarketData(stock.symbol).catch(error => {
        console.error(`Failed to get market data for ${stock.symbol}:`, error.message);
        return {
          currentPrice: 0,
          peRatio: 'N/A',
          latestEarnings: 'N/A'
        };
      })
    );

    const marketDataResults = await Promise.all(marketDataPromises);

    // Calculate metrics for each stock
    const enrichedStocks = portfolioStocks.map((stock, index) =>
      calculateMetrics(stock, marketDataResults[index])
    );

    // Calculate portfolio percentages
    const stocksWithPercentages = calculatePortfolioPercentages(enrichedStocks);

    // Group by sector
    const sectorData = groupBySector(stocksWithPercentages);

    // Calculate overall portfolio summary
    const totalInvestment = stocksWithPercentages.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = stocksWithPercentages.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 ? ((totalGainLoss / totalInvestment) * 100) : 0;

    const portfolioSummary = {
      totalInvestment: parseFloat(totalInvestment.toFixed(2)),
      totalPresentValue: parseFloat(totalPresentValue.toFixed(2)),
      totalGainLoss: parseFloat(totalGainLoss.toFixed(2)),
      totalGainLossPercentage: parseFloat(totalGainLossPercentage.toFixed(2)),
      totalStocks: stocksWithPercentages.length,
      sectorsCount: Object.keys(sectorData).length
    };

    const response = {
      summary: portfolioSummary,
      stocks: stocksWithPercentages,
      sectors: sectorData,
      lastUpdated: new Date().toISOString()
    };

    // Cache the response for 10 seconds for real-time updates
    setCachedData(cacheKey, response, 10);

    console.log('✅ Portfolio data enriched successfully');

    res.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      ...response
    });

  } catch (error) {
    console.error('❌ Error in portfolio endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data',
      message: error.message
    });
  }
});

// GET /api/portfolio/summary - Portfolio summary only
router.get('/portfolio/summary', async (req, res) => {
  try {
    const portfolioData = getCachedData('enriched_portfolio');

    if (portfolioData && portfolioData.summary) {
      return res.json({
        success: true,
        summary: portfolioData.summary,
        timestamp: new Date().toISOString()
      });
    }

    res.status(404).json({
      success: false,
      error: 'Portfolio summary not available. Please fetch full portfolio first.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio summary'
    });
  }
});

// GET /api/portfolio/sectors - Sector-wise data only
router.get('/portfolio/sectors', async (req, res) => {
  try {
    const portfolioData = getCachedData('enriched_portfolio');

    if (portfolioData && portfolioData.sectors) {
      return res.json({
        success: true,
        sectors: portfolioData.sectors,
        timestamp: new Date().toISOString()
      });
    }

    res.status(404).json({
      success: false,
      error: 'Sector data not available. Please fetch full portfolio first.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector data'
    });
  }
});

// DELETE /api/portfolio/cache - Clear cache for fresh data
router.delete('/portfolio/cache', (req, res) => {
  try {
    const { clearCache } = require('../utils/cache');
    clearCache();

    res.json({
      success: true,
      message: 'Portfolio cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

module.exports = router;
