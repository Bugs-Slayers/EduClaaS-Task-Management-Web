import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, FolderKanban,
  CheckSquare, LogOut, Zap, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizations', icon: Building2, label: 'Organizations' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const logout = useLogout()

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <aside
      className="flex h-screen w-72 flex-col border-r-4 border-[var(--border-strong)]"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Logo - Brutalist */}
      <div className="relative border-b-4 border-[var(--border-strong)] p-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center border-3 border-[var(--accent-electric)] rotate-3 transition-transform hover:rotate-6"
            style={{ background: 'var(--accent-electric)' }}
          >
            <Zap className="h-6 w-6" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div>
            <h1
              className="text-2xl leading-none tracking-tighter"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              TASK
            </h1>
            <div
              className="text-xs tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-electric)' }}
            >
              FLOW_V2
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div
          className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2"
          style={{ background: 'var(--accent-neon)' }}
        />
      </div>

      {/* Nav - Asymmetric */}
      <nav className="flex-1 space-y-2 p-6">
        {navItems.map(({ to, icon: Icon, label }, idx) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-4 border-2 px-5 py-4 font-bold uppercase tracking-wide text-sm transition-all duration-300',
                isActive
                  ? 'border-[var(--accent-electric)] translate-x-2'
                  : 'border-[var(--border-medium)] hover:border-[var(--accent-cyber)] hover:translate-x-1',
              )
            }
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
                  style={{ color: isActive ? 'var(--accent-electric)' : 'var(--text-secondary)' }}
                />
                <span style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {label}
                </span>
                {isActive && (
                  <div
                    className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 animate-pulse"
                    style={{ background: 'var(--accent-electric)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User - Editorial */}
      <div
        className="border-t-4 border-[var(--border-strong)] p-6"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div className="flex items-start gap-4 mb-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex h-14 w-14 shrink-0 items-center justify-center border-2 text-xl font-black transition-all',
                isActive
                  ? 'border-[var(--accent-electric)]'
                  : 'border-[var(--accent-electric)] hover:border-[var(--accent-cyber)]'
              )
            }
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-electric)',
              background: 'var(--bg-primary)'
            }}
          >
            {initials}
          </NavLink>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {user?.name}
            </p>
            <p
              className="truncate text-xs mt-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              {user?.email}
            </p>
            <button
              onClick={logout}
              className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-[var(--accent-neon)]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
            >
              <LogOut className="h-3 w-3" />
              Exit
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
