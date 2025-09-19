"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { useCallerStore } from "@/stores/useCallerStore"
import { useDashboardStore } from "@/stores/useDashboardStore"

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

// Geographic heat map of prospects
export function GeographicHeatmap() {
  const { prospects } = usePipelineStore()

  // Simulate geographic data (in production, this would come from actual addresses)
  const locationData = {
    lat: prospects.map(() => 37 + Math.random() * 5),
    lon: prospects.map(() => -122 + Math.random() * 10),
    z: prospects.map(p => p.qualificationScore),
    text: prospects.map(p => `${p.businessName}<br>Score: ${p.qualificationScore}`)
  }

  const data = [{
    type: 'scattergeo',
    locationmode: 'USA-states',
    lat: locationData.lat,
    lon: locationData.lon,
    text: locationData.text,
    hoverinfo: 'text',
    marker: {
      size: 8,
      color: locationData.z,
      colorscale: 'Viridis',
      cmin: 0,
      cmax: 100,
      reversescale: false,
      colorbar: {
        title: 'Qualification Score',
        thickness: 10,
        len: 0.5
      }
    }
  }]

  const layout = {
    title: '',
    geo: {
      scope: 'usa',
      projection: {
        type: 'albers usa'
      },
      showland: true,
      landcolor: 'rgb(243, 243, 243)',
      subunitcolor: 'rgb(217, 217, 217)',
      countrycolor: 'rgb(217, 217, 217)',
      countrywidth: 0.5,
      subunitwidth: 0.5
    },
    height: 500,
    margin: { t: 0, r: 0, l: 0, b: 0 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospect Geographic Distribution (Plotly)</CardTitle>
        <CardDescription>Heat map showing prospect locations and qualification scores</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}

// 3D surface plot for performance metrics
export function PerformanceSurface3D() {
  const { metrics } = useDashboardStore()
  const { calls } = useCallerStore()

  // Generate surface data
  const size = 20
  const x = Array.from({ length: size }, (_, i) => i)
  const y = Array.from({ length: size }, (_, i) => i)
  const z = []

  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      // Create a performance metric based on position
      row.push(Math.sin(i / 3) * Math.cos(j / 3) * 50 + 50)
    }
    z.push(row)
  }

  const data = [{
    type: 'surface',
    x: x,
    y: y,
    z: z,
    colorscale: 'Viridis',
    contours: {
      z: {
        show: true,
        usecolormap: true,
        highlightcolor: "#42f462",
        project: { z: true }
      }
    }
  }]

  const layout = {
    title: '',
    scene: {
      xaxis: { title: 'Time Period' },
      yaxis: { title: 'Campaign' },
      zaxis: { title: 'Performance %' },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      }
    },
    autosize: true,
    height: 500,
    margin: { t: 0, r: 0, l: 0, b: 0 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Performance Surface (Plotly)</CardTitle>
        <CardDescription>Multi-dimensional performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}

// Bubble chart for prospect analysis
export function ProspectBubbleChart() {
  const { prospects } = usePipelineStore()

  const data = [{
    type: 'scatter',
    mode: 'markers',
    x: prospects.map(p => p.qualificationScore),
    y: prospects.map(p => p.researchPasses.filter(r => r.completed).length),
    text: prospects.map(p => p.businessName),
    marker: {
      size: prospects.map(p => p.estimatedValue ? p.estimatedValue / 1000 : 10),
      sizemode: 'diameter',
      sizeref: 2,
      color: prospects.map(p => 
        p.temperature === 'hot' ? '#ef4444' :
        p.temperature === 'warm' ? '#f59e0b' : '#64748b'
      ),
      opacity: 0.6
    },
    hovertemplate: '<b>%{text}</b><br>' +
                   'Qualification: %{x}<br>' +
                   'Research Passes: %{y}<br>' +
                   '<extra></extra>'
  }]

  const layout = {
    title: '',
    xaxis: {
      title: 'Qualification Score',
      range: [0, 100]
    },
    yaxis: {
      title: 'Research Passes Completed',
      range: [0, 6]
    },
    height: 500,
    margin: { t: 20, r: 20, l: 60, b: 60 },
    hovermode: 'closest'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospect Analysis Bubble Chart (Plotly)</CardTitle>
        <CardDescription>Multi-dimensional prospect comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}

// Waterfall chart for revenue breakdown
export function RevenueWaterfall() {
  const { metrics } = useDashboardStore()

  const data = [{
    type: 'waterfall',
    orientation: "v",
    measure: ["relative", "relative", "relative", "relative", "total", "relative", "relative", "total"],
    x: ["Starting", "Cold Calls", "Warm Leads", "Hot Leads", "Subtotal", "Meetings", "Closed Deals", "Total"],
    textposition: "outside",
    text: ["+0", "+20000", "+30000", "+40000", "", "+25000", "+35000", ""],
    y: [0, 20000, 30000, 40000, 0, 25000, 35000, 0],
    connector: {
      line: {
        color: "rgb(63, 63, 63)"
      }
    },
    increasing: { marker: { color: "#10b981" } },
    decreasing: { marker: { color: "#ef4444" } },
    totals: { marker: { color: "#3b82f6" } }
  }]

  const layout = {
    title: "",
    xaxis: {
      type: "category"
    },
    yaxis: {
      title: "Revenue ($)"
    },
    height: 400,
    showlegend: false
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Waterfall Analysis (Plotly)</CardTitle>
        <CardDescription>Step-by-step revenue contribution</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "400px" }}
        />
      </CardContent>
    </Card>
  )
}

