// TypeScript interfaces for Vapi data structures

export interface VapiCall {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall';
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  endedReason?: 'assistant-error' | 'assistant-not-found' | 'db-error' | 'no-server-available' | 
                'pipeline-error-extra-function-failed' | 'pipeline-error-llm-failed' | 
                'pipeline-error-speech-failed' | 'pipeline-error-transcriber-failed' | 
                'pipeline-no-available-llm-model' | 'pipeline-no-available-speech-model' | 
                'pipeline-no-available-transcriber-model' | 'server-shutdown' | 
                'silence-timed-out' | 'voicemail' | 'customer-busy' | 'customer-ended-call' | 
                'customer-did-not-answer' | 'customer-did-not-give-microphone-permission' | 
                'assistant-request-returned-error' | 'assistant-request-returned-invalid-assistant' | 
                'assistant-request-returned-no-assistant' | 'assistant-request-returned-error' | 
                'assistant-ended-call' | 'customer-disconnected' | 'customer-did-not-answer-in-time' | 
                'exceeded-max-duration' | 'customer-busy-on-another-call' | 'customer-rejected-call' | 
                'system-disconnected-call' | 'transferred';
  phoneNumberId?: string;
  customerId?: string;
  customerNumber?: string;
  assistantId?: string;
  squadId?: string;
  assistant?: VapiAssistant;
  customer?: VapiCustomer;
  phoneNumber?: VapiPhoneNumber;
  artifact?: VapiArtifact;
  messages?: VapiMessage[];
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  cost?: number;
  costBreakdown?: VapiCostBreakdown;
  analysis?: VapiAnalysis;
  metadata?: Record<string, any>;
}

export interface VapiAssistant {
  id?: string;
  name?: string;
  firstMessage?: string;
  model?: {
    provider: 'openai' | 'anthropic' | 'deepgram' | 'groq' | 'together';
    model: string;
    temperature?: number;
    systemMessage?: string;
    maxTokens?: number;
  };
  voice?: {
    provider: '11labs' | 'deepgram' | 'openai' | 'playht' | 'rime-ai';
    voiceId: string;
    speed?: number;
    stability?: number;
  };
  recordingEnabled?: boolean;
  hipaaEnabled?: boolean;
  backgroundSound?: 'office' | 'restaurant' | 'street' | 'nature';
  silenceTimeoutSeconds?: number;
  maxDurationSeconds?: number;
  endCallMessage?: string;
  metadata?: Record<string, any>;
}

export interface VapiCustomer {
  number: string;
  name?: string;
  extension?: string;
}

export interface VapiPhoneNumber {
  id: string;
  orgId: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  stripeSubscriptionCurrentPeriodEnd?: string;
}

export interface VapiArtifact {
  messages?: VapiMessage[];
  messagesOpenAIFormatted?: any[];
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  transcript?: string;
  videoRecordingUrl?: string;
}

export interface VapiMessage {
  role: 'assistant' | 'user' | 'system' | 'function' | 'tool';
  message?: string;
  content?: string;
  name?: string;
  time?: number;
  secondsFromStart?: number;
  duration?: number;
  endTime?: number;
}

export interface VapiCostBreakdown {
  transport?: number;
  stt?: number;
  llm?: number;
  tts?: number;
  vapi?: number;
  total?: number;
  llmPromptTokens?: number;
  llmCompletionTokens?: number;
  ttsCharacters?: number;
  analysisCostBreakdown?: {
    stt?: number;
    llm?: number;
    llmPromptTokens?: number;
    llmCompletionTokens?: number;
    total?: number;
  };
}

export interface VapiAnalysis {
  summary?: string;
  structuredData?: Record<string, any>;
  successEvaluation?: string;
}

// Request/Response types for API calls
export interface ListCallsParams {
  assistantId?: string;
  phoneNumberId?: string;
  limit?: number;
  createdAtGt?: string;
  createdAtLt?: string;
  createdAtGe?: string;
  createdAtLe?: string;
  updatedAtGt?: string;
  updatedAtLt?: string;
  updatedAtGe?: string;
  updatedAtLe?: string;
}

export interface ListCallsResponse {
  calls: VapiCall[];
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface CreateCallData {
  phoneNumberId?: string;
  customer: VapiCustomer;
  assistant?: VapiAssistant;
  assistantId?: string;
  squadId?: string;
  metadata?: Record<string, any>;
}

export interface SyncResult {
  imported: number;
  updated: number;
  failed: number;
  errors?: string[];
}

// Webhook event types
export interface VapiWebhookEvent {
  event: 'call.started' | 'call.ended' | 'recording.ready' | 'transcript.ready' | 
         'speech.update' | 'function.called' | 'hang' | 'metadata' | 
         'conversation.update' | 'tool.called';
  timestamp: string;
  call?: VapiCall;
  callId?: string;
  data?: Record<string, any>;
}

export interface CallStartedEvent extends VapiWebhookEvent {
  event: 'call.started';
}

export interface CallEndedEvent extends VapiWebhookEvent {
  event: 'call.ended';
}

export interface RecordingReadyEvent extends VapiWebhookEvent {
  event: 'recording.ready';
  recordingUrl: string;
}

export interface TranscriptReadyEvent extends VapiWebhookEvent {
  event: 'transcript.ready';
  transcript: string;
  summary?: string;
}