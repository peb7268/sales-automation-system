/**
 * Google Sheets Read-Only Integration for Automated Sales Caller
 * This version can read data but cannot write (API key limitation)
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

class GoogleSheetsReadOnly {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.init();
  }

  async init() {
    try {
      this.sheets = google.sheets({ 
        version: 'v4', 
        auth: process.env.GOOGLE_API_KEY 
      });
      console.log('✅ Google Sheets API (read-only) initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error.message);
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
        averageDuration: filteredCalls.reduce((acc, row) => acc + (parseFloat(row[7]) || 0), 0) / filteredCalls.length || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Failed to get call statistics:', error.message);
      throw error;
    }
  }

  /**
   * Get all call data
   */
  async getAllCalls() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Call Log!A:O'
      });

      return response.data.values || [];
    } catch (error) {
      console.error('❌ Failed to get call data:', error.message);
      throw error;
    }
  }

  /**
   * Get daily summaries
   */
  async getDailySummaries() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Daily Summary!A:J'
      });

      return response.data.values || [];
    } catch (error) {
      console.error('❌ Failed to get daily summaries:', error.message);
      throw error;
    }
  }

  /**
   * Get qualified leads
   */
  async getQualifiedLeads() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Qualified Leads!A:L'
      });

      return response.data.values || [];
    } catch (error) {
      console.error('❌ Failed to get qualified leads:', error.message);
      throw error;
    }
  }
}

module.exports = GoogleSheetsReadOnly;