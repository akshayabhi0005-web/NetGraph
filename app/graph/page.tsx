import { AppShell } from '@/components/app-shell'
import { NetgraphHero } from '@/components/netgraph-hero'
export default function Graph(){return <AppShell title="Relationship graph"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-semibold tracking-tight">Explore your relationship graph</h2><p className="mt-3 text-muted-foreground">Drag to explore connections between skills, projects, technologies, and opportunities.</p><div className="mt-8"><NetgraphHero/></div></div></AppShell>}
