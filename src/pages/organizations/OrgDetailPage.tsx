import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Users, FolderKanban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useProjects } from '@/hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

export function OrgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: orgs, isLoading: orgsLoading } = useOrganizations()
  const { data: projects, isLoading: projectsLoading } = useProjects(id)

  const org = orgs?.find((o) => o.id === id)

  if (orgsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Organization not found</p>
        <Button onClick={() => navigate('/organizations')}>Back to Organizations</Button>
      </div>
    )
  }

  const orgProjects = projects?.filter((p) => p.organization_id === id) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/organizations')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Button variant="outline" size="sm">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>{org.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {org.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground text-sm">{org.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Created</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Members</h3>
              <p className="text-sm text-muted-foreground">{org.members.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({org.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {org.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            <div className="space-y-2">
              {org.members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="text-sm font-medium">{member.user_id}</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Projects ({orgProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : orgProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet</p>
          ) : (
            <div className="space-y-2">
              {orgProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.members.length} members
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    {project.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
