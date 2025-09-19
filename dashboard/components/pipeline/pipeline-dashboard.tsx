"use client"

import * as React from "react"
import { usePipelineStore } from "@/stores/usePipelineStore"
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
} from "lucide-react"
import { PipelineStage } from "@/types"
import { PipelineFunnel } from "./pipeline-funnel"
import { ProspectList } from "./prospect-list"
import { ResearchMonitor } from "./research-monitor"
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
  } = usePipelineStore()

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
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
          <Button size="sm">
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

      {/* Interactive Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
          <CardDescription>
            Click on a stage to filter prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(["cold", "contacted", "interested", "qualified"] as PipelineStage[]).map((stage, index) => {
              const count = stageMetrics[stage]
              const percentage = totalProspects > 0 ? (count / totalProspects * 100).toFixed(0) : "0"
              const isActive = stageFilter === stage
              
              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className="h-auto w-full flex-col items-start p-4"
                    onClick={() => setStageFilter(isActive ? "all" : stage)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className={`h-3 w-3 rounded-full ${stageColors[stage]}`} />
                      {index < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="mt-3 w-full">
                      <p className="text-left text-sm font-medium">{stageTitles[stage]}</p>
                      <p className="mt-1 text-left text-2xl font-bold">{count}</p>
                      <p className="mt-1 text-left text-xs text-muted-foreground">
                        {percentage}% of total
                      </p>
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Funnel Visualization */}
        <div className="lg:col-span-1">
          <PipelineFunnel />
        </div>
        
        {/* Prospect List */}
        <div className="lg:col-span-2">
          <ProspectList prospects={filteredProspects} />
        </div>
      </div>

      {/* Research Monitor */}
      <ResearchMonitor />
    </div>
  )
}