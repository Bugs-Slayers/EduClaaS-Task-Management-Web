import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CheckSquare, MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { TaskFormDialog } from './TaskFormDialog'
import type { Task, TaskStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export function TasksPage() {
  const [params] = useSearchParams()
  const projectId = params.get('project') ?? undefined
  const { data: tasks, isLoading } = useTasks(projectId)
  const { mutate: create, isPending: creating } = useCreateTask()
  const { mutate: update, isPending: updating } = useUpdateTask('')
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const filteredTasks = tasks?.filter((t) => statusFilter === 'all' || t.status === statusFilter) ?? []

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

  const handleQuickStatusChange = (task: Task, newStatus: TaskStatus) => {
    update({ id: task.id, data: { status: newStatus } })
  }

  const statusOptions: Array<{ value: TaskStatus | 'all'; label: string; color: string }> = [
    { value: 'all', label: 'ALL TASKS', color: 'var(--text-primary)' },
    { value: 'todo', label: 'TODO', color: 'var(--text-secondary)' },
    { value: 'in_progress', label: 'IN PROGRESS', color: 'var(--accent-cyber)' },
    { value: 'in_review', label: 'REVIEW', color: 'var(--accent-warning)' },
    { value: 'done', label: 'DONE', color: 'var(--accent-electric)' },
    { value: 'blocked', label: 'BLOCKED', color: 'var(--accent-neon)' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-4xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            TASKS
          </h1>
          <p
            className="text-lg italic"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
          >
            Manage and track your work items
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="group flex items-center gap-3 border-3 border-[var(--accent-electric)] px-6 py-3 font-bold uppercase tracking-wide transition-all hover:translate-x-1 hover:translate-y-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--accent-electric)',
            background: 'var(--bg-primary)'
          }}
        >
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className="border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:translate-x-0.5"
            style={{
              fontFamily: 'var(--font-display)',
              borderColor: statusFilter === option.value ? option.color : 'var(--border-medium)',
              color: statusFilter === option.value ? option.color : 'var(--text-tertiary)',
              background: statusFilter === option.value ? 'var(--bg-secondary)' : 'transparent'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          className="border-3 border-[var(--border-strong)] p-16 text-center"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <CheckSquare className="mx-auto h-16 w-16 mb-6" style={{ color: 'var(--text-tertiary)' }} />
          <h3
            className="text-2xl mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            NO TASKS FOUND
          </h3>
          <p
            className="text-base mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
          >
            {statusFilter === 'all'
              ? 'Create your first task to get started.'
              : `No tasks with status "${statusFilter}".`}
          </p>
          {statusFilter === 'all' && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-[var(--accent-electric)] px-6 py-3 font-bold uppercase tracking-wide transition-all hover:translate-x-1"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--accent-electric)',
                background: 'var(--bg-primary)'
              }}
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`group border-3 border-[var(--border-strong)] p-6 transition-all hover:border-[var(--accent-electric)] hover:translate-x-1 animate-slide-up stagger-${Math.min(idx + 1, 5)}`}
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-lg mb-2 truncate"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
                    >
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="text-xs uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
                    >
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </span>
                    {task.tags.length > 0 && (
                      <>
                        <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                        <div className="flex gap-2">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="border border-[var(--border-medium)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge type="priority" value={task.priority} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="transition-transform hover:scale-105">
                        <StatusBadge type="taskStatus" value={task.status} className="cursor-pointer" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-2 border-[var(--border-strong)] p-2"
                      style={{ background: 'var(--bg-elevated)' }}
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={() => handleQuickStatusChange(task, 'todo')}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        TODO
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleQuickStatusChange(task, 'in_progress')}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        IN PROGRESS
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleQuickStatusChange(task, 'in_review')}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        REVIEW
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleQuickStatusChange(task, 'done')}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        DONE
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleQuickStatusChange(task, 'blocked')}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        BLOCKED
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="border-2 border-[var(--border-medium)] p-2 opacity-0 transition-all group-hover:opacity-100 hover:border-[var(--accent-electric)]"
                        style={{ background: 'var(--bg-primary)' }}
                      >
                        <MoreVertical className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-2 border-[var(--border-strong)] p-2"
                      style={{ background: 'var(--bg-elevated)' }}
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={() => { setSelected(task); setEditOpen(true) }}
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelected(task); setDeleteOpen(true) }}
                        variant="destructive"
                        className="font-bold uppercase tracking-wide text-xs"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
