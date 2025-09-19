"use client"

import * as React from "react"
import { useCallerStore } from "@/stores/useCallerStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Plus,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Users,
  Activity,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { LiveCallMonitor } from "./live-call-monitor"
import { CampaignManager } from "./campaign-manager"
import { CallAnalytics } from "./call-analytics"
import { VapiWebhookHandler } from "./vapi-webhook-handler"
import { motion } from "framer-motion"

export function CallerDashboard() {
  const {
    calls,
    campaigns,
    getTodaysCalls,
    getActiveCampaignsCount,
    activeCalls,
    isMonitoring,
    toggleMonitoring,
  } = useCallerStore()

  const todaysCalls = getTodaysCalls()
  const activeCampaignsCount = getActiveCampaignsCount()
  const meetingsBooked = calls.filter(c => c.meetingScheduled).length
  const connectionRate = calls.length > 0 
    ? (calls.filter(c => c.status === 'connected' || c.status === 'completed').length / calls.length * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Calling</h2>
          <p className="text-muted-foreground">
            Monitor and manage voice calling campaigns with Vapi AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Scripts
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCalls.length}</div>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < activeCalls.length ? "bg-green-500 animate-pulse" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysCalls.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> from average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 5.2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetingsBooked}</div>
            <p className="text-xs text-muted-foreground">
              🎯 Goal: 15 this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vapi Webhook Status */}
      <VapiWebhookHandler />

      {/* Main Content Tabs */}
      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          {/* Live Monitoring Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Call Monitoring</CardTitle>
                  <CardDescription>
                    Real-time call status and transcriptions from Vapi
                  </CardDescription>
                </div>
                <Button
                  variant={isMonitoring ? "destructive" : "default"}
                  onClick={toggleMonitoring}
                >
                  {isMonitoring ? (
                    <>
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Monitoring
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <LiveCallMonitor />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CallAnalytics />
        </TabsContent>
      </Tabs>

      {/* Active Campaigns Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Status</CardTitle>
            <Badge variant="secondary">
              {activeCampaignsCount} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaigns.filter(c => c.status === 'active').slice(0, 3).map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <div>
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.completedCalls}/{campaign.totalProspects} calls
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ 
                          width: `${(campaign.completedCalls / campaign.totalProspects) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium">
                    {((campaign.completedCalls / campaign.totalProspects) * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}