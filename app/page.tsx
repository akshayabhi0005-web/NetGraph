'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, BrainCircuit, ChevronRight, CircleCheck, Database, FileText, GitBranch, Layers3, Menu, Network, ScanSearch, Sparkles, Target, X } from 'lucide-react'
import { useState } from 'react'
import { NetgraphHero } from '@/components/netgraph-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/context/auth-context'

const features = [
  { icon: ScanSearch, title: 'Profile-based analysis', text: 'Turn your experience, education, and skills into a structured career profile.' },
  { icon: Target, title: 'Career matches', text: 'Compare your profile with transparent, illustrative role requirements.' },
  { icon: GitBranch, title: 'Skill gap analysis', text: 'See what to explore next with a clear view of represented and missing skills.' },
  { icon: Network, title: 'Relationship discovery', text: 'Map the hidden connections between tools, capabilities, projects, and roles.' },
  { icon: BarChart3, title: 'Actionable insights', text: 'Follow your coverage, focus areas, and progress from one calm workspace.' },
  { icon: FileText, title: 'Career reports', text: 'Package your discoveries into a shareable report for your next conversation.' },
]
const steps = [
  ['01', 'Build your profile', 'Add the experiences, skills, education, and goals that make your path yours.'],
  ['02', 'Run your analysis', 'Our transparent demo matching logic connects your profile to example role patterns.'],
  ['03', 'Explore your edge', 'Follow relationships, understand gaps, and choose your next area to grow.'],
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-[10px] bg-indigo-600 text-white shadow-lg shadow-indigo-200"><Network className="size-4" /></span><span className="text-[15px] font-bold tracking-[-0.04em]">NETGRAPH</span></Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex"><a href="#features" className="transition hover:text-foreground">Features</a><a href="#how-it-works" className="transition hover:text-foreground">How it works</a><a href="#about" className="transition hover:text-foreground">About</a></div>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-foreground">Dashboard</Link>
              <Button asChild className="rounded-full bg-slate-950 px-5 hover:bg-indigo-700 text-white"><Link href="/dashboard">Open Workspace <ArrowRight data-icon="inline-end" /></Link></Button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-foreground">Log in</Link>
              <Button asChild className="rounded-full bg-slate-950 px-5 hover:bg-indigo-700 text-white"><Link href="/signup">Get started <ArrowRight data-icon="inline-end" /></Link></Button>
            </>
          )}
        </div>
        <button aria-label="Toggle navigation" className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div className="flex flex-col gap-4 border-t border-border bg-card/80 px-5 py-5 md:hidden">
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        {isAuthenticated ? (
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        ) : (
          <>
            <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Button asChild><Link href="/signup">Get started</Link></Button>
          </>
        )}
      </div>}
    </nav>

    <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-6 lg:px-8 lg:pb-28 lg:pt-16 overflow-visible">
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}><Badge variant="secondary" className="mb-6 rounded-full border border-indigo-100 bg-primary/10 px-3 py-1.5 text-indigo-700"><Sparkles className="mr-1.5 size-3.5" /> Career intelligence, mapped</Badge><h1 className="max-w-xl text-[clamp(3.25rem,7vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-foreground">Find the thread between <span className="text-indigo-600">what you know</span> and what&apos;s next.</h1><p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">NETGRAPH explores the relationships between your skills, projects, technologies, and career opportunities — so your next move feels less like a guess.</p><div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-slate-950 px-6 hover:bg-indigo-700 text-white">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>{isAuthenticated ? "Go to workspace" : "Build your profile"} <ArrowRight data-icon="inline-end" /></Link>
          </Button>
          <a href="#how-it-works" className="group flex items-center gap-2 px-3 text-sm font-semibold text-slate-600">See how it works <ChevronRight className="size-4 transition group-hover:translate-x-1" /></a></div><p className="mt-6 text-xs font-medium text-slate-400">Start with your profile. Explore insights when your analysis is ready.</p></motion.div>
      </div>
      <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .15 }} className="relative h-[480px] w-full overflow-visible sm:h-[580px] lg:h-[720px] pointer-events-auto"><NetgraphHero className="h-full w-full overflow-visible" /></motion.div>
    </section>

    <section className="border-y border-border/80 bg-card/80"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 text-sm text-muted-foreground sm:grid-cols-3 lg:px-8"><div className="flex items-center gap-3"><CircleCheck className="size-4 text-indigo-500" /> Transparent sample logic</div><div className="flex items-center gap-3"><CircleCheck className="size-4 text-indigo-500" /> Built for curious builders</div><div className="flex items-center gap-3"><CircleCheck className="size-4 text-indigo-500" /> No promises, just clarity</div></div></section>

    <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">One connected view</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">Your career is a network, not a checklist.</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">See the shape of your profile and the opportunities around it, with enough context to take a meaningful next step.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, text }, i) => <motion.article whileHover={{ y: -3 }} key={title} className="bg-card/80 p-7 lg:p-8"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-indigo-600"><Icon className="size-5" /></div><p className="mt-7 text-lg font-semibold">{title}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p><div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-600">Explore <ArrowRight className="size-3.5" /></div></motion.article>)}</div></section>

    <section id="how-it-works" className="bg-slate-950 text-white"><div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">How NETGRAPH works</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Clarity is a process.</h2><p className="mt-5 max-w-sm leading-7 text-slate-400">A guided flow that puts your profile first, then gives you a useful map to explore.</p></div><div className="grid gap-10">{steps.map(([number, title, text]) => <div key={number} className="grid grid-cols-[52px_1fr] gap-5 border-b border-white/10 pb-9 last:border-0"><span className="font-mono text-sm text-indigo-300">{number}</span><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 max-w-md leading-7 text-slate-400">{text}</p></div></div>)}</div></div></section>

    <section id="about" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="grid gap-12 rounded-[30px] border border-indigo-100 bg-primary/10/60 p-8 md:p-12 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">An academic data mining project</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.055em] text-foreground md:text-5xl">Make your invisible connections visible.</h2><p className="mt-5 max-w-xl leading-8 text-slate-600">NETGRAPH is designed to help you understand profile alignment and explore potential directions. Results are demonstration estimates, not verified job-market predictions.</p></div><Button asChild size="lg" className="w-fit rounded-full bg-indigo-600 hover:bg-indigo-700"><Link href="/signup">Start exploring <ArrowRight data-icon="inline-end" /></Link></Button></div></section>

    <footer className="border-t border-border bg-card/80"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8"><div><Link href="/" className="flex items-center gap-2.5"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white"><Network className="size-3.5" /></span><span className="text-sm font-bold tracking-[-0.04em]">NETGRAPH</span></Link><p className="mt-3 text-xs text-slate-400">Career intelligence for the next chapter.</p></div><div className="flex flex-wrap gap-5 text-xs font-medium text-muted-foreground"><a href="#features">Features</a><a href="#how-it-works">How it works</a><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div></div></footer>
  </main>
}
