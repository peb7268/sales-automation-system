"use client"

import * as React from "react"
import * as d3 from "d3"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { useCallerStore } from "@/stores/useCallerStore"
import { motion } from "framer-motion"

// Sankey diagram for pipeline flow
export function SankeyDiagram() {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const { prospects } = usePipelineStore()

  React.useEffect(() => {
    if (!svgRef.current) return

    const width = 800
    const height = 400
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Create nodes and links for sankey
    const nodes = [
      { id: "cold", label: "Cold Leads", value: prospects.filter(p => p.temperature === 'cold').length },
      { id: "warm", label: "Warm Leads", value: prospects.filter(p => p.temperature === 'warm').length },
      { id: "hot", label: "Hot Leads", value: prospects.filter(p => p.temperature === 'hot').length },
      { id: "qualified", label: "Qualified", value: prospects.filter(p => p.qualificationScore > 70).length },
      { id: "meeting", label: "Meeting", value: prospects.filter(p => p.pipelineStage === 'meeting').length },
      { id: "closed", label: "Closed", value: prospects.filter(p => p.pipelineStage === 'closed').length },
    ]

    const links = [
      { source: 0, target: 3, value: 30 },
      { source: 1, target: 3, value: 40 },
      { source: 2, target: 3, value: 50 },
      { source: 3, target: 4, value: 60 },
      { source: 4, target: 5, value: 20 },
    ]

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(nodes.map(d => d.id))
      .range(["#64748b", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"])

    // Create node rectangles
    const nodeWidth = 100
    const nodeHeight = 60
    const nodeSpacing = (width - nodeWidth * 3) / 4
    const verticalSpacing = height / 3

    const nodePositions = [
      { x: nodeSpacing, y: verticalSpacing * 0.5 }, // cold
      { x: nodeSpacing, y: verticalSpacing * 1.5 }, // warm
      { x: nodeSpacing, y: verticalSpacing * 2.5 }, // hot
      { x: nodeSpacing * 2 + nodeWidth, y: verticalSpacing * 1.5 }, // qualified
      { x: nodeSpacing * 3 + nodeWidth * 2, y: verticalSpacing * 1.5 }, // meeting
      { x: width - nodeSpacing - nodeWidth, y: verticalSpacing * 1.5 }, // closed
    ]

    // Draw links as curved paths
    const linkGenerator = d3.linkHorizontal()
      .x((d: any) => d.x)
      .y((d: any) => d.y)

    svg.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        const source = nodePositions[d.source]
        const target = nodePositions[d.target]
        return linkGenerator({
          source: { x: source.x + nodeWidth, y: source.y + nodeHeight / 2 },
          target: { x: target.x, y: target.y + nodeHeight / 2 }
        })
      })
      .attr("fill", "none")
      .attr("stroke", (d: any) => color(nodes[d.source].id) as string)
      .attr("stroke-width", (d: any) => Math.max(2, d.value / 10))
      .attr("stroke-opacity", 0.4)

    // Draw nodes
    const nodeGroups = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${nodePositions[i].x}, ${nodePositions[i].y})`)

    nodeGroups.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", (d: any) => color(d.id) as string)
      .attr("rx", 5)
      .attr("opacity", 0.8)

    nodeGroups.append("text")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2 - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text((d: any) => d.label)

    nodeGroups.append("text")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text((d: any) => d.value)

  }, [prospects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Flow Visualization (D3.js)</CardTitle>
        <CardDescription>Sankey diagram showing lead progression</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg ref={svgRef}></svg>
      </CardContent>
    </Card>
  )
}

// Force-directed graph for prospect relationships
export function ForceDirectedGraph() {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const { prospects } = usePipelineStore()

  React.useEffect(() => {
    if (!svgRef.current) return

    const width = 800
    const height = 500

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Create nodes from prospects (limited to 30 for performance)
    const nodes = prospects.slice(0, 30).map(p => ({
      id: p.id,
      name: p.businessName,
      temperature: p.temperature,
      score: p.qualificationScore,
      radius: 5 + (p.qualificationScore / 10)
    }))

    // Create some random links between prospects
    const links: any[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.9) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: Math.random()
          })
        }
      }
    }

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['cold', 'warm', 'hot'])
      .range(['#64748b', '#f59e0b', '#ef4444'])

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.radius + 2))

    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1)

    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => colorScale(d.temperature) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d: any) => d.name.slice(0, 10))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("dy", -15)

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    node
      .on("mouseover", function(event, d: any) {
        tooltip.transition().duration(200).style("opacity", 1)
        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Temperature: ${d.temperature}<br/>
          Score: ${d.score}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0)
      })

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y)

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Cleanup
    return () => {
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [prospects])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospect Network Graph (D3.js)</CardTitle>
        <CardDescription>Force-directed graph showing prospect relationships</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg ref={svgRef}></svg>
      </CardContent>
    </Card>
  )
}

// Radial tree for campaign hierarchy
export function RadialTree() {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const { campaigns } = useCallerStore()

  React.useEffect(() => {
    if (!svgRef.current) return

    const width = 600
    const height = 600
    const radius = Math.min(width, height) / 2 - 40

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    // Create hierarchical data
    const data = {
      name: "Campaigns",
      children: campaigns.map(campaign => ({
        name: campaign.name,
        children: [
          { name: "Calls", value: campaign.completedCalls },
          { name: "Qualified", value: campaign.metrics?.qualifiedProspects || 0 },
          { name: "Meetings", value: campaign.metrics?.meetingsBooked || 0 },
        ]
      }))
    }

    const root = d3.hierarchy(data)
      .sum((d: any) => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

    tree(root as any)

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(["Campaigns", "Calls", "Qualified", "Meetings"])
      .range(["#6366f1", "#10b981", "#f59e0b", "#ef4444"])

    // Draw links
    const link = g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkRadial()
        .angle((d: any) => d.x)
        .radius((d: any) => d.y) as any)
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)

    // Draw nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y}, 0)
      `)

    node.append("circle")
      .attr("r", (d: any) => d.children ? 4 : 6)
      .attr("fill", (d: any) => colorScale(d.data.name) as string)

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", (d: any) => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", (d: any) => d.x >= Math.PI ? "rotate(180)" : null)
      .text((d: any) => d.data.name)
      .attr("font-size", "10px")

  }, [campaigns])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Hierarchy (D3.js)</CardTitle>
        <CardDescription>Radial tree visualization of campaign structure</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg ref={svgRef}></svg>
      </CardContent>
    </Card>
  )
}