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
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage your organizations and teams"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !orgs || orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to start collaborating with your team."
          action={{ label: 'Create Organization', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Card key={org.id} className="group relative hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {org.members.length} {org.members.length === 1 ? 'member' : 'members'}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
              </CardHeader>
              <CardContent>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {org.description || 'No description provided'}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projects?org=${org.id}`)}
                    className="h-7 text-xs"
                  >
                    View projects
                  </Button>
                </div>
              </CardContent>
            </Card>
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
