#!/usr/bin/env node

const { google } = require('googleapis');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

async function testWrite() {
  console.log('✍️ Testing direct write to Google Sheets...\n');

  try {
    const sheets = google.sheets({ 
      version: 'v4', 
      auth: process.env.GOOGLE_API_KEY 
    });

    // Try to write a simple test value
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Call Log!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [['Test Write']]
      }
    });

    console.log('✅ Successfully wrote to Google Sheet!');
    console.log('📝 Updated cells:', response.data.updatedCells);

  } catch (error) {
    console.error('❌ Write failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('Login Required')) {
      console.log('\n🔧 This suggests the sheet is not properly shared or the API key lacks permissions');
    }
  }
}

testWrite();