"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallerStore } from "@/stores/useCallerStore"
import { 
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Clock,
  User,
  Building,
  TrendingUp,
  Play,
  Pause,
  SkipForward,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function LiveCallMonitor() {
  const { 
    activeCalls,
    currentTranscript,
    endCall,
    isMonitoring,
  } = useCallerStore()

  const [selectedCallId, setSelectedCallId] = React.useState<string | null>(null)
  const [audioWaveform, setAudioWaveform] = React.useState<number[]>(
    Array(20).fill(0).map(() => Math.random())
  )

  // Simulate audio waveform
  React.useEffect(() => {
    if (!isMonitoring || activeCalls.length === 0) return

    const interval = setInterval(() => {
      setAudioWaveform(Array(20).fill(0).map(() => Math.random()))
    }, 100)

    return () => clearInterval(interval)
  }, [isMonitoring, activeCalls.length])

  const selectedCall = activeCalls.find(c => c.id === selectedCallId) || activeCalls[0]

  if (!isMonitoring) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <MicOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Monitoring Disabled</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click "Start Monitoring" to begin tracking live calls
          </p>
        </CardContent>
      </Card>
    )
  }

  if (activeCalls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Phone className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Active Calls</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Waiting for incoming calls from Vapi...
          </p>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Active Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Calls ({activeCalls.length})</CardTitle>
          <CardDescription>
            Live calls in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              <AnimatePresence>
                {activeCalls.map((call, index) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "rounded-lg border p-3 cursor-pointer transition-colors",
                      selectedCallId === call.id ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedCallId(call.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-medium text-sm">
                            {call.prospectName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {call.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {call.phoneNumber}
                          </span>
                        </div>
                        {call.interestLevel && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              call.interestLevel === 'high' && "bg-green-100 text-green-700",
                              call.interestLevel === 'medium' && "bg-yellow-100 text-yellow-700",
                              call.interestLevel === 'low' && "bg-red-100 text-red-700"
                            )}
                          >
                            {call.interestLevel} interest
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          endCall(call.id, 'completed')
                        }}
                      >
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Call Details & Waveform */}
      {selectedCall && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Call in Progress</CardTitle>
                <CardDescription>
                  {selectedCall.prospectName} - {selectedCall.companyName}
                </CardDescription>
              </div>
              <Badge variant="default" className="animate-pulse">
                <Phone className="mr-1 h-3 w-3" />
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Waveform */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-center gap-1 h-16">
                {audioWaveform.map((height, index) => (
                  <motion.div
                    key={index}
                    className="w-1.5 bg-primary rounded-full"
                    animate={{ height: `${height * 64}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon">
                <MicOff className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => endCall(selectedCall.id, 'completed')}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>

            {/* Live Transcript */}
            <div>
              <h4 className="text-sm font-medium mb-2">Live Transcript</h4>
              <ScrollArea className="h-[200px] rounded-lg border p-3">
                <div className="space-y-2 text-sm">
                  {currentTranscript.split('\n').filter(Boolean).map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-2"
                    >
                      <span className="font-medium text-muted-foreground">
                        {line.startsWith('Agent') ? '🤖' : '👤'}
                      </span>
                      <span>{line}</span>
                    </motion.div>
                  ))}
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 w-1 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Sentiment Indicator */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Sentiment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">😊</span>
                <Badge variant="outline" className="text-xs">
                  Positive
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}