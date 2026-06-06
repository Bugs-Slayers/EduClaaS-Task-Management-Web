import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-none border-2 px-3 py-1 text-sm font-bold uppercase tracking-wide transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:uppercase placeholder:tracking-wide md:text-sm aria-invalid:border-[var(--accent-neon)]",
        className
      )}
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border-strong)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-electric)'
        e.currentTarget.style.outline = 'none'
      }}
      onBlur={(e) => {
        if (!e.currentTarget.hasAttribute('aria-invalid')) {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
        }
      }}
      {...props}
    />
  )
}

export { Input }
