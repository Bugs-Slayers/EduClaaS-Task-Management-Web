import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Clock, Ban, AlertTriangle,
  Loader2, Zap, ArrowRight, Building2, FolderKanban,
  Mail, LogIn, UserPlus,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { invitationsApi } from '@/api/invitations'
import { useQueryClient } from '@tanstack/react-query'

type PageState =
  | { status: 'loading' }
  | { status: 'no_token' }
  | { status: 'needs_auth'; token: string }
  | { status: 'accepting'; token: string }
  | { status: 'success'; type: 'organization' | 'project' | string }
  | { status: 'error'; code: ErrorCode; message: string }

type ErrorCode =
  | 'revoked'
  | 'expired'
  | 'already_accepted'
  | 'already_declined'
  | 'wrong_email'
  | 'not_found'
  | 'unknown'

function parseErrorCode(message: string): ErrorCode {
  const m = message.toLowerCase()
  if (m.includes('revoked')) return 'revoked'
  if (m.includes('expired')) return 'expired'
  if (m.includes('accepted')) return 'already_accepted'
  if (m.includes('declined')) return 'already_declined'
  if (m.includes('different email') || m.includes('email address')) return 'wrong_email'
  if (m.includes('not found')) return 'not_found'
  return 'unknown'
}

const errorConfig: Record<ErrorCode, {
  icon: React.ElementType
  accentColor: string
  title: string
  description: string
}> = {
  revoked: {
    icon: Ban,
    accentColor: 'var(--accent-neon)',
    title: 'Invitation Revoked',
    description: 'This invitation was cancelled by the sender. Ask them to send a new one.',
  },
  expired: {
    icon: Clock,
    accentColor: 'var(--accent-warning)',
    title: 'Invitation Expired',
    description: 'This invitation link is more than 7 days old. Ask the sender to resend it.',
  },
  already_accepted: {
    icon: CheckCircle2,
    accentColor: 'var(--accent-electric)',
    title: 'Already Accepted',
    description: "You've already accepted this invitation. Head to your dashboard.",
  },
  already_declined: {
    icon: XCircle,
    accentColor: 'var(--text-tertiary)',
    title: 'Already Declined',
    description: 'You previously declined this invitation. Ask the sender to resend it.',
  },
  wrong_email: {
    icon: Mail,
    accentColor: 'var(--accent-neon)',
    title: 'Wrong Account',
    description: "This invitation was sent to a different email address. Log in with the correct account.",
  },
  not_found: {
    icon: AlertTriangle,
    accentColor: 'var(--accent-warning)',
    title: 'Invitation Not Found',
    description: 'This invitation link is invalid or has already been used.',
  },
  unknown: {
    icon: AlertTriangle,
    accentColor: 'var(--accent-neon)',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again or contact support.',
  },
}

