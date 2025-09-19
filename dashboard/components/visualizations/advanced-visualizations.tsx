"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Activity, 
  Globe, 
  Network,
  BarChart3,
  Boxes,
  RefreshCw
} from "lucide-react"

// Three.js components
import { Pipeline3D, ProspectClustering3D } from "./pipeline-3d"

// D3.js components
import { SankeyDiagram, ForceDirectedGraph, RadialTree } from "./d3-charts"

// Plotly components
import { 
  GeographicHeatmap, 
  PerformanceSurface3D, 
  ProspectBubbleChart,
  RevenueWaterfall,
  CampaignSunburst,
  ParallelCoordinates
} from "./plotly-charts"

export function AdvancedVisualizations() {
  const [activeTab, setActiveTab] = React.useState("threejs")

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Advanced Visualizations
          </h2>
          <p className="text-muted-foreground">
            Interactive 3D graphics and advanced data visualizations
          </p>
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-500" />
                3D Visualizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Three.js scenes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                D3.js Charts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Interactive graphs</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Plotly Charts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Scientific plots</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">60fps</div>
              <p className="text-xs text-muted-foreground">Animation rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="threejs" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Three.js 3D
            <Badge variant="secondary" className="ml-1">WebGL</Badge>
          </TabsTrigger>
          <TabsTrigger value="d3" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            D3.js
            <Badge variant="secondary" className="ml-1">SVG</Badge>
          </TabsTrigger>
          <TabsTrigger value="plotly" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Plotly
            <Badge variant="secondary" className="ml-1">Scientific</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threejs" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Pipeline3D />
            <ProspectClustering3D />
          </motion.div>
        </TabsContent>

        <TabsContent value="d3" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <SankeyDiagram />
            <ForceDirectedGraph />
            <RadialTree />
          </motion.div>
        </TabsContent>

        <TabsContent value="plotly" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <GeographicHeatmap />
              <PerformanceSurface3D />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ProspectBubbleChart />
              <RevenueWaterfall />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CampaignSunburst />
              <ParallelCoordinates />
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Feature highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Features</CardTitle>
          <CardDescription>Advanced capabilities and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-500" />
                Three.js Features
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• WebGL-powered 3D rendering</li>
                <li>• Real-time animations at 60fps</li>
                <li>• Interactive orbit controls</li>
                <li>• Dynamic lighting and materials</li>
                <li>• Hover and click interactions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                D3.js Features
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• SVG-based visualizations</li>
                <li>• Force-directed layouts</li>
                <li>• Hierarchical data structures</li>
                <li>• Drag and drop interactions</li>
                <li>• Custom transitions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Plotly Features
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Scientific-grade plotting</li>
                <li>• Geographic visualizations</li>
                <li>• 3D surface plots</li>
                <li>• Statistical charts</li>
                <li>• Built-in interactivity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}