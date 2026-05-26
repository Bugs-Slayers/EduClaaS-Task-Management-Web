import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FolderKanban, Users, Mail, CheckSquare,
  UserMinus, MoreVertical, UserPlus, Clock, CheckCircle2,
  XCircle, Ban, Loader2, Pencil, GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProjectFormDialog } from './ProjectFormDialog'
import {
  useProject,
  useUpdateProject,
  useProjectMembers,
  useProjectInvitations,
  useSendProjectInvitation,
  useRevokeProjectInvitation,
  useRemoveProjectMember,
} from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useAuthStore } from '@/store/auth.store'
import { formatDistanceToNow } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type Tab = 'tasks' | 'members' | 'invitations'

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
})
type InviteForm = z.infer<typeof inviteSchema>

const inviteStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'var(--accent-warning)', icon: Clock, label: 'PENDING' },
  accepted: { color: 'var(--accent-electric)', icon: CheckCircle2, label: 'ACCEPTED' },
  declined: { color: 'var(--text-tertiary)', icon: XCircle, label: 'DECLINED' },
  revoked: { color: 'var(--accent-neon)', icon: Ban, label: 'REVOKED' },
  expired: { color: 'var(--text-tertiary)', icon: Clock, label: 'EXPIRED' },
}

const priorityBorderColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#84cc16',
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const projectId = id ?? ''

  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId)
  const { data: invitations, isLoading: invitationsLoading } = useProjectInvitations(projectId)
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId)

  const { mutate: updateProject, isPending: updatingProject } = useUpdateProject(projectId)
  const { mutate: sendInvite, isPending: sendingInvite } = useSendProjectInvitation(projectId)
  const { mutate: revokeInvite, isPending: revoking } = useRevokeProjectInvitation(projectId)
  const { mutate: removeMember, isPending: removingMember } = useRemoveProjectMember(projectId)

  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [editOpen, setEditOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  })

  const myMember = members?.find((m) => m.user_id === user?.id)
  const isOwner = myMember?.is_owner ?? false

  const handleInviteSubmit = (data: InviteForm) => {
    sendInvite(data, { onSuccess: () => { setInviteOpen(false); reset() } })
  }

  const handleEditSubmit = (data: any) => {
    updateProject(data, { onSuccess: () => setEditOpen(false) })
  }

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-40 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-96 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FolderKanban className="h-16 w-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-lg font-bold mb-6" style={{ color: 'var(--text-secondary)' }}>Project not found</p>
        <Button onClick={() => navigate('/projects')} style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}>
          Back to Projects
        </Button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks?.length },
    { id: 'members', label: 'Members', icon: Users, count: members?.length },
    { id: 'invitations', label: 'Invitations', icon: Mail, count: invitations?.filter(i => i.status === 'pending').length },
  ]

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[var(--accent-electric)]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Projects
      </button>

      {/* Hero Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center border-2"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-cyber)' }}
            >
              <FolderKanban className="h-8 w-8" style={{ color: 'var(--accent-cyber)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-cyber)', fontFamily: 'var(--font-display)' }}>
                Project
              </p>
              <h1 className="text-4xl font-black break-words" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              )}
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {isOwner && (
              <Button
                onClick={() => setInviteOpen(true)}
                className="h-10 px-4"
                style={{ background: 'var(--accent-cyber)', color: 'var(--text-inverse)' }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="h-10 px-4 border-2"
              style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-6">
          {[
            { label: 'Tasks', value: tasks?.length ?? 0 },
            { label: 'Members', value: members?.length ?? project.members.length },
            { label: 'Status', value: project.status.toUpperCase() },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b-2" style={{ borderColor: 'var(--border-medium)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                color: isActive ? 'var(--accent-cyber)' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid var(--accent-cyber)' : '3px solid transparent',
                marginBottom: '-2px',
              }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-[10px] font-black"
                  style={{
                    background: isActive ? 'var(--accent-cyber)' : 'var(--bg-tertiary)',
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {/* ── Tasks Tab ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasksLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
              ))
            ) : !tasks || tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <CheckSquare className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
                <Button
                  onClick={() => navigate(`/tasks?project_id=${projectId}`)}
                  style={{ background: 'var(--accent-cyber)', color: 'var(--text-inverse)' }}
                >
                  View Kanban Board
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/tasks?project_id=${projectId}`)}
                    className="text-xs h-8"
                    style={{ color: 'var(--accent-cyber)' }}
                  >
                    Open Kanban Board →
                  </Button>
                </div>
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border-l-4 transition-all hover:opacity-80 text-left"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-medium)',
                      borderLeftColor: priorityBorderColor[task.priority] ?? 'var(--border-medium)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <GripVertical className="h-4 w-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <StatusBadge type="priority" value={task.priority} />
                      <StatusBadge type="taskStatus" value={task.status} />
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Members Tab ── */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {membersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
              ))
            ) : !members || members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Users className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No members yet</p>
              </div>
            ) : (
              members.map((member) => {
                const isMe = member.user_id === user?.id
                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 rounded-lg border transition-all hover:border-current group"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-black border-2"
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderColor: member.is_owner ? 'var(--accent-warning)' : 'var(--border-medium)',
                          color: member.is_owner ? 'var(--accent-warning)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {member.name?.slice(0, 2).toUpperCase() ?? '??'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            {member.name}
                            {isMe && <span className="ml-2 text-xs" style={{ color: 'var(--accent-electric)' }}>(you)</span>}
                          </p>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.is_owner && (
                        <div className="flex items-center gap-1.5 px-3 py-1 border" style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}>
                          <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                            Owner
                          </span>
                        </div>
                      )}
                      {!member.is_owner && (isOwner || isMe) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveConfirm(member.user_id)}
                          className="h-8 text-xs border opacity-0 group-hover:opacity-100"
                          style={{ borderColor: 'var(--accent-neon)', color: 'var(--accent-neon)' }}
                        >
                          <UserMinus className="mr-1 h-3 w-3" />
                          {isMe ? 'Leave' : 'Remove'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Invitations Tab ── */}
        {activeTab === 'invitations' && (
          <div className="space-y-3">
            {!isOwner ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Mail className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Only the project owner can view invitations</p>
              </div>
            ) : invitationsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
              ))
            ) : !invitations || invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Mail className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No invitations sent yet</p>
                <Button
                  onClick={() => setInviteOpen(true)}
                  style={{ background: 'var(--accent-cyber)', color: 'var(--text-inverse)' }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            ) : (
              invitations.map((inv) => {
                const cfg = inviteStatusConfig[inv.status] ?? inviteStatusConfig.pending
                const StatusIcon = cfg.icon
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center border-2"
                        style={{ background: 'var(--bg-tertiary)', borderColor: cfg.color }}
                      >
                        <Mail className="h-4 w-4" style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                          {inv.email}
                        </p>
                        {inv.expires_at && inv.status === 'pending' && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            expires {formatDistanceToNow(new Date(inv.expires_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 border" style={{ borderColor: cfg.color }}>
                        <StatusIcon className="h-3 w-3" style={{ color: cfg.color }} />
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: cfg.color, fontFamily: 'var(--font-display)' }}>
                          {cfg.label}
                        </span>
                      </div>
                      {inv.status === 'pending' && isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeConfirm(inv.id)}
                          disabled={revoking}
                          className="h-8 text-xs border"
                          style={{ borderColor: 'var(--accent-neon)', color: 'var(--accent-neon)' }}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={(v) => { setInviteOpen(v); if (!v) reset() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Invite to Project
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleInviteSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-invite-email">Email address *</Label>
              <Input
                id="proj-invite-email"
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={sendingInvite}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendingInvite} style={{ background: 'var(--accent-cyber)', color: 'var(--text-inverse)' }}>
                {sendingInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
        loading={updatingProject}
        defaultValues={project}
        mode="edit"
      />

      {/* Remove Member Confirm */}
      <ConfirmDialog
        open={!!removeConfirm}
        onOpenChange={(v) => { if (!v) setRemoveConfirm(null) }}
        title="Remove member?"
        description="This will remove the member from the project."
        onConfirm={() => {
          if (removeConfirm) removeMember(removeConfirm, { onSuccess: () => setRemoveConfirm(null) })
        }}
        loading={removingMember}
      />

      {/* Revoke Invitation Confirm */}
      <ConfirmDialog
        open={!!revokeConfirm}
        onOpenChange={(v) => { if (!v) setRevokeConfirm(null) }}
        title="Revoke invitation?"
        description="The invitee will no longer be able to accept this invitation."
        onConfirm={() => {
          if (revokeConfirm) revokeInvite(revokeConfirm, { onSuccess: () => setRevokeConfirm(null) })
        }}
        loading={revoking}
      />
    </div>
  )
}
