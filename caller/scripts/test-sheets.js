#!/usr/bin/env node

/**
 * Test Google Sheets integration with existing spreadsheet
 * Run: npm run test:sheets
 */

const GoogleSheetsIntegration = require('../integrations/google-sheets');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

async function testSheetsIntegration() {
  console.log('🧪 Testing Google Sheets integration...\n');

  if (!process.env.GOOGLE_SHEETS_ID) {
    console.error('❌ GOOGLE_SHEETS_ID not found in .env file');
    console.log('📋 Please follow the manual setup guide: scripts/create-manual-sheet.md');
    process.exit(1);
  }

  try {
    const sheetsIntegration = new GoogleSheetsIntegration();
    
    console.log('📊 Testing call logging...');
    
    // Test call logging
    const testCall = {
      callId: `TEST_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      prospectName: 'John Smith',
      company: 'ABC Restaurant',
      phoneNumber: '+15551234567',
      industry: 'Restaurant',
      duration: 3.2,
      status: 'Connected',
      qualificationScore: 8,
      interestLevel: 'High',
      nextAction: 'Schedule Meeting',
      notes: 'Very interested in our services. Mentioned needing help with marketing campaigns.',
      meetingBooked: true,
      recordingUrl: 'https://recordings.vapi.ai/example'
    };

    await sheetsIntegration.logCall(testCall);
    console.log('✅ Call logged successfully');

    // Test daily summary
    console.log('📈 Testing daily summary...');
    const today = new Date().toISOString().split('T')[0];
    const summaryData = {
      date: today,
      totalCalls: 25,
      successfulConnections: 18,
      qualifiedProspects: 8,
      meetingsBooked: 3,
      connectionRate: '72%',
      qualificationRate: '44%',
      bookingRate: '38%',
      totalCallTime: 45.5,
      notes: 'Strong performance today. Restaurant industry showing high interest.'
    };

    await sheetsIntegration.updateDailySummary(summaryData);
    console.log('✅ Daily summary updated successfully');

    // Test qualified lead tracking
    console.log('🎯 Testing qualified lead tracking...');
    const qualifiedLead = {
      leadId: `LEAD_${Date.now()}`,
      dateQualified: today,
      prospectName: 'John Smith',
      company: 'ABC Restaurant',
      phoneNumber: '+15551234567',
      email: 'john@abcrestaurant.com',
      industry: 'Restaurant',
      qualificationScore: 8,
      interestLevel: 'High',
      meetingScheduled: true,
      linearProjectCreated: false,
      status: 'Meeting Set'
    };

    await sheetsIntegration.addQualifiedLead(qualifiedLead);
    console.log('✅ Qualified lead added successfully');

    // Test statistics retrieval
    console.log('📊 Testing statistics retrieval...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    const endDate = new Date();
    
    const stats = await sheetsIntegration.getCallStatistics(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    console.log('📈 Weekly Statistics:');
    console.log(`   Total Calls: ${stats.totalCalls}`);
    console.log(`   Qualified Calls: ${stats.qualifiedCalls}`);
    console.log(`   Meetings Booked: ${stats.meetingsBooked}`);
    console.log(`   Average Duration: ${stats.averageDuration?.toFixed(1) || 0} minutes`);

    console.log('\n🎉 All tests passed! Google Sheets integration is working correctly.');
    console.log(`🔗 View your spreadsheet: https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify GOOGLE_SHEETS_ID in .env is correct');
    console.log('2. Check that spreadsheet exists and is accessible');
    console.log('3. Ensure sheets are named: "Call Log", "Daily Summary", "Qualified Leads"');
    console.log('4. Verify Google API key has Sheets API enabled');
    process.exit(1);
  }
}

if (require.main === module) {
  testSheetsIntegration();
}

module.exports = { testSheetsIntegration };