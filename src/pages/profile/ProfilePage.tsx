import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Edit2, Building2, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>User not authenticated</p>
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-xl border-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
        <div className="flex items-start justify-between min-w-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 text-xl font-black" style={{ borderColor: 'var(--accent-electric)', color: 'var(--accent-electric)', background: 'var(--bg-primary)', fontFamily: 'var(--font-display)' }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="text-2xl font-black truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{user.name}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 ml-3">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-xl border-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
        <div className="p-6 pb-0">
          <h3 className="text-sm font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Account Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>
              <Mail className="h-3 w-3" />
              Email
            </h4>
            <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {user.email_verified ? (
                <>
                  <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--accent-electric)' }} />
                  <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}>Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" style={{ color: 'var(--accent-warning)' }} />
                  <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-warning)' }}>Not verified</span>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>Name</h4>
            <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{user.name}</p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>User ID</h4>
            <p className="text-xs break-all" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{user.id}</p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}>Member Since</h4>
            <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Organizations */}
      {user.organizations.length > 0 && (
        <div className="rounded-xl border-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
          <div className="p-6 pb-0">
            <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              <Building2 className="h-4 w-4" />
              Organizations ({user.organizations.length})
            </h3>
          </div>
          <div className="p-6 space-y-2">
            {user.organizations.map((orgId) => (
              <div
                key={orgId}
                className="flex items-center justify-between p-3 border-2"
                style={{ borderColor: 'var(--border-medium)', background: 'var(--bg-tertiary)' }}
              >
                <span className="text-sm font-bold uppercase tracking-wide truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{orgId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 ml-2"
                  onClick={() => {}}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border-2" style={{ borderColor: 'var(--accent-neon)', background: 'var(--bg-secondary)' }}>
        <div className="p-6 pb-0">
          <h3 className="text-sm font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-neon)' }}>Danger Zone</h3>
        </div>
        <div className="p-6">
          <Button variant="destructive" size="sm">Delete Account</Button>
        </div>
      </div>
    </div>
  )
}
