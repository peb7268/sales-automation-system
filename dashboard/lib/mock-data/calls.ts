import { ICallRecord, CallStatus, CallOutcome, InterestLevel, NextAction, ICallTranscript, ISentimentAnalysis } from '@/types';
import { mockProspects } from './prospects';

const callOutcomes: CallOutcome[] = ['qualified', 'not_qualified', 'callback_requested', 'meeting_scheduled', 'not_interested'];
const interestLevels: InterestLevel[] = ['high', 'medium', 'low', 'none'];
const nextActions: NextAction[] = ['schedule_meeting', 'send_follow_up_sms', 'email_info', 'call_back_later', 'remove_from_list'];

function generateTranscript(): ICallTranscript {
  const segments = [
    { speaker: 'agent' as const, text: 'Hello, this is Sarah from Mile High Marketing. Is this the business owner?', timestamp: 0 },
    { speaker: 'prospect' as const, text: 'Yes, this is John. What can I help you with?', timestamp: 5 },
    { speaker: 'agent' as const, text: 'Great! I\'m calling about helping local businesses improve their online presence...', timestamp: 10 },
  ];
  
  return {
    fullText: segments.map(s => s.text).join(' '),
    segments,
    summary: 'Initial qualifying call to discuss digital marketing services',
    duration: 180,
    wordCount: 245,
    speakerTurns: 12,
  };
}

function generateSentiment(): ISentimentAnalysis {
  return {
    overall: 'positive',
    score: 0.65,
    breakdown: {
      positive: 0.6,
      neutral: 0.3,
      negative: 0.1,
    },
    timeline: [
      { timestamp: 0, sentiment: 'neutral', intensity: 0.5 },
      { timestamp: 60, sentiment: 'positive', intensity: 0.7 },
      { timestamp: 120, sentiment: 'positive', intensity: 0.8 },
    ],
  };
}

function generateCall(index: number): ICallRecord {
  const prospect = mockProspects[index % mockProspects.length];
  const status: CallStatus = ['completed', 'voicemail', 'no_answer', 'connected'][Math.floor(Math.random() * 4)] as CallStatus;
  const hasOutcome = status === 'completed' || status === 'connected';
  
  const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  const duration = Math.floor(Math.random() * 300) + 30;
  
  return {
    id: `call-${index + 1}`,
    prospectId: prospect.id,
    campaignId: `campaign-${Math.floor(index / 20) + 1}`,
    
    startedAt,
    endedAt: new Date(startedAt.getTime() + duration * 1000),
    duration,
    
    phoneNumber: prospect.contact.phone,
    prospectName: prospect.contact.primaryContact,
    companyName: prospect.business.name,
    industry: prospect.business.industry,
    
    status,
    outcome: hasOutcome ? callOutcomes[Math.floor(Math.random() * callOutcomes.length)] : undefined,
    qualificationScore: hasOutcome ? Math.floor(Math.random() * 10) + 1 : undefined,
    interestLevel: hasOutcome ? interestLevels[Math.floor(Math.random() * interestLevels.length)] : undefined,
    nextAction: hasOutcome ? nextActions[Math.floor(Math.random() * nextActions.length)] : undefined,
    
    meetingScheduled: Math.random() > 0.8 && hasOutcome,
    meetingDate: Math.random() > 0.8 && hasOutcome ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
    
    recordingUrl: hasOutcome ? `https://recordings.example.com/call-${index + 1}.mp3` : undefined,
    transcript: hasOutcome && Math.random() > 0.3 ? generateTranscript() : undefined,
    sentiment: hasOutcome && Math.random() > 0.3 ? generateSentiment() : undefined,
    
    keyPoints: hasOutcome ? ['Current using competitor', 'Interested in pricing', 'Wants to see demo'] : undefined,
    objections: hasOutcome ? ['Too expensive', 'Happy with current solution'] : undefined,
    opportunities: hasOutcome ? ['Expansion plans next quarter', 'Budget available'] : undefined,
    
    vapiCallId: `vapi-${index + 1}`,
    cost: duration * 0.002,
    
    aiNotes: hasOutcome ? 'Prospect seems interested but concerned about pricing. Follow up with case studies.' : undefined,
  };
}

// Generate 500 mock calls
export const mockCalls: ICallRecord[] = Array.from({ length: 500 }, (_, i) => generateCall(i));

// Helper functions
export const getCallsByProspect = (prospectId: string) => 
  mockCalls.filter(c => c.prospectId === prospectId);

export const getRecentCalls = (days: number = 7) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return mockCalls.filter(c => c.startedAt > cutoff);
};

export const getCallsByOutcome = (outcome: CallOutcome) => 
  mockCalls.filter(c => c.outcome === outcome);

// Call metrics
export const callMetrics = {
  total: mockCalls.length,
  completed: mockCalls.filter(c => c.status === 'completed').length,
  connected: mockCalls.filter(c => c.status === 'connected').length,
  voicemail: mockCalls.filter(c => c.status === 'voicemail').length,
  noAnswer: mockCalls.filter(c => c.status === 'no_answer').length,
  meetingsScheduled: mockCalls.filter(c => c.meetingScheduled).length,
  averageDuration: mockCalls.reduce((sum, c) => sum + c.duration, 0) / mockCalls.length,
  totalCost: mockCalls.reduce((sum, c) => sum + (c.cost || 0), 0),
};