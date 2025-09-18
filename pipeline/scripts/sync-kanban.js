#!/usr/bin/env npx tsx
"use strict";
/**
 * Kanban Sync Script
 * Synchronizes prospect data with Kanban board visualization
 *
 * Usage:
 *   npm run sync-kanban
 *   npx tsx scripts/sync-kanban.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const kanban_integration_1 = require("../src/utils/obsidian/kanban-integration");
const logging_1 = require("../src/utils/logging");
async function main() {
    try {
        console.log('🔄 Starting Kanban synchronization...');
        // Sync all prospects to Kanban board
        await kanban_integration_1.kanbanIntegration.syncAllProspectsToKanban();
        // Generate pipeline health metrics
        const metrics = await kanban_integration_1.kanbanIntegration.generatePipelineMetrics();
        console.log('\n📊 Pipeline Health Metrics:');
        console.log('─────────────────────────────');
        console.log('\n📈 Stage Distribution:');
        Object.entries(metrics.stageDistribution).forEach(([stage, count]) => {
            const stageEmoji = getStageEmoji(stage);
            console.log(`  ${stageEmoji} ${stage.padEnd(12)}: ${count} prospects`);
        });
        console.log('\n⭐ Average Score by Stage:');
        Object.entries(metrics.averageScoreByStage).forEach(([stage, score]) => {
            const stageEmoji = getStageEmoji(stage);
            console.log(`  ${stageEmoji} ${stage.padEnd(12)}: ${score}/100`);
        });
        console.log('\n📈 Conversion Rates:');
        Object.entries(metrics.conversionRates).forEach(([transition, rate]) => {
            console.log(`  ${transition.padEnd(25)}: ${rate}%`);
        });
        console.log('\n⏰ Stagnant Prospects (7+ days):');
        if (metrics.stagnantProspects.length === 0) {
            console.log('  ✅ No stagnant prospects found');
        }
        else {
            metrics.stagnantProspects.slice(0, 5).forEach(prospect => {
                const daysSince = Math.floor((Date.now() - prospect.updated.getTime()) / (1000 * 60 * 60 * 24));
                console.log(`  ⚠️  ${prospect.business.name} (${daysSince} days in ${prospect.pipelineStage})`);
            });
            if (metrics.stagnantProspects.length > 5) {
                console.log(`  ... and ${metrics.stagnantProspects.length - 5} more`);
            }
        }
        console.log('\n⚡ Pipeline Velocity (Avg Days in Stage):');
        Object.entries(metrics.velocityMetrics).forEach(([stage, days]) => {
            if (days > 0) {
                const stageEmoji = getStageEmoji(stage);
                console.log(`  ${stageEmoji} ${stage.padEnd(12)}: ${days} days`);
            }
        });
        console.log('\n✅ Kanban synchronization completed successfully!');
        console.log(`📋 Kanban board: Projects/Sales/Sales-Pipeline-Kanban.md`);
    }
    catch (error) {
        console.error('❌ Kanban synchronization failed:', error);
        logging_1.logger.error('Kanban sync script failed:', error);
        process.exit(1);
    }
}
function getStageEmoji(stage) {
    const emojis = {
        'cold': '🧊',
        'contacted': '📞',
        'interested': '💬',
        'qualified': '✅',
        'closed_won': '💰',
        'closed_lost': '❌',
        'frozen': '🧊'
    };
    return emojis[stage] || '📋';
}
// Run the script
main().catch(console.error);
//# sourceMappingURL=sync-kanban.js.map