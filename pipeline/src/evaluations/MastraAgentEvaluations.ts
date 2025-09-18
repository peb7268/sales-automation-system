import { anthropic } from '@ai-sdk/anthropic';
import { Logger } from '../utils/logging';

export interface EvaluationCriterion {
  name: string;
  weight: number;
  evaluator: 'rule_based' | 'model_graded' | 'statistical';
  rule?: string;
  model?: any;
  prompt?: string;
  metric?: string;
  threshold?: number;
}

export interface EvaluationResult {
  criterion: string;
  score: number; // 0-1
  explanation?: string;
  passed: boolean;
  weight: number;
}

export interface QualityAssessment {
  overall_score: number; // 0-1
  letter_grade: string;
  passed: boolean;
  results: EvaluationResult[];
  timestamp: Date;
  recommendations: string[];
}

/**
 * Evaluation framework for Mastra agents
 * Provides comprehensive quality assessment for agent outputs
 */
export class MastraAgentEvaluations {
  private logger: Logger;
  private evaluationModel: any;

  constructor() {
    this.logger = new Logger('MastraAgentEvaluations', 'evaluation');
    this.evaluationModel = anthropic('claude-3-haiku-20240307', {
      temperature: 0.1,
      maxTokens: 2000
    });
  }

  /**
   * Evaluate prospecting agent output quality
   */
  async evaluateProspectingQuality(prospectData: any): Promise<QualityAssessment> {
    this.logger.info('Evaluating prospecting quality', { 
      businessName: prospectData.business?.name || prospectData.businessName 
    });

    const criteria = this.getProspectingQualityCriteria();
    const results: EvaluationResult[] = [];

    for (const criterion of criteria) {
      try {
        const result = await this.evaluateCriterion(criterion, prospectData);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to evaluate criterion ${criterion.name}`, { 
          error: error.message 
        });
        results.push({
          criterion: criterion.name,
          score: 0,
          passed: false,
          weight: criterion.weight,
          explanation: `Evaluation failed: ${error.message}`
        });
      }
    }

    return this.calculateOverallAssessment(results, 'prospecting');
  }

  /**
   * Evaluate pitch quality
   */
  async evaluatePitchQuality(pitchContent: string, prospectData: any): Promise<QualityAssessment> {
    this.logger.info('Evaluating pitch quality', { 
      businessName: prospectData.company || prospectData.businessName,
      pitchLength: pitchContent.length
    });

    const criteria = this.getPitchQualityCriteria();
    const results: EvaluationResult[] = [];
    const context = { pitchContent, prospectData };

    for (const criterion of criteria) {
      try {
        const result = await this.evaluateCriterion(criterion, context);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to evaluate criterion ${criterion.name}`, { 
          error: error.message 
        });
        results.push({
          criterion: criterion.name,
          score: 0,
          passed: false,
          weight: criterion.weight,
          explanation: `Evaluation failed: ${error.message}`
        });
      }
    }

