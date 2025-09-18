# 🚀 Sales Automation System - Quick Start Guide

This guide will help you set up and run the automated agentic sales team system, including integration with Obsidian for pipeline management and prospect tracking.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [API Key Configuration](#api-key-configuration)
4. [Obsidian Setup](#obsidian-setup)
5. [Running the System](#running-the-system)
6. [Development Mode](#development-mode)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Obsidian** (latest version)
- **Git** (for version control)

## 💻 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sales-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## 🔑 API Key Configuration

The system requires several API keys for full functionality. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### Required API Keys

#### 1. Google Maps API Key
- **Purpose:** Business discovery and location data
- **How to obtain:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing one
  3. Enable the Places API and Geocoding API
  4. Create credentials (API Key)
  5. Restrict the key to your domain/IP for security

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### 2. Firecrawl API Key (Optional)
- **Purpose:** Website analysis and competitive intelligence
- **How to obtain:**
  1. Visit [Firecrawl.dev](https://firecrawl.dev)
  2. Sign up for an account
  3. Get your API key from the dashboard

```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

#### 3. Perplexity API Key (Optional)
- **Purpose:** Market intelligence and competitor analysis
- **How to obtain:**
  1. Visit [Perplexity AI](https://www.perplexity.ai/)
  2. Sign up for API access
  3. Generate an API key

```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

#### 4. Anthropic Claude API Key (Optional)
- **Purpose:** AI-powered content generation
- **How to obtain:**
  1. Visit [Anthropic Console](https://console.anthropic.com/)
  2. Create an account and add billing
  3. Generate an API key

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### 5. Obsidian Vault Path
- **Purpose:** Integration with your Obsidian vault
- **Setup:** Set the absolute path to your Obsidian vault

```env
OBSIDIAN_VAULT_PATH=/absolute/path/to/your/obsidian/vault
```

### Optional API Keys

These are optional but provide enhanced functionality:

```env
# Yellow Pages API (if available)
YELLOW_PAGES_API_KEY=your_yellow_pages_api_key_here

# SendGrid for email automation
SENDGRID_API_KEY=your_sendgrid_api_key_here

# FreshBooks for billing integration
FRESHBOOKS_API_KEY=your_freshbooks_api_key_here

# Linear for project management
LINEAR_API_KEY=your_linear_api_key_here

# Logging level
LOG_LEVEL=info
```

## 📖 Obsidian Setup

### 1. Install Required Plugins

Install these Obsidian community plugins:

- **Kanban** - For pipeline visualization
- **Dataview** - For dynamic prospect lists and analytics
- **Templater** - For automated prospect profile creation
- **Charts** - For analytics visualization (optional)

### 2. Vault Structure

The system will create this structure in your Obsidian vault:

```
your-vault/
├── prospects/                    # Prospect profiles organized by location
│   ├── Denver-CO/
│   ├── Colorado Springs-CO/
│   └── ...
├── campaigns/                    # Marketing campaign notes
├── templates/                    # Prospect and campaign templates
│   ├── prospect-profile.md
│   ├── campaign-template.md
│   └── activity-template.md
├── dashboards/                   # Analytics and reporting
│   ├── sales-dashboard.md
│   ├── pipeline-health.md
│   └── performance-metrics.md
└── Daily Notes/                  # Daily prospect activities
    ├── 2024-01-15.md
    └── ...
```

### 3. Configure Obsidian Settings

1. **Enable Daily Notes:** Go to Settings → Core plugins → Daily notes (Enable)
2. **Set Daily Notes Template:** Point to `templates/daily-note.md`
3. **Configure Dataview:** Settings → Community plugins → Dataview → Enable JavaScript

## 🏃 Running the System

### 1. Basic Prospecting

Run the prospecting agent to find and qualify new prospects:

```bash
# Basic usage - Denver restaurants within 25 miles
npm run prospect -- --city="Denver" --state="CO" --radius=25 --industry="restaurants"

# With verbose output
npm run prospect -- --city="Denver" --state="CO" --radius=25 --industry="restaurants" --verbose

# Multiple industries
npm run prospect -- --city="Boulder" --state="CO" --radius=15 --industry="professional_services"

# Save results to file
npm run prospect -- --city="Denver" --state="CO" --radius=25 --output="results.json" --format="json"
```

### 2. Generate Pitches

Create personalized sales pitches for qualified prospects:

```bash
# Generate pitches for all qualified prospects
npm run pitches:generate

# Generate pitches with verbose logging
npm run pitches:verbose

# Generate pitches for specific prospects
npm run generate-pitches -- --prospect="prospect-id" --verbose
```

### 3. Sync with Obsidian

Update your Obsidian vault with the latest prospect data:

```bash
# Sync all prospect data to Obsidian
npm run kanban:sync

# Generate analytics dashboard
npm run analytics:update

# Create clean dashboard
npm run clean-dashboard
```

### 4. Start the Full System

To run the complete automated sales pipeline:

```bash
# Start all agents
npm run agents:start

# Check pipeline status
npm run pipeline:status

# Stop all agents
npm run agents:stop
```

## 🛠️ Development Mode

### Running in Development

```bash
# Start with hot reload
npm run dev

# Watch mode for TypeScript compilation
npm run build:watch

# Run specific development tasks
npm run test:watch
```

### Environment Variables for Development

Add these to your `.env` for development:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Build the project:** `npm run build`
3. **Test your changes:** `npm run test`
4. **Run the system:** `npm run prospect -- --city="Denver" --state="CO" --radius=10 --verbose`

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- prospect-validation.test.ts
```

### Test the Prospecting Agent

```bash
# Test with mock data (no API keys required)
npm run prospect -- --city="Denver" --state="CO" --radius=10 --industry="restaurants" --verbose

# Test with real APIs (requires API keys)
GOOGLE_MAPS_API_KEY=your_key npm run prospect -- --city="Denver" --state="CO" --radius=25 --industry="restaurants"
```

### Validate Configuration

```bash
# Check that all integrations are properly configured
npm run setup

# Test Obsidian integration
npm run setup:obsidian

# Test analytics integration
npm run analytics:test
```

## 📊 Understanding the Output

### Prospecting Results

When you run the prospecting agent, you'll see:

```
🎯 Prospecting Results

📍 Location: Denver, CO (25 mile radius)
⏱️  Processing Time: 2.34s
🏢 Total Businesses Found: 15
✅ Qualified Prospects: 8
🔄 Duplicates Removed: 2

📊 API Usage:
  • Google Maps: 3 calls
  • Yellow Pages: 2 calls
  • Firecrawl: 5 calls
  • Perplexity: 1 calls

🏆 Top Qualified Prospects:

1. Mile High Marketing Agency
   Score: 87/100
   Industry: professional_services
   Location: Denver, CO
   Contact: (303) 555-0123 | info@milehighmarketing.com
   Website: https://milehighmarketing.com
```

### Qualification Scoring

The system scores prospects on a 0-100 scale based on:

- **Business Size (0-20 points):** Employee count and revenue indicators
- **Digital Presence (0-25 points):** Website quality, SEO, social media
- **Location (0-15 points):** Proximity to target areas
- **Industry (0-10 points):** Industry fit and market potential
- **Revenue Indicators (0-10 points):** Financial health signals
- **Competitor Gaps (0-20 points):** Opportunities identified

### Obsidian Integration

After running prospecting, check your Obsidian vault for:

1. **New prospect profiles** in `prospects/[City-State]/`
2. **Updated daily note** with today's prospecting activity
3. **Analytics dashboard** with updated metrics
4. **Kanban board** with new prospects in the pipeline

## 🔧 Troubleshooting

### Common Issues

#### 1. "API key not found" errors
- **Solution:** Ensure your `.env` file is in the root directory with proper API keys
- **Fallback:** The system will use mock data when API keys are missing

#### 2. "Obsidian vault not found"
- **Solution:** Check that `OBSIDIAN_VAULT_PATH` in `.env` points to the correct absolute path
- **Verify:** Make sure the path exists and is accessible

#### 3. No prospects found
- **Causes:** 
  - Radius too small
  - Industry not matching available businesses
  - Strict qualification criteria
- **Solutions:**
  - Increase search radius: `--radius=50`
  - Try different industries: `--industry="professional_services"`
  - Check logs with `--verbose` flag

#### 4. TypeScript compilation errors
```bash
# Clean and rebuild
npm run clean
npm run build

# Check for type errors
npm run type-check
```

#### 5. Permission errors with Obsidian
- **Solution:** Ensure the Node.js process has read/write access to your Obsidian vault directory
- **macOS/Linux:** `chmod -R 755 /path/to/obsidian/vault`

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
LOG_LEVEL=debug npm run prospect -- --city="Denver" --state="CO" --radius=25 --verbose
```

### Getting Help

If you encounter issues:

1. **Check the logs** in `logs/system/combined.log`
2. **Run with debug logging** using `LOG_LEVEL=debug`
3. **Verify your configuration** with `npm run setup`
4. **Test individual components** using the test commands above

## 🎯 Next Steps

Once you have the system running:

1. **Customize the qualification criteria** in `config/agents/prospecting.json`
2. **Add your own business categories** to target
3. **Create custom Obsidian templates** for your workflow
4. **Set up automated scheduling** using cron jobs or task schedulers
5. **Integrate with your CRM** using the API endpoints

## 📚 Additional Resources

- **Configuration Guide:** `docs/CONFIGURATION.md`
- **API Documentation:** `docs/API.md`
- **Obsidian Integration:** `docs/OBSIDIAN_SETUP.md`
- **Contributing:** `CONTRIBUTING.md`

---

🎉 **Congratulations!** You now have a fully automated sales prospecting system integrated with Obsidian for pipeline management. The system will help you identify, qualify, and track prospects while maintaining detailed records in your Obsidian vault.

For questions or support, please check the documentation or open an issue in the repository.