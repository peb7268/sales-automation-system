"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Phone, 
  Target, 
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react"

interface StageData {
  name: string
  value: number
  percentage: number
  color: string
  icon: React.ElementType
  description: string
}

export function PipelineFunnelV3() {
  const { prospects } = usePipelineStore()
  const [hoveredStage, setHoveredStage] = React.useState<string | null>(null)

  // Calculate prospects by stage
  const stageMetrics = React.useMemo(() => {
    const cold = prospects.filter(p => p.temperature === 'cold').length
    const contacted = prospects.filter(p => p.pipelineStage === 'contacted').length
    const interested = prospects.filter(p => p.pipelineStage === 'interested').length
    const qualified = prospects.filter(p => p.pipelineStage === 'qualified').length
    
    const total = cold || 1 // Prevent division by zero
    
    return [
      {
        name: 'Cold',
        value: cold,
        percentage: 100,
        color: '#94a3b8',
        icon: Users,
        description: 'New prospects'
      },
      {
        name: 'Contacted',
        value: contacted,
        percentage: (contacted / total) * 100,
        color: '#60a5fa',
        icon: Phone,
        description: 'Initial outreach made'
      },
      {
        name: 'Interested',
        value: interested,
        percentage: (interested / total) * 100,
        color: '#34d399',
        icon: Target,
        description: 'Showing interest'
      },
      {
        name: 'Qualified',
        value: qualified,
        percentage: (qualified / total) * 100,
        color: '#fb923c',
        icon: CheckCircle,
        description: 'Ready to close'
      }
    ] as StageData[]
  }, [prospects])

  // Calculate conversion rates
  const conversionRates = React.useMemo(() => {
    const rates = []
    for (let i = 0; i < stageMetrics.length - 1; i++) {
      const current = stageMetrics[i].value || 1
      const next = stageMetrics[i + 1].value
      const rate = ((next / current) * 100).toFixed(1)
      rates.push(rate)
    }
    return rates
  }, [stageMetrics])

  // Calculate overall conversion
  const overallConversion = React.useMemo(() => {
    const first = stageMetrics[0].value || 1
    const last = stageMetrics[stageMetrics.length - 1].value
    return ((last / first) * 100).toFixed(1)
  }, [stageMetrics])

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-900/50 dark:to-gray-800/30 backdrop-blur-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
              Sales Pipeline
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Visual funnel showing prospect progression
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="text-lg px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/50"
          >
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            {overallConversion}% Conversion
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Main Funnel Container */}
        <div className="relative">
          {/* Funnel Stages */}
          <div className="flex items-center justify-center gap-12 px-8 py-6">
            {stageMetrics.map((stage, index) => {
              const Icon = stage.icon
              // Progressive width calculation: 100% → 70% → 45% → 25%
              const widthPercentage = 100 - (index * 25)
              const isHovered = hoveredStage === stage.name

              return (
                <motion.div
                  key={stage.name}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredStage(stage.name)}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{ width: `${widthPercentage}%` }}
                >
                  {/* Funnel Segment */}
                  <motion.div
                    className="relative h-32 cursor-pointer"
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      y: isHovered ? -5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Glass Effect Background */}
                    <div 
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${stage.color}15 0%, ${stage.color}08 100%)`,
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: `2px solid ${stage.color}30`,
                        boxShadow: `
                          0 8px 32px ${stage.color}15,
                          inset 0 1px 2px rgba(255,255,255,0.3),
                          inset 0 -1px 2px rgba(0,0,0,0.1)
                        `
                      }}
                    >
                      {/* Gradient Overlay */}
                      <div 
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: `linear-gradient(180deg, transparent 0%, ${stage.color}10 100%)`
                        }}
                      />

                      {/* Animated Glow Effect */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              background: `radial-gradient(circle at center, ${stage.color}20 0%, transparent 70%)`,
                              filter: 'blur(20px)'
                            }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-center p-4">
                        {/* Icon */}
                        <motion.div
                          animate={{
                            rotate: isHovered ? 360 : 0,
                            scale: isHovered ? 1.2 : 1
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon 
                            className="h-8 w-8 mb-2"
                            style={{ 
                              color: stage.color,
                              filter: `drop-shadow(0 2px 4px ${stage.color}40)`
                            }}
                          />
                        </motion.div>

                        {/* Value */}
                        <motion.div
                          className="text-3xl font-bold mb-1"
                          style={{ color: stage.color }}
                          animate={{
                            scale: isHovered ? 1.1 : 1
                          }}
                        >
                          {stage.value}
                        </motion.div>

                        {/* Stage Name */}
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {stage.name}
                        </div>

                        {/* Description on Hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                            >
                              <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                                {stage.description}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Connecting Arrow */}
                    {index < stageMetrics.length - 1 && (
                      <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                        <motion.div
                          animate={{
                            x: isHovered ? 5 : 0,
                            opacity: isHovered ? 1 : 0.6
                          }}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight 
                            className="h-6 w-6 text-gray-400"
                            style={{
                              filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`
                            }}
                          />
                          {/* Conversion Rate */}
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                            {conversionRates[index]}%
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

        </div>

        {/* Monthly Sales Progress Bar and Yearly Projection */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Sales Progress - 2/3 width */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Monthly Sales Progress
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Stacked Horizontal Progress Bar */}
              <div className="relative">
                {/* Background Track */}
                <div className="h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
                  {/* Goal Marker */}
                  <div className="absolute inset-0 flex items-center">
                    <div 
                      className="absolute h-full w-0.5 bg-red-500 z-20"
                      style={{ left: '75%' }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                          Goal: $75K
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Progress Segments */}
                  <div className="relative h-full flex">
                    {/* Closed Deals */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 relative group"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                          Closed: $45K
                        </span>
                      </div>
                    </motion.div>

                    {/* In Pipeline */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '20%' }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 relative group"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                          Pipeline: $20K
                        </span>
                      </div>
                    </motion.div>

                    {/* Projected */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '15%' }}
                      transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-300 to-indigo-300 relative group opacity-60"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm drop-shadow-lg">
                          Projected: $15K
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Closed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pipeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-300 to-indigo-300 opacity-60" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Projected</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    80% of Goal
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Yearly Projection Card - 1/3 width */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="h-full"
            >
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Yearly Overview
                  </h3>
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>

                {/* Year to Date */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Closed YTD</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                      $385K
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      +23% vs last year
                    </p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-700" />

                  {/* Yearly Projection */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Projected Annual</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      $520K
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '74%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        74%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}