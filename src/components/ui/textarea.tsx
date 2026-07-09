import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border-2 px-3 py-2 text-sm font-bold tracking-wide transition-all outline-none placeholder:uppercase placeholder:tracking-wide disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-[var(--accent-neon)]",
        className
      )}
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border-strong)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-electric)'
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

export { Textarea }
