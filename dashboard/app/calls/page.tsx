'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  PhoneIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Call {
  id: string;
  vapi_call_id: string;
  business_name: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
  duration: number;
  outcome: string;
  vapi_status: string;
  qualification_score: number;
  cost: number;
  temperature: string;
  call_type: string;
  summary?: string;
}

interface CallsResponse {
  calls: Call[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalCalls: number;
    qualifiedCalls: number;
    completedCalls: number;
    avgDuration: number;
    totalCost: number;
    avgQualificationScore: number;
  };
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
    maximumFractionDigits: 2
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

function getStatusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case 'ended':
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    case 'in-progress':
      return <PhoneIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
}

export default function CallsDashboard() {
  const [data, setData] = useState<CallsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(filterStatus && { status: filterStatus }),
        ...(filterOutcome && { outcome: filterOutcome })
      });

      const response = await fetch(`/api/vapi/calls?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filterStatus, filterOutcome]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Call Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage all Vapi calls</p>
        </div>

        {/* Statistics Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <PhoneIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{data.statistics.totalCalls}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Qualified Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{data.statistics.qualifiedCalls}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(Math.round(data.statistics.avgDuration))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCost(data.statistics.totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ended">Ended</option>
              <option value="in-progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>

            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Outcomes</option>
              <option value="qualified">Qualified</option>
              <option value="interested">Interested</option>
              <option value="callback">Callback</option>
              <option value="voicemail">Voicemail</option>
              <option value="not_interested">Not Interested</option>
              <option value="no_answer">No Answer</option>
            </select>

            <button
              onClick={() => {
                setFilterStatus('');
                setFilterOutcome('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Date/Time
                      {sortBy === 'created_at' && (
                        sortOrder === 'DESC' ? 
                          <ArrowDownIcon className="ml-1 h-3 w-3" /> : 
                          <ArrowUpIcon className="ml-1 h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('duration')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Duration
                      {sortBy === 'duration' && (
                        sortOrder === 'DESC' ? 
                          <ArrowDownIcon className="ml-1 h-3 w-3" /> : 
                          <ArrowUpIcon className="ml-1 h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('qualification_score')}
                      className="flex items-center hover:text-gray-700"
                    >
                      Score
                      {sortBy === 'qualification_score' && (
                        sortOrder === 'DESC' ? 
                          <ArrowDownIcon className="ml-1 h-3 w-3" /> : 
                          <ArrowUpIcon className="ml-1 h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.call_type === 'outbound' ? (
                        <PhoneArrowUpRightIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <PhoneArrowDownLeftIcon className="h-5 w-5 text-green-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {call.business_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{call.contact_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{call.contact_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(call.vapi_status)}
                        <span className="ml-2 text-sm text-gray-900">{call.vapi_status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeColor(call.outcome)}`}>
                        {call.outcome?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {call.qualification_score || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTemperatureColor(call.temperature)}`}>
                        {call.temperature}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCost(call.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/calls/${call.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(page - 1) * 20 + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(page * 20, data.pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{data.pagination.total}</span>{' '}
                    results
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}