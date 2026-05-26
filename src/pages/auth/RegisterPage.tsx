import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Zap, ArrowRight, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/hooks/useAuth'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [showPw, setShowPw] = useState(false)
  const { mutate: register_, isPending } = useRegister()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="animate-fade-in">
      {/* Brutalist Header */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-16 w-16 items-center justify-center border-4 border-[var(--accent-cyber)] -rotate-3"
            style={{ background: 'var(--accent-cyber)' }}
          >
            <UserPlus className="h-8 w-8 rotate-3" style={{ color: 'var(--text-inverse)' }} />
          </div>
          <div>
            <h1
              className="text-3xl leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              JOIN US
            </h1>
            <div
              className="text-xs tracking-widest mt-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyber)' }}
            >
              NEW_USER_INIT
            </div>
          </div>
        </div>

        <h2
          className="mb-3 text-4xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          CREATE ACCOUNT
        </h2>
        <p
          className="text-lg italic max-w-md"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
        >
          Start managing your tasks, projects, and teams with a powerful command center built for modern work.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => register_(d))} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
          >
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            autoComplete="name"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="border-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-3 text-base font-medium transition-all focus:border-[var(--accent-cyber)] focus:outline-none"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
          />
          {errors.name && (
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)' }}
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@domain.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="border-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-3 text-base font-medium transition-all focus:border-[var(--accent-cyber)] focus:outline-none"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
          />
          {errors.email && (
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)' }}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={!!errors.password}
              className="border-2 border-[var(--border-strong)] bg-[var(--bg-secondary)] px-4 py-3 text-base font-medium transition-all focus:border-[var(--accent-cyber)] focus:outline-none"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-neon)' }}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full border-3 border-[var(--accent-cyber)] px-8 py-4 font-black uppercase tracking-wide transition-all hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'var(--accent-cyber)',
            color: 'var(--text-inverse)'
          }}
        >
          <span className="flex items-center justify-center gap-3">
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p
          className="text-sm"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold uppercase tracking-wide underline transition-colors hover:no-underline"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyber)' }}
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="mt-12 flex items-center gap-4">
        <div className="h-1 flex-1" style={{ background: 'var(--border-strong)' }} />
        <div
          className="h-3 w-3"
          style={{ background: 'var(--accent-cyber)' }}
        />
        <div className="h-1 flex-1" style={{ background: 'var(--border-strong)' }} />
      </div>
    </div>
  )
}
