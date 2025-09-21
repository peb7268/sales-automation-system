export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prospects: {
        Row: {
          id: string
          business_name: string
          industry: string
          location: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          temperature: 'cold' | 'warm' | 'hot'
          pipeline_stage: 'cold' | 'contacted' | 'interested' | 'qualified'
          score: number
          research_data: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          industry: string
          location: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          temperature?: 'cold' | 'warm' | 'hot'
          pipeline_stage?: 'cold' | 'contacted' | 'interested' | 'qualified'
          score?: number
          research_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          industry?: string
          location?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          temperature?: 'cold' | 'warm' | 'hot'
          pipeline_stage?: 'cold' | 'contacted' | 'interested' | 'qualified'
          score?: number
          research_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          status: 'draft' | 'active' | 'paused' | 'completed'
          type: 'cold_outreach' | 'follow_up' | 'qualification' | 'closing'
          target_count: number
          completed_count: number
          success_count: number
          script: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'draft' | 'active' | 'paused' | 'completed'
          type: 'cold_outreach' | 'follow_up' | 'qualification' | 'closing'
          target_count?: number
          completed_count?: number
          success_count?: number
          script?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'draft' | 'active' | 'paused' | 'completed'
          type?: 'cold_outreach' | 'follow_up' | 'qualification' | 'closing'
          target_count?: number
          completed_count?: number
          success_count?: number
          script?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          prospect_id: string
          campaign_id: string | null
          duration: number
          outcome: 'no_answer' | 'voicemail' | 'callback' | 'interested' | 'not_interested' | 'qualified'
          transcript: string | null
          recording_url: string | null
          sentiment_score: number | null
          notes: string | null
          scheduled_followup: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prospect_id: string
          campaign_id?: string | null
          duration: number
          outcome: 'no_answer' | 'voicemail' | 'callback' | 'interested' | 'not_interested' | 'qualified'
          transcript?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          notes?: string | null
          scheduled_followup?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prospect_id?: string
          campaign_id?: string | null
          duration?: number
          outcome?: 'no_answer' | 'voicemail' | 'callback' | 'interested' | 'not_interested' | 'qualified'
          transcript?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          notes?: string | null
          scheduled_followup?: string | null
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          type: string
          payload: Json
          timestamp: string
        }
        Insert: {
          id?: string
          type: string
          payload: Json
          timestamp: string
        }
        Update: {
          id?: string
          type?: string
          payload?: Json
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      temperature: 'cold' | 'warm' | 'hot'
      pipeline_stage: 'cold' | 'contacted' | 'interested' | 'qualified'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed'
      campaign_type: 'cold_outreach' | 'follow_up' | 'qualification' | 'closing'
      call_outcome: 'no_answer' | 'voicemail' | 'callback' | 'interested' | 'not_interested' | 'qualified'
    }
  }
}

// Helper types for easier usage
export type Prospect = Database['public']['Tables']['prospects']['Row']
export type NewProspect = Database['public']['Tables']['prospects']['Insert']
export type UpdateProspect = Database['public']['Tables']['prospects']['Update']

export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type NewCampaign = Database['public']['Tables']['campaigns']['Insert']
export type UpdateCampaign = Database['public']['Tables']['campaigns']['Update']

export type Call = Database['public']['Tables']['calls']['Row']
export type NewCall = Database['public']['Tables']['calls']['Insert']
export type UpdateCall = Database['public']['Tables']['calls']['Update']

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type NewAnalyticsEvent = Database['public']['Tables']['analytics_events']['Insert']