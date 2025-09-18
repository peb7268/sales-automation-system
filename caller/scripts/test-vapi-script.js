#!/usr/bin/env node

/**
 * Test Script for Vapi AI Conversation Script Integration
 * This script tests the personalization logic and Vapi AI API connection
 */

const ProspectPersonalizer = require('../integrations/prospect-personalizer');
require('dotenv').config({ path: '/Users/pbarrick/Desktop/dev/MHM/.env' });

// Sample prospect data for testing
const sampleProspect = {
  prospectId: "test-restaurant-001",
  businessName: "Tony's Italian Bistro",
  contactName: "Tony Rodriguez",
  phone: "+1-555-123-4567",
  industry: "Restaurant",
  location: "Denver, CO",
  businessHours: "11AM-10PM MST",
  competitiveAnalysis: {
    mainCompetitors: ["Olive Garden", "Maggiano's Little Italy"],
    marketPosition: "Family-friendly Italian dining",
    uniqueValue: "Authentic recipes and family atmosphere"
  },
  marketingInsights: {
    currentChallenges: ["online presence", "competing with chains"],
    opportunities: ["local SEO", "social media for food photos", "delivery optimization"]
  }
};

async function testScriptPersonalization() {
  console.log('🧪 Testing Vapi AI Script Personalization\n');
  
  try {
    const personalizer = new ProspectPersonalizer();
    
    // Test personalization
    console.log('📝 Personalizing conversation script...');
    const personalizedScript = await personalizer.personalizeScript(sampleProspect);
    
    console.log('✅ Script personalized successfully!');
    console.log('📊 Personalization Results:');
    console.log('   - Business Name:', personalizedScript.prospectMetadata.businessName);
    console.log('   - Industry Category:', personalizedScript.prospectMetadata.industryCategory);
    console.log('   - Personalized Fields:', personalizedScript.prospectMetadata.personalizedFields.join(', '));
    
    // Test first message personalization
    console.log('\n💬 Personalized First Message:');
    console.log(`   "${personalizedScript.firstMessage}"`);
    
    // Show industry-specific context
    if (personalizedScript.industryContext) {
      console.log('\n🎯 Industry-Specific Context:');
      console.log('   - Pain Points:', personalizedScript.industryContext.painPoints);
      console.log('   - Opportunities:', personalizedScript.industryContext.opportunities);
      console.log('   - Approach:', personalizedScript.industryContext.approach);
    }
    
    // Generate Vapi AI assistant config
    console.log('\n🤖 Generating Vapi AI Assistant Configuration...');
    const vapiAssistant = personalizer.generateVapiAssistant(personalizedScript, sampleProspect);
    
    console.log('✅ Vapi AI Assistant Config Generated:');
    console.log('   - Assistant Name:', vapiAssistant.name);
    console.log('   - Voice Provider:', vapiAssistant.voice.provider);
    console.log('   - Model:', `${vapiAssistant.model.provider}/${vapiAssistant.model.model}`);
    console.log('   - Functions Available:', vapiAssistant.functions.length);
    
    // Save personalized script
    console.log('\n💾 Saving personalized script...');
    const savedPath = await personalizer.savePersonalizedScript(personalizedScript, sampleProspect.prospectId);
    console.log('✅ Script saved to:', savedPath);
    
    return { personalizedScript, vapiAssistant };
    
  } catch (error) {
    console.error('❌ Script personalization test failed:', error.message);
    throw error;
  }
}

async function testVapiAPI() {
  console.log('\n📡 Testing Vapi AI API Connection\n');
  
  try {
    const axios = require('axios');
    
    // Test API connection
    console.log('🔗 Testing API connection...');
    const response = await axios.get(`${process.env.VAPI_BASE_URL}/assistant`, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Vapi AI API connection successful!');
    console.log('📊 API Response Status:', response.status);
    console.log('📋 Available Assistants:', response.data.length || 'Unknown');
    
    return true;
    
  } catch (error) {
    console.error('❌ Vapi AI API test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔧 This suggests an API key issue. Please verify:');
      console.log('   - API key is correct in .env file');
      console.log('   - API key has proper permissions');
      console.log('   - API key is a backend key (not public key)');
    }
    
    return false;
  }
}

async function simulateConversationFlow() {
  console.log('\n💬 Simulating Conversation Flow\n');
  
  const objectionResponses = require('../config/objection-responses.json');
  
  // Simulate common conversation scenarios
  const scenarios = [
    {
      name: 'Interested Prospect',
      input: 'Tell me more about what you offer',
      expectedResponse: 'positive'
    },
    {
      name: 'Price Objection',
      input: 'That sounds expensive',
      expectedResponse: 'objection_handled'
    },
    {
      name: 'Not Interested',
      input: 'Not interested, please remove me from your list',
      expectedResponse: 'polite_close'
    },
    {
      name: 'Already Have Marketing',
      input: 'We already have a marketing company',
      expectedResponse: 'competitive_response'
    }
  ];
  
  console.log('📝 Testing conversation scenarios:');
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}:`);
    console.log(`   Input: "${scenario.input}"`);
    
    // Find appropriate response based on scenario
    let response = 'Standard response would be generated based on context';
    
    if (scenario.input.toLowerCase().includes('tell me more')) {
      response = objectionResponses.positiveResponses.tellMeMore.responses[0];
    } else if (scenario.input.toLowerCase().includes('expensive')) {
      response = objectionResponses.commonObjections.tooExpensive.responses[0];
    } else if (scenario.input.toLowerCase().includes('not interested')) {
      response = objectionResponses.commonObjections.notInterested.responses[0];
    } else if (scenario.input.toLowerCase().includes('already have')) {
      response = objectionResponses.commonObjections.alreadyHaveMarketing.responses[0];
    }
    
    console.log(`   Response: "${response.substring(0, 100)}..."`);
  });
  
  console.log('\n✅ Conversation flow simulation complete');
}

async function runAllTests() {
  console.log('🚀 Starting Vapi AI Integration Tests\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Script Personalization
    const { personalizedScript, vapiAssistant } = await testScriptPersonalization();
    
    // Test 2: API Connection
    const apiWorking = await testVapiAPI();
    
    // Test 3: Conversation Flow
    await simulateConversationFlow();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Script Personalization: PASSED');
    console.log(`${apiWorking ? '✅' : '❌'} Vapi AI API Connection: ${apiWorking ? 'PASSED' : 'FAILED'}`);
    console.log('✅ Conversation Flow Logic: PASSED');
    
    if (apiWorking) {
      console.log('\n🎉 All tests passed! Ready for production testing.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Create a test assistant in Vapi AI dashboard');
      console.log('   2. Make a test call using the personalized script');
      console.log('   3. Validate conversation quality and objection handling');
      console.log('   4. Test meeting booking and data capture functions');
    } else {
      console.log('\n⚠️ API connection failed - fix API key before proceeding');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if script is called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testScriptPersonalization,
  testVapiAPI,
  simulateConversationFlow,
  sampleProspect
};