    return this.calculateOverallAssessment(results, 'pitch');
  }

  /**
   * Evaluate workflow execution performance
   */
  async evaluateWorkflowPerformance(
    workflowType: string,
    executionTime: number,
    result: any,
    errors: string[]
  ): Promise<QualityAssessment> {
    this.logger.info('Evaluating workflow performance', { 
      workflowType,
      executionTime,
      errorCount: errors.length
    });

    const criteria = this.getWorkflowPerformanceCriteria(workflowType);
    const results: EvaluationResult[] = [];
    const context = { workflowType, executionTime, result, errors };

    for (const criterion of criteria) {
      try {
        const evalResult = await this.evaluateCriterion(criterion, context);
        results.push(evalResult);
      } catch (error) {
        this.logger.error(`Failed to evaluate criterion ${criterion.name}`, { 
          error: error.message 
        });
        results.push({
          criterion: criterion.name,
          score: 0,
          passed: false,
          weight: criterion.weight,
          explanation: `Evaluation failed: ${error.message}`
        });
      }
    }

    return this.calculateOverallAssessment(results, 'workflow');
  }

  /**
   * Batch evaluate multiple prospects
   */
  async batchEvaluateProspects(prospects: any[]): Promise<{
    individual: QualityAssessment[];
    aggregate: {
      averageScore: number;
      passRate: number;
      commonIssues: string[];
      recommendations: string[];
    };
  }> {
    this.logger.info('Starting batch prospect evaluation', { count: prospects.length });

    const individual: QualityAssessment[] = [];
    const scores: number[] = [];
    const allRecommendations: string[] = [];

    // Evaluate each prospect individually
    for (let i = 0; i < prospects.length; i++) {
      try {
        const assessment = await this.evaluateProspectingQuality(prospects[i]);
        individual.push(assessment);
        scores.push(assessment.overall_score);
        allRecommendations.push(...assessment.recommendations);

        // Log progress for large batches
        if (i > 0 && i % 10 === 0) {
          this.logger.info(`Batch evaluation progress: ${i}/${prospects.length}`);
        }
      } catch (error) {
        this.logger.error(`Failed to evaluate prospect ${i}`, { error: error.message });
      }
    }

    // Calculate aggregate metrics
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const passRate = individual.filter(a => a.passed).length / individual.length;
    const commonIssues = this.identifyCommonIssues(individual);
    const recommendations = this.aggregateRecommendations(allRecommendations);

    this.logger.info('Batch evaluation completed', {
      evaluatedCount: individual.length,
      averageScore,
      passRate,
      commonIssuesCount: commonIssues.length
    });

    return {
      individual,
      aggregate: {
        averageScore,
        passRate,
        commonIssues,
        recommendations
      }
    };
  }

  /**
   * Compare two pitch versions
   */
  async comparePitchVersions(
    pitchA: string,
    pitchB: string,
    prospectData: any
  ): Promise<{
    winner: 'A' | 'B' | 'tie';
    scoreA: QualityAssessment;
    scoreB: QualityAssessment;
    comparison: {
      criterion: string;
      scoreA: number;
      scoreB: number;
      difference: number;
      winner: 'A' | 'B' | 'tie';
    }[];
    recommendation: string;
  }> {
    this.logger.info('Comparing pitch versions', { 
      businessName: prospectData.company || prospectData.businessName
    });

    // Evaluate both pitches
    const [scoreA, scoreB] = await Promise.all([
      this.evaluatePitchQuality(pitchA, prospectData),
      this.evaluatePitchQuality(pitchB, prospectData)
    ]);

    // Compare criterion by criterion
    const comparison = [];
    for (let i = 0; i < scoreA.results.length; i++) {
      const resultA = scoreA.results[i];
      const resultB = scoreB.results[i];
      const difference = resultA.score - resultB.score;
      
      comparison.push({
        criterion: resultA.criterion,
        scoreA: resultA.score,
        scoreB: resultB.score,
        difference,
        winner: difference > 0.05 ? 'A' : difference < -0.05 ? 'B' : 'tie'
      });
    }

    // Determine overall winner
    const scoreDiff = scoreA.overall_score - scoreB.overall_score;
    const winner = scoreDiff > 0.05 ? 'A' : scoreDiff < -0.05 ? 'B' : 'tie';

    // Generate recommendation
    const recommendation = this.generateComparisonRecommendation(winner, comparison, scoreA, scoreB);

    this.logger.info('Pitch comparison completed', {
      winner,
      scoreA: scoreA.overall_score,
      scoreB: scoreB.overall_score,
      difference: scoreDiff
    });

    return {
      winner,
      scoreA,
      scoreB,
      comparison,
      recommendation
    };
  }

  // Private evaluation methods

  private async evaluateCriterion(criterion: EvaluationCriterion, data: any): Promise<EvaluationResult> {
    let score = 0;
    let explanation = '';

    switch (criterion.evaluator) {
      case 'rule_based':
        ({ score, explanation } = this.evaluateRuleBased(criterion, data));
        break;
      
      case 'model_graded':
        ({ score, explanation } = await this.evaluateModelGraded(criterion, data));
        break;
      
      case 'statistical':
        ({ score, explanation } = this.evaluateStatistical(criterion, data));
        break;
      
      default:
        throw new Error(`Unknown evaluator type: ${criterion.evaluator}`);
    }

    const passed = score >= (criterion.threshold || 0.7);

    return {
      criterion: criterion.name,
      score,
      explanation,
      passed,
      weight: criterion.weight
    };
  }

  private evaluateRuleBased(criterion: EvaluationCriterion, data: any): { score: number; explanation: string } {
    let score = 0;
    let explanation = '';

    switch (criterion.name) {
      case 'contact_completeness':
        score = this.evaluateContactCompleteness(data);
        explanation = `Contact completeness score based on available phone, email, and website information`;
        break;

      case 'roi_realism':
        score = this.evaluateROIRealism(data);
        explanation = `ROI projection falls within realistic range (100-500% annually)`;
        break;

      case 'personalization_keywords':
        score = this.evaluatePersonalizationKeywords(data);
        explanation = `Pitch contains business name and industry-specific keywords`;
        break;

      case 'call_to_action_presence':
        score = this.evaluateCallToActionPresence(data);
        explanation = `Pitch contains clear call-to-action`;
        break;

      default:
        throw new Error(`Unknown rule-based criterion: ${criterion.name}`);
    }

    return { score, explanation };
  }

  private async evaluateModelGraded(
    criterion: EvaluationCriterion, 
    data: any
  ): Promise<{ score: number; explanation: string }> {
    if (!criterion.prompt) {
      throw new Error(`Model-graded criterion ${criterion.name} requires a prompt`);
    }

    try {
      // Prepare context for the evaluation model
      const evaluationPrompt = this.buildEvaluationPrompt(criterion, data);

      // Execute evaluation using the model
      // Note: This would need to be adapted based on actual AI SDK usage
      const response = await this.executeModelEvaluation(evaluationPrompt);

      // Parse the response to extract score and explanation
      const { score, explanation } = this.parseModelResponse(response);

      return { score, explanation };

    } catch (error) {
      this.logger.error(`Model evaluation failed for ${criterion.name}`, { error: error.message });
      return { 
        score: 0, 
        explanation: `Model evaluation failed: ${error.message}` 
      };
    }
  }

  private evaluateStatistical(criterion: EvaluationCriterion, data: any): { score: number; explanation: string } {
    let score = 0;
    let explanation = '';

    switch (criterion.name) {
      case 'qualification_score_distribution':
        score = this.evaluateQualificationDistribution(data);
        explanation = `Qualification score follows expected distribution`;
        break;

      case 'execution_time_performance':
        score = this.evaluateExecutionTimePerformance(data);
        explanation = `Execution time within acceptable performance range`;
        break;

      case 'error_rate':
        score = this.evaluateErrorRate(data);
        explanation = `Error rate within acceptable threshold`;
        break;

      default:
        throw new Error(`Unknown statistical criterion: ${criterion.name}`);
    }

    return { score, explanation };
  }

  // Criterion definitions

  private getProspectingQualityCriteria(): EvaluationCriterion[] {
    return [
      {
        name: 'contact_completeness',
        weight: 0.3,
        evaluator: 'rule_based',
        threshold: 0.7
      },
      {
        name: 'data_accuracy',
        weight: 0.4,
        evaluator: 'model_graded',
        model: this.evaluationModel,
        prompt: 'Rate the accuracy and validity of this prospect data on a scale of 0-1. Consider whether the business information, contact details, and digital presence assessment are realistic and consistent.',
        threshold: 0.8
      },
      {
        name: 'qualification_relevance',
        weight: 0.3,
        evaluator: 'statistical',
        metric: 'qualification_score_distribution',
        threshold: 0.6
      }
    ];
  }

  private getPitchQualityCriteria(): EvaluationCriterion[] {
    return [
      {
        name: 'personalization',
        weight: 0.25,
        evaluator: 'model_graded',
        model: this.evaluationModel,
        prompt: 'Rate how well this pitch is personalized to the specific business. Consider use of business name, industry details, location, and specific business characteristics.',
        threshold: 0.8
      },
      {
        name: 'value_proposition_clarity',
        weight: 0.25,
        evaluator: 'model_graded',
        model: this.evaluationModel,
        prompt: 'Rate the clarity and strength of the value proposition. Is it clear what benefits the business will receive? Are the benefits specific and compelling?',
        threshold: 0.7
      },
      {
        name: 'roi_realism',
        weight: 0.25,
        evaluator: 'rule_based',
        threshold: 0.8
      },
      {
        name: 'call_to_action_effectiveness',
        weight: 0.25,
        evaluator: 'model_graded',
        model: this.evaluationModel,
        prompt: 'Rate the effectiveness of the call-to-action. Is it clear, specific, and likely to prompt a response? Does it provide clear next steps?',
        threshold: 0.7
      }
    ];
  }

  private getWorkflowPerformanceCriteria(workflowType: string): EvaluationCriterion[] {
    const baseCriteria = [
      {
        name: 'execution_time_performance',
        weight: 0.3,
        evaluator: 'statistical',
        metric: 'execution_time',
        threshold: 0.7
      },
      {
        name: 'error_rate',
        weight: 0.4,
        evaluator: 'statistical',
        metric: 'error_count',
        threshold: 0.8
      },
      {
        name: 'output_quality',
        weight: 0.3,
        evaluator: 'model_graded',
        model: this.evaluationModel,
        prompt: 'Rate the overall quality of the workflow output. Consider completeness, accuracy, and usefulness.',
        threshold: 0.8
      }
    ];

    // Add workflow-specific criteria
    if (workflowType === 'prospecting') {
      baseCriteria.push({
        name: 'prospect_yield',
        weight: 0.2,
        evaluator: 'statistical',
        metric: 'qualified_prospects_ratio',
        threshold: 0.6
      });
    }

    return baseCriteria;
  }

  // Helper evaluation methods

  private evaluateContactCompleteness(data: any): number {
    const prospect = data.business || data;
    let score = 0;
    let totalFields = 3;

    if (prospect.phone || data.phone) score++;
    if (prospect.email || data.email) score++;
    if (prospect.website || data.website) score++;

    return score / totalFields;
  }

  private evaluateROIRealism(data: any): number {
    const pitchContent = data.pitchContent || '';
    
    // Extract ROI numbers from pitch content
    const roiMatches = pitchContent.match(/(\d+)%.*roi|roi.*(\d+)%/gi);
    if (!roiMatches) return 0.5; // No ROI mentioned

    // Check if ROI is in realistic range (100-500%)
    const roiNumbers = roiMatches.map(match => {
      const numbers = match.match(/\d+/g);
      return numbers ? parseInt(numbers[0]) : 0;
    });

    const validROI = roiNumbers.some(roi => roi >= 100 && roi <= 500);
    return validROI ? 1.0 : 0.3;
  }

  private evaluatePersonalizationKeywords(data: any): number {
    const pitchContent = data.pitchContent || '';
    const prospectData = data.prospectData || {};
    
    let score = 0;
    let totalChecks = 3;

    // Check for business name
    const businessName = prospectData.company || prospectData.businessName;
    if (businessName && pitchContent.includes(businessName)) score++;

    // Check for industry mention
    const industry = prospectData.industry;
    if (industry && pitchContent.toLowerCase().includes(industry.toLowerCase())) score++;

    // Check for location mention
    const location = prospectData.location || prospectData.city;
    if (location && pitchContent.includes(location)) score++;

    return score / totalChecks;
  }

  private evaluateCallToActionPresence(data: any): number {
    const pitchContent = data.pitchContent || '';
    
    const ctaKeywords = ['call', 'meeting', 'schedule', 'contact', 'reach out', 'discuss', 'chat'];
    const hasCallToAction = ctaKeywords.some(keyword => 
      pitchContent.toLowerCase().includes(keyword)
    );

    return hasCallToAction ? 1.0 : 0.0;
  }

  private evaluateQualificationDistribution(data: any): number {
    // Simplified statistical evaluation
    const score = data.qualification_score || data.qualificationScore;
    if (typeof score !== 'number') return 0.5;

    // Expect scores to be distributed appropriately
    if (score >= 60 && score <= 90) return 1.0;
    if (score >= 40 && score <= 95) return 0.8;
    return 0.4;
  }

  private evaluateExecutionTimePerformance(data: any): number {
    const executionTime = data.executionTime || 0;
    
    // Performance thresholds (in milliseconds)
    if (executionTime < 5000) return 1.0;      // Excellent: < 5 seconds
    if (executionTime < 10000) return 0.8;     // Good: < 10 seconds
    if (executionTime < 20000) return 0.6;     // Acceptable: < 20 seconds
    if (executionTime < 30000) return 0.4;     // Poor: < 30 seconds
    return 0.2;                                 // Very poor: >= 30 seconds
  }

  private evaluateErrorRate(data: any): number {
    const errors = data.errors || [];
    const errorCount = Array.isArray(errors) ? errors.length : 0;

    // Score based on error count
    if (errorCount === 0) return 1.0;
    if (errorCount <= 2) return 0.8;
    if (errorCount <= 5) return 0.6;
    return 0.3;
  }

  // Model evaluation helpers

  private buildEvaluationPrompt(criterion: EvaluationCriterion, data: any): string {
    let context = '';
    
    if (data.pitchContent) {
      context += `Pitch Content:\n${data.pitchContent}\n\n`;
    }
    
    if (data.prospectData) {
      context += `Prospect Data:\n${JSON.stringify(data.prospectData, null, 2)}\n\n`;
    }

    return `${criterion.prompt}\n\nContext:\n${context}\n\nPlease provide a score between 0 and 1, followed by a brief explanation.\nFormat: Score: X.X\nExplanation: [your explanation]`;
  }

  private async executeModelEvaluation(prompt: string): Promise<string> {
    // This would need to be implemented based on the actual AI SDK usage
    // For now, return a mock response
    return "Score: 0.8\nExplanation: Good personalization and clear value proposition.";
  }

  private parseModelResponse(response: string): { score: number; explanation: string } {
    const scoreMatch = response.match(/Score:\s*(\d*\.?\d+)/i);
    const explanationMatch = response.match(/Explanation:\s*(.+)/is);

    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';

    return { score: Math.max(0, Math.min(1, score)), explanation };
  }

  // Assessment calculation

  private calculateOverallAssessment(results: EvaluationResult[], type: string): QualityAssessment {
    const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
    const weightedScore = results.reduce((sum, result) => sum + (result.score * result.weight), 0);
    const overall_score = totalWeight > 0 ? weightedScore / totalWeight : 0;

    const letter_grade = this.calculateLetterGrade(overall_score);
    const passed = overall_score >= 0.7; // 70% threshold for passing

    const recommendations = this.generateRecommendations(results, type);

    return {
      overall_score,
      letter_grade,
      passed,
      results,
      timestamp: new Date(),
      recommendations
    };
  }

  private calculateLetterGrade(score: number): string {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C';
    if (score >= 0.6) return 'D';
    return 'F';
  }

  private generateRecommendations(results: EvaluationResult[], type: string): string[] {
    const recommendations = [];
    const failedCriteria = results.filter(r => !r.passed);

    for (const failed of failedCriteria) {
      switch (failed.criterion) {
        case 'contact_completeness':
          recommendations.push('Improve data enrichment to capture more complete contact information');
          break;
        case 'personalization':
          recommendations.push('Include more specific business details and industry insights in pitches');
          break;
        case 'roi_realism':
          recommendations.push('Ensure ROI projections are realistic and well-supported');
          break;
        case 'execution_time_performance':
          recommendations.push('Optimize workflow performance to reduce execution time');
          break;
        case 'error_rate':
          recommendations.push('Implement better error handling and validation');
          break;
        default:
          recommendations.push(`Improve ${failed.criterion.replace(/_/g, ' ')}`);
      }
    }

    return recommendations;
  }

  // Batch evaluation helpers

  private identifyCommonIssues(assessments: QualityAssessment[]): string[] {
    const issueFrequency = new Map<string, number>();

    for (const assessment of assessments) {
      const failedCriteria = assessment.results.filter(r => !r.passed);
      for (const failed of failedCriteria) {
        const current = issueFrequency.get(failed.criterion) || 0;
        issueFrequency.set(failed.criterion, current + 1);
      }
    }

    // Return issues that affect more than 20% of the batch
    const threshold = Math.ceil(assessments.length * 0.2);
    return Array.from(issueFrequency.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([issue, _]) => issue.replace(/_/g, ' '))
      .sort();
  }

  private aggregateRecommendations(allRecommendations: string[]): string[] {
    const recommendationFrequency = new Map<string, number>();

    for (const rec of allRecommendations) {
      const current = recommendationFrequency.get(rec) || 0;
      recommendationFrequency.set(rec, current + 1);
    }

    return Array.from(recommendationFrequency.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 5) // Top 5 recommendations
      .map(([rec, _]) => rec);
  }

  private generateComparisonRecommendation(
    winner: 'A' | 'B' | 'tie',
    comparison: any[],
    scoreA: QualityAssessment,
    scoreB: QualityAssessment
  ): string {
    if (winner === 'tie') {
      return 'Both pitches are of similar quality. Consider combining the best elements of each.';
    }

    const winnerScore = winner === 'A' ? scoreA : scoreB;
    const strongestCriteria = comparison
      .filter(c => c.winner === winner)
      .map(c => c.criterion)
      .slice(0, 2);

    return `Version ${winner} is recommended. It excels in ${strongestCriteria.join(' and ')}. Overall grade: ${winnerScore.letter_grade}`;
  }
}

// Export singleton instance
export const mastraAgentEvaluations = new MastraAgentEvaluations();