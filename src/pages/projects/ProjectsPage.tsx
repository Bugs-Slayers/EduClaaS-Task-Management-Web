import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, FolderKanban, MoreVertical, Pencil, Trash2, Eye, CheckSquare } from 'lucide-react'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-electric)' }}>
          Project Management
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black" style={{ color: 'var(--text-primary)' }}>
              Projects
            </h1>
            <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Organize and track your project work
            </p>
          </div>
          <Button 
            onClick={() => setCreateOpen(true)}
            className="px-6 h-11"
            style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <FolderKanban className="h-12 w-12 mb-4" style={{ color: 'var(--text-tertiary)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No projects yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first project to organize your tasks.</p>
          <Button 
            onClick={() => setCreateOpen(true)}
            style={{ background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
          >
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <div 
              key={proj.id} 
              className="group p-6 rounded-xl border transition-all hover:border-current"
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
                    <FolderKanban className="h-6 w-6" style={{ color: 'var(--accent-cyber)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {proj.name}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {proj.members.length} {proj.members.length === 1 ? 'member' : 'members'}
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
                    <DropdownMenuItem onClick={() => navigate(`/projects/${proj.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/tasks?project_id=${proj.id}`)}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      View Tasks
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

              <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {proj.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-medium)' }}>
                <StatusBadge type="projectStatus" value={proj.status} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDistanceToNow(new Date(proj.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
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
