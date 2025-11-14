import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            // Primary button - Purple (#633ff3)
            "bg-[#633ff3] text-white shadow-[0px_6px_18px_rgba(99,63,243,0.28)] hover:bg-[#5332d9] active:scale-[0.98]":
              variant === "primary",
            // Outline button
            "border border-border bg-card text-[#633ff3] hover:bg-muted":
              variant === "outline",
            // Ghost button
            "hover:bg-muted text-foreground":
              variant === "ghost",
            // Destructive button
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              variant === "destructive",
            // Sizes - compact as requested
            "h-10 px-4 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

