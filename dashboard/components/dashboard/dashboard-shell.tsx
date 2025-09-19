"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Settings,
  TrendingUp,
  Phone,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  RefreshCw,
  Zap,
  Target,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    isRealTimeEnabled,
    toggleRealTime,
    metrics,
    updateMetrics,
  } = useDashboardStore()

  React.useEffect(() => {
    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(() => {
      if (isRealTimeEnabled) {
        updateMetrics()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, updateMetrics])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo with aggressive pipe/sales icon */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Pipe icon with aggressive sales elements */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600 shadow-lg">
                {/* Stacked icon design: pipe + target */}
                <div className="relative">
                  <Target className="h-6 w-6 text-white absolute -rotate-12" strokeWidth={2.5} />
                  <Zap className="h-5 w-5 text-yellow-300 absolute top-0.5 left-0.5 animate-pulse" strokeWidth={3} />
                </div>
              </div>
              {/* Aggressive accent */}
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 animate-pulse border-2 border-background" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                PIPE
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Sales Acceleration</p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Real-time toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRealTime}
              className={cn(
                "relative",
                isRealTimeEnabled && "text-green-500"
              )}
            >
              <RefreshCw 
                size={18} 
                className={cn(
                  "transition-transform",
                  isRealTimeEnabled && "animate-spin"
                )}
              />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <h3 className="font-semibold">Notifications</h3>
                  <Badge variant="secondary">{unreadCount} unread</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start p-3"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex w-full items-start justify-between">
                        <span className="font-medium">{notification.title}</span>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="border-b bg-muted/50">
        <div className="container flex h-14 items-center gap-6 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prospects:</span>
            <span className="text-sm font-semibold">{metrics.totalProspects}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Qualified:</span>
            <span className="text-sm font-semibold text-green-600">
              {metrics.qualifiedLeads}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Calls Today:</span>
            <span className="text-sm font-semibold">{metrics.callsToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Meetings:</span>
            <span className="text-sm font-semibold text-blue-600">
              {metrics.meetingsBooked}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pipeline Value:</span>
            <span className="text-sm font-semibold">
              ${(metrics.estimatedPipeline / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Connection Rate:</span>
            <span className="text-sm font-semibold">
              {(metrics.connectionRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  )
}