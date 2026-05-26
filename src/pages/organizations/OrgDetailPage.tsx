import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, FolderKanban, Users, Mail, Crown,
  Shield, UserMinus, MoreVertical, UserPlus, Clock, CheckCircle2,
  XCircle, Ban, Loader2, Pencil, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { OrgFormDialog } from './OrgFormDialog'
import {
  useOrganization,
  useUpdateOrganization,
  useOrgMembers,
  useOrgInvitations,
  useSendOrgInvitation,
  useRevokeOrgInvitation,
  useUpdateOrgMemberRole,
  useRemoveOrgMember,
} from '@/hooks/useOrganizations'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/store/auth.store'
import { formatDistanceToNow, format } from 'date-fns'
import type { OrgRole, Invitation } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type Tab = 'members' | 'invitations' | 'projects'

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'member'] as const),
})
type InviteForm = z.infer<typeof inviteSchema>

const roleIcons: Record<OrgRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: Users,
}

const inviteStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'var(--accent-warning)', icon: Clock, label: 'PENDING' },
  accepted: { color: 'var(--accent-electric)', icon: CheckCircle2, label: 'ACCEPTED' },
  declined: { color: 'var(--text-tertiary)', icon: XCircle, label: 'DECLINED' },
  revoked: { color: 'var(--accent-neon)', icon: Ban, label: 'REVOKED' },
  expired: { color: 'var(--text-tertiary)', icon: Clock, label: 'EXPIRED' },
}

