import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useTask } from '@/hooks/useTasks'
import { formatDistanceToNow, format } from 'date-fns'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading } = useTask(id ?? '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Task not found</p>
        <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tasks')}
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

      {/* Task Details */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge type="taskStatus" value={task.status} />
              <StatusBadge type="priority" value={task.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(task.created_at), 'PPp')}
              </p>
            </div>

            {task.due_date && (
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Due Date
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.due_date), 'PPp')}
                </p>
              </div>
            )}

            {task.completed_at && (
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {task.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium bg-muted rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned To */}
      {task.assigned_to.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned To</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {task.assigned_to.map((userId) => (
                <div
                  key={userId}
                  className="flex items-center p-3 border rounded-lg"
                >
                  <span className="text-sm font-medium">{userId}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
