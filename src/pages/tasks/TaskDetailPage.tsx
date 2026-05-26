import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckSquare, Clock, AlertCircle, CheckCircle2,
  Tag, Users, UserPlus, UserMinus, Pencil, Loader2, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TaskFormDialog } from './TaskFormDialog'
import { useTask, useUpdateTask, useAssignTask, useUnassignTask } from '@/hooks/useTasks'
import { useProjectMembers } from '@/hooks/useProjects'
import { useAuthStore } from '@/store/auth.store'
import { formatDistanceToNow, format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const taskId = id ?? ''

  const { data: task, isLoading } = useTask(taskId)
  const { data: projectMembers } = useProjectMembers(task?.project_id ?? '')
  const { mutate: updateTask, isPending: updating } = useUpdateTask(taskId)
  const { mutate: assignUsers, isPending: assigning } = useAssignTask(taskId)
  const { mutate: unassignUser, isPending: unassigning } = useUnassignTask(taskId)

  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignConfirm, setUnassignConfirm] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')

  const handleEditSubmit = (data: any) => {
    updateTask(data, { onSuccess: () => setEditOpen(false) })
  }

  const handleAssign = () => {
    if (!selectedUserId) return
    assignUsers([selectedUserId], {
      onSuccess: () => {
        setAssignOpen(false)
        setSelectedUserId('')
      },
    })
  }

  const assignableMembers = projectMembers?.filter(
    (m) => !task?.assigned_to.includes(m.user_id)
  ) ?? []

  const assignedMemberDetails = projectMembers?.filter(
    (m) => task?.assigned_to.includes(m.user_id)
  ) ?? []

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="h-8 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-48 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-32 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckSquare className="h-16 w-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-lg font-bold mb-6" style={{ color: 'var(--text-secondary)' }}>Task not found</p>
        <Button onClick={() => navigate('/tasks')} style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}>
          Back to Tasks
        </Button>
      </div>
    )
  }

  const priorityAccent: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#84cc16',
  }
  const accentColor = priorityAccent[task.priority] ?? 'var(--accent-electric)'

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back nav */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[var(--accent-electric)]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Tasks
      </button>

      {/* Hero Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center border-2"
              style={{ background: 'var(--bg-tertiary)', borderColor: accentColor }}
            >
              <CheckSquare className="h-8 w-8" style={{ color: accentColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentColor, fontFamily: 'var(--font-display)' }}>
                Task
              </p>
              <h1 className="text-4xl font-black break-words" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                {task.title}
              </h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusBadge type="taskStatus" value={task.status} />
                <StatusBadge type="priority" value={task.priority} />
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-10 px-4 border-2 shrink-0"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div
          className="p-6 rounded-xl border-l-4"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)', borderLeftColor: accentColor }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
            Description
          </p>
          <p className="text-base whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {task.description}
          </p>
        </div>
      )}

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Created */}
        <div
          className="p-4 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
              Created
            </p>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {format(new Date(task.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" style={{ color: 'var(--accent-warning)' }} />
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
                Due Date
              </p>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--accent-warning)', fontFamily: 'var(--font-mono)' }}>
              {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
            </p>
          </div>
        )}

        {/* Completed */}
        {task.completed_at && (
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-electric)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--accent-electric)' }} />
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
                Completed
              </p>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--accent-electric)' }}>
              {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {format(new Date(task.completed_at), 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div
          className="p-6 rounded-xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
              Tags
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider border"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--accent-cyber)',
                  borderColor: 'var(--accent-cyber)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assigned To */}
      <div
        className="p-6 rounded-xl border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>
              Assigned To
            </p>
            <span
              className="px-1.5 py-0.5 text-[10px] font-black"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
            >
              {task.assigned_to.length}
            </span>
          </div>
          {assignableMembers.length > 0 && (
            <Button
              size="sm"
              onClick={() => setAssignOpen(true)}
              className="h-8 px-3 text-xs"
              style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
            >
              <UserPlus className="mr-1.5 h-3 w-3" />
              Assign
            </Button>
          )}
        </div>

        {task.assigned_to.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="h-8 w-8 mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No one assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {task.assigned_to.map((userId) => {
              const memberDetail = assignedMemberDetails.find((m) => m.user_id === userId)
              const isMe = userId === user?.id
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 rounded-lg border group"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-medium)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-xs font-black border-2"
                      style={{
                        background: 'var(--bg-primary)',
                        borderColor: isMe ? 'var(--accent-electric)' : 'var(--border-medium)',
                        color: isMe ? 'var(--accent-electric)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {memberDetail?.name?.slice(0, 2).toUpperCase() ?? userId.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {memberDetail?.name ?? userId}
                        {isMe && <span className="ml-2 text-xs" style={{ color: 'var(--accent-electric)' }}>(you)</span>}
                      </p>
                      {memberDetail?.email && (
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {memberDetail.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUnassignConfirm(userId)}
                    className="h-8 text-xs border opacity-0 group-hover:opacity-100"
                    style={{ borderColor: 'var(--accent-neon)', color: 'var(--accent-neon)' }}
                  >
                    <UserMinus className="mr-1 h-3 w-3" />
                    Unassign
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}

      {/* Edit Task Dialog */}
      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
        loading={updating}
        defaultValues={task}
        mode="edit"
      />

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={(v) => { setAssignOpen(v); if (!v) setSelectedUserId('') }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Assign Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select member *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project member..." />
                </SelectTrigger>
                <SelectContent>
                  {assignableMembers.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.name} — {m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedUserId || assigning}
              style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
            >
              {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirm */}
      <ConfirmDialog
        open={!!unassignConfirm}
        onOpenChange={(v) => { if (!v) setUnassignConfirm(null) }}
        title="Unassign user?"
        description="This will remove the user from this task."
        onConfirm={() => {
          if (unassignConfirm) unassignUser(unassignConfirm, { onSuccess: () => setUnassignConfirm(null) })
        }}
        loading={unassigning}
      />
    </div>
  )
}
