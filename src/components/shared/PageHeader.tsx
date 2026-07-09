import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-5xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
