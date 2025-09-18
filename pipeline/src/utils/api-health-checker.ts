/**
 * API Health Checker
 * Tests all API endpoints before running prospect research
 */

import { Logger } from './logging';

export interface ApiHealthCheck {
  service: string;
  healthy: boolean;
  error?: string;
  suggestions?: string[];
}

export interface ApiHealthReport {
  allHealthy: boolean;
  checks: ApiHealthCheck[];
  timestamp: Date;
}

export class ApiHealthChecker {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ApiHealthChecker', 'system');
  }

  /**
   * Run comprehensive API health checks
   */
  async checkAllApis(): Promise<ApiHealthReport> {
    const checks: ApiHealthCheck[] = [];
    
    // Test Google Maps API
    checks.push(await this.checkGoogleMapsApi());
    
    // Test Firecrawl API
    checks.push(await this.checkFirecrawlApi());
    
    // Test Perplexity API
    checks.push(await this.checkPerplexityApi());
    
    const allHealthy = checks.every(check => check.healthy);
    
    const report: ApiHealthReport = {
      allHealthy,
      checks,
      timestamp: new Date()
    };

    this.logger.info('API health check completed', {
      allHealthy,
      healthyServices: checks.filter(c => c.healthy).length,
      totalServices: checks.length
    });

    return report;
  }

  /**
   * Test Google Maps API
   */
  private async checkGoogleMapsApi(): Promise<ApiHealthCheck> {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Google Maps',
        healthy: false,
        error: 'GOOGLE_API_KEY not found in environment',
        suggestions: [
          'Add GOOGLE_API_KEY to your .env file',
          'Get API key from Google Cloud Console: https://console.cloud.google.com/apis/credentials',
          'Enable Places API and Maps JavaScript API'
        ]
      };
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED') {
        return {
          service: 'Google Maps',
          healthy: false,
          error: data.error_message || 'Request denied',
          suggestions: [
            'Check that your Google API key is valid',
            'Ensure Places API is enabled in Google Cloud Console',
            'Verify billing is set up for your Google Cloud project',
            'Check API key restrictions and allowed origins'
          ]
        };
      }

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return {
          service: 'Google Maps',
          healthy: true
        };
      }

      return {
        service: 'Google Maps',
        healthy: false,
        error: `Unexpected response: ${data.status}`,
        suggestions: [
          'Check Google Cloud Console for API quotas and limits',
          'Verify your API key has proper permissions'
        ]
      };

    } catch (error) {
      return {
        service: 'Google Maps',
        healthy: false,
        error: error.message,
        suggestions: [
          'Check your internet connection',
          'Verify the Google Maps API endpoint is accessible',
          'Check if your network blocks external API calls'
        ]
      };
    }
  }

  /**
   * Test Firecrawl API
   */
  private async checkFirecrawlApi(): Promise<ApiHealthCheck> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Firecrawl',
        healthy: false,
        error: 'FIRECRAWL_API_KEY not found in environment',
        suggestions: [
          'Add FIRECRAWL_API_KEY to your .env file',
          'Get API key from https://firecrawl.dev/account',
          'Sign up for Firecrawl if you don\'t have an account'
        ]
      };
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com'
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        return {
          service: 'Firecrawl',
          healthy: false,
          error: 'Unauthorized - Invalid API key',
          suggestions: [
            'Check that your Firecrawl API key is correct',
            'Generate a new API key from https://firecrawl.dev/account',
            'Ensure your API key starts with "fc-"'
          ]
        };
      }

      if (response.status === 402) {
        return {
          service: 'Firecrawl',
          healthy: false,
          error: 'Payment required - API credits exhausted',
          suggestions: [
            'Add credits to your Firecrawl account',
            'Upgrade your Firecrawl plan',
            'Check usage limits in your Firecrawl dashboard'
          ]
        };
      }

      if (data.success === true || response.ok) {
        return {
          service: 'Firecrawl',
          healthy: true
        };
      }

      return {
        service: 'Firecrawl',
        healthy: false,
        error: data.error || `HTTP ${response.status}`,
        suggestions: [
          'Check Firecrawl service status',
          'Verify your API key permissions',
          'Try again in a few minutes'
        ]
      };

    } catch (error) {
      return {
        service: 'Firecrawl',
        healthy: false,
        error: error.message,
        suggestions: [
          'Check your internet connection',
          'Verify the Firecrawl API endpoint is accessible',
          'Check if your network blocks external API calls'
        ]
      };
    }
  }

  /**
   * Test Perplexity API with current models
   */
  private async checkPerplexityApi(): Promise<ApiHealthCheck> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Perplexity',
        healthy: false,
        error: 'PERPLEXITY_API_KEY not found in environment',
        suggestions: [
          'Add PERPLEXITY_API_KEY to your .env file',
          'Get API key from https://www.perplexity.ai/settings/api',
          'Sign up for Perplexity Pro if you don\'t have an account'
        ]
      };
    }

    // Use current Perplexity API model names (updated Jan 2025)
    const modelsToTry = [
      'sonar',
      'sonar-pro',
      'sonar-reasoning',
      'sonar-reasoning-pro'
    ];

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10
          })
        });

        const data = await response.json();

        if (response.status === 401) {
          return {
            service: 'Perplexity',
            healthy: false,
            error: 'Unauthorized - Invalid API key',
            suggestions: [
              'Check that your Perplexity API key is correct',
              'Generate a new API key from https://www.perplexity.ai/settings/api',
              'Ensure you have a Perplexity Pro subscription',
              'Verify your API key starts with "pplx-"'
            ]
          };
        }

        if (response.status === 402) {
          return {
            service: 'Perplexity',
            healthy: false,
            error: 'Payment required - Credits exhausted',
            suggestions: [
              'Add credits to your Perplexity account',
              'Upgrade your Perplexity plan',
              'Check usage limits in your Perplexity dashboard'
            ]
          };
        }

        if (data.error && data.error.type === 'invalid_model') {
          // Try next model
          continue;
        }

        if (response.ok && data.choices && data.choices.length > 0) {
          return {
            service: 'Perplexity',
            healthy: true
          };
        }

      } catch (error) {
        // Try next model
        continue;
      }
    }

    return {
      service: 'Perplexity',
      healthy: false,
      error: 'All model attempts failed',
      suggestions: [
        'Check Perplexity API documentation for current model names',
        'Visit https://docs.perplexity.ai/guides/model-cards',
        'Verify your internet connection',
        'Try updating your Perplexity API key',
        'Contact Perplexity support if the issue persists'
      ]
    };
  }

  /**
   * Display health check results to user
   */
  displayHealthReport(report: ApiHealthReport): void {
    console.log('\n🔍 API Health Check Results');
    console.log('='.repeat(50));
    
    report.checks.forEach(check => {
      const status = check.healthy ? '✅' : '❌';
      console.log(`${status} ${check.service}: ${check.healthy ? 'Healthy' : 'Failed'}`);
      
      if (!check.healthy) {
        console.log(`   Error: ${check.error}`);
        if (check.suggestions) {
          console.log('   Suggestions:');
          check.suggestions.forEach(suggestion => {
            console.log(`   • ${suggestion}`);
          });
        }
        console.log('');
      }
    });

    console.log('-'.repeat(50));
    console.log(`Overall Status: ${report.allHealthy ? '✅ All APIs Healthy' : '❌ Some APIs Failed'}`);
    console.log(`Healthy Services: ${report.checks.filter(c => c.healthy).length}/${report.checks.length}`);
    console.log('');
  }

  /**
   * Prompt user for how to proceed when APIs fail
   */
  async promptUserOnFailure(report: ApiHealthReport): Promise<'continue' | 'fix' | 'abort'> {
    if (report.allHealthy) {
      return 'continue';
    }

    const healthyCount = report.checks.filter(c => c.healthy).length;
    const totalCount = report.checks.length;

    console.log('⚠️  Some APIs are not working properly.');
    console.log('   This will result in incomplete prospect research.');
    console.log('');
    console.log('Options:');
    console.log('1. CONTINUE - Run with degraded functionality (limited data)');
    console.log('2. FIX - Fix API keys and try again');
    console.log('3. ABORT - Stop and fix issues first');
    console.log('');
    
    // If majority of APIs are working (2/3 or better), allow continuing
    if (healthyCount >= 2) {
      console.log(`💡 ${healthyCount}/${totalCount} APIs are working. Continuing with available functionality.`);
      return 'continue';
    }
    
    // For automation purposes, return 'fix' if too many APIs are failing
    return 'fix';
  }
}