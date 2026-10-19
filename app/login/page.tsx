'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Network, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'

  const { login, loginDemo, isAuthenticated, user, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user && !user.onboarded) {
        router.push('/onboarding')
      } else {
        router.push(redirectPath)
      }
    }
  }, [authLoading, isAuthenticated, user?.onboarded, router, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (isSubmitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    const result = await login(trimmedEmail, password)
    setIsSubmitting(false)

    if (result.success) {
      if (result.user && !result.user.onboarded) {
        router.push('/onboarding')
      } else {
        router.push(redirectPath)
      }
    } else {
      if (result.isDatabaseUnavailable) {
        setErrorMessage(
          'The backend database service is currently unreachable or unconfigured. Please check environment configuration or try again shortly.'
        )
      } else {
        setErrorMessage(result.error || 'Invalid email or password.')
      }
    }
  }

  const handleDemoLogin = async () => {
    if (process.env.NODE_ENV === 'production') return
    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)
    await loginDemo()
    setIsSubmitting(false)
    router.push(redirectPath)
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    setInfoMessage('Password reset is managed securely by your system administrator or database provider.')
  }

  const isDevelopment = process.env.NODE_ENV !== 'production'

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="mb-9 lg:hidden">
        <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Network className="size-4" />
        </span>
        <p className="mt-3 font-bold">NETGRAPH</p>
      </div>
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Continue exploring your career potential.</p>

      {/* 1-Click Instant Demo Login Banner (Development Evaluation Only) */}
      {isDevelopment && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-sm text-indigo-950">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-medium text-indigo-900">
              Quick evaluation with demo profile (dev only)
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="rounded-full bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : 'Demo Sign In'}
          </Button>
        </div>
      )}

      <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
            <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-xs text-indigo-800">
            {infoMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pr-11"
              disabled={isSubmitting}
            />
            <button
              type="button"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(!show)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 rounded-full bg-slate-950 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign in <ArrowRight data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to NETGRAPH?{' '}
        <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
            <Network className="size-4" />
          </span>
          <span className="font-bold">NETGRAPH</span>
        </Link>
        <div>
          <p className="max-w-md text-5xl font-semibold leading-[1.02] tracking-[-0.06em]">
            Your next move starts with a better map.
          </p>
          <p className="mt-6 max-w-sm leading-7 text-slate-400">
            Sign in to return to your profile, analysis, and career graph.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Secure cloud analytics · Powered by Neon PostgreSQL
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
