"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCallerStore } from "@/stores/useCallerStore"
import { ICallCampaign } from "@/types"
import { 
  Play,
  Pause,
  Square,
  MoreVertical,
  Users,
  Phone,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const statusColors = {
  active: "bg-green-100 text-green-700 border-green-300",
  paused: "bg-yellow-100 text-yellow-700 border-yellow-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  archived: "bg-gray-100 text-gray-500 border-gray-300",
}

const statusIcons = {
  active: <Play className="h-3 w-3" />,
  paused: <Pause className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  draft: <Clock className="h-3 w-3" />,
  archived: <Square className="h-3 w-3" />,
}

export function CampaignManager() {
  const {
    campaigns,
    selectedCampaign,
    setSelectedCampaign,
    startCampaign,
    pauseCampaign,
    stopCampaign,
  } = useCallerStore()

  const handleCampaignAction = (campaignId: string, action: 'start' | 'pause' | 'stop') => {
    switch (action) {
      case 'start':
        startCampaign(campaignId)
        break
      case 'pause':
        pauseCampaign(campaignId)
        break
      case 'stop':
        stopCampaign(campaignId)
        break
    }
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused')
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')

  return (
    <div className="space-y-4">
      {/* Campaign Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns.reduce((sum, c) => sum + c.remainingCalls, 0)} calls remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.totalProspects, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0
                ? Math.round(
                    (campaigns.reduce((sum, c) => sum + c.completedCalls, 0) /
                    campaigns.reduce((sum, c) => sum + c.totalProspects, 0)) * 100
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage your calling campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {/* Campaign Header */}
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={statusColors[campaign.status]}
                      >
                        {statusIcons[campaign.status]}
                        <span className="ml-1">{campaign.status}</span>
                      </Badge>
                      <Badge variant="secondary">
                        {campaign.scriptVariant.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Campaign Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.totalProspects} prospects
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {campaign.completedCalls} calls
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </span>
                      {campaign.prospectCriteria.industries && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {campaign.prospectCriteria.industries.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {((campaign.completedCalls / campaign.totalProspects) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(campaign.completedCalls / campaign.totalProspects) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Campaign Metrics */}
                    {campaign.metrics && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-xs text-muted-foreground">Connection</p>
                          <p className="text-sm font-semibold">
                            {(campaign.metrics.connectionRate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-xs text-muted-foreground">Qualified</p>
                          <p className="text-sm font-semibold">
                            {campaign.metrics.qualifiedProspects}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-xs text-muted-foreground">Meetings</p>
                          <p className="text-sm font-semibold">
                            {campaign.metrics.meetingsBooked}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-xs text-muted-foreground">Cost/Call</p>
                          <p className="text-sm font-semibold">
                            ${campaign.metrics.costPerConnection.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campaign Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {campaign.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'pause')}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'start')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {(campaign.status === 'active' || campaign.status === 'paused') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'stop')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Clone Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Archive Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}