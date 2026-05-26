import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit2, Building2, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">User not authenticated</p>
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile_picture} />
                <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </h4>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {user.email_verified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">Not verified</span>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Name</h4>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">User ID</h4>
            <p className="text-xs font-mono text-muted-foreground break-all">{user.id}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Member Since</h4>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Organizations */}
      {user.organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organizations ({user.organizations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.organizations.map((orgId) => (
                <div
                  key={orgId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="text-sm font-medium">{orgId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Navigate to organization
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
