// Core API client for Vapi integration
import { 
  VapiCall, 
  ListCallsParams, 
  ListCallsResponse, 
  CreateCallData,
  SyncResult,
  VapiAssistant,
  VapiPhoneNumber
} from './vapi-types';

export class VapiClient {
  private apiKey: string;
  private baseUrl: string;
  public calls: {
    create: (data: CreateCallData) => Promise<VapiCall>;
  };
  
  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.VAPI_API_KEY || '';
    this.baseUrl = baseUrl || process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
    
    if (!this.apiKey) {
      throw new Error('VAPI_API_KEY is required');
    }
    
    // Initialize calls namespace for compatibility
    this.calls = {
      create: (data: CreateCallData) => this.createCall(data)
    };
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }
  
  // List all calls with optional filtering
  async listCalls(params?: ListCallsParams): Promise<VapiCall[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = `/call?${queryParams.toString()}`;
    const response = await this.request<VapiCall[]>(endpoint);
    
    return response;
  }
  
  // Get a specific call by ID
  async getCall(id: string): Promise<VapiCall> {
    return this.request<VapiCall>(`/call/${id}`);
  }
  
  // Get call recording (returns URL or buffer based on implementation)
  async getRecording(callId: string): Promise<string> {
    const call = await this.getCall(callId);
    
    if (!call.artifact?.recordingUrl) {
      throw new Error(`No recording available for call ${callId}`);
    }
    
    return call.artifact.recordingUrl;
  }
  
  // Create a new outbound call
  async createCall(data: CreateCallData): Promise<VapiCall> {
    return this.request<VapiCall>('/call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // List phone numbers
  async listPhoneNumbers(): Promise<VapiPhoneNumber[]> {
    return this.request<VapiPhoneNumber[]>('/phone-number');
  }
  
  // Get a specific phone number
  async getPhoneNumber(id: string): Promise<VapiPhoneNumber> {
    return this.request<VapiPhoneNumber>(`/phone-number/${id}`);
  }
  
  // List assistants
  async listAssistants(): Promise<VapiAssistant[]> {
    return this.request<VapiAssistant[]>('/assistant');
  }
  
  // Get a specific assistant
  async getAssistant(id: string): Promise<VapiAssistant> {
    return this.request<VapiAssistant>(`/assistant/${id}`);
  }
  
  // Sync historical calls from Vapi to local database
  async syncHistoricalCalls(
    since?: Date,
    until?: Date,
    onProgress?: (progress: number, total: number) => void
  ): Promise<SyncResult> {
    const result: SyncResult = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    
    try {
      // Build query parameters for date range
      const params: ListCallsParams = {
        limit: 100 // Process in batches
      };
      
      if (since) {
        params.createdAtGe = since.toISOString();
      }
      
      if (until) {
        params.createdAtLe = until.toISOString();
      }
      
      // Fetch all calls
      const calls = await this.listCalls(params);
      const total = calls.length;
      
      console.log(`Found ${total} calls to sync from Vapi`);
      
      // Process each call
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i];
        
        try {
          // Import to database (this will be implemented in the database service)
          const imported = await this.importCallToDatabase(call);
          
          if (imported === 'new') {
            result.imported++;
          } else if (imported === 'updated') {
            result.updated++;
          }
          
          // Report progress
          if (onProgress) {
            onProgress(i + 1, total);
          }
        } catch (error) {
          result.failed++;
          result.errors?.push(`Failed to import call ${call.id}: ${error}`);
          console.error(`Failed to import call ${call.id}:`, error);
        }
      }
      
      console.log(`Sync complete: ${result.imported} imported, ${result.updated} updated, ${result.failed} failed`);
    } catch (error) {
      console.error('Failed to sync calls from Vapi:', error);
      throw error;
    }
    
    return result;
  }
  
  // Helper method to import a call to the database
  private async importCallToDatabase(call: VapiCall): Promise<'new' | 'updated' | 'failed'> {
    // Import the pg pool for database operations
    const { query } = await import('@/lib/db');
    
    try {
      // Check if call already exists
      const existingResult = await query(
        'SELECT * FROM calls WHERE vapi_call_id = $1 LIMIT 1',
        [call.id]
      );
      const existingCall = existingResult.rows[0];
      
      // Calculate qualification score based on call analysis
      let qualificationScore = 0;
      
      // Parse metadata for scoring
      if (call.metadata?.qualificationScore) {
        qualificationScore = call.metadata.qualificationScore;
      } else if (call.analysis?.structuredData) {
        // Calculate score from structured data
        const data = call.analysis.structuredData;
        if (data.interested) qualificationScore += 20;
        if (data.hasBudget) qualificationScore += 30;
        if (data.hasTimeline) qualificationScore += 20;
        if (data.hasChallenge) qualificationScore += 15;
        if (data.meetingScheduled) qualificationScore += 40;
      }
      
      // Determine outcome based on call end reason and metadata
      let outcome: string = 'no_answer';
      if (call.endedReason === 'customer-ended-call' && call.duration && call.duration > 30) {
        outcome = 'callback';
      }
      if (call.metadata?.outcome) {
        outcome = call.metadata.outcome;
      }
      
      // Map Vapi outcome to our enum values
      const outcomeMap: Record<string, string> = {
        'meeting_scheduled': 'qualified',
        'meeting-scheduled': 'qualified',
        'qualified': 'qualified',
        'interested': 'interested',
        'not_interested': 'not_interested',
        'voicemail': 'voicemail',
        'callback': 'callback',
        'no_answer': 'no_answer'
      };
      
      const mappedOutcome = outcomeMap[outcome] || 'no_answer';
      
      // Extract customer number
      const customerNumber = call.customer?.number || call.customerNumber || call.metadata?.customerNumber;
      
      if (existingCall) {
        // Update existing call
        await query(
          `UPDATE calls SET 
            vapi_status = $1,
            vapi_metadata = $2,
            cost = $3,
            qualification_score = $4,
            call_type = $5,
            assistant_id = $6,
            phone_number_id = $7,
            customer_number = $8,
            started_at = $9,
            ended_at = $10,
            duration = $11,
            outcome = $12,
            transcript = $13,
            recording_url = $14,
            summary = $15,
            error_message = $16,
            temperature = $17,
            updated_at = NOW()
          WHERE id = $18`,
          [
            call.status,
            JSON.stringify(call.metadata || {}),
            call.cost || null,
            qualificationScore,
            call.type === 'outboundPhoneCall' ? 'outbound' : 'inbound',
            call.assistantId || null,
            call.phoneNumberId || null,
            customerNumber || null,
            call.startedAt ? new Date(call.startedAt) : null,
            call.endedAt ? new Date(call.endedAt) : null,
            call.duration || 0,
            mappedOutcome,
            call.artifact?.transcript || null,
            call.artifact?.recordingUrl || null,
            call.analysis?.summary || null,
            call.endedReason || null,
            this.calculateTemperature(qualificationScore),
            existingCall.id
          ]
        );
        
        return 'updated';
      } else {
        // Get or create prospect ID based on phone number
        let prospectId: string | null = null;
        
        if (customerNumber) {
          // Try to match prospect by phone number using the function we created
          const prospectResult = await query(
            `SELECT id FROM prospects 
             WHERE regexp_replace(contact_phone, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
             LIMIT 1`,
            [customerNumber]
          );
          
          prospectId = prospectResult.rows[0]?.id || null;
        }
        
        // If no prospect found but we have metadata, try to match by company name
        if (!prospectId && call.metadata?.company) {
          const prospectResult = await query(
            'SELECT id FROM prospects WHERE business_name = $1 LIMIT 1',
            [call.metadata.company]
          );
          
          prospectId = prospectResult.rows[0]?.id || null;
        }
        
        // Create new call - use a default prospect ID if none found
        if (!prospectId) {
          // Get the first prospect as a fallback (this should be improved in production)
          const defaultProspect = await query(
            'SELECT id FROM prospects ORDER BY created_at ASC LIMIT 1'
          );
          
          prospectId = defaultProspect.rows[0]?.id || null;
        }
        
        if (!prospectId) {
          throw new Error('No prospect found to associate with call');
        }
        
        await query(
          `INSERT INTO calls (
            vapi_call_id, prospect_id, campaign_id, vapi_status, vapi_metadata,
            cost, qualification_score, call_type, assistant_id, phone_number_id,
            customer_number, started_at, ended_at, duration, outcome,
            transcript, recording_url, summary, error_message, temperature, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          )`,
          [
            call.id,
            prospectId,
            null, // campaign_id - will be set if we have campaign info
            call.status,
            JSON.stringify(call.metadata || {}),
            call.cost || null,
            qualificationScore,
            call.type === 'outboundPhoneCall' ? 'outbound' : 'inbound',
            call.assistantId || null,
            call.phoneNumberId || null,
            customerNumber || null,
            call.startedAt ? new Date(call.startedAt) : null,
            call.endedAt ? new Date(call.endedAt) : null,
            call.duration || 0,
            mappedOutcome,
            call.artifact?.transcript || null,
            call.artifact?.recordingUrl || null,
            call.analysis?.summary || null,
            call.endedReason || null,
            this.calculateTemperature(qualificationScore),
            new Date(call.createdAt)
          ]
        );
        
        return 'new';
      }
    } catch (error) {
      console.error(`Failed to import call ${call.id} to database:`, error);
      throw error;
    }
  }
  
  // Calculate temperature based on qualification score
  private calculateTemperature(score: number): string {
    if (score >= 85) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  }
}

// Export a singleton instance factory for convenience
let _vapiClient: VapiClient | null = null;

export function getVapiClient(): VapiClient {
  if (!_vapiClient) {
    _vapiClient = new VapiClient();
  }
  return _vapiClient;
}