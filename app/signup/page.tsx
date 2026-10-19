'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Network, AlertCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (isSubmitting) return

    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
      return
    }

    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long to meet security requirements.')
      return
    }

    if (!agreed) {
      setErrorMessage('Please acknowledge the terms to continue.')
      return
    }

    setIsSubmitting(true)
    const result = await signup(trimmedName, trimmedEmail, password)
    setIsSubmitting(false)

    if (result.success) {
      // Proceed to profile onboarding
      router.push('/onboarding')
    } else {
      if (result.isDatabaseUnavailable) {
        setErrorMessage(
          'The backend database is currently unconfigured or offline. To explore NetGraph features immediately, please use "Demo Sign In" on the Login page.'
        )
      } else {
        setErrorMessage(result.error || 'Failed to create account. Please try again.')
      }
    }
  }

  return (
    <main className="flex min-h-screen bg-background">
      <div className="hidden w-[42%] bg-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-card/15">
            <Network className="size-4" />
          </span>
          <span className="font-bold">NETGRAPH</span>
        </Link>
        <div>
          <p className="text-5xl font-semibold leading-[1.02] tracking-[-0.06em]">
            A clearer view of where your skills can take you.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-sm text-indigo-100">
            <span className="flex items-center gap-2">
              <Check className="size-4" /> Map your skills and projects
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4" /> Explore illustrative career matches
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4" /> Find your next learning edge
            </span>
          </div>
        </div>
        <p className="text-xs text-indigo-200">
          Frontend demonstration · Local demo session mode
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
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
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">Create your profile</h1>
          <p className="mt-2 text-muted-foreground">Start with the essentials. You can add more details next.</p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
                <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                disabled={isSubmitting}
              />
            </div>

            <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="mt-1 accent-indigo-600"
              />
              <span>
                I understand this is a local demo authentication mode with client-side session persistence.
              </span>
            </label>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-full bg-slate-950 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
