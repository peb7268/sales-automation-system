'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface CallDetail {
  id: string;
  vapi_call_id: string;
  vapi_status: string;
  vapi_metadata: any;
  cost: number;
  qualification_score: number;
  call_type: string;
  assistant_id: string;
  phone_number_id: string;
  customer_number: string;
  started_at: string;
  ended_at: string;
  duration: number;
  outcome: string;
  transcript: string;
  recording_url: string;
  summary: string;
  error_message: string;
  temperature: string;
  notes: string;
  scheduled_followup: string;
  created_at: string;
  updated_at: string;
  // Prospect information
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  location: string;
  website: string;
  prospect_temperature: string;
  pipeline_stage: string;
  prospect_score: number;
  prospect_notes: string;
  prospect_id: string;
}

interface RelatedCall {
  id: string;
  vapi_call_id: string;
  created_at: string;
  duration: number;
  outcome: string;
  vapi_status: string;
  qualification_score: number;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(cost || 0);
}

function getTemperatureColor(temp: string): string {
  switch (temp?.toLowerCase()) {
    case 'hot': return 'text-red-600 bg-red-100';
    case 'warm': return 'text-yellow-600 bg-yellow-100';
    case 'cold': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

function getOutcomeColor(outcome: string): string {
  switch (outcome?.toLowerCase()) {
    case 'qualified': return 'text-green-700 bg-green-100';
    case 'interested': return 'text-blue-700 bg-blue-100';
    case 'callback': return 'text-yellow-700 bg-yellow-100';
    case 'voicemail': return 'text-purple-700 bg-purple-100';
    case 'not_interested': return 'text-red-700 bg-red-100';
    case 'no_answer': return 'text-gray-700 bg-gray-100';
    default: return 'text-gray-700 bg-gray-100';
  }
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [call, setCall] = useState<CallDetail | null>(null);
  const [relatedCalls, setRelatedCalls] = useState<RelatedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchCallDetails();
  }, [params.id]);

  const fetchCallDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vapi/calls/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch call details');
      }
      const data = await response.json();
      setCall(data.call);
      setRelatedCalls(data.relatedCalls || []);
      setNotes(data.call.notes || '');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!call) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/vapi/calls/${call.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notes');
      }
      
      const data = await response.json();
      setCall(data.call);
      setEditNotes(false);
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!call?.recording_url) return;
    
    if (audioPlaying) {
      // Pause audio
      setAudioPlaying(false);
    } else {
      // Play audio
      setAudioPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Call</h3>
                <p className="text-red-600 mt-1">{error || 'Call not found'}</p>
              </div>
            </div>
            <Link
              href="/calls"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Calls
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/calls"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Calls
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Call Details</h1>
          <p className="mt-2 text-gray-600">ID: {call.vapi_call_id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(call.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-gray-900 font-medium flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDuration(call.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {call.call_type === 'outbound' ? '📞 Outbound' : '📱 Inbound'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-gray-900 font-medium capitalize">{call.vapi_status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outcome</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeColor(call.outcome)}`}>
                    {call.outcome?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTemperatureColor(call.temperature)}`}>
                    {call.temperature}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Qualification Score</p>
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-900 font-medium">{call.qualification_score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="text-gray-900 font-medium flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {formatCost(call.cost)}
                  </p>
                </div>
              </div>
              
              {call.error_message && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {call.error_message}
                  </p>
                </div>
              )}
            </div>

            {/* Call Summary */}
            {call.summary && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Summary</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{call.summary}</p>
              </div>
            )}

            {/* Recording */}
            {call.recording_url && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recording</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleAudioPlayback}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {audioPlaying ? (
                      <>
                        <PauseIcon className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Play Recording
                      </>
                    )}
                  </button>
                  <a
                    href={call.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Download
                  </a>
                </div>
                {audioPlaying && (
                  <audio
                    src={call.recording_url}
                    autoPlay
                    onEnded={() => setAudioPlaying(false)}
                    className="hidden"
                  />
                )}
              </div>
            )}

            {/* Transcript */}
            {call.transcript && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Transcript
                </h2>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {call.transcript}
                  </pre>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                {!editNotes && (
                  <button
                    onClick={() => setEditNotes(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editNotes ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Add notes about this call..."
                  />
                  <div className="mt-3 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditNotes(false);
                        setNotes(call.notes || '');
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {notes || 'No notes added yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prospect Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Prospect Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Business</p>
                  <p className="text-gray-900 font-medium">{call.business_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-900 font-medium">{call.contact_name || 'Unknown'}</p>
                  {call.contact_phone && (
                    <p className="text-sm text-gray-600">{call.contact_phone}</p>
                  )}
                  {call.contact_email && (
                    <p className="text-sm text-gray-600">{call.contact_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="text-gray-900 font-medium">{call.industry || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">{call.location || 'Unknown'}</p>
                </div>
                {call.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={call.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {call.website}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Pipeline Stage</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {call.pipeline_stage || 'Unknown'}
                  </p>
                </div>
                {call.prospect_id && (
                  <Link
                    href={`/prospects/${call.prospect_id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View Prospect Details →
                  </Link>
                )}
              </div>
            </div>

            {/* Related Calls */}
            {relatedCalls.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Calls</h2>
                <div className="space-y-3">
                  {relatedCalls.map((relatedCall) => (
                    <Link
                      key={relatedCall.id}
                      href={`/calls/${relatedCall.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(relatedCall.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Duration: {formatDuration(relatedCall.duration)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getOutcomeColor(relatedCall.outcome)}`}>
                          {relatedCall.outcome}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600">
                          Score: {relatedCall.qualification_score}%
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {call.vapi_metadata && Object.keys(call.vapi_metadata).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <div className="space-y-2">
                  {Object.entries(call.vapi_metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500">{key}</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}