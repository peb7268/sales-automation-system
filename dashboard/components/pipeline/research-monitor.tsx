"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { 
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Activity,
  Zap,
  Globe,
  Search,
} from "lucide-react"
import { motion } from "framer-motion"

interface APIStatus {
  name: string
  icon: React.ReactNode
  status: 'healthy' | 'slow' | 'error'
  usage: number
  limit: number
  lastCheck: Date
}

export function ResearchMonitor() {
  const { isResearching, researchQueue } = usePipelineStore()
  
  const [apiStatuses, setApiStatuses] = React.useState<APIStatus[]>([
    {
      name: "Google Maps API",
      icon: <Globe className="h-4 w-4" />,
      status: 'healthy',
      usage: 2341,
      limit: 10000,
      lastCheck: new Date(),
    },
    {
      name: "Firecrawl API",
      icon: <Search className="h-4 w-4" />,
      status: 'slow',
      usage: 8123,
      limit: 10000,
      lastCheck: new Date(),
    },
    {
      name: "Perplexity API",
      icon: <Zap className="h-4 w-4" />,
      status: 'healthy',
      usage: 1234,
      limit: 5000,
      lastCheck: new Date(),
    },
  ])

  // Simulate API status updates
  React.useEffect(() => {
    if (!isResearching) return

    const interval = setInterval(() => {
      setApiStatuses(prev => prev.map(api => ({
        ...api,
        usage: Math.min(api.usage + Math.floor(Math.random() * 10), api.limit),
        lastCheck: new Date(),
        status: Math.random() > 0.8 ? 'slow' : 'healthy',
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [isResearching])

  const statusIcons = {
    healthy: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    slow: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  }

  const statusColors = {
    healthy: "text-green-600 bg-green-50 border-green-200",
    slow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    error: "text-red-600 bg-red-50 border-red-200",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Research Monitor</CardTitle>
            <CardDescription>
              API health and research progress
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isResearching && (
              <Badge variant="outline" className="animate-pulse">
                <Activity className="mr-1 h-3 w-3" />
                Researching
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Research Queue Status */}
          {researchQueue.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Research Queue</span>
                <Badge variant="secondary">{researchQueue.length} pending</Badge>
              </div>
              <Progress value={33} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Processing prospect 1 of {researchQueue.length}
              </p>
            </div>
          )}

          {/* API Status Grid */}
          <div className="space-y-3">
            {apiStatuses.map((api, index) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {api.icon}
                    <span className="font-medium text-sm">{api.name}</span>
                    {statusIcons[api.status]}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={statusColors[api.status]}
                  >
                    {api.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>API Calls</span>
                    <span>{api.usage.toLocaleString()} / {api.limit.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={(api.usage / api.limit) * 100} 
                    className="h-1.5"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage: {((api.usage / api.limit) * 100).toFixed(1)}%</span>
                    <span>Last check: {api.lastCheck.toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Research Statistics */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="font-semibold text-green-600">94.5%</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Avg Time</p>
              <p className="font-semibold">2.3 min</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Today's Total</p>
              <p className="font-semibold">11,698</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="font-semibold text-red-600">12</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}