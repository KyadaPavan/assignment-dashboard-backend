const XLSX = require('xlsx');
const path = require('path');

// Sample portfolio data based on the Excel format from the PDF
const samplePortfolioData = [
  {
    stockName: "Reliance Industries",
    symbol: "RELIANCE.NS",
    purchasePrice: 2100,
    quantity: 50,
    exchange: "NSE",
    sector: "Oil & Gas"
  },
  {
    stockName: "Tata Consultancy Services",
    symbol: "TCS.NS",
    purchasePrice: 3200,
    quantity: 30,
    exchange: "NSE",
    sector: "IT Services"
  },
  {
    stockName: "Infosys Limited",
    symbol: "INFY.NS",
    purchasePrice: 1450,
    quantity: 70,
    exchange: "NSE",
    sector: "IT Services"
  },
  {
    stockName: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    purchasePrice: 1520,
    quantity: 65,
    exchange: "NSE",
    sector: "Banking"
  },
  {
    stockName: "ICICI Bank",
    symbol: "ICICIBANK.NS",
    purchasePrice: 750,
    quantity: 100,
    exchange: "NSE",
    sector: "Banking"
  },
  {
    stockName: "ITC Limited",
    symbol: "ITC.NS",
    purchasePrice: 220,
    quantity: 200,
    exchange: "NSE",
    sector: "FMCG"
  },
  {
    stockName: "Hindustan Unilever",
    symbol: "HINDUNILVR.NS",
    purchasePrice: 2300,
    quantity: 25,
    exchange: "NSE",
    sector: "FMCG"
  },
  {
    stockName: "State Bank of India",
    symbol: "SBIN.NS",
    purchasePrice: 480,
    quantity: 150,
    exchange: "NSE",
    sector: "Banking"
  },
  {
    stockName: "Bajaj Finance",
    symbol: "BAJFINANCE.NS",
    purchasePrice: 6500,
    quantity: 15,
    exchange: "NSE",
    sector: "Financial Services"
  },
  {
    stockName: "Asian Paints",
    symbol: "ASIANPAINT.NS",
    purchasePrice: 3100,
    quantity: 20,
    exchange: "NSE",
    sector: "Paints"
  }
];

const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data.map(row => ({
      stockName: row['Stock Name'] || row['stockName'] || '',
      symbol: row['Symbol'] || row['symbol'] || '',
      purchasePrice: parseFloat(row['Purchase Price'] || row['purchasePrice'] || 0),
      quantity: parseInt(row['Quantity'] || row['quantity'] || 0),
      exchange: row['Exchange'] || row['exchange'] || 'NSE',
      sector: row['Sector'] || row['sector'] || 'Others'
    }));
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return null;
  }
};

const getPortfolioData = () => {
  // Try to read from Excel file first
  const excelPath = path.join(__dirname, '../../data/portfolio.xlsx');

  try {
    // Check if file exists first
    const fs = require('fs');
    if (fs.existsSync(excelPath)) {
      const excelData = parseExcelFile(excelPath);
      if (excelData && excelData.length > 0) {
        console.log('📊 Portfolio data loaded from Excel file');
        return excelData;
      }
    } else {
      console.log('📋 Excel file not found, using sample data');
    }
  } catch (error) {
    console.log('📋 Error reading Excel file, using sample data:', error.message);
  }

  // Return sample data if Excel file is not available
  console.log('📊 Using sample portfolio data');
  return samplePortfolioData;
};

module.exports = {
  parseExcelFile,
  getPortfolioData,
  samplePortfolioData
};
