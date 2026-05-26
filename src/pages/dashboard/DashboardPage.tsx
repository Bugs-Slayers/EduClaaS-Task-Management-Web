import { useNavigate } from 'react-router-dom'
import { Building2, FolderKanban, CheckSquare, Clock, ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/auth.store'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { formatDistanceToNow } from 'date-fns'

function StatCard({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: number | string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: orgs, isLoading: orgsLoading } = useOrganizations()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: tasks, isLoading: tasksLoading } = useTasks()

  const doneTasks = tasks?.filter((t) => t.status === 'done').length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status !== 'done').length ?? 0
  const recentTasks = tasks?.slice(0, 5) ?? []
  const recentProjects = projects?.slice(0, 6) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s an overview of your work</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {orgsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={Building2}
              label="Organizations"
              value={orgs?.length ?? 0}
            />
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={projects?.length ?? 0}
            />
            <StatCard
              icon={CheckSquare}
              label="Completed"
              value={doneTasks}
            />
            <StatCard
              icon={Clock}
              label="In Progress"
              value={pendingTasks}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex items-center justify-between flex-row pb-3">
            <CardTitle className="text-base">Recent Tasks</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-xs"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="ml-2 flex gap-1">
                      <StatusBadge type="priority" value={task.priority} />
                      <StatusBadge type="taskStatus" value={task.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex items-center justify-between flex-row pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-xs"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex flex-col p-3 border rounded-lg hover:bg-muted transition-colors text-left text-sm"
                  >
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.members.length} members
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/organizations')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              New Org
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/tasks')}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
