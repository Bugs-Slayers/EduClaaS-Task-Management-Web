import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Users, Plus, CheckSquare, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useAuthStore } from '@/store/auth.store'
import { projectsApi } from '@/api/projects'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: tasks, isLoading: tasksLoading } = useTasks(id)
  
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [inviting, setInviting] = useState(false)

  const project = projects?.find((p) => p.id === id)
  const projectTasks = tasks ?? []

  const handleInviteMember = async () => {
    if (!selectedUserId || !id) return

    try {
      setInviting(true)
      await projectsApi.addMember(id, selectedUserId)
      toast.success('Member invited!')
      setInviteOpen(false)
      setSelectedUserId('')
    } catch (error: any) {
      toast.error(error.response?.data?.error ?? 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  if (projectsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {project.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground text-sm">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Status</h3>
              <p className="text-sm text-muted-foreground capitalize">{project.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Created</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Members</h3>
              <p className="text-sm text-muted-foreground">{project.members.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({project.members.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setInviteOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </CardHeader>
        <CardContent>
          {project.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            <div className="space-y-2">
              {project.members.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="text-sm font-medium">{memberId}</span>
                  {memberId !== user?.id && (
                    <button className="text-xs text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks ({projectTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : projectTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/tasks`)}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize ml-2">
                    {task.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Add a member to this project by selecting their user ID
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Choose a user to invite..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="507f1f77bcf86cd799439014">User 1 (507f1f77bcf86cd799439014)</SelectItem>
                  <SelectItem value="507f1f77bcf86cd799439015">User 2 (507f1f77bcf86cd799439015)</SelectItem>
                  <SelectItem value="507f1f77bcf86cd799439016">User 3 (507f1f77bcf86cd799439016)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Enter user ID manually if not in list
              </p>
              <Input
                placeholder="Or paste user ID here..."
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteMember}
              disabled={!selectedUserId || inviting}
            >
              {inviting ? 'Inviting...' : 'Invite Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
