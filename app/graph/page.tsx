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
          <NetgraphHero className="relative h-[500px] w-full overflow-hidden rounded-[28px] border border-indigo-100/80 bg-[radial-gradient(circle_at_50%_40%,#eef2ff_0%,#eaf4ff_38%,#f8fafc_78%)] shadow-[0_24px_80px_rgba(79,70,229,0.14)] md:h-[600px]" />
        </div>
      </div>
    </AppShell>
  )
}
