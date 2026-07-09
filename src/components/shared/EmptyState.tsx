import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="mb-4 p-4 border-2" style={{ borderColor: 'var(--border-medium)', background: 'var(--bg-tertiary)' }}>
        <Icon className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
      </div>
      <h3 className="mb-2 text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{title}</h3>
      <p className="mb-6 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      {action && (
        <Button onClick={action.onClick} style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}>{action.label}</Button>
      )}
    </div>
  )
}