// Sunburst chart for hierarchical data
export function CampaignSunburst() {
  const { campaigns } = useCallerStore()

  const labels = ["All Campaigns"]
  const parents = [""]
  const values = [100]
  const colors = ["#6366f1"]

  campaigns.forEach(campaign => {
    labels.push(campaign.name)
    parents.push("All Campaigns")
    values.push(campaign.totalProspects)
    colors.push("#10b981")

    // Add campaign metrics as children
    labels.push(`${campaign.name} - Calls`)
    parents.push(campaign.name)
    values.push(campaign.completedCalls)
    colors.push("#3b82f6")

    labels.push(`${campaign.name} - Qualified`)
    parents.push(campaign.name)
    values.push(campaign.metrics?.qualifiedProspects || 0)
    colors.push("#f59e0b")

    labels.push(`${campaign.name} - Meetings`)
    parents.push(campaign.name)
    values.push(campaign.metrics?.meetingsBooked || 0)
    colors.push("#ef4444")
  })

  const data = [{
    type: 'sunburst',
    labels: labels,
    parents: parents,
    values: values,
    marker: {
      colors: colors
    },
    textinfo: "label+value",
    hovertemplate: '<b>%{label}</b><br>Value: %{value}<br>',
    branchvalues: 'total'
  }]

  const layout = {
    title: '',
    height: 500,
    margin: { t: 0, l: 0, r: 0, b: 0 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Hierarchy Sunburst (Plotly)</CardTitle>
        <CardDescription>Interactive hierarchical campaign breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "500px" }}
        />
      </CardContent>
    </Card>
  )
}

// Parallel coordinates for multi-dimensional analysis
export function ParallelCoordinates() {
  const { prospects } = usePipelineStore()

  const data = [{
    type: 'parcoords',
    line: {
      color: prospects.map(p => p.qualificationScore),
      colorscale: 'Viridis',
      showscale: true
    },
    dimensions: [
      {
        label: 'Qualification',
        values: prospects.map(p => p.qualificationScore),
        range: [0, 100]
      },
      {
        label: 'Research',
        values: prospects.map(p => p.researchPasses.filter(r => r.completed).length),
        range: [0, 5]
      },
      {
        label: 'Temperature',
        values: prospects.map(p => p.temperature === 'hot' ? 3 : p.temperature === 'warm' ? 2 : 1),
        range: [1, 3],
        tickvals: [1, 2, 3],
        ticktext: ['Cold', 'Warm', 'Hot']
      },
      {
        label: 'Stage',
        values: prospects.map(p => {
          switch(p.pipelineStage) {
            case 'closed': return 5
            case 'meeting': return 4
            case 'proposal': return 3
            case 'qualified': return 2
            default: return 1
          }
        }),
        range: [1, 5],
        tickvals: [1, 2, 3, 4, 5],
        ticktext: ['Lead', 'Qualified', 'Proposal', 'Meeting', 'Closed']
      }
    ]
  }]

  const layout = {
    title: '',
    height: 400,
    margin: { t: 50, r: 100, b: 20, l: 100 }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospect Parallel Coordinates (Plotly)</CardTitle>
        <CardDescription>Multi-dimensional prospect analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Plot
          data={data as any}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%", height: "400px" }}
        />
      </CardContent>
    </Card>
  )
}