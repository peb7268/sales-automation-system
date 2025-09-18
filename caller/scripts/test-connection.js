#!/usr/bin/env node

/**
 * Simple connection test for Google Sheets API
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

async function testConnection() {
  console.log('🔍 Testing Google Sheets API connection...\n');

  try {
    const sheets = google.sheets({ 
      version: 'v4', 
      auth: process.env.GOOGLE_API_KEY 
    });

    // Try to get spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID
    });

    console.log('✅ Successfully connected to Google Sheets!');
    console.log(`📊 Spreadsheet: "${response.data.properties.title}"`);
    console.log(`📝 Sheets found:`);
    
    response.data.sheets.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.properties.title}`);
    });

    console.log(`\n🔗 URL: https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}`);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Login Required')) {
      console.log('\n🔧 Solution: Make the spreadsheet public');
      console.log('1. Click "Share" in your Google Sheet');
      console.log('2. Change to "Anyone with the link"');  
      console.log('3. Set permission to "Editor"');
      console.log('4. Try again');
    } else if (error.message.includes('API key not valid')) {
      console.log('\n🔧 Solution: Check your Google API key');
      console.log('1. Ensure Sheets API is enabled in Google Cloud Console');
      console.log('2. Verify GOOGLE_API_KEY in .env file');
    }
  }
}

testConnection();