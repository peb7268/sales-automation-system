"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { usePipelineStore } from "@/stores/usePipelineStore"
import { IProspect, PipelineStage } from "@/types"
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  MoreVertical,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

const stageBadgeStyles: Record<PipelineStage, string> = {
  cold: "bg-slate-100 text-slate-700 border-slate-300",
  contacted: "bg-blue-100 text-blue-700 border-blue-300",
  interested: "bg-green-100 text-green-700 border-green-300",
  qualified: "bg-yellow-100 text-yellow-700 border-yellow-300",
}

const scoreColors = {
  high: "text-green-600",
  medium: "text-yellow-600",
  low: "text-red-600",
}

interface ProspectListProps {
  prospects: IProspect[]
}

export function ProspectList({ prospects }: ProspectListProps) {
  const { 
    selectedProspectIds,
    toggleProspectSelection,
    setSelectedProspect,
    moveProspect,
  } = usePipelineStore()

  const handleMoveStage = (prospectId: string, newStage: PipelineStage) => {
    moveProspect(prospectId, newStage)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prospects</CardTitle>
            <CardDescription>
              {prospects.length} prospects in current view
            </CardDescription>
          </div>
          {selectedProspectIds.size > 0 && (
            <Badge variant="secondary">
              {selectedProspectIds.size} selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {prospects.slice(0, 10).map((prospect, index) => (
            <motion.div
              key={prospect.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedProspectIds.has(prospect.id)}
                    onCheckedChange={() => toggleProspectSelection(prospect.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{prospect.business.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={stageBadgeStyles[prospect.pipelineStage]}
                      >
                        {prospect.pipelineStage}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {prospect.business.location.city}, {prospect.business.location.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {prospect.contact.primaryContact}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-semibold ${scoreColors[prospect.qualificationScore.qualificationLevel]}`}>
                        Score: {prospect.qualificationScore.total}
                      </span>
                      <span className="text-muted-foreground">
                        {prospect.business.industry.replace('_', ' ')}
                      </span>
                      {prospect.business.digitalPresence.hasWebsite && (
                        <Badge variant="secondary" className="text-xs">
                          Has Website
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last updated: {new Date(prospect.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProspect(prospect)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedProspect(prospect)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Start Call
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Move to...
                      </DropdownMenuItem>
                      {prospect.pipelineStage !== 'qualified' && (
                        <DropdownMenuItem 
                          onClick={() => handleMoveStage(prospect.id, 'qualified')}
                        >
                          Mark as Qualified
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Research Progress Bar */}
              {prospect.researchPasses && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Research Progress</span>
                    <span>{prospect.researchPasses.filter(p => p.status === 'completed').length}/{prospect.researchPasses.length}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-green-500 transition-all duration-300"
                      style={{ 
                        width: `${(prospect.researchPasses.filter(p => p.status === 'completed').length / prospect.researchPasses.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {prospects.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              Load More ({prospects.length - 10} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}