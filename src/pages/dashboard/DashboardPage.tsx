import { useNavigate } from 'react-router-dom'
import { Building2, FolderKanban, CheckSquare, Clock, ArrowRight, Plus, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/auth.store'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { formatDistanceToNow } from 'date-fns'

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType; label: string; value: number | string; color: string; delay: string
}) {
  return (
    <div
      className={`group relative border-3 border-[var(--border-strong)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-electric)] animate-slide-up ${delay}`}
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-4 inline-flex border-2 p-3 transition-transform group-hover:scale-110"
            style={{ borderColor: color, color }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <p
            className="text-4xl font-black leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {value}
          </p>
          <p
            className="mt-2 text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
          >
            {label}
          </p>
        </div>
        <div
          className="h-2 w-2 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: color }}
        />
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
  const recentProjects = projects?.slice(0, 4) ?? []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'GOOD MORNING'
    if (hour < 18) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  }

  return (
    <div className="space-y-12">
      {/* Hero Greeting - Brutalist */}
      <div className="relative animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="mb-2 inline-block border-2 border-[var(--accent-electric)] px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-electric)' }}
            >
              {getGreeting()}
            </div>
            <h1
              className="mb-3 max-w-3xl leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {user?.name?.split(' ')[0]}
            </h1>
            <p
              className="max-w-xl text-lg italic"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
            >
              Your command center for orchestrating work, tracking progress, and shipping results.
            </p>
          </div>
          <div
            className="h-24 w-24 border-4 border-[var(--accent-neon)] animate-pulse"
            style={{ background: 'var(--gradient-neon)' }}
          />
        </div>
        {/* Decorative line */}
        <div
          className="mt-8 h-1"
          style={{ background: 'var(--gradient-electric)' }}
        />
      </div>

      {/* Stats Grid - Asymmetric */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {orgsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)
        ) : (
          <>
            <StatCard
              icon={Building2}
              label="Organizations"
              value={orgs?.length ?? 0}
              color="var(--accent-electric)"
              delay="stagger-1"
            />
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={projects?.length ?? 0}
              color="var(--accent-cyber)"
              delay="stagger-2"
            />
            <StatCard
              icon={CheckSquare}
              label="Completed"
              value={doneTasks}
              color="var(--accent-electric)"
              delay="stagger-3"
            />
            <StatCard
              icon={Clock}
              label="In Progress"
              value={pendingTasks}
              color="var(--accent-warning)"
              delay="stagger-4"
            />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Tasks - Editorial Card */}
        <div
          className="border-3 border-[var(--border-strong)] animate-slide-up stagger-1"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div
            className="flex items-center justify-between border-b-3 border-[var(--border-strong)] p-6"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <h3
              className="text-xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              RECENT TASKS
            </h3>
            <button
              onClick={() => navigate('/tasks')}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {tasksLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : recentTasks.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-tertiary)' }} />
                <p
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
                >
                  No tasks yet.{' '}
                  <button
                    onClick={() => navigate('/tasks')}
                    className="font-bold underline"
                    style={{ color: 'var(--accent-electric)' }}
                  >
                    Create your first one
                  </button>
                </p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate('/tasks')}
                  className="group flex cursor-pointer items-center justify-between border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-electric)] hover:translate-x-1"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-bold uppercase"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                    >
                      {task.title}
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
                    >
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 gap-2">
                    <StatusBadge type="priority" value={task.priority} />
                    <StatusBadge type="taskStatus" value={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div
          className="border-3 border-[var(--border-strong)] animate-slide-up stagger-2"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div
            className="flex items-center justify-between border-b-3 border-[var(--border-strong)] p-6"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <h3
              className="text-xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              RECENT PROJECTS
            </h3>
            <button
              onClick={() => navigate('/projects')}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyber)' }}
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            {projectsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : recentProjects.length === 0 ? (
              <div className="py-12 text-center">
                <FolderKanban className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-tertiary)' }} />
                <p
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
                >
                  No projects yet.{' '}
                  <button
                    onClick={() => navigate('/projects')}
                    className="font-bold underline"
                    style={{ color: 'var(--accent-cyber)' }}
                  >
                    Start a new one
                  </button>
                </p>
              </div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group flex cursor-pointer items-center justify-between border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-cyber)] hover:translate-x-1"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-bold uppercase"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                    >
                      {project.name}
                    </p>
                    <p
                      className="truncate text-xs mt-1"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
                    >
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <StatusBadge type="projectStatus" value={project.status} className="ml-4 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Brutal Buttons */}
      <div
        className="border-3 border-[var(--accent-neon)] p-8 animate-slide-up stagger-3"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <h3
          className="mb-6 text-xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          QUICK ACTIONS
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/organizations')}
            className="group flex items-center gap-3 border-3 border-[var(--accent-electric)] px-6 py-4 font-bold uppercase tracking-wide transition-all hover:translate-x-1 hover:translate-y-1"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-electric)',
              background: 'var(--bg-primary)'
            }}
          >
            <Plus className="h-5 w-5" />
            New Organization
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="group flex items-center gap-3 border-3 border-[var(--accent-cyber)] px-6 py-4 font-bold uppercase tracking-wide transition-all hover:translate-x-1 hover:translate-y-1"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-cyber)',
              background: 'var(--bg-primary)'
            }}
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="group flex items-center gap-3 border-3 border-[var(--accent-warning)] px-6 py-4 font-bold uppercase tracking-wide transition-all hover:translate-x-1 hover:translate-y-1"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-warning)',
              background: 'var(--bg-primary)'
            }}
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>
      </div>
    </div>
  )
}
