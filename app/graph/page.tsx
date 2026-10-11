import { AppShell } from '@/components/app-shell'
import { NetgraphHero } from '@/components/netgraph-hero'

export default function Graph() {
  return (
    <AppShell title="Relationship graph">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight">
          Explore your relationship graph
        </h2>
        <p className="mt-2 text-muted-foreground">
          Drag to explore connections between skills, projects, technologies, and career opportunities.
        </p>

        <div className="mt-8">
          <NetgraphHero className="relative h-[520px] w-full overflow-hidden rounded-3xl border border-border/70 bg-card/50 shadow-sm md:h-[640px]" />
        </div>
      </div>
    </AppShell>
  )
}
