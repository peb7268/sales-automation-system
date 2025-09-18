import { randomUUID } from 'crypto';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// A/B Test Configuration
interface ABTestConfig {
  testId: string;
  testName: string;
  description: string;
  variants: PitchVariant[];
  targetSampleSize: number;
  targetResponseRate: number; // 15%+ target
  duration: number; // days
  status: 'setup' | 'running' | 'paused' | 'completed' | 'analyzed';
  startDate?: Date;
  endDate?: Date;
}

// Pitch Variant for Testing
interface PitchVariant {
  id: string;
  name: string;
  description: string;
  template: 'stage_aware' | 'time_boxed' | 'competitor_focused' | 'roi_heavy';
  modifications: {
    hookStyle?: 'research_based' | 'problem_focused' | 'opportunity_first' | 'benefit_driven';
    valueProposition?: 'roi_focused' | 'competition_based' | 'capability_showcase' | 'problem_solution';
    callToAction?: 'direct_ask' | 'value_offer' | 'consultation_style' | 'urgency_based';
    personalisation?: 'high' | 'medium' | 'low';
    tone?: 'professional' | 'conversational' | 'consultative' | 'partnership';
  };
  weightPercentage: number; // 0-100, should total 100% across variants
  metrics: ABTestMetrics;
}

// A/B Test Metrics Tracking
interface ABTestMetrics {
  sent: number;
  opened: number;
  replied: number;
  positiveReplies: number;
  meetings: number;
  conversionRate: number;
  responseRate: number;
  positiveResponseRate: number;
  meetingConversionRate: number;
  averageResponseTime: number; // hours
  qualityScore: number; // 1-10 scale
}

// Test Result Analysis
interface ABTestResults {
  testId: string;
  winner?: string; // variant ID
  confidence: number; // statistical confidence 0-1
  significanceLevel: number; // p-value
  recommendations: string[];
  insights: string[];
  nextActions: string[];
  variants: {
    [variantId: string]: {
      metrics: ABTestMetrics;
      performance: 'winner' | 'loser' | 'inconclusive';
      improvement: number; // percentage improvement over baseline
    };
  };
}

// Response tracking for individual pitches
interface PitchResponse {
  pitchId: string;
  prospectId: string;
  variantId: string;
  testId: string;
  sentDate: Date;
  openedDate?: Date;
  repliedDate?: Date;
  replyType: 'positive' | 'negative' | 'neutral' | 'meeting_request' | 'not_interested' | 'no_reply';
  replyContent?: string;
  meetingScheduled?: Date;
  qualityRating?: number; // 1-10 manual rating
  notes?: string;
}

/**
 * A/B Testing Framework for Pitch Optimization
 * Supports testing different message variations to optimize for 15%+ response rate
 */
export class PitchABTestingFramework {
  private readonly dataPath: string;
  private readonly testsPath: string;
  private readonly responsesPath: string;

  constructor(dataPath: string = './data/ab-testing') {
    this.dataPath = dataPath;
    this.testsPath = join(dataPath, 'tests');
    this.responsesPath = join(dataPath, 'responses');
    this.ensureDirectories();
  }

  /**
   * Create a new A/B test for pitch optimization
   */
  async createTest(config: Omit<ABTestConfig, 'testId' | 'status'>): Promise<string> {
    const testId = randomUUID();
    
    // Validate variant weights sum to 100%
    const totalWeight = config.variants.reduce((sum, v) => sum + v.weightPercentage, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`Variant weights must sum to 100%, got ${totalWeight}%`);
    }

    // Initialize metrics for each variant
    const variants = config.variants.map(variant => ({
      ...variant,
      metrics: this.initializeMetrics()
    }));

    const test: ABTestConfig = {
      testId,
      ...config,
      variants,
      status: 'setup'
    };

    await this.saveTest(test);
    console.log(`Created A/B test "${test.testName}" with ID: ${testId}`);
    
