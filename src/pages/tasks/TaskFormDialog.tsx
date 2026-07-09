import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjects, useProjectMembers } from '@/hooks/useProjects'
import type { Task, TaskStatus, TaskPriority } from '@/types'

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().optional(),
  project_id: z.string().min(1, 'Project required'),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked'] as const).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const).optional(),
  assigned_to: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (data: FormData) => void
  loading?: boolean
  defaultValues?: Partial<Task>
  mode?: 'create' | 'edit'
}

export function TaskFormDialog({ open, onOpenChange, onSubmit, loading, defaultValues, mode = 'create' }: Props) {
  const { data: projects } = useProjects()
  const tagInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedProjectId = useWatch({ control, name: 'project_id' })
  const watchedAssignedTo = useWatch({ control, name: 'assigned_to' }) ?? []
  const watchedTags = useWatch({ control, name: 'tags' }) ?? []

  const projectIdForMembers = mode === 'create' ? watchedProjectId : (defaultValues?.project_id ?? '')
  const { data: projectMembers } = useProjectMembers(projectIdForMembers)

  useEffect(() => {
    if (open) {
      reset({
        title: defaultValues?.title ?? '',
        description: defaultValues?.description ?? '',
        project_id: defaultValues?.project_id ?? '',
        status: defaultValues?.status ?? 'todo',
        priority: defaultValues?.priority ?? 'medium',
        assigned_to: defaultValues?.assigned_to ?? [],
        tags: defaultValues?.tags ?? [],
      })
      if (tagInputRef.current) {
        tagInputRef.current.value = ''
      }
    }
  }, [open, defaultValues, reset])

  const addTag = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed && !watchedTags.includes(trimmed)) {
      setValue('tags', [...watchedTags, trimmed])
    }
    if (tagInputRef.current) {
      tagInputRef.current.value = ''
    }
  }

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter((t: string) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(e.currentTarget.value)
    }
  }

  const addMember = (userId: string) => {
    if (userId && !watchedAssignedTo.includes(userId)) {
      setValue('assigned_to', [...watchedAssignedTo, userId])
    }
  }

  const removeMember = (userId: string) => {
    setValue('assigned_to', watchedAssignedTo.filter((id: string) => id !== userId))
  }

  const availableMembers = (projectMembers ?? []).filter(
    (m) => !watchedAssignedTo.includes(m.user_id),
  )

  const assignedMembers = (projectMembers ?? []).filter(
    (m) => watchedAssignedTo.includes(m.user_id),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" placeholder="Design homepage" {...register('title')} aria-invalid={!!errors.title} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" placeholder="Task details..." rows={3} {...register('description')} />
          </div>
          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label>Project *</Label>
              <Select onValueChange={(v) => setValue('project_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && <p className="text-xs text-destructive">{errors.project_id.message}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue={defaultValues?.status ?? 'todo'} onValueChange={(v) => setValue('status', v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select defaultValue={defaultValues?.priority ?? 'medium'} onValueChange={(v) => setValue('priority', v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Assigned To ── */}
          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            {projectIdForMembers ? (
              <div className="space-y-2">
                {assignedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {assignedMembers.map((m) => (
                      <span
                        key={m.user_id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border rounded-sm"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border-medium)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {m.name}
                        <button
                          type="button"
                          onClick={() => removeMember(m.user_id)}
                          className="hover:opacity-70"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {availableMembers.length > 0 ? (
                  <Select value="" onValueChange={addMember}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Add member${assignedMembers.length > 0 ? '...' : ''}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers.map((m) => (
                        <SelectItem key={m.user_id} value={m.user_id}>
                          {m.name} — {m.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : watchedAssignedTo.length > 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>All members assigned</p>
                ) : null}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {mode === 'create' ? 'Select a project first' : 'Loading members...'}
              </p>
            )}
          </div>

          {/* ── Tags ── */}
          <div className="space-y-1.5">
            <Label htmlFor="task-tags">Tags</Label>
            <div className="space-y-2">
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {watchedTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider border rounded-sm"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--accent-cyber)',
                        borderColor: 'var(--accent-cyber)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70"
                        style={{ color: 'var(--accent-cyber)' }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                id="task-tags"
                ref={tagInputRef}
                placeholder="Type tag and press Enter or comma"
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInputRef.current) addTag(tagInputRef.current.value)
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
