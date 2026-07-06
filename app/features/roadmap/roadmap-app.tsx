import { useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  Position,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Filter,
  PanelRightClose,
  PanelRightOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { roadmapItems, roadmapItemMap } from "~/data/roadmap";
import { RoadmapDetails } from "~/features/roadmap/roadmap-details";
import RoadmapNode, { type RoadmapNodeData } from "~/features/roadmap/roadmap-node";
import { useRoadmapHydration } from "~/hooks/use-roadmap-hydration";
import { getProgress, getRoadmapStatus, matchesRoadmapFilter } from "~/lib/roadmap";
import { cn } from "~/lib/utils";
import { useRoadmapStore } from "~/store/roadmap-store";
import type { RoadmapFilter, RoadmapLayout, RoadmapNodeId } from "~/types/roadmap";

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const filters: Array<{ value: RoadmapFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "completed", label: "Selesai" },
  { value: "available", label: "Bisa Dikerjakan" },
  { value: "locked", label: "Terkunci" },
  { value: "coming-soon", label: "Coming Soon" },
];

const verticalPositions: Record<RoadmapNodeId, { x: number; y: number }> = {
  repository: { x: -290, y: 0 },
  book: { x: 0, y: 0 },
  sks112: { x: 290, y: 0 },
  usept: { x: 580, y: 0 },
  library: { x: -145, y: 250 },
  yudisium: { x: 180, y: 520 },
  graduation: { x: 180, y: 790 },
};

function getItemPosition(id: RoadmapNodeId, layout: RoadmapLayout) {
  if (layout === "vertical") {
    return verticalPositions[id];
  }

  return roadmapItemMap.get(id)?.position ?? { x: 0, y: 0 };
}

function Toolbar() {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const filter = useRoadmapStore((state) => state.filter);
  const layout = useRoadmapStore((state) => state.layout);
  const query = useRoadmapStore((state) => state.query);
  const setFilter = useRoadmapStore((state) => state.setFilter);
  const setLayout = useRoadmapStore((state) => state.setLayout);
  const setQuery = useRoadmapStore((state) => state.setQuery);
  const selectedFilter = filters.find((item) => item.value === filter)?.label ?? "Semua";
  const selectedLayout = layout === "vertical" ? "Atas-Bawah" : "Kiri-Kanan";

  return (
    <div className="border-b border-white/10 bg-neutral-950/90 backdrop-blur lg:flex lg:items-center lg:justify-between lg:gap-4 lg:p-4">
      <div className="flex items-start justify-between gap-3 p-4 lg:p-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-cyan-200">
            FASILKOM UNSRI
          </p>
          <h1 className="mt-1 text-balance text-xl font-semibold leading-tight text-white">
            Roadmap Yudisium & Wisuda
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 lg:hidden">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
              {selectedFilter}
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
              {selectedLayout}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="mt-0.5 border-white/10 bg-white/5 text-white hover:bg-white/10 lg:hidden"
          title={isMobilePanelOpen ? "Tutup pengaturan" : "Buka pengaturan"}
          aria-label={isMobilePanelOpen ? "Tutup pengaturan" : "Buka pengaturan"}
          aria-expanded={isMobilePanelOpen}
          onClick={() => setIsMobilePanelOpen((value) => !value)}
        >
          {isMobilePanelOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
        </Button>
      </div>

      <div
        className={cn(
          "grid gap-3 px-4 pb-4 lg:flex lg:items-center lg:justify-end lg:p-0",
          isMobilePanelOpen ? "grid-rows-[1fr] opacity-100" : "hidden lg:flex"
        )}
      >
        <label className="relative min-w-0 sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
            value={query}
            placeholder="Cari syarat..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="relative min-w-0 sm:w-48">
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <select
            className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 pl-9 pr-9 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
            value={filter}
            onChange={(event) => setFilter(event.target.value as RoadmapFilter)}
          >
            {filters.map((item) => (
              <option key={item.value} value={item.value} className="bg-neutral-950">
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:w-[260px]">
          <Button
            type="button"
            variant={layout === "vertical" ? "default" : "ghost"}
            size="default"
            className={cn(
              "h-9 gap-2 text-white hover:bg-white/10",
              layout === "vertical" && "bg-cyan-300 text-neutral-950 hover:bg-cyan-200"
            )}
            title="Tampilkan dari atas ke bawah"
            aria-label="Tampilkan dari atas ke bawah"
            onClick={() => setLayout("vertical")}
          >
            <ArrowDown className="size-4" />
            <span>Atas-Bawah</span>
          </Button>
          <Button
            type="button"
            variant={layout === "horizontal" ? "default" : "ghost"}
            size="default"
            className={cn(
              "h-9 gap-2 text-white hover:bg-white/10",
              layout === "horizontal" && "bg-cyan-300 text-neutral-950 hover:bg-cyan-200"
            )}
            title="Tampilkan dari kiri ke kanan"
            aria-label="Tampilkan dari kiri ke kanan"
            onClick={() => setLayout("horizontal")}
          >
            <ArrowRight className="size-4" />
            <span>Kiri-Kanan</span>
          </Button>
        </div>
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const completedIds = useRoadmapStore((state) => state.completedIds);
  const selectedId = useRoadmapStore((state) => state.selectedId);
  const selectNode = useRoadmapStore((state) => state.selectNode);
  const filter = useRoadmapStore((state) => state.filter);
  const layout = useRoadmapStore((state) => state.layout);
  const query = useRoadmapStore((state) => state.query);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const selectedItem = roadmapItemMap.get(selectedId) ?? roadmapItems[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => {
      setIsDesktop(mediaQuery.matches);

      if (mediaQuery.matches) {
        setMobileDetailsOpen(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

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
        position: getItemPosition(item.id, layout),
        selected: item.id === selectedId,
        targetPosition: layout === "vertical" ? Position.Top : Position.Left,
        sourcePosition: layout === "vertical" ? Position.Bottom : Position.Right,
        data: {
          item,
          status: getRoadmapStatus(item, completedSet),
          dependencyCount: item.dependencies.length,
          layout,
        },
      })),
    [completedSet, layout, selectedId, visibleItems]
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
        <div
          className={cn(
            "grid min-h-0 flex-1",
            isSidebarCollapsed
              ? "lg:grid-cols-[minmax(0,1fr)_4rem]"
              : "lg:grid-cols-[minmax(0,1fr)_380px]"
          )}
        >
          <section className="relative min-h-0">
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
                if (isDesktop) {
                  setIsSidebarCollapsed(false);
                  return;
                }

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

          <aside
            className={cn(
              "hidden min-h-0 border-l border-white/10 bg-neutral-950/95 transition-[width] duration-200 lg:flex lg:flex-col",
              isSidebarCollapsed ? "w-16" : "w-[380px]"
            )}
          >
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium text-white">Detail Syarat</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                title={isSidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
                aria-label={isSidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
                onClick={() => setIsSidebarCollapsed((value) => !value)}
              >
                {isSidebarCollapsed ? (
                  <PanelRightOpen className="size-4" />
                ) : (
                  <PanelRightClose className="size-4" />
                )}
              </Button>
            </div>
            {isSidebarCollapsed ? (
              <button
                type="button"
                className="flex flex-1 flex-col items-center gap-3 px-2 py-4 text-left text-zinc-300 transition hover:bg-white/5 hover:text-white"
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="Buka detail syarat"
              >
                <span className="writing-vertical text-xs font-medium uppercase tracking-normal">
                  Detail
                </span>
                <span className="mt-auto text-center text-[0.68rem] leading-4 text-zinc-400">
                  Klik node untuk buka
                </span>
              </button>
            ) : (
              <>
                <ProgressPanel />
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  <RoadmapDetails item={selectedItem} />
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <Sheet open={!isDesktop && mobileDetailsOpen} onOpenChange={setMobileDetailsOpen}>
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
