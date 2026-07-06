import { useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Filter, Search } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { roadmapItems, roadmapItemMap } from "~/data/roadmap";
import { RoadmapDetails } from "~/features/roadmap/roadmap-details";
import RoadmapNode, { type RoadmapNodeData } from "~/features/roadmap/roadmap-node";
import { useRoadmapHydration } from "~/hooks/use-roadmap-hydration";
import { getProgress, getRoadmapStatus, matchesRoadmapFilter } from "~/lib/roadmap";
import { cn } from "~/lib/utils";
import { useRoadmapStore } from "~/store/roadmap-store";
import type { RoadmapFilter } from "~/types/roadmap";

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const filters: Array<{ value: RoadmapFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "completed", label: "Completed" },
  { value: "available", label: "Available" },
  { value: "locked", label: "Locked" },
  { value: "coming-soon", label: "Coming Soon" },
];

function Toolbar() {
  const filter = useRoadmapStore((state) => state.filter);
  const query = useRoadmapStore((state) => state.query);
  const setFilter = useRoadmapStore((state) => state.setFilter);
  const setQuery = useRoadmapStore((state) => state.setQuery);

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 bg-neutral-950/80 p-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-cyan-200">
          FASILKOM UNSRI
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">
          Roadmap Yudisium & Wisuda
        </h1>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative min-w-0 sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
            value={query}
            placeholder="Cari syarat..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <select
            className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 pl-9 pr-8 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20 sm:w-40"
            value={filter}
            onChange={(event) => setFilter(event.target.value as RoadmapFilter)}
          >
            {filters.map((item) => (
              <option key={item.value} value={item.value} className="bg-neutral-950">
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function ProgressPanel() {
  const completedIds = useRoadmapStore((state) => state.completedIds);
  const progress = getProgress(new Set(completedIds));

  return (
    <div className="border-b border-white/10 bg-neutral-950/80 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white">Progress</span>
        <span className="text-zinc-300">
          {progress.completedCount}/{progress.totalCount} syarat
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-cyan-300 transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-zinc-400">{progress.percentage}% selesai</div>
    </div>
  );
}

export function RoadmapApp() {
  const isHydrated = useRoadmapHydration();
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const completedIds = useRoadmapStore((state) => state.completedIds);
  const selectedId = useRoadmapStore((state) => state.selectedId);
  const selectNode = useRoadmapStore((state) => state.selectNode);
  const filter = useRoadmapStore((state) => state.filter);
  const query = useRoadmapStore((state) => state.query);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const selectedItem = roadmapItemMap.get(selectedId) ?? roadmapItems[0];

  const visibleItems = useMemo(
    () =>
      roadmapItems.filter((item) =>
        matchesRoadmapFilter(item, completedSet, filter, query)
      ),
    [completedSet, filter, query]
  );
  const visibleIds = useMemo(() => new Set(visibleItems.map((item) => item.id)), [visibleItems]);

  const nodes: Node<RoadmapNodeData>[] = useMemo(
    () =>
      visibleItems.map((item) => ({
        id: item.id,
        type: "roadmapNode",
        position: item.position,
        selected: item.id === selectedId,
        data: {
          item,
          status: getRoadmapStatus(item, completedSet),
          dependencyCount: item.dependencies.length,
        },
      })),
    [completedSet, selectedId, visibleItems]
  );

  const edges: Edge[] = useMemo(
    () =>
      roadmapItems.flatMap((item) =>
        item.dependencies
          .filter((dependencyId) => visibleIds.has(dependencyId) && visibleIds.has(item.id))
          .map((dependencyId) => {
            const status = getRoadmapStatus(item, completedSet);
            return {
              id: `${dependencyId}-${item.id}`,
              source: dependencyId,
              target: item.id,
              animated: status === "available",
              type: "smoothstep",
              style: {
                stroke:
                  status === "completed"
                    ? "#34d399"
                    : status === "available"
                      ? "#67e8f9"
                      : "#52525b",
                strokeWidth: status === "available" ? 2.5 : 2,
              },
            };
          })
      ),
    [completedSet, visibleIds]
  );

  return (
    <main className="min-h-dvh overflow-hidden bg-neutral-950 text-white">
      <div className="flex min-h-dvh flex-col">
        <Toolbar />
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="relative min-h-[calc(100dvh-94px)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.45}
              maxZoom={1.35}
              proOptions={{ hideAttribution: true }}
              onNodeClick={(_, node) => {
                selectNode(node.id as typeof selectedId);
                setMobileDetailsOpen(true);
              }}
              className={cn(!isHydrated && "opacity-70")}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#3f3f46" />
              <Controls className="!border-white/10 !bg-zinc-900/90 !text-white" />
              <MiniMap
                pannable
                zoomable
                nodeStrokeWidth={3}
                className="!hidden !border !border-white/10 !bg-zinc-900/90 lg:!block"
              />
            </ReactFlow>
          </section>

          <aside className="hidden min-h-0 border-l border-white/10 bg-neutral-950/95 lg:flex lg:flex-col">
            <ProgressPanel />
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <RoadmapDetails item={selectedItem} />
            </div>
          </aside>
        </div>
      </div>

      <Sheet open={mobileDetailsOpen} onOpenChange={setMobileDetailsOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-lg border-white/10 bg-neutral-950 p-0 lg:hidden">
          <SheetHeader className="border-b border-white/10">
            <SheetTitle>{selectedItem.title}</SheetTitle>
            <SheetDescription>Detail syarat roadmap</SheetDescription>
          </SheetHeader>
          <div className="max-h-[calc(85dvh-76px)] overflow-y-auto p-5">
            <ProgressPanel />
            <div className="pt-5">
              <RoadmapDetails item={selectedItem} compact />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
