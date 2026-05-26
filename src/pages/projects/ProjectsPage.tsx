import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, FolderKanban, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { ProjectFormDialog } from './ProjectFormDialog'
import type { Project } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orgId = params.get('org') ?? undefined
  const { data: projects, isLoading } = useProjects(orgId)
  const { mutate: create, isPending: creating } = useCreateProject()
  const { mutate: update, isPending: updating } = useUpdateProject('')
  const { mutate: deleteProj, isPending: deleting } = useDeleteProject()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)

  const handleCreate = (data: any) => {
    create(data, { onSuccess: () => setCreateOpen(false) })
  }

  const handleEdit = (data: any) => {
    if (!selected) return
    update({ id: selected.id, data }, { onSuccess: () => setEditOpen(false) })
  }

  const handleDelete = () => {
    if (!selected) return
    deleteProj(selected.id, { onSuccess: () => setDeleteOpen(false) })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your projects and track progress"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to organize your tasks."
          action={{ label: 'Create Project', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <Card key={proj.id} className="group relative hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{proj.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {proj.members.length} {proj.members.length === 1 ? 'member' : 'members'}
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
                      <DropdownMenuItem onClick={() => navigate(`/tasks?project=${proj.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelected(proj); setEditOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelected(proj); setDeleteOpen(true) }}
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
                  {proj.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <StatusBadge type="projectStatus" value={proj.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(proj.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={creating}
        mode="create"
      />

      <ProjectFormDialog
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
          title="Delete project?"
          description={`This will permanently delete "${selected.name}" and all tasks.`}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}
