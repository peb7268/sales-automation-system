#!/usr/bin/env node

/**
 * Setup script to create and configure Google Sheets for call tracking
 * Run: node scripts/setup-sheets.js
 */

const GoogleSheetsIntegration = require('../integrations/google-sheets');
require('dotenv').config({ path: '../../.env' });

async function setupGoogleSheets() {
  console.log('🚀 Setting up Google Sheets for Automated Sales Caller...\n');

  try {
    // Initialize Google Sheets integration
    const sheetsIntegration = new GoogleSheetsIntegration();
    
    // Create the tracking spreadsheet
    console.log('📊 Creating call tracking spreadsheet...');
    const result = await sheetsIntegration.createCallTrackingSpreadsheet();
    
    console.log('\n✅ Google Sheets setup complete!');
    console.log(`📋 Spreadsheet ID: ${result.spreadsheetId}`);
    console.log(`🔗 Spreadsheet URL: ${result.url}`);
    
    // Update .env file with spreadsheet ID
    console.log('\n📝 Update your .env file with:');
    console.log(`GOOGLE_SHEETS_ID="${result.spreadsheetId}"`);
    
    // Test the integration
    console.log('\n🧪 Testing integration...');
    await testIntegration(sheetsIntegration);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure Google API credentials are properly configured');
    console.error('2. Verify service account has Sheets and Drive permissions');
    console.error('3. Check that GOOGLE_API_KEY is set in .env file');
    process.exit(1);
  }
}

async function testIntegration(sheetsIntegration) {
  try {
    // Test logging a sample call
    const testCallData = {
      callId: 'TEST_001',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      prospectName: 'Test Prospect',
      company: 'Test Company',
      phoneNumber: '+15551234567',
      industry: 'Testing',
      duration: 2.5,
      status: 'Connected',
      qualificationScore: 8,
      interestLevel: 'High',
      nextAction: 'Schedule Meeting',
      notes: 'Test call logged via setup script',
      meetingBooked: true,
      recordingUrl: 'https://example.com/recording'
    };

    await sheetsIntegration.logCall(testCallData);
    
    // Test daily summary
    const testSummary = {
      date: new Date().toISOString().split('T')[0],
      totalCalls: 1,
      successfulConnections: 1,
      qualifiedProspects: 1,
      meetingsBooked: 1,
      connectionRate: 100,
      qualificationRate: 100,
      bookingRate: 100,
      totalCallTime: 2.5,
      notes: 'Test summary from setup script'
    };

    await sheetsIntegration.updateDailySummary(testSummary);

    // Test qualified lead tracking
    const testLead = {
      leadId: 'LEAD_001',
      dateQualified: new Date().toISOString().split('T')[0],
      prospectName: 'Test Prospect',
      company: 'Test Company',
      phoneNumber: '+15551234567',
      email: 'test@example.com',
      industry: 'Testing',
      qualificationScore: 8,
      interestLevel: 'High',
      meetingScheduled: true,
      linearProjectCreated: false,
      status: 'Meeting Set'
    };

    await sheetsIntegration.addQualifiedLead(testLead);
    
    console.log('✅ All tests passed! Integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupGoogleSheets()
    .then(() => {
      console.log('\n🎉 Setup completed successfully!');
      console.log('You can now use the Google Sheets integration in your automated sales caller.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupGoogleSheets };