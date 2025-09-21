'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Phone, TrendingUp, Clock, DollarSign, Users, Award, Calendar, Activity } from 'lucide-react';

interface AnalyticsData {
  period: number;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalCalls: number;
    uniqueProspects: number;
    qualifiedLeads: number;
    hotLeads: number;
    avgDuration: number;
    totalCost: number;
    avgQualificationScore: number;
    completionRate: number;
  };
  charts: {
    callVolume: any[];
    outcomeDistribution: any[];
    temperatureDistribution: any[];
    durationStats: any[];
    costAnalysis: any[];
    qualificationScoreTrends: any[];
    topProspects: any[];
    hourlyDistribution: any[];
    statusDistribution: any[];
  };
}

const OUTCOME_COLORS = {
  qualified: '#10b981',
  interested: '#3b82f6',
  not_qualified: '#f59e0b',
  not_interested: '#ef4444',
  no_answer: '#6b7280',
  follow_up: '#8b5cf6'
};

const TEMPERATURE_COLORS = {
  hot: '#ef4444',
  warm: '#f59e0b',
  cool: '#3b82f6',
  cold: '#6b7280'
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vapi/analytics?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Analytics Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing data from {new Date(analytics.dateRange.from).toLocaleDateString()} 
              {' '}to {new Date(analytics.dateRange.to).toLocaleDateString()}
            </p>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Phone className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.summary.totalCalls}
              </span>
            </div>
            <p className="text-gray-600">Total Calls</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.summary.uniqueProspects} unique prospects
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {analytics.summary.qualifiedLeads}
              </span>
            </div>
            <p className="text-gray-600">Qualified Leads</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.summary.hotLeads} hot leads
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">
                {formatDuration(Math.round(analytics.summary.avgDuration))}
              </span>
            </div>
            <p className="text-gray-600">Avg Duration</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.summary.completionRate.toFixed(1)}% completion rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">
                ${analytics.summary.totalCost.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-600">Total Cost</p>
            <p className="text-sm text-gray-500 mt-1">
              Score: {analytics.summary.avgQualificationScore.toFixed(1)}/10
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Call Volume Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.charts.callVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: any) => [value, '']}
                />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total" />
                <Area type="monotone" dataKey="qualified" stackId="2" stroke="#10b981" fill="#10b981" name="Qualified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Outcome Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.charts.outcomeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.outcome}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.charts.outcomeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry.outcome as keyof typeof OUTCOME_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Temperature</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.charts.temperatureDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temperature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {analytics.charts.temperatureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TEMPERATURE_COLORS[entry.temperature as keyof typeof TEMPERATURE_COLORS] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Qualification Score Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualification Score Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.charts.qualificationScoreTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: any) => [value?.toFixed(1), '']}
                />
                <Legend />
                <Line type="monotone" dataKey="avg_score" stroke="#10b981" name="Average" strokeWidth={2} />
                <Line type="monotone" dataKey="max_score" stroke="#3b82f6" name="Max" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="min_score" stroke="#ef4444" name="Min" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.charts.costAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Cost' || name === 'Avg Cost') {
                      return [`$${value?.toFixed(2)}`, name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="total_cost" fill="#f59e0b" name="Total Cost" />
                <Line yAxisId="right" type="monotone" dataKey="avg_cost" stroke="#8b5cf6" name="Avg Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Call Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.charts.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00 - ${hour}:59`}
                  formatter={(value: any, name: string) => {
                    if (name === 'avg_duration') {
                      return [formatDuration(Math.round(value)), 'Avg Duration'];
                    }
                    return [value, 'Calls'];
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Prospects Table */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Prospects by Activity</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperature
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.charts.topProspects.map((prospect) => (
                  <tr key={prospect.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prospect.business_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.contact_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.call_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.avg_qualification_score?.toFixed(1) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prospect.max_temperature === 'hot' ? 'bg-red-100 text-red-800' :
                        prospect.max_temperature === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        prospect.max_temperature === 'cool' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prospect.max_temperature || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}