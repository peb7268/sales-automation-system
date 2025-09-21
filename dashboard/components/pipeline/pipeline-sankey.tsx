"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { TrendingUp, Sparkles, Calendar, DollarSign, Users } from "lucide-react"
import * as d3 from "d3"

export function PipelineSankey() {
  const { prospects } = usePipelineStore()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const [period, setPeriod] = React.useState<'current' | 'previous' | 'year'>('current')

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const total = prospects.length || 1500 // Use sample data if no prospects
    const qualified = prospects.filter(p => p.pipelineStage === 'qualified').length || 294
    const contacted = prospects.filter(p => p.pipelineStage === 'contacted').length || 1020
    const interested = prospects.filter(p => p.pipelineStage === 'interested').length || 612

    return {
      totalLeads: total,
      qualificationRate: ((qualified / total) * 100).toFixed(0),
      winRate: ((qualified / total) * 100).toFixed(0),
      pipelineValue: '$2.4M',
      avgSalesCycle: '23d'
    }
  }, [prospects])

  // Sankey data based on period
  const sankeyData = React.useMemo(() => {
    const baseData = {
      nodes: [
        { id: "New Leads", name: "New Leads" },
        { id: "MQL", name: "MQL" },
        { id: "SQL", name: "SQL" },
        { id: "Opportunity", name: "Opportunity" },
        { id: "Proposal", name: "Proposal" },
        { id: "Negotiation", name: "Negotiation" },
        { id: "Closed Won", name: "Closed Won" },
        { id: "Closed Lost", name: "Closed Lost" },
        { id: "Nurture", name: "Nurture" },
        { id: "Disqualified", name: "Disqualified" }
      ],
      links: []
    }

    // Different data for different periods
    if (period === 'current') {
      baseData.links = [
        { source: "New Leads", target: "MQL", value: 1020 },
        { source: "New Leads", target: "Disqualified", value: 480 },
        { source: "MQL", target: "SQL", value: 765 },
        { source: "MQL", target: "Nurture", value: 255 },
        { source: "SQL", target: "Opportunity", value: 612 },
        { source: "SQL", target: "Disqualified", value: 153 },
        { source: "Opportunity", target: "Proposal", value: 490 },
        { source: "Opportunity", target: "Closed Lost", value: 122 },
        { source: "Proposal", target: "Negotiation", value: 367 },
        { source: "Proposal", target: "Closed Lost", value: 123 },
        { source: "Negotiation", target: "Closed Won", value: 294 },
        { source: "Negotiation", target: "Closed Lost", value: 73 },
        { source: "Nurture", target: "SQL", value: 51 }
      ]
    } else if (period === 'previous') {
      baseData.links = [
        { source: "New Leads", target: "MQL", value: 850 },
        { source: "New Leads", target: "Disqualified", value: 400 },
        { source: "MQL", target: "SQL", value: 637 },
        { source: "MQL", target: "Nurture", value: 213 },
        { source: "SQL", target: "Opportunity", value: 510 },
        { source: "SQL", target: "Disqualified", value: 127 },
        { source: "Opportunity", target: "Proposal", value: 408 },
        { source: "Opportunity", target: "Closed Lost", value: 102 },
        { source: "Proposal", target: "Negotiation", value: 306 },
        { source: "Proposal", target: "Closed Lost", value: 102 },
        { source: "Negotiation", target: "Closed Won", value: 245 },
        { source: "Negotiation", target: "Closed Lost", value: 61 },
        { source: "Nurture", target: "SQL", value: 43 }
      ]
    } else {
      baseData.links = [
        { source: "New Leads", target: "MQL", value: 4080 },
        { source: "New Leads", target: "Disqualified", value: 1920 },
        { source: "MQL", target: "SQL", value: 3060 },
        { source: "MQL", target: "Nurture", value: 1020 },
        { source: "SQL", target: "Opportunity", value: 2448 },
        { source: "SQL", target: "Disqualified", value: 612 },
        { source: "Opportunity", target: "Proposal", value: 1958 },
        { source: "Opportunity", target: "Closed Lost", value: 490 },
        { source: "Proposal", target: "Negotiation", value: 1468 },
        { source: "Proposal", target: "Closed Lost", value: 490 },
        { source: "Negotiation", target: "Closed Won", value: 1174 },
        { source: "Negotiation", target: "Closed Lost", value: 294 },
        { source: "Nurture", target: "SQL", value: 204 }
      ]
    }

    return baseData
  }, [period])

  // Render D3 Sankey
  React.useEffect(() => {
    if (!svgRef.current) return

    const renderSankey = () => {
      // Use manual Sankey implementation with d3 instead of d3-sankey for better compatibility

      const width = 1200
      const height = 500
      const margin = { top: 10, right: 10, bottom: 10, left: 10 }

      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove()

      // Color scale
      const colors: Record<string, string> = {
        "New Leads": "#3182ce",
        "MQL": "#805ad5",
        "SQL": "#d69e2e",
        "Opportunity": "#38a169",
        "Proposal": "#e53e3e",
        "Negotiation": "#dd6b20",
        "Closed Won": "#38b2ac",
        "Closed Lost": "#f56565",
        "Nurture": "#a0aec0",
        "Disqualified": "#cbd5e0"
      }

      // Manual Sankey layout calculation
      const nodeWidth = 20
      const nodePadding = 20
      const availableWidth = width - margin.left - margin.right
      const availableHeight = height - margin.top - margin.bottom

      // Prepare nodes with positioning
      const nodes = sankeyData.nodes.map((node, i) => {
        const x = (i % 3) * (availableWidth / 3) + margin.left
        const y = Math.floor(i / 3) * (availableHeight / 4) + margin.top
        return {
          ...node,
          x0: x,
          x1: x + nodeWidth,
          y0: y,
          y1: y + 60,
          value: sankeyData.links.filter(l => l.source === node.id || l.target === node.id)
            .reduce((sum, l) => sum + l.value, 0)
        }
      })

      // Prepare links with positioning
      const links = sankeyData.links.map(link => {
        const sourceNode = nodes.find(n => n.id === link.source)
        const targetNode = nodes.find(n => n.id === link.target)
        return {
          ...link,
          source: sourceNode,
          target: targetNode,
          width: Math.max(1, link.value / 50) // Scale link width
        }
      })

      const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        .attr("height", "100%")

      // Add gradient definitions
      const defs = svg.append("defs")

      links.forEach((link: any, i: number) => {
        const gradient = defs.append("linearGradient")
          .attr("id", `gradient-${i}`)
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", link.source.x1)
          .attr("x2", link.target.x0)

        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colors[link.source.name])
          .attr("stop-opacity", 0.7)

        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colors[link.target.name])
          .attr("stop-opacity", 0.7)
      })

    // Add links with manual path creation
    svg.append("g")
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        // Create curved path from source to target
        const sx = d.source.x1
        const sy = (d.source.y0 + d.source.y1) / 2
        const tx = d.target.x0
        const ty = (d.target.y0 + d.target.y1) / 2
        const mx = (sx + tx) / 2
        return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`
      })
      .attr("stroke", (d: any, i: number) => `url(#gradient-${i})`)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .on("mouseover", function(event: any, d: any) {
        d3.select(this).attr("stroke-opacity", 0.7)
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "1"
          tooltipRef.current.innerHTML = `
            <strong>${d.source.name} → ${d.target.name}</strong><br/>
            Leads: ${d.value.toLocaleString()}<br/>
            ${((d.value / d.source.value) * 100).toFixed(1)}% of ${d.source.name}
          `
          tooltipRef.current.style.left = `${event.pageX + 10}px`
          tooltipRef.current.style.top = `${event.pageY - 10}px`
        }
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-opacity", 0.4)
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0"
        }
      })

    // Add nodes
    const node = svg.append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")

    // Add rectangles for nodes
    node.append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => colors[d.name])
      .attr("stroke", (d: any) => d3.color(colors[d.name])?.darker(0.5))
      .attr("stroke-width", 1)
      .attr("fill-opacity", 0.95)
      .style("cursor", "pointer")
      .on("mouseover", function(event: any, d: any) {
        d3.select(this).attr("fill-opacity", 1)
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "1"
          tooltipRef.current.innerHTML = `
            <strong>${d.name}</strong><br/>
            Total: ${d.value.toLocaleString()} leads
          `
          tooltipRef.current.style.left = `${event.pageX + 10}px`
          tooltipRef.current.style.top = `${event.pageY - 10}px`
        }
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill-opacity", 0.95)
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0"
        }
      })

    // Add labels
    node.append("text")
      .attr("x", (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "start" : "end")
      .text((d: any) => d.name)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#2d3748")

    // Add value labels
    node.append("text")
      .attr("x", (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2 + 16)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "start" : "end")
      .text((d: any) => d.value.toLocaleString())
      .style("font-size", "12px")
      .style("fill", "#718096")
    }

    renderSankey()
  }, [sankeyData])

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-900/50 dark:to-gray-800/30 backdrop-blur-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              Sales Pipeline Flow
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Real-time visualization of lead progression through your sales funnel
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('current')}
            >
              Current Quarter
            </Button>
            <Button
              variant={period === 'previous' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('previous')}
            >
              Previous Quarter
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Full Year
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {period === 'year' ? '6,000' : period === 'previous' ? '1,250' : metrics.totalLeads.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Leads</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {period === 'year' ? '66%' : period === 'previous' ? '64%' : `${metrics.qualificationRate}%`}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Qualification Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {period === 'year' ? '40%' : period === 'previous' ? '38%' : `${metrics.winRate}%`}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Win Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {period === 'year' ? '$8.7M' : period === 'previous' ? '$1.8M' : metrics.pipelineValue}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pipeline Value</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {period === 'year' ? '24d' : period === 'previous' ? '26d' : metrics.avgSalesCycle}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg. Sales Cycle</div>
          </div>
        </div>

        {/* Sankey Diagram */}
        <div className="relative bg-white dark:bg-gray-900 rounded-lg p-4">
          <svg ref={svgRef}></svg>
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none transition-opacity duration-200 bg-gray-900 text-white p-3 rounded-lg text-sm shadow-lg"
          style={{ opacity: 0 }}
        />
      </CardContent>
    </Card>
  )
}