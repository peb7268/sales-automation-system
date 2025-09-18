# API Setup Guide for MHM Sales Automation

This guide provides step-by-step instructions for obtaining and configuring all required API keys for the MHM Sales Automation multi-pass prospecting system.

## Overview

The prospecting agent uses a 4-pass data collection system that requires several APIs:

- **Pass 1**: Google Maps Places API - Business discovery and location data
- **Pass 2**: Firecrawl API - Web search verification and website analysis  
- **Pass 3**: Google Maps Places API - Reviews and insights analysis
- **Pass 4**: Additional sources (Yellow Pages, Perplexity, website scraping)

## Required API Keys

### 1. Google Maps Platform API Key (REQUIRED)

**Purpose**: Business discovery, location data, reviews analysis  
**Cost**: Free tier available (limited requests), then pay-per-use  
**Criticality**: High - Core functionality for business data extraction

#### Step-by-Step Setup:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Name: "MHM Sales Automation" (or your preferred name)
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - **Places API** (required for business search)
     - **Geocoding API** (required for location conversion)
     - **Maps JavaScript API** (optional, for map displays)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Secure Your API Key (IMPORTANT)**
   - Click "Restrict Key" on your new API key
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose: Places API, Geocoding API
   - Under "Application restrictions":
     - Select "IP addresses" or "HTTP referrers" as needed
     - Add your development/server IPs

6. **Add to Environment File**
   ```bash
   # Add to .env file
   GOOGLE_MAPS_API_KEY="AIzaSy..."  # Your new Google Maps API key
   ```

#### Pricing Information:
- **Free Tier**: $200 credit per month (approximately 28,500 Places API calls)
- **Places Nearby Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests
- **Geocoding**: $5 per 1,000 requests

**Setup Verification**:
```bash
# Test your key works:
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=39.7392,-104.9903&radius=1000&keyword=restaurant&key=YOUR_API_KEY"
```

### 2. Firecrawl API Key (REQUIRED)

**Purpose**: Web search verification, website analysis, content extraction  
**Cost**: Free tier available, then subscription-based  
**Criticality**: High - Essential for data verification and augmentation

#### Step-by-Step Setup:

1. **Visit Firecrawl Website**
   - Go to: https://firecrawl.dev/

2. **Sign Up for Account**
   - Click "Get Started" or "Sign Up"
   - Use your business email
   - Verify your email address

3. **Access Dashboard**
   - Log in to your Firecrawl dashboard
   - Navigate to "API Keys" section

4. **Generate API Key**
   - Click "Create New API Key"
   - Name: "MHM Sales Automation"
   - Copy the generated key (starts with "fc-")

5. **Add to Environment File**
   ```bash
   # Add to .env file
   FIRECRAWL_API_KEY="fc-..."  # Your Firecrawl API key
   ```

#### Pricing Information:
- **Free Tier**: 500 credits per month
- **Starter Plan**: $29/month (2,000 credits)
- **Growth Plan**: $99/month (10,000 credits)
- **1 Credit**: Typically 1 page scrape or search

**Setup Verification**:
```bash
# Test your key works:
curl -X POST "https://api.firecrawl.dev/v0/scrape" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"url": "https://example.com"}'
```

### 3. Perplexity API Key (OPTIONAL)

**Purpose**: AI-powered business intelligence and research  
**Cost**: Free tier available, then subscription  
**Criticality**: Medium - Enhances data quality but not essential

#### Step-by-Step Setup:

1. **Visit Perplexity API**
   - Go to: https://www.perplexity.ai/settings/api

2. **Create Account**
   - Sign up with your business email
   - Verify your account

3. **Generate API Key**
   - Navigate to API settings
   - Click "Create API Key"
   - Copy the key (starts with "pplx-")

4. **Add to Environment File**
   ```bash
   # Add to .env file
   PERPLEXITY_API_KEY="pplx-..."  # Your Perplexity API key
   ```

#### Pricing Information:
- **Free Tier**: Limited requests per month
- **Pro Plan**: $20/month for higher limits

### 4. Yellow Pages API Key (OPTIONAL)

**Purpose**: Additional business directory data  
**Cost**: Varies by provider  
**Criticality**: Low - Supplementary data source

#### Available Providers:

**Option A: YellowPages.com API**
- Contact: https://corporate.yp.com/advertising-solutions/
- Typically requires business account

**Option B: Alternative Business Directory APIs**
- **Yelp Fusion API**: https://www.yelp.com/developers
- **Foursquare Places API**: https://developer.foursquare.com/
- **SerpAPI**: https://serpapi.com/ (scrapes Yellow Pages)

## Environment Configuration

After obtaining your API keys, update your `.env` file:

```bash
# Core APIs (Required for full functionality)
GOOGLE_MAPS_API_KEY="AIzaSy..."     # Google Maps Platform API key
FIRECRAWL_API_KEY="fc-..."          # Firecrawl API key

# Optional APIs (Enhance data quality)
PERPLEXITY_API_KEY="pplx-..."       # Perplexity AI API key
YELLOW_PAGES_API_KEY="yp-..."       # Yellow Pages or alternative

# Existing APIs (Already configured)
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-proj-..."
```

## Testing Your Setup

Run the prospect command to test all APIs:

```bash
npm run add-prospect "test restaurant"
```

Expected output with proper API keys:
- ✅ Google Maps API: Should find business data
- ✅ Firecrawl API: Should verify and augment data
- ✅ High confidence scores (70%+)
- ✅ Complete contact information

## Troubleshooting Common Issues

### Google Maps API Issues

**Problem**: "REQUEST_DENIED" error
**Solution**: 
- Ensure you're using Google Maps Platform API key, not Gemini AI key
- Verify Places API is enabled in Google Cloud Console
- Check API key restrictions aren't too strict

**Problem**: "OVER_QUERY_LIMIT" error
**Solution**:
- Check your Google Cloud billing account
- Monitor usage in Google Cloud Console
- Consider upgrading your quota

### Firecrawl API Issues

**Problem**: "Unauthorized: Token missing"
**Solution**:
- Verify API key format starts with "fc-"
- Check for extra spaces in .env file
- Ensure key is active in Firecrawl dashboard

**Problem**: Rate limiting errors
**Solution**:
- Monitor your Firecrawl credit usage
- Implement delays between requests
- Consider upgrading your plan

### General API Issues

**Problem**: APIs show as "available" but don't work
**Solution**:
- Restart the application after updating .env
- Check .env file syntax (no spaces around =)
- Verify environment variables are loaded correctly

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Restrict API key permissions**
   - Google Maps: Restrict to only needed APIs
   - Use IP restrictions where possible

3. **Monitor API usage**
   - Set up billing alerts
   - Regular review of API usage
   - Implement rate limiting in your code

4. **Rotate API keys regularly**
   - Generate new keys quarterly
   - Revoke old keys after migration

## Cost Optimization Tips

1. **Cache API results** when possible
2. **Implement smart fallbacks** to reduce API calls
3. **Use batch requests** where supported
4. **Monitor usage patterns** and optimize queries
5. **Set billing alerts** to avoid unexpected charges

## Support Resources

- **Google Maps Platform Support**: https://developers.google.com/maps/support
- **Firecrawl Documentation**: https://docs.firecrawl.dev/
- **Perplexity API Docs**: https://docs.perplexity.ai/
- **MHM Sales Automation Issues**: Create GitHub issue in project repository

---

**Last Updated**: August 2025  
**Version**: 1.0  
**Maintainer**: MHM Development Team