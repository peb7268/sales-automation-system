/**
 * Prospect Personalization Logic for Vapi AI Conversation Scripts
 * Dynamically customizes conversation based on prospect data
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

class ProspectPersonalizer {
  constructor() {
    this.baseScriptPath = path.join(__dirname, '../config/conversation-scripts/basic-sales-script.json');
    this.industryMappings = {
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'dining': 'restaurant',
      'cafe': 'restaurant',
      'retail': 'retail',
      'store': 'retail',
      'shop': 'retail',
      'boutique': 'retail',
      'healthcare': 'healthcare',
      'medical': 'healthcare',
      'dental': 'healthcare',
      'clinic': 'healthcare',
      'law': 'professional_services',
      'legal': 'professional_services',
      'accounting': 'professional_services',
      'consulting': 'professional_services',
      'insurance': 'professional_services'
    };
  }

  /**
   * Generate personalized conversation script for specific prospect
   */
  async personalizeScript(prospectData) {
    try {
      const baseScript = JSON.parse(fs.readFileSync(this.baseScriptPath, 'utf8'));
      
      // Create personalized copy
      const personalizedScript = JSON.parse(JSON.stringify(baseScript));
      
      // Determine industry category
      const industryCategory = this.mapIndustryCategory(prospectData.industry);
      
      // Personalize system prompt with prospect data
      personalizedScript.systemPrompt = this.personalizeSystemPrompt(
        baseScript.systemPrompt, 
        prospectData, 
        industryCategory
      );
      
      // Personalize first message
      personalizedScript.firstMessage = this.personalizeMessage(
        baseScript.firstMessage,
        prospectData
      );
      
      // Add industry-specific context if available
      if (baseScript.dynamicResponses[industryCategory]) {
        personalizedScript.industryContext = baseScript.dynamicResponses[industryCategory];
        
        // Personalize industry approach
        personalizedScript.industryContext.approach = this.personalizeMessage(
          personalizedScript.industryContext.approach,
          prospectData
        );
      }
      
      // Add conversation metadata
      personalizedScript.prospectMetadata = {
        prospectId: prospectData.prospectId,
        businessName: prospectData.businessName,
        industry: prospectData.industry,
        industryCategory: industryCategory,
        generatedAt: new Date().toISOString(),
        personalizedFields: this.getPersonalizedFields(prospectData)
      };
      
      return personalizedScript;
    } catch (error) {
      console.error('❌ Failed to personalize script:', error);
      throw error;
    }
  }

  /**
   * Map business industry to script category
   */
  mapIndustryCategory(industry) {
    if (!industry) return 'professional_services';
    
    const industryLower = industry.toLowerCase();
    
    for (const [keyword, category] of Object.entries(this.industryMappings)) {
      if (industryLower.includes(keyword)) {
        return category;
      }
    }
    
    return 'professional_services'; // Default fallback
  }

  /**
   * Replace template variables in text
   */
  personalizeMessage(template, prospectData) {
    let personalized = template;
    
    // Replace all prospect data variables
    Object.entries(prospectData).forEach(([key, value]) => {
      const placeholder = `{{prospect.${key}}}`;
      if (personalized.includes(placeholder) && value) {
        personalized = personalized.replace(new RegExp(placeholder, 'g'), value);
      }
    });
    
    // Handle nested objects (like competitive analysis)
    if (prospectData.competitiveAnalysis) {
      const competitors = prospectData.competitiveAnalysis.mainCompetitors;
      if (competitors && competitors.length > 0) {
        personalized = personalized.replace(
          /{{prospect\.competitors}}/g, 
          competitors.slice(0, 2).join(' and ')
        );
      }
    }
    
    if (prospectData.marketingInsights) {
      const challenges = prospectData.marketingInsights.currentChallenges;
      const opportunities = prospectData.marketingInsights.opportunities;
      
      if (challenges && challenges.length > 0) {
        personalized = personalized.replace(
          /{{prospect\.challenges}}/g,
          challenges.slice(0, 2).join(' and ')
        );
      }
      
      if (opportunities && opportunities.length > 0) {
        personalized = personalized.replace(
          /{{prospect\.opportunities}}/g,
          opportunities.slice(0, 2).join(' and ')
        );
      }
    }
    
    return personalized;
  }

  /**
   * Personalize system prompt with prospect context
   */
  personalizeSystemPrompt(template, prospectData, industryCategory) {
    let personalized = this.personalizeMessage(template, prospectData);
    
    // Add industry-specific guidance
    const industryGuidance = this.getIndustryGuidance(industryCategory, prospectData);
    if (industryGuidance) {
      personalized += `\n\nINDUSTRY-SPECIFIC GUIDANCE:\n${industryGuidance}`;
    }
    
    return personalized;
  }

  /**
   * Get industry-specific conversation guidance
   */
  getIndustryGuidance(industryCategory, prospectData) {
    const guidance = {
      restaurant: `This is a restaurant business. Focus on:
- Online reviews and reputation management
- Local search visibility for "restaurants near me" searches
- Food delivery platform optimization
- Social media for showcasing food and atmosphere
- Seasonal marketing campaigns
Common pain points: Managing online reviews, competing with delivery apps, seasonal fluctuations`,

      retail: `This is a retail business. Focus on:
- Competing with online retailers
- Local foot traffic generation
- Inventory-based seasonal campaigns
- Customer loyalty programs
- Local search optimization
Common pain points: Online competition, changing consumer habits, inventory management`,

      healthcare: `This is a healthcare practice. Focus on:
- Patient acquisition and retention
- Online reputation management
- Educational content marketing
- HIPAA-compliant marketing strategies
- Local health service searches
Common pain points: Patient trust, compliance requirements, appointment scheduling`,

      professional_services: `This is a professional service business. Focus on:
- Lead generation and qualification
- Authority and credibility building
- Professional networking and referrals
- Content marketing and thought leadership
- Local professional service searches
Common pain points: Differentiating from competitors, building trust, consistent lead flow`
    };

    return guidance[industryCategory] || guidance.professional_services;
  }

  /**
   * Get list of fields that were personalized
   */
  getPersonalizedFields(prospectData) {
    const fields = [];
    
    if (prospectData.businessName) fields.push('businessName');
    if (prospectData.contactName) fields.push('contactName');
    if (prospectData.industry) fields.push('industry');
    if (prospectData.location) fields.push('location');
    if (prospectData.competitiveAnalysis) fields.push('competitiveAnalysis');
    if (prospectData.marketingInsights) fields.push('marketingInsights');
    
    return fields;
  }

  /**
   * Save personalized script to file
   */
  async savePersonalizedScript(script, prospectId) {
    const fileName = `personalized-script-${prospectId}-${Date.now()}.json`;
    const filePath = path.join(__dirname, '../data/personalized-scripts', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(script, null, 2));
    console.log(`✅ Personalized script saved: ${fileName}`);
    
    return filePath;
  }

  /**
   * Generate Vapi AI assistant configuration with personalized script
   */
  generateVapiAssistant(personalizedScript, prospectData) {
    return {
      name: `Sales Call - ${prospectData.businessName}`,
      model: personalizedScript.model,
      voice: personalizedScript.voice,
      firstMessage: personalizedScript.firstMessage,
      systemPrompt: personalizedScript.systemPrompt,
      functions: personalizedScript.functions,
      endCallPhrases: personalizedScript.endCallPhrases,
      metadata: {
        prospectId: prospectData.prospectId,
        businessName: prospectData.businessName,
        industry: prospectData.industry,
        campaignType: 'automated_sales_outreach'
      }
    };
  }
}

module.exports = ProspectPersonalizer;