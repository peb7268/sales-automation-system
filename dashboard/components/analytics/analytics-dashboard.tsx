"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { useCallerStore } from "@/stores/useCallerStore"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  DollarSign,
  Users,
  Phone
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadialBarChart, RadialBar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Treemap, ComposedChart
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export function AnalyticsDashboard() {
  const { timeframe, setTimeframe, metrics } = useDashboardStore()
  const { calls, campaigns } = useCallerStore()
  const { prospects } = usePipelineStore()
  const [selectedMetric, setSelectedMetric] = React.useState("revenue")
  const [dateRange, setDateRange] = React.useState("week")

  // Performance over time data
  const performanceData = React.useMemo(() => {
    const days = dateRange === "week" ? 7 : dateRange === "month" ? 30 : 90
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        calls: Math.floor(Math.random() * 100) + 50,
        qualified: Math.floor(Math.random() * 30) + 10,
        meetings: Math.floor(Math.random() * 15) + 5,
        revenue: Math.floor(Math.random() * 50000) + 20000,
      }
    })
  }, [dateRange])

  // Conversion funnel data
  const funnelData = [
    { name: 'Total Prospects', value: prospects.length, fill: COLORS[0] },
    { name: 'Contacted', value: Math.floor(prospects.length * 0.7), fill: COLORS[1] },
    { name: 'Qualified', value: Math.floor(prospects.length * 0.3), fill: COLORS[2] },
    { name: 'Meeting Scheduled', value: Math.floor(prospects.length * 0.15), fill: COLORS[3] },
    { name: 'Closed Won', value: Math.floor(prospects.length * 0.05), fill: COLORS[4] },
  ]

  // Revenue by source
  const revenueBySource = [
    { source: 'Cold Calls', value: 45000, percentage: 35 },
    { source: 'Warm Leads', value: 65000, percentage: 45 },
    { source: 'Referrals', value: 30000, percentage: 20 },
  ]

  // Campaign ROI data
  const roiData = campaigns.map(campaign => ({
    name: campaign.name.split(' ').slice(0, 2).join(' '),
    invested: campaign.metrics?.totalCost || Math.floor(Math.random() * 5000) + 1000,
    return: campaign.metrics?.revenue || Math.floor(Math.random() * 20000) + 5000,
    roi: ((campaign.metrics?.revenue || 10000) / (campaign.metrics?.totalCost || 2000) * 100 - 100).toFixed(0) + '%'
  }))

  // Agent performance comparison
  const agentPerformance = [
    { agent: 'Agent 1', calls: 120, conversions: 18, rate: 15 },
    { agent: 'Agent 2', calls: 95, conversions: 16, rate: 17 },
    { agent: 'Agent 3', calls: 110, conversions: 14, rate: 13 },
    { agent: 'Agent 4', calls: 88, conversions: 15, rate: 17 },
  ]

  // Geographic distribution
  const geoData = [
    { region: 'West', prospects: 45, value: 250000 },
    { region: 'East', prospects: 38, value: 210000 },
    { region: 'Central', prospects: 28, value: 160000 },
    { region: 'South', prospects: 22, value: 120000 },
  ]

  // Time to close distribution
  const timeToCloseData = [
    { days: '0-7', count: 12 },
    { days: '8-14', count: 18 },
    { days: '15-21', count: 25 },
    { days: '22-30', count: 15 },
    { days: '30+', count: 8 },
  ]

  // Import advanced visualizations (lazy loaded for performance)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const AdvancedVisualizations = React.lazy(() => 
    import('../visualizations/advanced-visualizations').then(module => ({
      default: module.AdvancedVisualizations
    }))
  )

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.3%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +2.4% from last period
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +$1,200 from last period
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sales Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 days</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                -3 days faster
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">31.5%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +4.2% improvement
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="advanced">Advanced 3D</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="calls" 
                        stroke={COLORS[0]} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="qualified" 
                        stroke={COLORS[1]} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="meetings" 
                        stroke={COLORS[2]} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Comparative analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={agentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agent" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calls" fill={COLORS[0]} />
                      <Bar yAxisId="left" dataKey="conversions" fill={COLORS[1]} />
                      <Line yAxisId="right" type="monotone" dataKey="rate" stroke={COLORS[2]} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time to Close Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Velocity Analysis</CardTitle>
              <CardDescription>Time to close distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeToCloseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="days" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[3]} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Prospect journey through the sales pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Conversion percentages */}
              <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                {funnelData.map((stage, index) => {
                  const percentage = index === 0 ? 100 : Math.round((stage.value / funnelData[0].value) * 100)
                  return (
                    <div key={index}>
                      <div className="text-sm font-medium">{stage.name}</div>
                      <div className="text-2xl font-bold" style={{ color: stage.fill }}>
                        {percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">{stage.value} prospects</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>Where your revenue comes from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source} (${percentage}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
                <CardDescription>Revenue by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="prospects" fill={COLORS[4]} />
                      <Bar dataKey="value" fill={COLORS[5]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Revenue performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={COLORS[2]} 
                      fill={COLORS[2]} 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign ROI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign ROI Analysis</CardTitle>
              <CardDescription>Return on investment by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="invested" fill={COLORS[3]} />
                    <Bar dataKey="return" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {roiData.map((campaign, index) => (
                  <div key={index} className="text-center">
                    <p className="text-sm text-muted-foreground">{campaign.name}</p>
                    <p className="text-2xl font-bold text-green-600">{campaign.roi} ROI</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading advanced visualizations...</p>
              </div>
            </div>
          }>
            <AdvancedVisualizations />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}