import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority, ProjectStatus } from '@/types'

const taskStatusStyles: Record<TaskStatus, { bg: string; color: string; border: string }> = {
  todo: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-medium)' },
  in_progress: { bg: 'var(--bg-secondary)', color: 'var(--accent-cyber)', border: 'var(--accent-cyber)' },
  in_review: { bg: 'var(--bg-secondary)', color: 'var(--accent-warning)', border: 'var(--accent-warning)' },
  done: { bg: 'var(--bg-secondary)', color: 'var(--accent-electric)', border: 'var(--accent-electric)' },
  blocked: { bg: 'var(--bg-secondary)', color: 'var(--accent-neon)', border: 'var(--accent-neon)' },
}

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'TODO',
  in_progress: 'IN PROGRESS',
  in_review: 'REVIEW',
  done: 'DONE',
  blocked: 'BLOCKED',
}

const priorityStyles: Record<TaskPriority, { bg: string; color: string; border: string }> = {
  low: { bg: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: 'var(--border-medium)' },
  medium: { bg: 'var(--bg-secondary)', color: 'var(--accent-cyber)', border: 'var(--accent-cyber)' },
  high: { bg: 'var(--bg-secondary)', color: 'var(--accent-warning)', border: 'var(--accent-warning)' },
  critical: { bg: 'var(--bg-secondary)', color: 'var(--accent-neon)', border: 'var(--accent-neon)' },
}

const projectStatusStyles: Record<ProjectStatus, { bg: string; color: string; border: string }> = {
  active: { bg: 'var(--bg-secondary)', color: 'var(--accent-electric)', border: 'var(--accent-electric)' },
  completed: { bg: 'var(--bg-secondary)', color: 'var(--accent-cyber)', border: 'var(--accent-cyber)' },
  archived: { bg: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: 'var(--border-medium)' },
}

interface Props {
  type: 'taskStatus' | 'priority' | 'projectStatus'
  value: string
  className?: string
}

export function StatusBadge({ type, value, className }: Props) {
  let styles = { bg: '', color: '', border: '' }
  let label = value

  if (type === 'taskStatus') {
    styles = taskStatusStyles[value as TaskStatus] ?? styles
    label = taskStatusLabels[value as TaskStatus] ?? value
  } else if (type === 'priority') {
    styles = priorityStyles[value as TaskPriority] ?? styles
    label = value.toUpperCase()
  } else if (type === 'projectStatus') {
    styles = projectStatusStyles[value as ProjectStatus] ?? styles
    label = value.toUpperCase()
  }

  return (
    <span
      className={cn('inline-flex items-center border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider', className)}
      style={{
        background: styles.bg,
        color: styles.color,
        borderColor: styles.border,
        fontFamily: 'var(--font-display)'
      }}
    >
      {label}
    </span>
  )
}
