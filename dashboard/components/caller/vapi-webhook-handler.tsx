"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCallerStore } from "@/stores/useCallerStore"
import { IVapiWebhookPayload } from "@/types"
import { 
  Webhook,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Headphones,
  Mic,
  MicOff,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function VapiWebhookHandler() {
  const { activeCalls, endCall, updateTranscript } = useCallerStore()
  const [webhookStatus, setWebhookStatus] = React.useState<'connected' | 'disconnected' | 'error'>('connected')
  const [recentWebhooks, setRecentWebhooks] = React.useState<IVapiWebhookPayload[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Simulate webhook events from Vapi
  React.useEffect(() => {
    const simulateVapiWebhook = () => {
      if (activeCalls.length === 0) return

      const events: IVapiWebhookPayload['event'][] = [
        'call.started',
        'transcript.partial',
        'transcript.final',
        'call.ended',
      ]

      const randomCall = activeCalls[Math.floor(Math.random() * activeCalls.length)]
      const randomEvent = events[Math.floor(Math.random() * events.length)]

      const webhookPayload: IVapiWebhookPayload = {
        event: randomEvent,
        callId: randomCall.id,
        assistantId: 'asst_123',
        phoneNumberId: 'phone_123',
        data: {
          duration: Math.floor(Math.random() * 300),
          recordingUrl: `https://vapi.ai/recordings/${randomCall.id}.mp3`,
          transcript: "This is a sample transcript from Vapi webhook...",
          sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
          qualificationScore: Math.floor(Math.random() * 10) + 1,
        },
        timestamp: new Date(),
      }

      handleVapiWebhook(webhookPayload)
    }

    const interval = setInterval(simulateVapiWebhook, 5000)
    return () => clearInterval(interval)
  }, [activeCalls])

  const handleVapiWebhook = (payload: IVapiWebhookPayload) => {
    setIsProcessing(true)
    
    // Add to recent webhooks
    setRecentWebhooks(prev => [payload, ...prev].slice(0, 5))

    // Process based on event type
    switch (payload.event) {
      case 'call.started':
        console.log('Call started:', payload.callId)
        break
      
      case 'transcript.partial':
        if (payload.data.transcript) {
          updateTranscript(payload.data.transcript)
        }
        break
      
      case 'transcript.final':
        if (payload.data.transcript) {
          updateTranscript(payload.data.transcript)
        }
        break
      
      case 'call.ended':
        // Update call with Vapi data including recording URL
        if (payload.callId && payload.data.recordingUrl) {
          // In production, this would update the call record with the recording URL
          console.log('Call ended with recording:', payload.data.recordingUrl)
        }
        break
      
      case 'call.failed':
        console.error('Call failed:', payload.callId)
        setWebhookStatus('error')
        break
    }

    setTimeout(() => setIsProcessing(false), 500)
  }

  const statusConfig = {
    connected: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-600 bg-green-50 border-green-200",
      label: "Connected",
    },
    disconnected: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      label: "Disconnected",
    },
    error: {
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Error",
    },
  }

  const eventIcons = {
    'call.started': <Headphones className="h-3 w-3" />,
    'call.ended': <MicOff className="h-3 w-3" />,
    'transcript.partial': <Mic className="h-3 w-3" />,
    'transcript.final': <Mic className="h-3 w-3" />,
    'call.failed': <XCircle className="h-3 w-3" />,
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>Vapi Webhook Status</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={statusConfig[webhookStatus].color}
            >
              {statusConfig[webhookStatus].icon}
              <span className="ml-1">{statusConfig[webhookStatus].label}</span>
            </Badge>
            {isProcessing && (
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        </div>
        <CardDescription>
          Real-time call events and recording URLs from Vapi AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Recent Webhook Events */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Events</h4>
            <AnimatePresence>
              {recentWebhooks.length > 0 ? (
                recentWebhooks.map((webhook, index) => (
                  <motion.div
                    key={`${webhook.callId}-${webhook.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {eventIcons[webhook.event]}
                      <span className="font-medium">{webhook.event}</span>
                      <span className="text-muted-foreground">
                        Call #{webhook.callId.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {webhook.data.recordingUrl && (
                        <Badge variant="secondary" className="text-xs">
                          Has Recording
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(webhook.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No webhook events yet. Start a call to see events.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Webhook Configuration Info */}
          <div className="rounded-lg bg-muted p-3 text-xs">
            <p className="font-medium mb-1">Webhook Endpoint:</p>
            <code className="text-muted-foreground">
              https://your-domain.com/api/webhooks/vapi
            </code>
            <p className="mt-2 text-muted-foreground">
              Configure this URL in your Vapi assistant settings to receive call events and recording URLs.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}