/**
 * Google Sheets Integration for Automated Sales Caller
 * Handles call tracking, logging, and results management
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

class GoogleSheetsIntegration {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.init();
  }

  async init() {
    try {
      // Initialize Google Sheets API with API key
      this.sheets = google.sheets({ 
        version: 'v4', 
        auth: process.env.GOOGLE_API_KEY 
      });

      console.log('✅ Google Sheets API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error.message);
      throw error;
    }
  }

  /**
   * Create the call tracking spreadsheet with proper headers and formatting
   */
  async createCallTrackingSpreadsheet() {
    try {
      const spreadsheet = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: 'Automated Sales Caller - Call Tracking'
          },
          sheets: [
            {
              properties: {
                title: 'Call Log',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 15
                }
              }
            },
            {
              properties: {
                title: 'Daily Summary',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10
                }
              }
            },
            {
              properties: {
                title: 'Qualified Leads',
                gridProperties: {
                  rowCount: 500,
                  columnCount: 12
                }
              }
            }
          ]
        }
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      console.log(`✅ Created spreadsheet: ${spreadsheet.data.spreadsheetUrl}`);

      // Set up headers and formatting
      await this.setupCallLogHeaders(spreadsheetId);
      await this.setupDailySummaryHeaders(spreadsheetId);
      await this.setupQualifiedLeadsHeaders(spreadsheetId);

      return {
        spreadsheetId,
        url: spreadsheet.data.spreadsheetUrl
      };
    } catch (error) {
      console.error('❌ Failed to create spreadsheet:', error.message);
      throw error;
    }
  }

  /**
   * Set up Call Log sheet headers and formatting
   */
  async setupCallLogHeaders(spreadsheetId) {
    const headers = [
      'Call ID',
      'Date',
      'Time',
      'Prospect Name',
      'Company',
      'Phone Number',
      'Industry',
      'Call Duration (min)',
      'Call Status',
      'Qualification Score',
      'Interest Level',
      'Next Action',
      'Notes',
      'Meeting Booked',
      'Recording URL'
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Call Log!A1:O1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });

    // Format header row
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 15
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });
  }

  /**
   * Set up Daily Summary sheet headers
   */
  async setupDailySummaryHeaders(spreadsheetId) {
    const headers = [
      'Date',
      'Total Calls',
      'Successful Connections',
      'Qualified Prospects',
      'Meetings Booked',
      'Connection Rate %',
      'Qualification Rate %',
      'Booking Rate %',
      'Total Call Time (min)',
      'Notes'
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Daily Summary!A1:J1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });
  }

  /**
   * Set up Qualified Leads sheet headers
   */
  async setupQualifiedLeadsHeaders(spreadsheetId) {
    const headers = [
      'Lead ID',
      'Date Qualified',
      'Prospect Name',
      'Company',
      'Phone Number',
      'Email',
      'Industry',
      'Qualification Score',
      'Interest Level',
      'Meeting Scheduled',
      'Linear Project Created',
      'Status'
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Qualified Leads!A1:L1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });
  }

  /**
   * Log a new call to the Call Log sheet
   */
  async logCall(callData) {
    try {
      const row = [
        callData.callId,
        callData.date,
        callData.time,
        callData.prospectName,
        callData.company,
        callData.phoneNumber,
        callData.industry,
        callData.duration,
        callData.status,
        callData.qualificationScore || '',
        callData.interestLevel || '',
        callData.nextAction || '',
        callData.notes || '',
        callData.meetingBooked ? 'Yes' : 'No',
        callData.recordingUrl || ''
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Call Log!A:O',
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });

      console.log(`✅ Logged call for ${callData.prospectName}`);
    } catch (error) {
      console.error('❌ Failed to log call:', error.message);
      throw error;
    }
  }

  /**
   * Update daily summary statistics
   */
  async updateDailySummary(summaryData) {
    try {
      const row = [
        summaryData.date,
        summaryData.totalCalls,
        summaryData.successfulConnections,
        summaryData.qualifiedProspects,
        summaryData.meetingsBooked,
        summaryData.connectionRate,
        summaryData.qualificationRate,
        summaryData.bookingRate,
        summaryData.totalCallTime,
        summaryData.notes || ''
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Daily Summary!A:J',
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });

      console.log(`✅ Updated daily summary for ${summaryData.date}`);
    } catch (error) {
      console.error('❌ Failed to update daily summary:', error.message);
      throw error;
    }
  }

  /**
   * Add qualified lead to tracking
   */
  async addQualifiedLead(leadData) {
    try {
      const row = [
        leadData.leadId,
        leadData.dateQualified,
        leadData.prospectName,
        leadData.company,
        leadData.phoneNumber,
        leadData.email,
        leadData.industry,
        leadData.qualificationScore,
        leadData.interestLevel,
        leadData.meetingScheduled ? 'Yes' : 'No',
        leadData.linearProjectCreated ? 'Yes' : 'No',
        leadData.status
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Qualified Leads!A:L',
        valueInputOption: 'RAW',
        resource: {
          values: [row]
        }
      });

      console.log(`✅ Added qualified lead: ${leadData.prospectName}`);
    } catch (error) {
      console.error('❌ Failed to add qualified lead:', error.message);
      throw error;
    }
  }

  /**
   * Get call statistics for a date range
   */
  async getCallStatistics(startDate, endDate) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Call Log!A:O'
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return { totalCalls: 0, qualifiedCalls: 0, meetingsBooked: 0 };
      }

      // Filter by date range and calculate statistics
      const filteredCalls = rows.slice(1).filter(row => {
        const callDate = new Date(row[1]);
        return callDate >= new Date(startDate) && callDate <= new Date(endDate);
      });

      const stats = {
        totalCalls: filteredCalls.length,
        qualifiedCalls: filteredCalls.filter(row => row[9] && parseFloat(row[9]) >= 7).length,
        meetingsBooked: filteredCalls.filter(row => row[13] === 'Yes').length,
        averageDuration: filteredCalls.reduce((acc, row) => acc + (parseFloat(row[7]) || 0), 0) / filteredCalls.length
      };

      return stats;
    } catch (error) {
      console.error('❌ Failed to get call statistics:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleSheetsIntegration;