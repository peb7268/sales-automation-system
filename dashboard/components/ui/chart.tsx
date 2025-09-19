import * as React from "react"
import { cn } from "@/lib/utils"

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
))
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return <>{content}</>
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-popover p-2 text-popover-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
ChartTooltipContent.displayName = "ChartTooltipContent"
