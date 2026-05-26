import { Outlet, Navigate } from 'react-router-dom'
import { Zap, Code2, Sparkles, Layers } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Left panel - Brutalist Editorial */}
      <div
        className="hidden w-1/2 flex-col justify-between border-r-4 border-[var(--border-strong)] p-16 lg:flex"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center border-4 border-[var(--accent-electric)] rotate-6"
            style={{ background: 'var(--accent-electric)' }}
          >
            <Zap className="h-8 w-8 -rotate-6" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div>
            <h1
              className="text-3xl leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              TASKFLOW
            </h1>
            <div
              className="text-xs tracking-widest mt-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-electric)' }}
            >
              V2.0_SYSTEM
            </div>
          </div>
        </div>

        {/* Quote - Editorial */}
        <div className="space-y-8">
          <div
            className="border-l-4 border-[var(--accent-electric)] pl-8"
          >
            <p
              className="text-3xl italic leading-tight"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              "Organize chaos. Amplify output. Ship results."
            </p>
            <footer
              className="mt-6 text-sm uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              — Built for modern teams
            </footer>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-electric)]"
            >
              <Code2 className="h-6 w-6 mb-3" style={{ color: 'var(--accent-electric)' }} />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                API First
              </p>
              <p
                className="mt-1 text-xs"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
              >
                Built for scale
              </p>
            </div>
            <div
              className="border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-cyber)]"
            >
              <Sparkles className="h-6 w-6 mb-3" style={{ color: 'var(--accent-cyber)' }} />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Real-time
              </p>
              <p
                className="mt-1 text-xs"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
              >
                Instant updates
              </p>
            </div>
            <div
              className="border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-warning)]"
            >
              <Layers className="h-6 w-6 mb-3" style={{ color: 'var(--accent-warning)' }} />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Organized
              </p>
              <p
                className="mt-1 text-xs"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
              >
                Multi-level hierarchy
              </p>
            </div>
            <div
              className="border-2 border-[var(--border-medium)] p-4 transition-all hover:border-[var(--accent-neon)]"
            >
              <div
                className="h-6 w-6 mb-3 border-2 border-[var(--accent-neon)]"
              />
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Secure
              </p>
              <p
                className="mt-1 text-xs"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-tertiary)' }}
              >
                Enterprise grade
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p
              className="text-4xl font-black leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}
            >
              ∞
            </p>
            <p
              className="mt-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              Tasks
            </p>
          </div>
          <div>
            <p
              className="text-4xl font-black leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyber)' }}
            >
              100%
            </p>
            <p
              className="mt-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              Uptime
            </p>
          </div>
          <div>
            <p
              className="text-4xl font-black leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-warning)' }}
            >
              &lt;50ms
            </p>
            <p
              className="mt-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
            >
              Response
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Form Area */}
      <div
        className="flex flex-1 items-center justify-center p-8"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-12 w-12 items-center justify-center border-3 border-[var(--accent-electric)]"
              style={{ background: 'var(--accent-electric)' }}
            >
              <Zap className="h-6 w-6" style={{ color: 'var(--text-inverse)' }} />
            </div>
            <span
              className="text-2xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              TASKFLOW
            </span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
