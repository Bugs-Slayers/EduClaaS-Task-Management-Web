import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CheckSquare, MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { TaskFormDialog } from './TaskFormDialog'
import type { Task, TaskStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const TASK_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
]

export function TasksPage() {
  const [params] = useSearchParams()
  const projectId = params.get('project_id') ?? params.get('project') ?? undefined
  const { data: tasks, isLoading } = useTasks(projectId)
  const { mutate: create, isPending: creating } = useCreateTask()
  const { mutate: update, isPending: updating } = useUpdateTask('')
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status.id] = tasks?.filter((t) => t.status === status.id) ?? []
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  const handleCreate = (data: any) => {
    create(data, { onSuccess: () => setCreateOpen(false) })
  }

  const handleEdit = (data: any) => {
    if (!selected) return
    update({ id: selected.id, data }, { onSuccess: () => setEditOpen(false) })
  }

  const handleDelete = () => {
    if (!selected) return
    deleteTask(selected.id, { onSuccess: () => setDeleteOpen(false) })
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return
    if (draggedTask.status === status) {
      setDraggedTask(null)
      return
    }
    update({ id: draggedTask.id, data: { status } })
    setDraggedTask(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        description="Drag and drop tasks to organize your work"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 rounded" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-32 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 overflow-x-auto pb-4">
          {TASK_STATUSES.map((status) => (
            <div
              key={status.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status.id)}
              className="flex flex-col gap-3 min-h-96 p-4 rounded-lg border transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-medium)',
                borderStyle: 'dashed'
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{status.label}</h3>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{ 
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-tertiary)'
                  }}
                >
                  {tasksByStatus[status.id].length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 flex-1">
                {tasksByStatus[status.id].length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No tasks</p>
                  </div>
                ) : (
                  tasksByStatus[status.id].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={() => setDraggedTask(null)}
                      className={`group cursor-grab active:cursor-grabbing p-3 rounded border-l-4 transition-all ${
                        draggedTask?.id === task.id ? 'opacity-50' : ''
                      }`}
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-medium)',
                        borderLeftColor:
                          task.priority === 'critical'
                            ? '#ef4444'
                            : task.priority === 'high'
                              ? '#f97316'
                              : task.priority === 'medium'
                                ? '#eab308'
                                : '#84cc16',
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-tertiary)' }} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                            {task.description && (
                              <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => { setSelected(task); setEditOpen(true) }}>
                                <Pencil className="mr-2 h-3 w-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setSelected(task); setDeleteOpen(true) }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Task Meta */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                          </span>
                          <StatusBadge type="priority" value={task.priority} />
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs rounded px-2 py-1" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+{task.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={creating}
        mode="create"
      />

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        loading={updating}
        defaultValues={selected ?? undefined}
        mode="edit"
      />

      {selected && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete task?"
          description={`This will permanently delete "${selected.title}".`}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}
