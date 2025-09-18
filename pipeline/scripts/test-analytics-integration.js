#!/usr/bin/env npx tsx
"use strict";
/**
 * Analytics Integration Test Script
 * Tests the complete analytics pipeline and dashboard integration
 *
 * Usage:
 *   npm run test-analytics
 *   npx tsx scripts/test-analytics-integration.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_generator_1 = require("../src/utils/analytics/dashboard-generator");
const vault_integration_1 = require("../src/utils/obsidian/vault-integration");
const logging_1 = require("../src/utils/logging");
const fs = __importStar(require("fs/promises"));
async function testAnalyticsIntegration() {
    console.log('🧪 Starting Analytics Integration Test Suite...\n');
    let testsPassed = 0;
    let testsTotal = 0;
    try {
        // Test 1: Dashboard generator instantiation
        testsTotal++;
        console.log('🔬 Test 1: Dashboard Generator Instantiation');
        try {
            const generator = dashboard_generator_1.dashboardGenerator;
            console.log('✅ Dashboard generator created successfully');
            testsPassed++;
        }
        catch (error) {
            console.log('❌ Dashboard generator failed:', error);
        }
        // Test 2: Analytics data generation
        testsTotal++;
        console.log('\n🔬 Test 2: Analytics Data Generation');
        try {
            const analyticsData = await dashboard_generator_1.dashboardGenerator.generateAnalyticsData();
            // Verify data structure
            const requiredSections = ['summary', 'charts', 'tables', 'kpis'];
            const hasSections = requiredSections.every(section => analyticsData.hasOwnProperty(section));
            if (hasSections) {
                console.log('✅ Analytics data structure valid');
                console.log(`   📊 Summary: ${Object.keys(analyticsData.summary).length} metrics`);
                console.log(`   📈 Charts: ${Object.keys(analyticsData.charts).length} chart types`);
                console.log(`   📋 Tables: ${Object.keys(analyticsData.tables).length} table types`);
                console.log(`   🎯 KPIs: ${Object.keys(analyticsData.kpis).length} KPI metrics`);
                testsPassed++;
            }
            else {
                console.log('❌ Analytics data structure invalid');
            }
        }
        catch (error) {
            console.log('❌ Analytics data generation failed:', error);
        }
        // Test 3: Dashboard file update
        testsTotal++;
        console.log('\n🔬 Test 3: Dashboard File Update');
        try {
            const dashboardPath = '/Users/pbarrick/Documents/Main/Projects/Sales/Sales-Analytics-Dashboard.md';
            // Check if dashboard file exists
            await fs.access(dashboardPath);
            console.log('✅ Dashboard file exists');
            // Read dashboard content
            const content = await fs.readFile(dashboardPath, 'utf8');
            // Verify frontmatter structure
            const hasFrontmatter = content.startsWith('---');
            const hasCharts = content.includes('```chart');
            const hasDataview = content.includes('```dataview');
            if (hasFrontmatter && hasCharts && hasDataview) {
                console.log('✅ Dashboard structure valid');
                console.log('   📊 Frontmatter: Present');
                console.log('   📈 Charts: Present');
                console.log('   📋 Dataview queries: Present');
                testsPassed++;
            }
            else {
                console.log('❌ Dashboard structure invalid');
                console.log(`   📊 Frontmatter: ${hasFrontmatter ? 'Present' : 'Missing'}`);
                console.log(`   📈 Charts: ${hasCharts ? 'Present' : 'Missing'}`);
                console.log(`   📋 Dataview: ${hasDataview ? 'Present' : 'Missing'}`);
            }
        }
        catch (error) {
            console.log('❌ Dashboard file test failed:', error);
        }
        // Test 4: Vault integration
        testsTotal++;
        console.log('\n🔬 Test 4: Vault Integration');
        try {
            const prospects = await vault_integration_1.vaultIntegration.getAllProspects();
            console.log(`✅ Vault integration working - Found ${prospects.length} prospects`);
            testsPassed++;
        }
        catch (error) {
            console.log('❌ Vault integration failed:', error);
        }
        // Test 5: KPI calculations
        testsTotal++;
        console.log('\n🔬 Test 5: KPI Calculation System');
        try {
            const analyticsData = await dashboard_generator_1.dashboardGenerator.generateAnalyticsData();
            const kpiKeys = ['dailyProspects', 'responseRate', 'qualificationRate', 'pipelineValue', 'averageDealSize'];
            let kpiTestsPassed = 0;
            kpiKeys.forEach(key => {
                const kpi = analyticsData.kpis[key];
                if (kpi && typeof kpi.current === 'number' && typeof kpi.target === 'number' && kpi.status) {
                    kpiTestsPassed++;
                }
            });
            if (kpiTestsPassed === kpiKeys.length) {
                console.log('✅ All KPI calculations working');
                console.log(`   🎯 KPIs tested: ${kpiTestsPassed}/${kpiKeys.length}`);
                testsPassed++;
            }
            else {
                console.log(`❌ KPI calculations incomplete: ${kpiTestsPassed}/${kpiKeys.length} working`);
            }
        }
        catch (error) {
            console.log('❌ KPI calculation test failed:', error);
        }
        // Test 6: Chart data generation
        testsTotal++;
        console.log('\n🔬 Test 6: Chart Data Generation');
        try {
            const analyticsData = await dashboard_generator_1.dashboardGenerator.generateAnalyticsData();
            const chartTypes = ['revenueTracking', 'pipelineDistribution', 'scoreDistribution', 'geographicPerformance', 'industryAnalysis', 'activityTrends', 'conversionFunnel'];
            let chartTestsPassed = 0;
            chartTypes.forEach(chartType => {
                const chart = analyticsData.charts[chartType];
                if (chart && chart.labels && chart.datasets && Array.isArray(chart.labels) && Array.isArray(chart.datasets)) {
                    chartTestsPassed++;
                }
            });
            if (chartTestsPassed === chartTypes.length) {
                console.log('✅ All chart data generation working');
                console.log(`   📈 Charts tested: ${chartTestsPassed}/${chartTypes.length}`);
                testsPassed++;
            }
            else {
                console.log(`❌ Chart data generation incomplete: ${chartTestsPassed}/${chartTypes.length} working`);
            }
        }
        catch (error) {
            console.log('❌ Chart data generation test failed:', error);
        }
        // Test 7: Full dashboard update
        testsTotal++;
        console.log('\n🔬 Test 7: Full Dashboard Update');
        try {
            await dashboard_generator_1.dashboardGenerator.updateDashboard();
            console.log('✅ Full dashboard update completed successfully');
            testsPassed++;
        }
        catch (error) {
            console.log('❌ Full dashboard update failed:', error);
        }
        // Test Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Analytics Integration Test Results');
        console.log('='.repeat(50));
        console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
        console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
        if (testsPassed === testsTotal) {
            console.log('🎉 All tests passed! Analytics system fully functional.');
            console.log('\n📋 System Status:');
            console.log('   ✅ Dashboard Generator: Working');
            console.log('   ✅ Analytics Data Generation: Working');
            console.log('   ✅ Dashboard File Integration: Working');
            console.log('   ✅ Vault Integration: Working');
            console.log('   ✅ KPI Calculations: Working');
            console.log('   ✅ Chart Data Generation: Working');
            console.log('   ✅ Full Update Process: Working');
            console.log('\n🚀 Next Steps:');
            console.log('   1. Run daily: npm run analytics:daily');
            console.log('   2. Setup automation with cron or task scheduler');
            console.log('   3. Add prospects to see analytics in action');
            console.log('   4. Integrate with Kanban pipeline for real-time updates');
            process.exit(0);
        }
        else {
            console.log('⚠️  Some tests failed. Review errors above.');
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check .env configuration');
            console.log('   2. Verify Obsidian vault path');
            console.log('   3. Ensure all dependencies installed');
            console.log('   4. Review error logs above');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('💥 Test suite failed with critical error:', error);
        logging_1.logger.error('Analytics integration test suite failed:', error);
        process.exit(1);
    }
}
// Helper function to display test results
function displayTestResult(testName, passed, details) {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}`);
    if (details) {
        console.log(`   ${details}`);
    }
}
// Run the test suite
testAnalyticsIntegration().catch(console.error);
//# sourceMappingURL=test-analytics-integration.js.map