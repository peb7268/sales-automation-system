# Pitch Creator Agent - AI-Generated Sales Pitches

The Pitch Creator Agent is an AI-powered system that analyzes prospect data and generates customized sales pitches tailored to each business's specific needs, industry, and digital presence gaps.

## 🎯 Overview

The agent reads prospect data from `index.md` files in the folder-based prospect structure and generates complete, customized pitch content in the corresponding `pitch.md` files. Each pitch is tailored based on:

- **Industry-specific messaging** and case studies
- **Digital presence analysis** and gap identification
- **Revenue-based ROI projections** and investment calculations
- **Qualification score-based calls-to-action**
- **Business size-appropriate** proof points and examples

## 🚀 Usage

### Generate Pitches for All Prospects

```bash
npm run generate-pitches -- --all
```

### Generate Pitch for Specific Prospect

```bash
npm run generate-pitches -- --prospect=demo-restaurant-denver
```

### Generate with Detailed Output

```bash
npm run generate-pitches -- --all --verbose
```

### Show Available Prospects

```bash
npm run generate-pitches
```

## 📊 Pitch Components

Each generated pitch includes:

### 1. **Opening Hook** 🎯
- Industry-specific attention grabber
- Personalized with contact name and company
- References specific business strengths or opportunities

### 2. **Value Proposition** 💎
- Builds on existing digital assets
- Addresses identified gaps (social media, website, reviews, etc.)
- Promises specific outcome timeframes

### 3. **Proof Points & Case Studies** 📊
- Industry-relevant success stories
- Business size-appropriate examples
- Specific metrics and results

### 4. **ROI Projection** 💰
- Investment breakdown (setup + monthly costs)
- Revenue increase projections based on business size
- Break-even timeline and ROI percentage
- Conservative estimates based on industry benchmarks

### 5. **Call to Action** 🚀
- Tailored based on qualification score:
  - **High scores (80+)**: Meeting request with specific availability
  - **Medium scores (60-80)**: Brief call to discuss fit
  - **Lower scores (<60)**: Case study offer with email/call option

## 🏗️ Technical Implementation

### Pitch Analysis Process

1. **Load Prospect Data**: Reads `index.md` frontmatter using `parseFrontmatter()`
2. **Analyze Digital Presence**: Evaluates gaps in website, social media, Google Business, reviews
3. **Generate Industry Content**: Selects appropriate hooks, case studies, and examples
4. **Calculate ROI**: Based on estimated revenue and business size category
5. **Format Output**: Creates structured markdown with frontmatter

### File Structure

```
prospects/prospect-folder/
├── index.md          # Prospect data (input)
└── pitch.md          # Generated pitch (output)
```

### Generated Pitch Frontmatter

```yaml
---
type: prospect-pitch
company: "Company Name"
industry: restaurants
created: "2025-07-31T15:13:03.676Z"
updated: "2025-07-31T15:13:03.676Z"
status: generated
pitch_version: 1.0
qualification_score: 85
tags: [sales, pitch, restaurants, ai-generated]
---
```

## 📈 Industry-Specific Features

### Restaurants
- Focus on online ordering, social media, review management
- Case studies about takeout increases and reservation boosts
- ROI calculations based on food service margins

### Retail
- Emphasis on online sales, foot traffic, omnichannel strategy
- Examples of e-commerce growth and physical store traffic
- ROI projections for retail-specific metrics

### Professional Services
- Lead generation, content marketing, local SEO focus
- Client acquisition and retention examples
- Service-based ROI calculations

### Healthcare
- Patient acquisition, online presence, reputation management
- Healthcare-compliant marketing examples
- Patient volume and revenue projections

## 🔄 Automation Integration

### Automatic Generation Triggers

- **New Prospect Creation**: Automatically creates pitch placeholder
- **Manual Generation**: Use commands to generate/regenerate pitches
- **Batch Processing**: Generate pitches for all prospects needing them

### Quality Control Features

- **Content Validation**: Ensures all required components are present
- **Data Consistency**: Maintains alignment with prospect profile data
- **Version Control**: Tracks pitch versions and update timestamps

## 🎛️ Customization Options

### ROI Calculation Variables

```typescript
// Investment levels by business size
const monthlyInvestment = {
  small: 800,    // Base monthly
  medium: 1200,  // Medium business
  large: 1800    // Enterprise
};

const setupCost = {
  small: 2500,   // Base setup
  medium: 3500,  // Medium setup  
  large: 5000    // Enterprise setup
};
```

### Industry Messaging

Each industry has customized:
- Opening hooks and attention grabbers
- Value propositions and benefit statements
- Proof points and case study examples
- Call-to-action approaches

## 📊 Performance Metrics

### Pitch Quality Indicators

- **Personalization Score**: How well the pitch addresses specific business needs
- **Industry Relevance**: Appropriateness of examples and case studies
- **ROI Accuracy**: Realistic financial projections based on business size
- **Action Clarity**: Clear and appropriate next steps

### Success Tracking

Monitor pitch effectiveness through:
- Response rates to pitched prospects
- Meeting conversion rates
- Closed deal attribution to specific pitch elements
- A/B testing of different pitch approaches

## 🔧 Technical Configuration

### Environment Variables

```bash
# Required for pitch generation
OBSIDIAN_VAULT_PATH="/Users/username/Documents/Main"
OBSIDIAN_PROSPECTS_PATH="/Users/username/Documents/Main/Projects/Sales/Prospects"
```

### Dependencies

- **Frontmatter Parser**: For reading prospect data
- **File System Access**: For reading index.md and writing pitch.md
- **Prospect Folder Manager**: For handling folder structure

## 🚀 Future Enhancements

### Planned Features

1. **A/B Testing Framework**: Test different pitch variations
2. **Industry Template Expansion**: More specialized industry approaches
3. **Dynamic Content Updates**: Auto-refresh pitches when prospect data changes
4. **Performance Analytics**: Track pitch effectiveness and optimize
5. **Integration with Outreach Tools**: Direct email/SMS sending
6. **Multi-Language Support**: Generate pitches in different languages

### Advanced Customization

- **Template System**: Custom pitch templates per industry
- **AI Model Configuration**: Different AI models for different industries
- **Dynamic Pricing**: ROI calculations based on market conditions
- **Competitive Analysis**: Include competitor-aware messaging

The Pitch Creator Agent transforms raw prospect data into compelling, personalized sales pitches that significantly improve conversion rates and reduce the time needed to craft effective outreach messages.