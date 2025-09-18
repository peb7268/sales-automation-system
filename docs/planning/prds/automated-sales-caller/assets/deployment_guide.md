# Sales Caller v2 - Deployment Guide

## Quick Start (Next Steps)

### Phase 1 Complete ✅
- All sample assets created
- Environment configuration prepared
- Testing scripts ready
- Documentation updated

### Phase 2: Integration (20 minutes)

#### Step 1: Google Drive Setup (5 min)
1. Access: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing
2. Upload `sales_script.txt` to the folder
3. Upload `sales_pipeline.csv` to the folder
4. Create `call_logs/` subfolder

#### Step 2: Make.com Configuration (30 min)
**Important**: Manual setup required - JSON blueprint import not supported

1. **Follow Manual Setup Guide**: [makecom_manual_setup.md](./makecom_manual_setup.md)
2. **Create new scenario** in Make.com named "Sales Caller v2"
3. **Add 11 modules** following the detailed module-by-module instructions
4. **Key Configuration Points**:
   - Google Sheets ID: **1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys**
   - Sheet Name: "Sheet1"
   - Webhook URL: https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx
   - Upload sales_script.txt to Google Drive and get file ID
5. **Test each module** individually before running full scenario

#### Step 3: Test Webhook (5 min)
```bash
# Copy your Make.com API key
./test_webhook.sh YOUR_MAKECOM_API_KEY

# Verify webhook responses in Make.com dashboard
# Check Google Sheets for test data updates
```

### Phase 3: Production Testing (30 minutes)

#### Step 1: Vapi AI Setup (15 min)
1. Create Vapi account: https://vapi.ai
2. Create assistant with OpenAI GPT-4
3. Configure ElevenLabs voice (Sarah)
4. Test with sample payload from `vapi_request_sample.json`

#### Step 2: End-to-End Test (10 min)
1. Add test lead to pipeline CSV
2. Trigger Make.com scenario
3. Monitor call initiation in Vapi dashboard
4. Verify webhook callback updates pipeline

#### Step 3: Production Deployment (5 min)
1. Set TEST_MODE=false in environment
2. Add real prospects to pipeline
3. Enable Make.com scenario automation
4. Monitor first production calls

## File Locations

### Local Assets (Ready to Deploy)
```
/projects/sales/docs/planning/prds/automated-sales-caller/assets/
├── sales_script.txt          # Upload to Google Drive
├── sales_pipeline.csv        # ✅ Already in Google Sheets  
├── makecom_manual_setup.md   # Step-by-step Make.com setup
├── vapi_request_sample.json  # Reference for Vapi setup
├── environment.env           # Copy to .env
├── test_webhook.sh          # Run for testing
└── deployment_guide.md       # This file
```

### Google Drive Deployment
- **Folder**: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing
- **Google Sheets**: https://docs.google.com/spreadsheets/d/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/edit?usp=sharing ✅ **COMPLETED**
- **Upload Next**: sales_script.txt
- **Create**: call_logs/ subfolder

### Make.com Configuration
- **Webhook**: https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx
- **Setup Guide**: [makecom_manual_setup.md](./makecom_manual_setup.md)
- **Authentication**: x-make-apikey header
- **Modules Required**: 11 modules (Watch Rows → Download File → Text Replace → HTTP Request → Update Row → Webhook → Router → 4 Update Modules)

## Troubleshooting

### Common Issues
1. **Webhook 401 Error**: Check x-make-apikey header
2. **Google Drive Access**: Verify folder permissions
3. **Vapi Call Fails**: Check API key and assistant ID
4. **Pipeline Not Updating**: Verify Google Sheets connection

### Testing Commands
```bash
# Test webhook connectivity
curl -I https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx

# Test Google Drive access
curl "https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"

# Run full webhook test suite
./test_webhook.sh YOUR_API_KEY
```

### Support Resources
- Make.com Documentation: https://www.make.com/en/help
- Vapi AI Documentation: https://docs.vapi.ai
- Google Drive API: https://developers.google.com/drive

## Success Criteria

### Technical Validation
- [ ] Webhook responds with 200 status
- [ ] Google Sheets updates automatically
- [ ] Vapi calls initiate successfully
- [ ] Call outcomes route correctly

### Business Validation
- [ ] Script sounds natural in Vapi
- [ ] Qualification scoring works accurately
- [ ] Temperature assignments are logical
- [ ] Follow-up actions trigger properly

### Performance Targets
- [ ] <3 second call initiation
- [ ] >80% webhook success rate
- [ ] >90% data sync accuracy
- [ ] <100ms webhook response time

## Next Steps After Deployment

1. **Monitor First 10 Calls**: Verify quality and accuracy
2. **Refine Scripts**: Based on conversation outcomes
3. **Scale Gradually**: Increase daily call volume
4. **Add Analytics**: Create performance dashboard
5. **Team Training**: Onboard sales team on new qualified leads

## Emergency Procedures

### If Calls Fail
1. Check Vapi dashboard for errors
2. Verify Make.com scenario status
3. Test webhook with curl command
4. Fallback to manual calling queue

### If Data Sync Breaks
1. Check Google Sheets permissions
2. Verify Make.com Google integration
3. Manual update pipeline status
4. Export call logs from Vapi

The system is now ready for rapid deployment with all assets, configurations, and testing procedures in place!