export function OrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const orgId = id ?? ''

  const { data: org, isLoading: orgLoading } = useOrganization(orgId)
  const { data: members, isLoading: membersLoading } = useOrgMembers(orgId)
  const { data: invitations, isLoading: invitationsLoading } = useOrgInvitations(orgId)
  const { data: projects, isLoading: projectsLoading } = useProjects(orgId)

  const { mutate: updateOrg, isPending: updatingOrg } = useUpdateOrganization(orgId)
  const { mutate: sendInvite, isPending: sendingInvite } = useSendOrgInvitation(orgId)
  const { mutate: revokeInvite, isPending: revoking } = useRevokeOrgInvitation(orgId)
  const { mutate: updateRole } = useUpdateOrgMemberRole(orgId)
  const { mutate: removeMember, isPending: removingMember } = useRemoveOrgMember(orgId)

  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [editOpen, setEditOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  })

  const myRole = members?.find((m) => m.user_id === user?.id)?.role
  const isOwner = myRole === 'owner'
  const isAdminOrOwner = myRole === 'owner' || myRole === 'admin'

  const handleInviteSubmit = (data: InviteForm) => {
    sendInvite(data, { onSuccess: () => { setInviteOpen(false); reset() } })
  }

  const handleEditSubmit = (data: any) => {
    updateOrg(data, { onSuccess: () => setEditOpen(false) })
  }

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-40 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-96 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-16 w-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-lg font-bold mb-6" style={{ color: 'var(--text-secondary)' }}>Organization not found</p>
        <Button onClick={() => navigate('/organizations')} style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}>
          Back to Organizations
        </Button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'members', label: 'Members', icon: Users, count: members?.length },
    { id: 'invitations', label: 'Invitations', icon: Mail, count: invitations?.filter(i => i.status === 'pending').length },
    { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects?.length },
  ]

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <button
        onClick={() => navigate('/organizations')}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[var(--accent-electric)]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Organizations
      </button>

      {/* Hero Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center border-2"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-electric)' }}
            >
              <Building2 className="h-8 w-8" style={{ color: 'var(--accent-electric)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-electric)', fontFamily: 'var(--font-display)' }}>
                Organization
              </p>
              <h1 className="text-4xl font-black break-words" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                {org.name}
              </h1>
              {org.description && (
                <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                  {org.description}
                </p>
              )}
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Created {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {isAdminOrOwner && (
              <Button
                onClick={() => setInviteOpen(true)}
                className="h-10 px-4"
                style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
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
            { label: 'Members', value: members?.length ?? org.members.length },
            { label: 'Projects', value: projects?.length ?? 0 },
            { label: 'Pending Invites', value: invitations?.filter(i => i.status === 'pending').length ?? 0 },
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
                color: isActive ? 'var(--accent-electric)' : 'var(--text-secondary)',
                borderBottom: isActive ? '3px solid var(--accent-electric)' : '3px solid transparent',
                marginBottom: '-2px',
              }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-[10px] font-black"
                  style={{
                    background: isActive ? 'var(--accent-electric)' : 'var(--bg-tertiary)',
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
        {/* ── Members Tab ── */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {membersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
              ))
            ) : !members || members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Users className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No members yet</p>
              </div>
            ) : (
              members.map((member) => {
                const RoleIcon = roleIcons[member.role]
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
                          borderColor: member.role === 'owner' ? 'var(--accent-warning)' : member.role === 'admin' ? 'var(--accent-cyber)' : 'var(--border-medium)',
                          color: member.role === 'owner' ? 'var(--accent-warning)' : member.role === 'admin' ? 'var(--accent-cyber)' : 'var(--text-secondary)',
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
                      <div className="flex items-center gap-1.5 px-3 py-1 border"
                        style={{
                          borderColor: member.role === 'owner' ? 'var(--accent-warning)' : member.role === 'admin' ? 'var(--accent-cyber)' : 'var(--border-medium)',
                          color: member.role === 'owner' ? 'var(--accent-warning)' : member.role === 'admin' ? 'var(--accent-cyber)' : 'var(--text-secondary)',
                        }}
                      >
                        <RoleIcon className="h-3 w-3" />
                        <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                          {member.role}
                        </span>
                      </div>
                      {isOwner && !isMe && member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateRole({ userId: member.user_id, role: member.role === 'admin' ? 'member' : 'admin' })}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make {member.role === 'admin' ? 'Member' : 'Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRemoveConfirm(member.user_id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {isMe && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveConfirm(member.user_id)}
                          className="h-8 text-xs opacity-0 group-hover:opacity-100"
                          style={{ color: 'var(--accent-neon)' }}
                        >
                          Leave
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
            {!isAdminOrOwner ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Shield className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Only admins and owners can view invitations</p>
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
                  style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
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
                        <div className="flex items-center gap-2 mt-0.5">
                          {inv.role && (
                            <span className="text-xs uppercase" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                              {inv.role}
                            </span>
                          )}
                          {inv.expires_at && inv.status === 'pending' && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                              · expires {formatDistanceToNow(new Date(inv.expires_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 border" style={{ borderColor: cfg.color }}>
                        <StatusIcon className="h-3 w-3" style={{ color: cfg.color }} />
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: cfg.color, fontFamily: 'var(--font-display)' }}>
                          {cfg.label}
                        </span>
                      </div>
                      {inv.status === 'pending' && isAdminOrOwner && (
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

        {/* ── Projects Tab ── */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg" style={{ background: 'var(--bg-secondary)' }} />
              ))
            ) : !projects || projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <FolderKanban className="h-10 w-10 mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No projects yet</p>
                <Button
                  onClick={() => navigate('/projects')}
                  style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border transition-all hover:border-current text-left group"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center border-2"
                      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-cyber)' }}
                    >
                      <FolderKanban className="h-4 w-4" style={{ color: 'var(--accent-cyber)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {project.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {project.members.length} members · {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge type="projectStatus" value={project.status} />
                </button>
              ))
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
              Invite Member
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleInviteSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select defaultValue="member" onValueChange={(v) => setValue('role', v as 'admin' | 'member')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} disabled={sendingInvite}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendingInvite} style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}>
                {sendingInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Org Dialog */}
      <OrgFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
        loading={updatingOrg}
        defaultValues={org}
        mode="edit"
      />

      {/* Remove Member Confirm */}
      <ConfirmDialog
        open={!!removeConfirm}
        onOpenChange={(v) => { if (!v) setRemoveConfirm(null) }}
        title="Remove member?"
        description="This will remove the member from the organization."
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