export function InvitationAcceptPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const token = searchParams.get('token')

  const [state, setState] = useState<PageState>({ status: 'loading' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'no_token' })
      return
    }

    if (!isAuthenticated) {
      setState({ status: 'needs_auth', token })
      return
    }

    // Authenticated — auto-accept
    setState({ status: 'accepting', token })
    invitationsApi
      .accept({ token })
      .then((res) => {
        // Invalidate org/project caches so sidebar/dashboard refresh
        qc.invalidateQueries({ queryKey: ['organizations'] })
        qc.invalidateQueries({ queryKey: ['projects'] })
        qc.invalidateQueries({ queryKey: ['invitations', 'mine'] })
        setState({ status: 'success', type: 'organization' })
      })
      .catch((err) => {
        const msg: string =
          err?.response?.data?.message ??
          err?.response?.data?.error ??
          err?.message ??
          'Unknown error'
        setState({ status: 'error', code: parseErrorCode(msg), message: msg })
      })
  }, [token, isAuthenticated])

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--accent-electric) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center border-4 border-[var(--accent-electric)] rotate-3"
            style={{ background: 'var(--accent-electric)' }}
          >
            <Zap className="h-6 w-6" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div>
            <h1
              className="text-2xl leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              TASKFLOW
            </h1>
            <div
              className="text-xs tracking-widest mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-electric)' }}
            >
              INVITATION_SYSTEM
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="border-2 p-8"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-strong)',
          }}
        >
          {/* ── Loading ── */}
          {state.status === 'loading' && (
            <div className="flex flex-col items-center py-8 text-center">
              <Loader2
                className="h-12 w-12 animate-spin mb-4"
                style={{ color: 'var(--accent-electric)' }}
              />
              <p
                className="text-sm uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
              >
                Initializing...
              </p>
            </div>
          )}

          {/* ── No Token ── */}
          {state.status === 'no_token' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 mb-6"
                style={{ borderColor: 'var(--accent-warning)', background: 'var(--bg-tertiary)' }}
              >
                <AlertTriangle className="h-8 w-8" style={{ color: 'var(--accent-warning)' }} />
              </div>
              <p
                className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-warning)' }}
              >
                Invalid Link
              </p>
              <h2
                className="text-3xl font-black mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                No Token Found
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                This invitation link is missing a token. Make sure you copied the full link from your email.
              </p>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 border-2 border-[var(--accent-electric)] px-6 py-3 font-black uppercase tracking-wide transition-all hover:translate-x-1"
                style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* ── Needs Auth ── */}
          {state.status === 'needs_auth' && (
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-16 w-16 items-center justify-center border-2 mb-6"
                style={{ borderColor: 'var(--accent-electric)', background: 'var(--bg-tertiary)' }}
              >
                <Mail className="h-8 w-8" style={{ color: 'var(--accent-electric)' }} />
              </div>

              <p
                className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}
              >
                You've Been Invited
              </p>
              <h2
                className="text-3xl font-black mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Join TaskFlow
              </h2>
              <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
                You've received an invitation to collaborate on TaskFlow.
              </p>
              <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Sign in or create an account to accept it.
              </p>

              {/* Token preview */}
              <div
                className="w-full mb-8 p-3 border-l-4 text-left"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--accent-electric)' }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
                >
                  Invitation Token
                </p>
                <p
                  className="text-xs break-all"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-electric)' }}
                >
                  {state.token}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  to={`/login?redirect=/invitations/accept?token=${state.token}`}
                  className="flex items-center justify-center gap-2 border-2 border-[var(--accent-electric)] px-6 py-4 font-black uppercase tracking-wide transition-all hover:translate-x-1"
                  style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
                >
                  <LogIn className="h-5 w-5" />
                  Sign In to Accept
                </Link>
                <Link
                  to={`/register?redirect=/invitations/accept?token=${state.token}`}
                  className="flex items-center justify-center gap-2 border-2 px-6 py-4 font-black uppercase tracking-wide transition-all hover:border-[var(--accent-electric)]"
                  style={{ fontFamily: 'var(--font-display)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* ── Accepting (spinner while API call runs) ── */}
          {state.status === 'accepting' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="relative mb-6">
                <div
                  className="flex h-16 w-16 items-center justify-center border-2"
                  style={{ borderColor: 'var(--accent-electric)', background: 'var(--bg-tertiary)' }}
                >
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-electric)' }} />
                </div>
                <div
                  className="absolute -right-1 -top-1 h-3 w-3 animate-pulse"
                  style={{ background: 'var(--accent-neon)' }}
                />
              </div>
              <p
                className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}
              >
                Processing
              </p>
              <h2
                className="text-3xl font-black mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Accepting Invitation
              </h2>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Verifying your token and adding you to the team...
              </p>
            </div>
          )}

          {/* ── Success ── */}
          {state.status === 'success' && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div
                  className="flex h-16 w-16 items-center justify-center border-2"
                  style={{ borderColor: 'var(--accent-electric)', background: 'var(--bg-tertiary)' }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--accent-electric)' }} />
                </div>
                <div
                  className="absolute -right-1 -top-1 h-3 w-3 animate-pulse"
                  style={{ background: 'var(--accent-electric)' }}
                />
              </div>

              <p
                className="text-xs font-black uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-electric)' }}
              >
                Welcome Aboard
              </p>
              <h2
                className="text-3xl font-black mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Invitation Accepted
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                You've successfully joined. Head to your dashboard to get started.
              </p>

              {/* Quick nav */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 border-2 border-[var(--accent-electric)] px-6 py-4 font-black uppercase tracking-wide transition-all hover:translate-x-1"
                  style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/organizations')}
                    className="flex items-center justify-center gap-2 border-2 px-4 py-3 text-sm font-black uppercase tracking-wide transition-all hover:border-[var(--accent-electric)]"
                    style={{ fontFamily: 'var(--font-display)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                  >
                    <Building2 className="h-4 w-4" />
                    Organizations
                  </button>
                  <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center justify-center gap-2 border-2 px-4 py-3 text-sm font-black uppercase tracking-wide transition-all hover:border-[var(--accent-cyber)]"
                    style={{ fontFamily: 'var(--font-display)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                  >
                    <FolderKanban className="h-4 w-4" />
                    Projects
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {state.status === 'error' && (() => {
            const cfg = errorConfig[state.code]
            const Icon = cfg.icon
            return (
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center border-2 mb-6"
                  style={{ borderColor: cfg.accentColor, background: 'var(--bg-tertiary)' }}
                >
                  <Icon className="h-8 w-8" style={{ color: cfg.accentColor }} />
                </div>

                <p
                  className="text-xs font-black uppercase tracking-widest mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: cfg.accentColor }}
                >
                  {state.code.replace(/_/g, ' ')}
                </p>
                <h2
                  className="text-3xl font-black mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {cfg.title}
                </h2>
                <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {cfg.description}
                </p>

                {/* Raw error for debugging */}
                <div
                  className="w-full mb-8 p-3 border-l-4 text-left"
                  style={{ background: 'var(--bg-tertiary)', borderColor: cfg.accentColor }}
                >
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
                  >
                    Server Response
                  </p>
                  <p
                    className="text-xs break-words"
                    style={{ fontFamily: 'var(--font-mono)', color: cfg.accentColor }}
                  >
                    {state.message}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  {/* If wrong email — offer to switch account */}
                  {state.code === 'wrong_email' ? (
                    <button
                      onClick={() => {
                        useAuthStore.getState().clearAuth()
                        navigate(`/login?redirect=/invitations/accept?token=${token}`)
                      }}
                      className="flex items-center justify-center gap-2 border-2 border-[var(--accent-neon)] px-6 py-4 font-black uppercase tracking-wide transition-all hover:translate-x-1"
                      style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-neon)', color: 'var(--text-inverse)' }}
                    >
                      <LogIn className="h-5 w-5" />
                      Switch Account
                    </button>
                  ) : state.code === 'already_accepted' ? (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center justify-center gap-2 border-2 border-[var(--accent-electric)] px-6 py-4 font-black uppercase tracking-wide transition-all hover:translate-x-1"
                      style={{ fontFamily: 'var(--font-display)', background: 'var(--accent-electric)', color: 'var(--text-inverse)' }}
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center justify-center gap-2 border-2 px-6 py-4 font-black uppercase tracking-wide transition-all hover:border-[var(--accent-electric)]"
                      style={{ fontFamily: 'var(--font-display)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                    >
                      Back to Dashboard
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: 'var(--border-strong)' }} />
          <p
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
          >
            TaskFlow Invitation System
          </p>
          <div className="h-px flex-1" style={{ background: 'var(--border-strong)' }} />
        </div>
      </div>
    </div>
  )
}
