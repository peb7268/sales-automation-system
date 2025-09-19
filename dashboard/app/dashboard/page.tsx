"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PipelineDashboard } from "@/components/pipeline/pipeline-dashboard"
import { CallerDashboard } from "@/components/caller/caller-dashboard"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { SettingsDashboard } from "@/components/settings/settings-dashboard"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { 
  TrendingUp, 
  Phone, 
  BarChart3,
  Activity,
  Users,
  DollarSign,
  Target,
  Settings
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { activeTab, setActiveTab, metrics, timeframe } = useDashboardStore()

  // Quick stats cards
  const stats = [
    {
      title: "Total Prospects",
      value: metrics.totalProspects,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Qualified Leads",
      value: metrics.qualifiedLeads,
      change: "+23%", 
      trend: "up",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Calls Today",
      value: metrics.callsToday,
      change: "+8%",
      trend: "up",
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pipeline Value",
      value: `$${(metrics.estimatedPipeline / 1000).toFixed(0)}K`,
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Activity className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">{stat.change}</span>
                    <span className="ml-1">from last {timeframe}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Pipeline</span>
            <Badge variant="secondary" className="ml-2">
              {metrics.totalProspects}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="caller" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>Caller</span>
            <Badge variant="secondary" className="ml-2">
              {metrics.callsToday}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PipelineDashboard />
          </motion.div>
        </TabsContent>

        <TabsContent value="caller" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CallerDashboard />
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyticsDashboard />
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsDashboard />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}