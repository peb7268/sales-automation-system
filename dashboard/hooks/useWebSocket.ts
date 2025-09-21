"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  lastMessage: any
}

interface WebSocketOptions {
  autoConnect?: boolean
  debug?: boolean
}

export function useWebSocket(url: string = 'ws://localhost:3001', options: WebSocketOptions = {}) {
  const { autoConnect = true, debug = false } = options
  const socketRef = useRef<Socket | null>(null)
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null
  })

  const connect = () => {
    if (socketRef.current?.connected) return

    setState(prev => ({ ...prev, connecting: true, error: null }))

    try {
      socketRef.current = io(url, {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: true
      })

      socketRef.current.on('connect', () => {
        if (debug) console.log('WebSocket connected')
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null
        }))
      })

      socketRef.current.on('disconnect', (reason) => {
        if (debug) console.log('WebSocket disconnected:', reason)
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }))
      })

      socketRef.current.on('connect_error', (error) => {
        if (debug) console.error('WebSocket connection error:', error)
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: error.message
        }))
      })

      // Listen for all events
      socketRef.current.onAny((eventName, data) => {
        if (debug) console.log('WebSocket event:', eventName, data)
        setState(prev => ({
          ...prev,
          lastMessage: { event: eventName, data, timestamp: new Date() }
        }))
      })

    } catch (error) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }))
    }
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Cannot emit: WebSocket not connected')
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, autoConnect])

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket: socketRef.current
  }
}