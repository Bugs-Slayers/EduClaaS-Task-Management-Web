import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CheckSquare, MoreVertical, Pencil, Trash2, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage and track your tasks"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        }
      />

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="in_review">In Review</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={statusFilter === 'all' ? 'Create your first task to get started.' : `No tasks with status "${statusFilter}".`}
              action={statusFilter === 'all' ? { label: 'Create Task', onClick: () => setCreateOpen(true) } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          {task.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
                            {task.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex gap-1">
                                  {task.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="rounded bg-muted px-1.5 py-0.5">{tag}</span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge type="priority" value={task.priority} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <StatusBadge type="taskStatus" value={task.status} className="cursor-pointer" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'todo')}>To Do</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'in_progress')}>In Progress</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'in_review')}>In Review</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'done')}>Done</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'blocked')}>Blocked</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelected(task); setEditOpen(true) }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => { setSelected(task); setDeleteOpen(true) }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
