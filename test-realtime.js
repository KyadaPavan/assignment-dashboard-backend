// Test script to demonstrate real-time price changes
const yahooFinance = require('yahoo-finance2').default;

async function testRealTimePrices() {
  console.log('🔍 Testing Real-time Price Updates...\n');

  const symbols = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];

  for (let i = 0; i < 5; i++) {
    console.log(`📊 Fetch #${i + 1} - ${new Date().toLocaleTimeString()}`);

    for (const symbol of symbols) {
      try {
        const quote = await yahooFinance.quote(symbol);
        const price = quote.regularMarketPrice || quote.price || 0;
        const marketState = quote.marketState || 'UNKNOWN';

        console.log(`💰 ${symbol}: ₹${price} (Market: ${marketState})`);
      } catch (error) {
        console.log(`❌ ${symbol}: Error - ${error.message}`);
      }
    }

    console.log('---');

    if (i < 4) {
      console.log('⏳ Waiting 10 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

testRealTimePrices();
