import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOrganizations } from '@/hooks/useOrganizations'
import type { Project, ProjectStatus } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  organization_id: z.string().min(1, 'Organization required'),
  status: z.enum(['active', 'completed', 'archived'] as const).optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (data: FormData) => void
  loading?: boolean
  defaultValues?: Partial<Project>
  mode?: 'create' | 'edit'
}

export function ProjectFormDialog({ open, onOpenChange, onSubmit, loading, defaultValues, mode = 'create' }: Props) {
  const { data: orgs } = useOrganizations()
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name ?? '',
        description: defaultValues?.description ?? '',
        organization_id: defaultValues?.organization_id ?? '',
        status: defaultValues?.status ?? 'active',
      })
    }
  }, [open, defaultValues, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Name *</Label>
            <Input id="proj-name" placeholder="Website Redesign" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description</Label>
            <Textarea id="proj-desc" placeholder="Project details..." rows={3} {...register('description')} />
          </div>
          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label>Organization *</Label>
              <Select onValueChange={(v) => setValue('organization_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select organization" /></SelectTrigger>
                <SelectContent>
                  {orgs?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization_id && <p className="text-xs text-destructive">{errors.organization_id.message}</p>}
            </div>
          )}
          {mode === 'edit' && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select defaultValue={defaultValues?.status ?? 'active'} onValueChange={(v) => setValue('status', v as ProjectStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
