"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { motion } from "framer-motion"
import {
  Save,
  RefreshCw,
  Shield,
  Bell,
  Palette,
  Code,
  Database,
  Zap,
  Key,
  Globe,
  Webhook,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from "lucide-react"

export function SettingsDashboard() {
  const { 
    isRealTimeEnabled, 
    toggleRealTime,
    notificationPreferences,
    updateNotificationPreferences,
    apiSettings,
    updateApiSettings,
  } = useDashboardStore()

  const [showApiKey, setShowApiKey] = React.useState(false)
  const [vapiKey, setVapiKey] = React.useState("vapi_k_********************************")
  const [openaiKey, setOpenaiKey] = React.useState("sk-********************************")
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle")

  const handleSave = () => {
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your sales acceleration platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {saveStatus === "saved" && (
            <Badge variant="outline" className="gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Saved
            </Badge>
          )}
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Real-time Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Real-time Updates
                </CardTitle>
                <CardDescription>
                  Configure real-time data synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="realtime">Enable Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh data every 30 seconds
                    </p>
                  </div>
                  <Switch
                    id="realtime"
                    checked={isRealTimeEnabled}
                    onCheckedChange={toggleRealTime}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Update Interval (seconds)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      defaultValue={[30]} 
                      max={120} 
                      min={10} 
                      step={10}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">30s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Density</Label>
                  <Select defaultValue="comfortable">
                    <SelectTrigger>
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Configure data retention and caching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cache">Enable Local Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Improve performance with local data caching
                    </p>
                  </div>
                  <Switch id="cache" defaultChecked />
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Vapi Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-500" />
                  Vapi Integration
                </CardTitle>
                <CardDescription>
                  Configure your Vapi AI voice assistant API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vapi-key">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="vapi-key"
                        type={showApiKey ? "text" : "password"}
                        value={vapiKey}
                        onChange={(e) => setVapiKey(e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vapi-assistant">Assistant ID</Label>
                  <Input
                    id="vapi-assistant"
                    placeholder="asst_********************************"
                    defaultValue="asst_pipe_sales_v2"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Connected</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Last used 2 minutes ago</span>
                </div>
              </CardContent>
            </Card>

            {/* OpenAI Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  OpenAI Integration
                </CardTitle>
                <CardDescription>
                  Configure OpenAI API for advanced AI features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select defaultValue="gpt-4-turbo">
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-600">Rate limited</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">450/500 requests used today</span>
                </div>
              </CardContent>
            </Card>

            {/* Other Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Additional Integrations
                </CardTitle>
                <CardDescription>
                  Connect with other services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Google Maps API</p>
                      <p className="text-sm text-muted-foreground">
                        Location and business data
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Firecrawl API</p>
                      <p className="text-sm text-muted-foreground">
                        Web scraping and research
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-muted-foreground">
                        Database and authentication
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Kafka</p>
                      <p className="text-sm text-muted-foreground">
                        Event streaming
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Configuring
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-orange-500" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure webhook endpoints for real-time events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vapi Webhooks */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Vapi Call Events</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url"
                        placeholder="https://your-domain.com/api/webhooks/vapi"
                        defaultValue="https://pipe.sales/api/webhooks/vapi"
                      />
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="call-started" defaultChecked />
                        <Label htmlFor="call-started">Call Started</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="call-ended" defaultChecked />
                        <Label htmlFor="call-ended">Call Ended</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="transcript-final" defaultChecked />
                        <Label htmlFor="transcript-final">Transcript Final</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="recording-ready" defaultChecked />
                        <Label htmlFor="recording-ready">Recording Ready</Label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Test Webhook
                    </Button>
                  </div>
                </div>

                {/* Pipeline Events */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">Pipeline Events</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="prospect-qualified" defaultChecked />
                      <Label htmlFor="prospect-qualified">Prospect Qualified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="meeting-scheduled" defaultChecked />
                      <Label htmlFor="meeting-scheduled">Meeting Scheduled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="deal-closed" />
                      <Label htmlFor="deal-closed">Deal Closed</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Activity</CardTitle>
                <CardDescription>
                  Monitor webhook deliveries and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { event: "call.ended", status: "success", time: "2 min ago" },
                    { event: "transcript.final", status: "success", time: "5 min ago" },
                    { event: "call.started", status: "success", time: "8 min ago" },
                    { event: "prospect.qualified", status: "failed", time: "15 min ago" },
                    { event: "recording.ready", status: "success", time: "22 min ago" },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {log.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{log.event}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-qualified">New Qualified Lead</Label>
                      <Switch id="email-qualified" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-meeting">Meeting Scheduled</Label>
                      <Switch id="email-meeting" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-daily">Daily Summary</Label>
                      <Switch id="email-daily" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-weekly">Weekly Report</Label>
                      <Switch id="email-weekly" />
                    </div>
                  </div>
                </div>

                {/* In-App Notifications */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">In-App Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-call">Call Completed</Label>
                      <Switch id="app-call" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-research">Research Complete</Label>
                      <Switch id="app-research" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-errors">System Errors</Label>
                      <Switch id="app-errors" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-achievements">Achievements</Label>
                      <Switch id="app-achievements" defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">Push Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-urgent">Urgent Alerts Only</Label>
                      <Switch id="push-urgent" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Enable Browser Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Security
                </CardTitle>
                <CardDescription>
                  Advanced security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch id="2fa" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after inactivity
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Revoke All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Developer Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-500" />
                  Developer Options
                </CardTitle>
                <CardDescription>
                  Advanced options for developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show detailed logs in console
                    </p>
                  </div>
                  <Switch id="debug" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mock">Use Mock Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Use simulated data for testing
                    </p>
                  </div>
                  <Switch id="mock" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>API Rate Limit</Label>
                  <Select defaultValue="1000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 req/hour</SelectItem>
                      <SelectItem value="500">500 req/hour</SelectItem>
                      <SelectItem value="1000">1000 req/hour</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Database className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}