"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, Target, Phone, CheckCircle } from "lucide-react"
import * as d3 from "d3"

export function PipelineFunnelV2() {
  const { prospects } = usePipelineStore()
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Calculate prospects by stage
  const stageData = React.useMemo(() => {
    const stages = {
      cold: prospects.filter(p => p.temperature === 'cold').length,
      contacted: prospects.filter(p => p.pipelineStage === 'contacted').length,
      interested: prospects.filter(p => p.pipelineStage === 'interested').length,
      qualified: prospects.filter(p => p.pipelineStage === 'qualified').length,
    }
    return stages
  }, [prospects])

  // Calculate conversion rates
  const conversionRates = React.useMemo(() => {
    const total = stageData.cold
    const contactRate = total > 0 ? ((stageData.contacted / total) * 100).toFixed(1) : 0
    const interestRate = stageData.contacted > 0 ? ((stageData.interested / stageData.contacted) * 100).toFixed(1) : 0
    const qualifyRate = stageData.interested > 0 ? ((stageData.qualified / stageData.interested) * 100).toFixed(1) : 0
    const overallRate = total > 0 ? ((stageData.qualified / total) * 100).toFixed(1) : 0

    return { contactRate, interestRate, qualifyRate, overallRate }
  }, [stageData])

  // Data for D3 funnel
  const funnelData = [
    {
      name: 'Cold',
      value: stageData.cold,
      color: '#64748b',
      lightColor: '#94a3b8',
      icon: Users,
    },
    {
      name: 'Contacted',
      value: stageData.contacted,
      color: '#3b82f6',
      lightColor: '#60a5fa',
      icon: Phone,
    },
    {
      name: 'Interested',
      value: stageData.interested,
      color: '#10b981',
      lightColor: '#34d399',
      icon: Target,
    },
    {
      name: 'Qualified',
      value: stageData.qualified,
      color: '#f97316',
      lightColor: '#fb923c',
      icon: CheckCircle,
    }
  ]

  // D3 Funnel Chart Effect
  React.useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const containerWidth = 600
    const containerHeight = 200
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    // Set up SVG dimensions
    svg.attr("width", containerWidth).attr("height", containerHeight)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Calculate maximum value for scaling
    const maxValue = Math.max(...funnelData.map(d => d.value))
    const maxHeight = height * 0.8

    // Calculate positions and sizes for each stage
    const stageWidth = width / funnelData.length
    const gap = 20

    funnelData.forEach((stage, i) => {
      const x = i * stageWidth
      const centerY = height / 2
      
      // Calculate trapezoid height based on value (progressive scaling)
      const heightRatio = maxValue > 0 ? stage.value / maxValue : 0
      const baseHeight = maxHeight * heightRatio
      
      // Progressive width scaling (gets narrower from left to right)
      const progressiveScale = 1 - (i * 0.15) // Each stage gets 15% narrower
      const stageHeight = baseHeight * progressiveScale
      
      // Create trapezoid path (wider at left, narrower at right) with rotation
      const leftWidth = stageWidth - gap
      const rightWidth = leftWidth * 0.85 // Right side is 85% of left side width
      
      // Add rotation effect - each trapezoid rotates slightly to the right
      const rotationAngle = 3 + (i * 2) // Progressive rotation: 3°, 5°, 7°, 9°
      
      const trapezoidPath = `
        M ${x + gap/2} ${centerY - stageHeight/2}
        L ${x + leftWidth - gap/2} ${centerY - stageHeight/2}
        L ${x + leftWidth - gap/2 - (leftWidth - rightWidth)/2} ${centerY + stageHeight/2}
        L ${x + gap/2 + (leftWidth - rightWidth)/2} ${centerY + stageHeight/2}
        Z
      `

      // Create enhanced gradient for glass effect
      const gradientId = `gradient-${i}`
      const glowGradientId = `glow-gradient-${i}`
      
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", stage.lightColor)
        .attr("stop-opacity", 0.6) // More transparent

      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", stage.color)
        .attr("stop-opacity", 0.4) // Glass-like transparency

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", stage.color)
        .attr("stop-opacity", 0.7)

      // Create glow gradient for hover effect
      const glowGradient = svg.append("defs")
        .append("radialGradient")
        .attr("id", glowGradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")

      glowGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", stage.color)
        .attr("stop-opacity", 0.8)

      glowGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", stage.color)
        .attr("stop-opacity", 0.1)

      // Create filter for glow effect
      const filterId = `glow-filter-${i}`
      const filter = svg.append("defs")
        .append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")

      filter.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur")

      const feMerge = filter.append("feMerge")
      feMerge.append("feMergeNode").attr("in", "coloredBlur")
      feMerge.append("feMergeNode").attr("in", "SourceGraphic")

      // Create trapezoid group for rotation and hover effects
      const trapezoidGroup = g.append("g")
        .attr("transform", `translate(${x + leftWidth/2 - gap/4}, ${centerY}) rotate(${rotationAngle}) translate(${-(x + leftWidth/2 - gap/4)}, ${-centerY})`)
        .style("cursor", "pointer")

      // Invisible larger area for better hover detection
      trapezoidGroup.append("path")
        .attr("d", trapezoidPath)
        .attr("fill", "transparent")
        .attr("stroke", "none")
        .style("cursor", "pointer")

      // Main trapezoid
      const mainTrapezoid = trapezoidGroup.append("path")
        .attr("d", trapezoidPath)
        .attr("fill", `url(#${gradientId})`)
        .attr("stroke", stage.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6)
        .style("backdrop-filter", "blur(10px)")
        .style("transition", "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)")

      // Glass overlay effect
      trapezoidGroup.append("path")
        .attr("d", trapezoidPath)
        .attr("fill", "url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='glass' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:white;stop-opacity:0.3'/%3E%3Cstop offset='50%25' style='stop-color:white;stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:white;stop-opacity:0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23glass)'/%3E%3C/svg%3E)")
        .style("pointer-events", "none")

      // Hover effects
      trapezoidGroup
        .on("mouseenter", function() {
          d3.select(this).select("path:first-of-type")
            .transition()
            .duration(300)
            .attr("filter", `url(#${filterId})`)
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", 1)
            .style("transform", "scale(1.05)")

          // Enhance the glow on hover
          d3.select(this)
            .transition()
            .duration(300)
            .style("filter", `drop-shadow(0 0 20px ${stage.color}60)`)
        })
        .on("mouseleave", function() {
          d3.select(this).select("path:first-of-type")
            .transition()
            .duration(300)
            .attr("filter", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.6)
            .style("transform", "scale(1)")

          d3.select(this)
            .transition()
            .duration(300)
            .style("filter", "none")
        })

      // Add stage label with rotation compensation
      g.append("text")
        .attr("x", x + leftWidth/2 - gap/4)
        .attr("y", centerY - stageHeight/2 - 15)
        .attr("text-anchor", "middle")
        .attr("fill", stage.color)
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .style("text-shadow", "0 1px 2px rgba(0,0,0,0.3)")
        .text(stage.name)

      // Add value label inside trapezoid with rotation compensation
      g.append("text")
        .attr("x", x + leftWidth/2 - gap/4)
        .attr("y", centerY + 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
        .style("pointer-events", "none")
        .text(stage.value)
    })

  }, [funnelData])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              Sales Pipeline
            </CardTitle>
            <CardDescription>Horizontal funnel visualization showing prospect flow</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            Overall: {conversionRates.overallRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-8">
          {/* D3 Horizontal Funnel */}
          <div className="flex-1">
            <svg 
              ref={svgRef} 
              className="w-full"
              style={{ maxWidth: '600px', height: '200px' }}
            />
          </div>

          {/* Stats Panel */}
          <div className="w-56 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Contact Rate */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Contact Rate</span>
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {conversionRates.contactRate}%
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Cold → Contacted
                </div>
              </div>

              {/* Interest Rate */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Interest Rate</span>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {conversionRates.interestRate}%
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Contacted → Interested
                </div>
              </div>

              {/* Qualify Rate */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Qualify Rate</span>
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {conversionRates.qualifyRate}%
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Interested → Qualified
                </div>
              </div>

              {/* Overall Conversion */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Rate</span>
                  {parseFloat(conversionRates.overallRate) > 10 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {conversionRates.overallRate}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Cold → Qualified
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stage Icons Row - Funnel Style */}
        <div className="flex justify-center items-end mt-6 px-4 gap-8">
          {funnelData.map((stage, index) => {
            const Icon = stage.icon
            // Progressive sizing - largest on left, smallest on right
            const sizes = ['w-16 h-16 p-4', 'w-14 h-14 p-3.5', 'w-12 h-12 p-3', 'w-10 h-10 p-2.5']
            const iconSizes = ['h-8 w-8', 'h-7 w-7', 'h-6 w-6', 'h-5 w-5']
            
            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div 
                  className={`${sizes[index]} rounded-full backdrop-blur-md border-2 transition-all duration-300 ease-out
                    transform rotate-12 group-hover:rotate-0 group-hover:scale-110 
                    group-hover:shadow-2xl group-hover:shadow-current/50
                    relative overflow-hidden`}
                  style={{ 
                    backgroundColor: `${stage.color}15`, 
                    borderColor: `${stage.color}40`,
                    boxShadow: `0 8px 32px ${stage.color}20`
                  }}
                >
                  {/* Glass effect overlay */}
                  <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent 
                      opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 blur-sm"
                    style={{ 
                      background: `radial-gradient(circle, ${stage.color}40 0%, transparent 70%)`
                    }}
                  />
                  
                  <Icon 
                    className={`${iconSizes[index]} relative z-10 transition-all duration-300 
                      group-hover:scale-110 group-hover:brightness-110`}
                    style={{ 
                      color: stage.color,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                </div>
                
                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stage.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stage.name}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}