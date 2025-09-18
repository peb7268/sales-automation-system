#!/usr/bin/env npx tsx

/**
 * Analytics Dashboard Update Script
 * Updates the Sales Analytics Dashboard with fresh data and charts
 * 
 * Usage:
 *   npm run update-analytics
 *   npx tsx scripts/update-analytics.ts
 */

import { dashboardGenerator, AnalyticsData } from '../src/utils/analytics/dashboard-generator';
import { vaultIntegration } from '../src/utils/obsidian/vault-integration';
import { logger } from '../src/utils/logging';

async function main() {
  try {
    console.log('📊 Starting analytics dashboard update...');
    
    // Generate fresh analytics data
    console.log('🔄 Generating analytics data...');
    const analyticsData = await dashboardGenerator.generateAnalyticsData();
    
    // Display summary metrics
    console.log('\n📈 Current Performance Summary:');
    console.log('─────────────────────────────────────');
    console.log(`📋 Total Prospects: ${analyticsData.summary.totalProspects}`);
    console.log(`✅ Qualified Prospects (75+): ${analyticsData.summary.qualifiedProspects}`);
    console.log(`💰 Pipeline Value: $${analyticsData.summary.pipelineValue.toLocaleString()}`);
    console.log(`📊 Monthly Progress: ${analyticsData.summary.monthlyProgress}%`);
    console.log(`📈 Conversion Rate: ${analyticsData.summary.conversionRate}%`);
    
    // Display KPI status
    console.log('\n🎯 Key Performance Indicators:');
    console.log('─────────────────────────────────');
    
    const kpiStatus = (status: string) => {
      switch(status) {
        case 'on-track': return '🟢';
        case 'warning': return '🟡';
        case 'critical': return '🔴';
        default: return '⚪';
      }
    };
    
    console.log(`${kpiStatus(analyticsData.kpis.dailyProspects.status)} Daily Prospects: ${analyticsData.kpis.dailyProspects.current}/${analyticsData.kpis.dailyProspects.target}`);
    console.log(`${kpiStatus(analyticsData.kpis.responseRate.status)} Response Rate: ${analyticsData.kpis.responseRate.current}%/${analyticsData.kpis.responseRate.target}%`);
    console.log(`${kpiStatus(analyticsData.kpis.qualificationRate.status)} Qualification Rate: ${analyticsData.kpis.qualificationRate.current}%/${analyticsData.kpis.qualificationRate.target}%`);
    console.log(`${kpiStatus(analyticsData.kpis.pipelineValue.status)} Pipeline Value: $${analyticsData.kpis.pipelineValue.current.toLocaleString()}/$${analyticsData.kpis.pipelineValue.target.toLocaleString()}`);
    console.log(`${kpiStatus(analyticsData.kpis.averageDealSize.status)} Avg Deal Size: $${analyticsData.kpis.averageDealSize.current.toLocaleString()}/$${analyticsData.kpis.averageDealSize.target.toLocaleString()}`);
    
    // Display top prospects
    console.log('\n🔥 Top Performing Prospects:');
    console.log('─────────────────────────────');
    if (analyticsData.tables.topProspects.length === 0) {
      console.log('   📋 No qualified prospects yet (75+ score needed)');
    } else {
      analyticsData.tables.topProspects.slice(0, 5).forEach(prospect => {
        console.log(`   🏢 ${prospect.company.padEnd(25)} | Score: ${prospect.score}/100 | ${prospect.stage} | $${prospect.estimatedValue.toLocaleString()}`);
      });
    }
    
    // Display stagnant prospects
    console.log('\n⏰ Stagnant Prospects (Needs Attention):');
    console.log('─────────────────────────────────────────');
    if (analyticsData.tables.stagnantProspects.length === 0) {
      console.log('   ✅ No stagnant prospects found');
    } else {
      analyticsData.tables.stagnantProspects.slice(0, 5).forEach(prospect => {
        console.log(`   ⚠️  ${prospect.company.padEnd(25)} | ${prospect.daysSinceUpdate} days | Score: ${prospect.score}/100`);
      });
    }
    
    // Display industry performance
    console.log('\n🏭 Industry Performance:');
    console.log('─────────────────────────');
    if (analyticsData.tables.industryBreakdown.length === 0) {
      console.log('   📋 No industry data available yet');
    } else {
      analyticsData.tables.industryBreakdown.forEach(industry => {
        console.log(`   🏢 ${industry.industry.padEnd(20)} | ${industry.prospects} prospects | Avg Score: ${industry.averageScore}/100 | ${industry.marketShare}% share`);
      });
    }
    
    // Display location performance  
    console.log('\n🌍 Geographic Performance:');
    console.log('───────────────────────────');
    if (analyticsData.tables.performanceByLocation.length === 0) {
      console.log('   📍 No location data available yet');
    } else {
      analyticsData.tables.performanceByLocation.slice(0, 5).forEach(location => {
        console.log(`   📍 ${location.location.padEnd(20)} | ${location.prospects} prospects | Avg Score: ${location.averageScore}/100 | $${location.estimatedRevenue.toLocaleString()}`);
      });
    }
    
    // Update dashboard file
    console.log('\n🔄 Updating dashboard file...');
    await dashboardGenerator.updateDashboard();
    
    // Display chart data summary
    console.log('\n📊 Chart Data Generated:');
    console.log('─────────────────────────');
    console.log(`📈 Revenue Tracking: ${analyticsData.charts.revenueTracking.datasets.length} datasets`);
    console.log(`🍩 Pipeline Distribution: ${analyticsData.charts.pipelineDistribution.labels.length} stages`);
    console.log(`📊 Score Distribution: ${analyticsData.charts.scoreDistribution.labels.length} ranges`);
    console.log(`🌍 Geographic Performance: ${analyticsData.charts.geographicPerformance.labels.length} locations`);
    console.log(`🏭 Industry Analysis: ${analyticsData.charts.industryAnalysis.labels.length} industries`);
    console.log(`📅 Activity Trends: ${analyticsData.charts.activityTrends.labels.length} data points`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('────────────────────');
    
    if (analyticsData.summary.totalProspects === 0) {
      console.log('   🎯 Start by running the prospecting agent to identify initial leads');
      console.log('   📞 Focus on geographic areas with high business density');
    } else if (analyticsData.summary.qualifiedProspects === 0) {
      console.log('   🎯 Focus on qualification scoring - research existing prospects');
      console.log('   📊 Review qualification criteria and scoring algorithm');
    } else if (analyticsData.kpis.responseRate.current < 10) {
      console.log('   📞 Improve outreach messaging and personalization');
      console.log('   🎯 A/B test different value propositions');
    } else if (analyticsData.summary.pipelineValue < 10000) {
      console.log('   💰 Focus on moving qualified prospects through the pipeline');
      console.log('   📅 Schedule follow-up activities for interested prospects');
    }
    
    if (analyticsData.tables.stagnantProspects.length > 0) {
      console.log(`   ⏰ Address ${analyticsData.tables.stagnantProspects.length} stagnant prospects with follow-up activities`);
    }
    
    console.log('\n✅ Analytics dashboard update completed successfully!');
    console.log(`📋 Dashboard location: Projects/Sales/Sales-Analytics-Dashboard.md`);
    console.log(`🔄 Next update: Run this script daily or set up automation`);
    
  } catch (error) {
    console.error('❌ Analytics dashboard update failed:', error);
    logger.error('Analytics update script failed:', error);
    process.exit(1);
  }
}

// Helper function to display chart info
function displayChartInfo(chartData: any, chartName: string) {
  if (chartData && chartData.labels) {
    console.log(`   📊 ${chartName}: ${chartData.labels.length} data points`);
  }
}

// Run the script
main().catch(console.error);