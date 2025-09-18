# Manual Google Sheets Setup Guide

Since the automated creation requires OAuth2 authentication, let's create the tracking spreadsheet manually:

## Step 1: Create New Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create" → "Blank spreadsheet"
3. Name it: **"Automated Sales Caller - Call Tracking"**

## Step 2: Set Up Call Log Sheet

**Rename first sheet to:** `Call Log`

**Add these headers in row 1:**
```
A1: Call ID
B1: Date
C1: Time
D1: Prospect Name
E1: Company
F1: Phone Number
G1: Industry
H1: Call Duration (min)
I1: Call Status
J1: Qualification Score
K1: Interest Level
L1: Next Action
M1: Notes
N1: Meeting Booked
O1: Recording URL
```

## Step 3: Create Daily Summary Sheet

1. Add new sheet (+ icon at bottom)
2. Name it: `Daily Summary`
3. Add these headers:

```
A1: Date
B1: Total Calls
C1: Successful Connections
D1: Qualified Prospects
E1: Meetings Booked
F1: Connection Rate %
G1: Qualification Rate %
H1: Booking Rate %
I1: Total Call Time (min)
J1: Notes
```

## Step 4: Create Qualified Leads Sheet

1. Add another sheet: `Qualified Leads`
2. Add these headers:

```
A1: Lead ID
B1: Date Qualified
C1: Prospect Name
D1: Company
E1: Phone Number
F1: Email
G1: Industry
H1: Qualification Score
I1: Interest Level
J1: Meeting Scheduled
K1: Linear Project Created
L1: Status
```

## Step 5: Get Spreadsheet ID

1. Look at the URL of your spreadsheet
2. Copy the ID from the URL (between `/d/` and `/edit`)
   
   Example: `https://docs.google.com/spreadsheets/d/`**1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms**`/edit`
   
   The ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 6: Update Environment

Add the spreadsheet ID to your `.env` file:

```env
GOOGLE_SHEETS_ID="your_spreadsheet_id_here"
```

## Step 7: Test Integration

Once set up, run:
```bash
npm run test:sheets
```

This approach lets you use the Google Sheets integration without complex OAuth2 setup.