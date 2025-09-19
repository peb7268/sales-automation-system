"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { motion } from "framer-motion"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'

const stageColors = {
  cold: "#64748b",
  contacted: "#3b82f6",
  interested: "#10b981",
  qualified: "#f59e0b",
}

export function PipelineFunnel() {
  const { getStageCount } = usePipelineStore()
  
  const data = [
    { stage: "Cold", count: getStageCount("cold"), color: stageColors.cold },
    { stage: "Contacted", count: getStageCount("contacted"), color: stageColors.contacted },
    { stage: "Interested", count: getStageCount("interested"), color: stageColors.interested },
    { stage: "Qualified", count: getStageCount("qualified"), color: stageColors.qualified },
  ]

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
        <CardDescription>
          Prospect distribution across stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual Funnel */}
          <div className="flex flex-col items-center space-y-2">
            {data.map((item, index) => {
              const widthPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              const marginPercentage = (100 - widthPercentage) / 2
              
              return (
                <motion.div
                  key={item.stage}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <div className="relative">
                    <div
                      className="h-12 flex items-center justify-center text-white font-semibold rounded transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: item.color,
                        width: `${widthPercentage}%`,
                        marginLeft: `${marginPercentage}%`,
                        marginRight: `${marginPercentage}%`,
                      }}
                    >
                      {item.count}
                    </div>
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {item.stage}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bar Chart Alternative View */}
          <div className="h-48 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Metrics */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Contact Rate</p>
              <p className="font-semibold">
                {data[0].count > 0 
                  ? ((data[1].count / data[0].count) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="font-semibold">
                {data[1].count > 0
                  ? ((data[2].count / data[1].count) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Qualify Rate</p>
              <p className="font-semibold">
                {data[2].count > 0
                  ? ((data[3].count / data[2].count) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-xs text-muted-foreground">Overall</p>
              <p className="font-semibold">
                {data[0].count > 0
                  ? ((data[3].count / data[0].count) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}