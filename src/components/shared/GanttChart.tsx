import { useNavigate } from 'react-router-dom'
import type { Task } from '@/types'
import { subDays, addDays, differenceInDays, format, parseISO, startOfDay, isAfter, isBefore } from 'date-fns'

interface Props {
  tasks: Task[]
}

const priorityColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#84cc16',
}

const priorityLabel: Record<string, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

export function GanttChart({ tasks }: Props) {
  const navigate = useNavigate()

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No tasks to display</p>
      </div>
    )
  }

  // Compute date range
  const today = startOfDay(new Date())
  const dates = tasks
    .flatMap((t) => {
      const d: Date[] = [parseISO(t.created_at)]
      if (t.due_date) d.push(parseISO(t.due_date))
      return d
    })
    .sort((a, b) => a.getTime() - b.getTime())

  const startDate = dates.length > 0 && isBefore(dates[0], today) ? dates[0] : subDays(today, 1)
  const endDate = dates.length > 0 && isAfter(dates[dates.length - 1], today) ? dates[dates.length - 1] : addDays(today, 14)

  const totalDays = differenceInDays(endDate, startDate) + 1
  const dayWidth = Math.max(40, Math.min(80, 800 / totalDays))

  const statusColor: Record<string, string> = {
    todo: 'var(--text-tertiary)',
    in_progress: 'var(--accent-cyber)',
    in_review: 'var(--accent-warning)',
    done: 'var(--accent-electric)',
    blocked: 'var(--accent-neon)',
  }

  return (
    <div
      className="rounded-xl border-2 overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
    >
      {/* Header - date axis */}
      <div
        className="flex sticky top-0 z-10 border-b-2"
        style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-medium)' }}
      >
        {/* Task name column */}
        <div
          className="shrink-0 p-3 font-black text-xs uppercase tracking-wider border-r-2"
          style={{ width: 220, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', borderColor: 'var(--border-medium)' }}
        >
          Task
        </div>
        {/* Date columns */}
        <div className="flex flex-1 overflow-hidden">
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = addDays(startDate, i)
            const isToday = differenceInDays(day, today) === 0
            return (
              <div
                key={i}
                className="shrink-0 flex flex-col items-center justify-center py-2 text-[10px] font-black uppercase tracking-wider"
                style={{
                  width: dayWidth,
                  color: isToday ? 'var(--accent-electric)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-display)',
                  background: isToday ? 'rgba(0, 255, 136, 0.08)' : undefined,
                  borderRight: '1px solid var(--border-subtle)',
                }}
              >
                <span>{format(day, 'MMM')}</span>
                <span className="mt-0.5">{format(day, 'dd')}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task rows */}
      <div className="overflow-y-auto max-h-[600px]">
        {tasks.map((task) => {
          const taskStart = parseISO(task.created_at)
          const taskEnd = task.due_date ? parseISO(task.due_date) : addDays(taskStart, 3)
          const barStart = differenceInDays(taskStart, startDate)
          const barDuration = differenceInDays(taskEnd, taskStart) + 1

          // Clamp
          const clampedStart = Math.max(0, barStart)
          const clampedEnd = Math.min(totalDays, barStart + barDuration)
          const visibleStart = Math.max(0, clampedStart)
          const visibleWidth = Math.max(1, clampedEnd - clampedStart)

          const color = priorityColor[task.priority] ?? 'var(--text-tertiary)'
          const status = statusColor[task.status] ?? 'var(--text-tertiary)'

          return (
            <div
              key={task.id}
              className="flex border-b cursor-pointer transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border-subtle)' }}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              {/* Task name */}
              <div
                className="shrink-0 flex items-center gap-2 p-3 border-r-2"
                style={{ width: 220, borderColor: 'var(--border-medium)' }}
              >
                <div
                  className="w-2 h-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p
                    className="text-xs font-bold uppercase tracking-wide truncate"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color, fontFamily: 'var(--font-mono)' }}
                    >
                      {priorityLabel[task.priority]}
                    </span>
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ background: status }}
                    />
                    <span
                      className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: status, fontFamily: 'var(--font-mono)' }}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gantt bar area */}
              <div className="flex flex-1 relative" style={{ minHeight: 48 }}>
                {/* Grid lines */}
                {Array.from({ length: totalDays }).map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0"
                    style={{ width: dayWidth, borderRight: '1px solid var(--border-subtle)' }}
                  />
                ))}

                {/* Task bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded h-6 flex items-center px-2 overflow-hidden"
                  style={{
                    left: visibleStart * dayWidth + 2,
                    width: Math.max(4, visibleWidth * dayWidth - 4),
                    background: color,
                    opacity: task.status === 'done' ? 0.5 : 0.85,
                    border: `2px solid ${color}`,
                  }}
                >
                  <span
                    className="text-[9px] font-black uppercase tracking-wider truncate"
                    style={{
                      color: task.priority === 'low' || task.priority === 'medium' ? 'var(--text-inverse)' : '#ffffff',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {visibleWidth * dayWidth > 60 ? task.title : ''}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
