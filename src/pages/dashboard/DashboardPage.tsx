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
    <div 
      className="p-6 rounded-xl border transition-all hover:scale-105"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-medium)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </p>
          <p className="mt-4 text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
        </div>
        <div 
          className="p-3 rounded-lg ml-3"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <Icon className="h-6 w-6" style={{ color: 'var(--accent-electric)' }} />
        </div>
      </div>
    </div>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '2px solid var(--border-medium)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-electric)' }}>
          Welcome Back
        </p>
        <h1 className="text-5xl font-black" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
          Overview of your organizations, projects, and tasks
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {orgsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
          ))
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
              label="Completed Tasks"
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
        <div 
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-medium)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Tasks</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-xs h-8"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded" style={{ background: 'var(--bg-tertiary)' }} />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => navigate('/tasks')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="ml-3 flex gap-2 shrink-0">
                    <StatusBadge type="priority" value={task.priority} />
                    <StatusBadge type="taskStatus" value={task.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-medium)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Projects</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-xs h-8"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
          {projectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded" style={{ background: 'var(--bg-tertiary)' }} />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No projects yet</p>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate('/projects')}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left text-sm"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{project.name}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="p-6 rounded-xl border"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-medium)',
        }}
      >
        <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => navigate('/organizations')}
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: `1px solid var(--border-medium)` }}
            className="hover:border-current"
          >
            <Building2 className="mr-2 h-4 w-4" />
            New Organization
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/projects')}
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: `1px solid var(--border-medium)` }}
            className="hover:border-current"
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/tasks')}
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: `1px solid var(--border-medium)` }}
            className="hover:border-current"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
    </div>
  )
}