    return testId;
  }

  /**
   * Start running an A/B test
   */
  async startTest(testId: string): Promise<void> {
    const test = await this.loadTest(testId);
    test.status = 'running';
    test.startDate = new Date();
    test.endDate = new Date(Date.now() + test.duration * 24 * 60 * 60 * 1000);
    
    await this.saveTest(test);
    console.log(`Started A/B test: ${test.testName}`);
  }

  /**
   * Get the next variant to use based on current test allocation
   */
  async getVariantForProspect(testId: string, prospectId: string): Promise<string> {
    const test = await this.loadTest(testId);
    
    if (test.status !== 'running') {
      throw new Error(`Test ${testId} is not running (status: ${test.status})`);
    }

    // Simple random allocation based on weights
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weightPercentage;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return test.variants[0].id;
  }

  /**
   * Record that a pitch was sent
   */
  async recordPitchSent(
    testId: string, 
    variantId: string, 
    prospectId: string, 
    pitchId: string
  ): Promise<void> {
    const response: PitchResponse = {
      pitchId,
      prospectId,
      variantId,
      testId,
      sentDate: new Date(),
      replyType: 'no_reply'
    };

    await this.savePitchResponse(response);
    await this.updateVariantMetrics(testId, variantId, { sent: 1 });
    
    console.log(`Recorded pitch sent: ${pitchId} using variant ${variantId}`);
  }

  /**
   * Record pitch response (positive, negative, meeting request, etc.)
   */
  async recordPitchResponse(
    pitchId: string,
    replyType: PitchResponse['replyType'],
    replyContent?: string,
    qualityRating?: number
  ): Promise<void> {
    const response = await this.loadPitchResponse(pitchId);
    response.repliedDate = new Date();
    response.replyType = replyType;
    response.replyContent = replyContent;
    response.qualityRating = qualityRating;

    await this.savePitchResponse(response);

    // Update metrics
    const metricsUpdate: Partial<ABTestMetrics> = { replied: 1 };
    
    if (['positive', 'meeting_request'].includes(replyType)) {
      metricsUpdate.positiveReplies = 1;
    }
    
    if (replyType === 'meeting_request') {
      metricsUpdate.meetings = 1;
    }

    await this.updateVariantMetrics(response.testId, response.variantId, metricsUpdate);
    
    console.log(`Recorded response: ${replyType} for pitch ${pitchId}`);
  }

  /**
   * Analyze A/B test results and determine winner
   */
  async analyzeTest(testId: string): Promise<ABTestResults> {
    const test = await this.loadTest(testId);
    const responses = await this.loadAllResponsesForTest(testId);
    
    // Calculate updated metrics for each variant
    for (const variant of test.variants) {
      const variantResponses = responses.filter(r => r.variantId === variant.id);
      variant.metrics = this.calculateMetrics(variantResponses);
    }

    // Find the best performing variant
    const sortedVariants = test.variants
      .filter(v => v.metrics.sent > 10) // Minimum sample size
      .sort((a, b) => b.metrics.positiveResponseRate - a.metrics.positiveResponseRate);

    const winner = sortedVariants[0];
    const baseline = sortedVariants[1] || sortedVariants[0];

    // Calculate statistical confidence (simplified)
    const confidence = this.calculateStatisticalConfidence(winner?.metrics, baseline?.metrics);

    const results: ABTestResults = {
      testId,
      winner: winner?.id,
      confidence,
      significanceLevel: 1 - confidence,
      recommendations: this.generateRecommendations(test.variants, winner),
      insights: this.generateInsights(test.variants),
      nextActions: this.generateNextActions(test.variants, winner),
      variants: {}
    };

    // Populate variant results
    test.variants.forEach(variant => {
      const improvement = baseline ? 
        ((variant.metrics.positiveResponseRate - baseline.metrics.positiveResponseRate) / baseline.metrics.positiveResponseRate) * 100 :
        0;

      results.variants[variant.id] = {
        metrics: variant.metrics,
        performance: variant.id === winner?.id ? 'winner' : 
                    improvement < -10 ? 'loser' : 'inconclusive',
        improvement
      };
    });

    // Save analysis results
    await this.saveTestResults(testId, results);
    
    if (winner) {
      console.log(`A/B test analysis complete. Winner: ${winner.name} with ${winner.metrics.positiveResponseRate.toFixed(1)}% positive response rate`);
    } else {
      console.log(`A/B test analysis complete. No clear winner identified.`);
    }

    return results;
  }

  /**
   * Get current test status and metrics
   */
  async getTestStatus(testId: string): Promise<{
    test: ABTestConfig;
    currentMetrics: { [variantId: string]: ABTestMetrics };
    projectedEndDate?: Date;
    samplesRemaining: number;
  }> {
    const test = await this.loadTest(testId);
    const responses = await this.loadAllResponsesForTest(testId);

    const currentMetrics: { [variantId: string]: ABTestMetrics } = {};
    
    test.variants.forEach(variant => {
      const variantResponses = responses.filter(r => r.variantId === variant.id);
      currentMetrics[variant.id] = this.calculateMetrics(variantResponses);
    });

    const totalSent = Object.values(currentMetrics).reduce((sum, m) => sum + m.sent, 0);
    const samplesRemaining = Math.max(0, test.targetSampleSize - totalSent);

    return {
      test,
      currentMetrics,
      projectedEndDate: test.endDate,
      samplesRemaining
    };
  }

  /**
   * Create predefined test configurations for common scenarios
   */
  static createStageAwarenessTest(): Omit<ABTestConfig, 'testId' | 'status'> {
    return {
      testName: 'Stage-Aware Messaging Test',
      description: 'Test different messaging approaches for cold vs warm prospects',
      targetSampleSize: 200,
      targetResponseRate: 0.15, // 15%
      duration: 14, // 2 weeks
      variants: [
        {
          id: 'cold_research',
          name: 'Cold - Research Based',
          description: 'Research-focused approach for cold prospects',
          template: 'stage_aware',
          modifications: {
            hookStyle: 'research_based',
            valueProposition: 'problem_solution',
            callToAction: 'value_offer',
            personalisation: 'high',
            tone: 'professional'
          },
          weightPercentage: 50,
          metrics: {} as ABTestMetrics
        },
        {
          id: 'cold_opportunity',
          name: 'Cold - Opportunity First',
          description: 'Opportunity-focused approach for cold prospects',
          template: 'stage_aware',
          modifications: {
            hookStyle: 'opportunity_first',
            valueProposition: 'roi_focused',
            callToAction: 'direct_ask',
            personalisation: 'medium',
            tone: 'consultative'
          },
          weightPercentage: 50,
          metrics: {} as ABTestMetrics
        }
      ]
    };
  }

  static createTimeBoxingTest(): Omit<ABTestConfig, 'testId' | 'status'> {
    return {
      testName: 'Time-Boxed vs Full Format Test',
      description: 'Compare time-boxed pitches vs full format presentations',
      targetSampleSize: 150,
      targetResponseRate: 0.15,
      duration: 21, // 3 weeks
      variants: [
        {
          id: 'time_boxed',
          name: 'Time-Boxed Pitch',
          description: '30s/60s/120s structured pitch',
          template: 'time_boxed',
          modifications: {
            hookStyle: 'benefit_driven',
            valueProposition: 'capability_showcase',
            callToAction: 'consultation_style',
            personalisation: 'high',
            tone: 'conversational'
          },
          weightPercentage: 50,
          metrics: {} as ABTestMetrics
        },
        {
          id: 'full_format',
          name: 'Full Format Pitch',
          description: 'Comprehensive presentation format',
          template: 'stage_aware',
          modifications: {
            hookStyle: 'problem_focused',
            valueProposition: 'roi_focused',
            callToAction: 'direct_ask',
            personalisation: 'high',
            tone: 'professional'
          },
          weightPercentage: 50,
          metrics: {} as ABTestMetrics
        }
      ]
    };
  }

  static createCompetitorFocusTest(): Omit<ABTestConfig, 'testId' | 'status'> {
    return {
      testName: 'Competitor Analysis Impact Test',
      description: 'Test impact of competitor analysis on pitch effectiveness',
      targetSampleSize: 180,
      targetResponseRate: 0.15,
      duration: 14,
      variants: [
        {
          id: 'competitor_heavy',
          name: 'Competitor-Heavy Pitch',
          description: 'Emphasizes competitive advantages',
          template: 'competitor_focused',
          modifications: {
            hookStyle: 'problem_focused',
            valueProposition: 'competition_based',
            callToAction: 'urgency_based',
            personalisation: 'high',
            tone: 'consultative'
          },
          weightPercentage: 33,
          metrics: {} as ABTestMetrics
        },
        {
          id: 'roi_focused',
          name: 'ROI-Focused Pitch',
          description: 'Emphasizes financial returns',
          template: 'roi_heavy',
          modifications: {
            hookStyle: 'benefit_driven',
            valueProposition: 'roi_focused',
            callToAction: 'value_offer',
            personalisation: 'high',
            tone: 'professional'
          },
          weightPercentage: 33,
          metrics: {} as ABTestMetrics
        },
        {
          id: 'balanced_approach',
          name: 'Balanced Approach',
          description: 'Balance of competition and ROI focus',
          template: 'stage_aware',
          modifications: {
            hookStyle: 'research_based',
            valueProposition: 'problem_solution',
            callToAction: 'consultation_style',
            personalisation: 'high',
            tone: 'consultative'
          },
          weightPercentage: 34,
          metrics: {} as ABTestMetrics
        }
      ]
    };
  }

  // Private helper methods
  private async ensureDirectories(): Promise<void> {
    for (const dir of [this.dataPath, this.testsPath, this.responsesPath]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  private initializeMetrics(): ABTestMetrics {
    return {
      sent: 0,
      opened: 0,
      replied: 0,
      positiveReplies: 0,
      meetings: 0,
      conversionRate: 0,
      responseRate: 0,
      positiveResponseRate: 0,
      meetingConversionRate: 0,
      averageResponseTime: 0,
      qualityScore: 0
    };
  }

  private calculateMetrics(responses: PitchResponse[]): ABTestMetrics {
    const metrics = this.initializeMetrics();
    
    if (responses.length === 0) return metrics;

    metrics.sent = responses.length;
    metrics.opened = responses.filter(r => r.openedDate).length;
    metrics.replied = responses.filter(r => r.repliedDate).length;
    metrics.positiveReplies = responses.filter(r => 
      ['positive', 'meeting_request'].includes(r.replyType)
    ).length;
    metrics.meetings = responses.filter(r => r.meetingScheduled).length;

    // Calculate rates
    if (metrics.sent > 0) {
      metrics.responseRate = metrics.replied / metrics.sent;
      metrics.positiveResponseRate = metrics.positiveReplies / metrics.sent;
      metrics.conversionRate = metrics.meetings / metrics.sent;
    }

    if (metrics.replied > 0) {
      metrics.meetingConversionRate = metrics.meetings / metrics.replied;
    }

    // Calculate average response time
    const responseTimesHours = responses
      .filter(r => r.repliedDate && r.sentDate)
      .map(r => (r.repliedDate!.getTime() - r.sentDate.getTime()) / (1000 * 60 * 60));
    
    if (responseTimesHours.length > 0) {
      metrics.averageResponseTime = responseTimesHours.reduce((a, b) => a + b, 0) / responseTimesHours.length;
    }

    // Calculate average quality score
    const qualityScores = responses
      .filter(r => r.qualityRating)
      .map(r => r.qualityRating!);
    
    if (qualityScores.length > 0) {
      metrics.qualityScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
    }

    return metrics;
  }

  private calculateStatisticalConfidence(winnerMetrics?: ABTestMetrics, baselineMetrics?: ABTestMetrics): number {
    // Simplified confidence calculation
    // In production, use proper statistical tests (chi-square, t-test, etc.)
    if (!winnerMetrics || !baselineMetrics) return 0;
    
    const minSampleSize = 30;
    if (winnerMetrics.sent < minSampleSize || baselineMetrics.sent < minSampleSize) {
      return 0.5; // Low confidence with small samples
    }

    const difference = Math.abs(winnerMetrics.positiveResponseRate - baselineMetrics.positiveResponseRate);
    const avgRate = (winnerMetrics.positiveResponseRate + baselineMetrics.positiveResponseRate) / 2;
    
    if (difference > avgRate * 0.3) return 0.95; // High confidence for large differences
    if (difference > avgRate * 0.2) return 0.85; // Medium-high confidence
    if (difference > avgRate * 0.1) return 0.7;  // Medium confidence
    return 0.6; // Low confidence for small differences
  }

  private generateRecommendations(variants: PitchVariant[], winner?: PitchVariant): string[] {
    const recommendations = [];

    if (winner) {
      recommendations.push(`Use ${winner.name} approach as primary template`);
      
      if (winner.modifications.hookStyle) {
        recommendations.push(`Adopt ${winner.modifications.hookStyle} hook style for future pitches`);
      }
      
      if (winner.metrics.positiveResponseRate >= 0.15) {
        recommendations.push(`Winner achieves target 15%+ response rate - scale this approach`);
      } else {
        recommendations.push(`Response rate below 15% target - consider further optimization`);
      }
    }

    // General recommendations based on all variants
    const avgResponseRate = variants.reduce((sum, v) => sum + v.metrics.positiveResponseRate, 0) / variants.length;
    
    if (avgResponseRate < 0.10) {
      recommendations.push('Consider more personalized messaging approach');
      recommendations.push('Review target audience qualification criteria');
    }

    if (avgResponseRate < 0.05) {
      recommendations.push('Fundamental messaging strategy may need revision');
      recommendations.push('Consider testing completely different value propositions');
    }

    return recommendations;
  }

  private generateInsights(variants: PitchVariant[]): string[] {
    const insights = [];

    // Response rate insights
    const responseRates = variants.map(v => v.metrics.positiveResponseRate);
    const maxRate = Math.max(...responseRates);
    const minRate = Math.min(...responseRates);
    
    if (maxRate - minRate > 0.05) {
      insights.push('Significant variation in response rates suggests messaging approach matters greatly');
    }

    // Quality insights
    const avgQuality = variants.reduce((sum, v) => sum + (v.metrics.qualityScore || 0), 0) / variants.length;
    if (avgQuality > 7) {
      insights.push('High quality scores indicate good prospect fit and messaging relevance');
    }

    // Timing insights
    const avgResponseTimes = variants.map(v => v.metrics.averageResponseTime).filter(t => t > 0);
    if (avgResponseTimes.length > 0) {
      const fastestResponse = Math.min(...avgResponseTimes);
      if (fastestResponse < 24) {
        insights.push('Fast response times suggest strong initial interest generation');
      }
    }

    return insights;
  }

  private generateNextActions(variants: PitchVariant[], winner?: PitchVariant): string[] {
    const actions = [];

    if (winner) {
      if (winner.metrics.positiveResponseRate >= 0.15) {
        actions.push('Scale winning variant to larger audience');
        actions.push('Create templated version for team use');
      } else {
        actions.push('Optimize winning variant further to reach 15% target');
        actions.push('Test additional variations of winning approach');
      }
    }

    actions.push('Conduct follow-up analysis after 100 more responses');
    actions.push('Test winning elements in different industry verticals');
    actions.push('Create automated variant assignment for ongoing optimization');

    return actions;
  }

  // File I/O operations
  private async saveTest(test: ABTestConfig): Promise<void> {
    const filePath = join(this.testsPath, `${test.testId}.json`);
    await writeFile(filePath, JSON.stringify(test, null, 2));
  }

  private async loadTest(testId: string): Promise<ABTestConfig> {
    const filePath = join(this.testsPath, `${testId}.json`);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  private async savePitchResponse(response: PitchResponse): Promise<void> {
    const filePath = join(this.responsesPath, `${response.pitchId}.json`);
    await writeFile(filePath, JSON.stringify(response, null, 2));
  }

  private async loadPitchResponse(pitchId: string): Promise<PitchResponse> {
    const filePath = join(this.responsesPath, `${pitchId}.json`);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  private async loadAllResponsesForTest(testId: string): Promise<PitchResponse[]> {
    // In production, this would be more efficient with a database
    // For now, we'll implement a simple file-based approach
    const responses: PitchResponse[] = [];
    
    try {
      const files = await readFile(join(this.responsesPath, 'index.json'), 'utf8');
      const responseFiles: string[] = JSON.parse(files);
      
      for (const file of responseFiles) {
        try {
          const response = await this.loadPitchResponse(file.replace('.json', ''));
          if (response.testId === testId) {
            responses.push(response);
          }
        } catch (error) {
          // Skip missing files
        }
      }
    } catch (error) {
      // Index file doesn't exist yet
    }

    return responses;
  }

  private async updateVariantMetrics(testId: string, variantId: string, updates: Partial<ABTestMetrics>): Promise<void> {
    const test = await this.loadTest(testId);
    const variant = test.variants.find(v => v.id === variantId);
    
    if (variant) {
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof ABTestMetrics;
        (variant.metrics[typedKey] as number) += (updates[typedKey] as number) || 0;
      });
      
      await this.saveTest(test);
    }
  }

  private async saveTestResults(testId: string, results: ABTestResults): Promise<void> {
    const filePath = join(this.testsPath, `${testId}_results.json`);
    await writeFile(filePath, JSON.stringify(results, null, 2));
  }
}

// Export for use in pitch creator agent
export default PitchABTestingFramework;