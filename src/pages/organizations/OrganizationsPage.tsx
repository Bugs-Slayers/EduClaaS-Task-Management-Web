import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Users, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from '@/hooks/useOrganizations'
import { OrgFormDialog } from './OrgFormDialog'
import { InviteDialog } from './InviteDialog'
import type { Organization } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export function OrganizationsPage() {
  const navigate = useNavigate()
  const { data: orgs, isLoading } = useOrganizations()
  const { mutate: create, isPending: creating } = useCreateOrganization()
  const { mutate: update, isPending: updating } = useUpdateOrganization('')
  const { mutate: deleteOrg, isPending: deleting } = useDeleteOrganization()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Organization | null>(null)

  const handleCreate = (data: any) => {
    create(data, { onSuccess: () => setCreateOpen(false) })
  }

  const handleEdit = (data: any) => {
    if (!selected) return
    update({ id: selected.id, data }, { onSuccess: () => setEditOpen(false) })
  }

  const handleDelete = () => {
    if (!selected) return
    deleteOrg(selected.id, { onSuccess: () => setDeleteOpen(false) })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-electric)' }}>
          Team Management
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black" style={{ color: 'var(--text-primary)' }}>
              Organizations
            </h1>
            <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Manage your organizations and collaborate with teams
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="px-6 h-11"
            style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Organization
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : !orgs || orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <Building2 className="h-12 w-12 mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No organizations yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first organization to start collaborating with your team.</p>
          <Button
            onClick={() => setCreateOpen(true)}
            style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
          >
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="group p-6 rounded-xl border transition-all hover:border-current cursor-pointer"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-medium)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <Building2 className="h-6 w-6" style={{ color: 'var(--accent-electric)' }} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)', maxWidth: '100%' }}>
                      {org.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {org.members.length} {org.members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/organizations/${org.id}`)}>
                      <Building2 className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelected(org); setInviteOpen(true) }}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite member
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelected(org); setEditOpen(true) }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { setSelected(org); setDeleteOpen(true) }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {org.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-medium)' }}>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Created {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/projects?org=${org.id}`)}
                  className="h-8 text-xs"
                >
                  Projects →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrgFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={creating}
        mode="create"
      />

      <OrgFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        loading={updating}
        defaultValues={selected ?? undefined}
        mode="edit"
      />

      {selected && (
        <>
          <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} orgId={selected.id} />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete organization?"
            description={`This will permanently delete "${selected.name}" and all associated data.`}
            onConfirm={handleDelete}
            loading={deleting}
          />
        </>
      )}
    </div>
  )
}
