"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallerStore } from "@/stores/useCallerStore"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TimeFrame } from "@/types"
import { motion } from "framer-motion"

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']

export function CallAnalytics() {
  const { calls, campaigns } = useCallerStore()
  const { timeframe } = useDashboardStore()

  // Prepare data for charts
  const outcomeData = [
    { name: 'Qualified', value: calls.filter(c => c.outcome === 'qualified').length, color: COLORS[0] },
    { name: 'Not Qualified', value: calls.filter(c => c.outcome === 'not_qualified').length, color: COLORS[3] },
    { name: 'Callback', value: calls.filter(c => c.outcome === 'callback_requested').length, color: COLORS[2] },
    { name: 'Meeting', value: calls.filter(c => c.outcome === 'meeting_scheduled').length, color: COLORS[1] },
    { name: 'Not Interested', value: calls.filter(c => c.outcome === 'not_interested').length, color: COLORS[4] },
  ]

  // Hourly performance data
  const hourlyData = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9
    const hourCalls = calls.filter(c => {
      const callHour = new Date(c.startedAt).getHours()
      return callHour === hour
    })
    return {
      hour: `${hour}:00`,
      calls: hourCalls.length,
      connections: hourCalls.filter(c => c.status === 'connected' || c.status === 'completed').length,
      meetings: hourCalls.filter(c => c.meetingScheduled).length,
    }
  })

  // Campaign comparison data
  const campaignData = campaigns.slice(0, 5).map(campaign => ({
    name: campaign.name.split(' ').slice(0, 2).join(' '),
    calls: campaign.completedCalls,
    qualified: campaign.metrics?.qualifiedProspects || 0,
    meetings: campaign.metrics?.meetingsBooked || 0,
    cost: campaign.metrics?.totalCost || 0,
  }))

  // Interest level distribution
  const interestData = [
    { level: 'High', count: calls.filter(c => c.interestLevel === 'high').length, fill: COLORS[0] },
    { level: 'Medium', count: calls.filter(c => c.interestLevel === 'medium').length, fill: COLORS[1] },
    { level: 'Low', count: calls.filter(c => c.interestLevel === 'low').length, fill: COLORS[3] },
    { level: 'None', count: calls.filter(c => c.interestLevel === 'none').length, fill: COLORS[4] },
  ]

  // Weekly trend data
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayName = date.toLocaleDateString('en', { weekday: 'short' })
    const dayCalls = calls.filter(c => {
      const callDate = new Date(c.startedAt).toDateString()
      return callDate === date.toDateString()
    })
    
    return {
      day: dayName,
      calls: dayCalls.length,
      qualified: dayCalls.filter(c => c.outcome === 'qualified').length,
      meetings: dayCalls.filter(c => c.meetingScheduled).length,
    }
  })

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Call Outcomes Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>Distribution of call results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Interest Level Radial Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Interest Levels</CardTitle>
                <CardDescription>Prospect interest distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={interestData}>
                      <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockWise
                        dataKey="count"
                      />
                      <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Trend</CardTitle>
              <CardDescription>Call activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="calls" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="qualified" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="meetings" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Hourly Performance Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Performance</CardTitle>
              <CardDescription>Call activity by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calls" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="connections" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="meetings" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Call Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calls.length > 0 
                    ? Math.round(calls.reduce((sum, c) => sum + c.duration, 0) / calls.length / 60)
                    : 0} min
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: 3-5 min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Qualification Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {calls.length > 0
                    ? ((calls.filter(c => c.outcome === 'qualified').length / calls.length) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ↑ 3.2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Meeting Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {calls.length > 0
                    ? ((calls.filter(c => c.meetingScheduled).length / calls.length) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry avg: 8%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cost per Qualified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${calls.filter(c => c.outcome === 'qualified').length > 0
                    ? (calls.reduce((sum, c) => sum + (c.cost || 0), 0) / 
                       calls.filter(c => c.outcome === 'qualified').length).toFixed(2)
                    : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Budget: $15/lead
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Comparison</CardTitle>
              <CardDescription>Performance across active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill={COLORS[2]} />
                    <Bar dataKey="qualified" fill={COLORS[0]} />
                    <Bar dataKey="meetings" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}