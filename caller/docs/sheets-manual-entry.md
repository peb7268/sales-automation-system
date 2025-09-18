# Manual Google Sheets Entry Guide

Since API keys cannot write to Google Sheets, here's how to manually enter data while we work on OAuth2 integration:

## Call Log Entry Format

Add new calls to the **Call Log** sheet with these values:

### Sample Entry:
```
Call ID: CALL_20250825_001
Date: 2025-08-25
Time: 2:30 PM
Prospect Name: John Smith
Company: ABC Restaurant
Phone Number: +15551234567
Industry: Restaurant
Call Duration (min): 3.5
Call Status: Connected
Qualification Score: 8
Interest Level: High
Next Action: Schedule Meeting
Notes: Very interested in marketing services. Asked about pricing.
Meeting Booked: Yes
Recording URL: https://vapi.ai/recording/abc123
```

## Daily Summary Entry

At the end of each day, add to **Daily Summary** sheet:

### Sample Entry:
```
Date: 2025-08-25
Total Calls: 25
Successful Connections: 18
Qualified Prospects: 8
Meetings Booked: 3
Connection Rate %: 72%
Qualification Rate %: 44%
Booking Rate %: 38%
Total Call Time (min): 85.5
Notes: Strong day for restaurant industry
```

## Qualified Leads Entry

For each qualified prospect, add to **Qualified Leads** sheet:

### Sample Entry:
```
Lead ID: LEAD_20250825_001
Date Qualified: 2025-08-25
Prospect Name: John Smith
Company: ABC Restaurant
Phone Number: +15551234567
Email: john@abcrestaurant.com
Industry: Restaurant
Qualification Score: 8
Interest Level: High
Meeting Scheduled: Yes
Linear Project Created: No
Status: Meeting Set
```

## Call Status Options:
- Connected
- Voicemail
- No Answer
- Busy
- Disconnected
- Invalid Number

## Interest Level Options:
- High
- Medium  
- Low
- None
- Hostile

## Next Action Options:
- Schedule Meeting
- Send Follow-up SMS
- Email Info
- Call Back Later
- Remove from List

## Lead Status Options:
- New
- Contacted
- Meeting Set
- Proposal Sent
- Won
- Lost

## Quick Tips:
1. Use consistent date format: YYYY-MM-DD
2. Score qualification 1-10 (7+ = qualified)
3. Use Yes/No for boolean fields
4. Keep notes concise but detailed
5. Update Linear Project Created when you create projects

The read-only integration can still analyze your manually entered data for reporting and statistics!