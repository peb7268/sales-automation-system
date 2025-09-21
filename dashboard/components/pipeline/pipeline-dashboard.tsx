"use client"

import * as React from "react"
import { usePipelineStoreWithSupabase } from "@/stores/usePipelineStoreWithSupabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Target,
  Activity,
  ChevronRight,
  Plus,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Wifi,
  WifiOff,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  FileUp,
} from "lucide-react"
import { PipelineStage } from "@/types"
import { PipelineSankey } from "./pipeline-sankey"
import { ProspectList } from "./prospect-list"
import { ResearchMonitor } from "./research-monitor"
import { ProspectForm } from "./prospect-form"
import { DeleteProspectDialog } from "./delete-prospect-dialog"
import { CsvImportDialog } from "./csv-import-dialog"
import { motion } from "framer-motion"

const stageColors: Record<PipelineStage, string> = {
  cold: "bg-slate-500",
  contacted: "bg-blue-500",
  interested: "bg-green-500",
  qualified: "bg-yellow-500",
}

const stageTitles: Record<PipelineStage, string> = {
  cold: "Cold Leads",
  contacted: "Contacted",
  interested: "Interested",
  qualified: "Qualified",
}

export function PipelineDashboard() {
  const {
    prospects,
    stageFilter,
    setStageFilter,
    industryFilter,
    setIndustryFilter,
    searchQuery,
    setSearchQuery,
    getFilteredProspects,
    getStageCount,
    isResearching,
    setIsResearching,
    fetchProspects,
    isLoading,
    error,
    wsConnected,
    wsConnecting,
    connectWebSocket,
    disconnectWebSocket,
    notifications,
    removeNotification,
  } = usePipelineStoreWithSupabase()

  // State for prospect form
  const [isProspectFormOpen, setIsProspectFormOpen] = React.useState(false)
  const [selectedProspectForEdit, setSelectedProspectForEdit] = React.useState<null | any>(null)
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create')

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [prospectToDelete, setProspectToDelete] = React.useState<null | any>(null)

  // State for CSV import dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)

  // Load prospects on mount and connect WebSocket
  React.useEffect(() => {
    fetchProspects()
    connectWebSocket()

    // Cleanup on unmount
    return () => {
      disconnectWebSocket()
    }
  }, [])

  // Auto-reconnect WebSocket if disconnected
  React.useEffect(() => {
    if (!wsConnected && !wsConnecting) {
      const reconnectTimer = setTimeout(() => {
        console.log('Attempting WebSocket reconnection...')
        connectWebSocket()
      }, 5000)

      return () => clearTimeout(reconnectTimer)
    }
  }, [wsConnected, wsConnecting])

  const filteredProspects = getFilteredProspects()
  const industries = Array.from(new Set(prospects.map(p => p.business.industry)))

  // Calculate stage metrics
  const stageMetrics = {
    cold: getStageCount("cold"),
    contacted: getStageCount("contacted"),
    interested: getStageCount("interested"),
    qualified: getStageCount("qualified"),
  }

  const totalProspects = prospects.length
  const qualifiedCount = stageMetrics.qualified
  const conversionRate = totalProspects > 0 ? (qualifiedCount / totalProspects * 100).toFixed(1) : "0"

  // Handle edit prospect
  const handleEditProspect = (prospect: any) => {
    setSelectedProspectForEdit(prospect)
    setFormMode('edit')
    setIsProspectFormOpen(true)
  }

  // Handle delete prospect
  const handleDeleteProspect = (prospect: any) => {
    setProspectToDelete(prospect)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading prospects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchProspects()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Pipeline</h2>
          <p className="text-muted-foreground">
            Track and manage your prospect research and qualification
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
            {wsConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            ) : wsConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {wsConnecting ? "Connecting..." : wsConnected ? "Live" : "Offline"}
            </span>
          </div>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResearching(!isResearching)}
            className={isResearching ? "animate-pulse" : ""}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isResearching ? "animate-spin" : ""}`} />
            {isResearching ? "Researching..." : "Start Research"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setFormMode('create')
              setSelectedProspectForEdit(null)
              setIsProspectFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProspects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                <ArrowUp className="inline h-3 w-3" />
                2.3%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-full w-[87%] rounded-full bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search prospects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry.charAt(0).toUpperCase() + industry.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setStageFilter("all")
                setIndustryFilter("all")
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Sankey Visualization - Full Width */}
      <PipelineSankey />

      {/* Prospect List - Full Width */}
      <ProspectList
        prospects={filteredProspects}
        onEditProspect={handleEditProspect}
        onDeleteProspect={handleDeleteProspect}
      />

      {/* Research Monitor */}
      <ResearchMonitor />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg border flex items-start gap-3 ${
                notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
              {notification.type === 'warning' && <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
              {notification.type === 'info' && <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />}

              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Prospect Form Modal */}
      <ProspectForm
        open={isProspectFormOpen}
        onOpenChange={setIsProspectFormOpen}
        prospect={selectedProspectForEdit}
        mode={formMode}
      />

      {/* Delete Prospect Dialog */}
      <DeleteProspectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        prospect={prospectToDelete}
      />

      {/* CSV Import Dialog */}
      <CsvImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  )
}