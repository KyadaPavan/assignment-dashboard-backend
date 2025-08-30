const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const createSampleExcel = () => {
  const sampleData = [
    {
      'Stock Name': 'Reliance Industries',
      'Symbol': 'RELIANCE.NS',
      'Purchase Price': 2100,
      'Quantity': 50,
      'Exchange': 'NSE',
      'Sector': 'Oil & Gas'
    },
    {
      'Stock Name': 'Tata Consultancy Services',
      'Symbol': 'TCS.NS',
      'Purchase Price': 3200,
      'Quantity': 30,
      'Exchange': 'NSE',
      'Sector': 'IT Services'
    },
    {
      'Stock Name': 'Infosys Limited',
      'Symbol': 'INFY.NS',
      'Purchase Price': 1450,
      'Quantity': 70,
      'Exchange': 'NSE',
      'Sector': 'IT Services'
    },
    {
      'Stock Name': 'HDFC Bank',
      'Symbol': 'HDFCBANK.NS',
      'Purchase Price': 1520,
      'Quantity': 65,
      'Exchange': 'NSE',
      'Sector': 'Banking'
    },
    {
      'Stock Name': 'ICICI Bank',
      'Symbol': 'ICICIBANK.NS',
      'Purchase Price': 750,
      'Quantity': 100,
      'Exchange': 'NSE',
      'Sector': 'Banking'
    },
    {
      'Stock Name': 'ITC Limited',
      'Symbol': 'ITC.NS',
      'Purchase Price': 220,
      'Quantity': 200,
      'Exchange': 'NSE',
      'Sector': 'FMCG'
    },
    {
      'Stock Name': 'Hindustan Unilever',
      'Symbol': 'HINDUNILVR.NS',
      'Purchase Price': 2300,
      'Quantity': 25,
      'Exchange': 'NSE',
      'Sector': 'FMCG'
    },
    {
      'Stock Name': 'State Bank of India',
      'Symbol': 'SBIN.NS',
      'Purchase Price': 480,
      'Quantity': 150,
      'Exchange': 'NSE',
      'Sector': 'Banking'
    },
    {
      'Stock Name': 'Bajaj Finance',
      'Symbol': 'BAJFINANCE.NS',
      'Purchase Price': 6500,
      'Quantity': 15,
      'Exchange': 'NSE',
      'Sector': 'Financial Services'
    },
    {
      'Stock Name': 'Asian Paints',
      'Symbol': 'ASIANPAINT.NS',
      'Purchase Price': 3100,
      'Quantity': 20,
      'Exchange': 'NSE',
      'Sector': 'Paints'
    }
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio');

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write the file
  const filePath = path.join(dataDir, 'portfolio.xlsx');
  XLSX.writeFile(workbook, filePath);

  console.log('📁 Sample Excel file created at:', filePath);
  return filePath;
};

module.exports = { createSampleExcel };
