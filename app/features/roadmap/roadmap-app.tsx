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
import type { RoadmapFilter, RoadmapItem, RoadmapLayout, RoadmapNodeId } from "~/types/roadmap";

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

function getItemLevel(
  item: RoadmapItem,
  levels: Map<RoadmapNodeId, number>,
  visiting = new Set<RoadmapNodeId>()
): number {
  const cachedLevel = levels.get(item.id);

  if (cachedLevel !== undefined) {
    return cachedLevel;
  }

  if (visiting.has(item.id) || item.dependencies.length === 0) {
    levels.set(item.id, 0);
    return 0;
  }

  visiting.add(item.id);

  const level =
    Math.max(
      ...item.dependencies.map((dependencyId) => {
        const dependency = roadmapItemMap.get(dependencyId);
        return dependency ? getItemLevel(dependency, levels, visiting) : 0;
      })
    ) + 1;

  visiting.delete(item.id);
  levels.set(item.id, level);
  return level;
}

function getLayoutPositions(layout: RoadmapLayout) {
  const levels = new Map<RoadmapNodeId, number>();
  const groupedItems = new Map<number, RoadmapItem[]>();

  for (const item of roadmapItems) {
    const level = getItemLevel(item, levels);
    groupedItems.set(level, [...(groupedItems.get(level) ?? []), item]);
  }

  // Determine DFS order to group related nodes together
  const visited = new Set<RoadmapNodeId>();
  const dfsOrder: RoadmapNodeId[] = [];
  
  // Find leaf nodes (nodes that are not dependencies of any other node)
  const hasDependents = new Set<RoadmapNodeId>();
  for (const item of roadmapItems) {
    for (const depId of item.dependencies) {
      hasDependents.add(depId);
    }
  }
  const leafIds = roadmapItems.map(item => item.id).filter(id => !hasDependents.has(id));

  function dfs(id: RoadmapNodeId) {
    if (visited.has(id)) return;
    visited.add(id);
    const item = roadmapItemMap.get(id);
    if (item) {
      for (const depId of item.dependencies) {
        dfs(depId);
      }
    }
    dfsOrder.push(id);
  }

  for (const id of leafIds) {
    dfs(id);
  }
  for (const item of roadmapItems) {
    dfs(item.id);
  }

  const orderMap = new Map(dfsOrder.map((id, index) => [id, index]));
  const positions = new Map<RoadmapNodeId, { x: number; y: number }>();

  const maxLevel = Math.max(...levels.values(), 0);

  if (layout === "vertical") {
    const xSpacing = 300;
    const ySpacing = 260;

    // Process level 0
    const level0 = groupedItems.get(0) ?? [];
    level0.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    level0.forEach((item, index) => {
      positions.set(item.id, { x: index * xSpacing, y: 0 });
    });

    // Process levels 1 to maxLevel
    for (let l = 1; l <= maxLevel; l++) {
      const items = groupedItems.get(l) ?? [];
      const calculatedX = new Map<RoadmapNodeId, number>();

      for (const item of items) {
        let sumX = 0;
        let count = 0;
        for (const depId of item.dependencies) {
          if (positions.has(depId)) {
            sumX += positions.get(depId)!.x;
            count++;
          }
        }
        const initialX = count > 0 ? sumX / count : 0;
        calculatedX.set(item.id, initialX);
      }

      // Sort items at this level by their calculated X
      items.sort((a, b) => (calculatedX.get(a.id) ?? 0) - (calculatedX.get(b.id) ?? 0));

      // Resolve collisions
      const levelXCoords: number[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let x = calculatedX.get(item.id) ?? 0;
        if (i > 0) {
          const prevX = levelXCoords[i - 1];
          if (x < prevX + xSpacing) {
            x = prevX + xSpacing;
          }
        }
        levelXCoords.push(x);
        positions.set(item.id, { x, y: l * ySpacing });
      }
    }
  } else {
    // Horizontal layout
    const xSpacing = 340;
    const ySpacing = 220;

    // Process level 0
    const level0 = groupedItems.get(0) ?? [];
    level0.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    level0.forEach((item, index) => {
      positions.set(item.id, { x: 0, y: index * ySpacing });
    });

    // Process levels 1 to maxLevel
    for (let l = 1; l <= maxLevel; l++) {
      const items = groupedItems.get(l) ?? [];
      const calculatedY = new Map<RoadmapNodeId, number>();

      for (const item of items) {
        let sumY = 0;
        let count = 0;
        for (const depId of item.dependencies) {
          if (positions.has(depId)) {
            sumY += positions.get(depId)!.y;
            count++;
          }
        }
        const initialY = count > 0 ? sumY / count : 0;
        calculatedY.set(item.id, initialY);
      }

      // Sort items at this level by their calculated Y
      items.sort((a, b) => (calculatedY.get(a.id) ?? 0) - (calculatedY.get(b.id) ?? 0));

      // Resolve collisions
      const levelYCoords: number[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let y = calculatedY.get(item.id) ?? 0;
        if (i > 0) {
          const prevY = levelYCoords[i - 1];
          if (y < prevY + ySpacing) {
            y = prevY + ySpacing;
          }
        }
        levelYCoords.push(y);
        positions.set(item.id, { x: l * xSpacing, y });
      }
    }
  }

  // Post-processing: Edge-node collision avoidance
  if (layout === "vertical") {
    const nodeWidth = 230;
    const safeDistance = nodeWidth / 2 + 50; // half width + margin (e.g. 115 + 50 = 165)

    for (let pass = 0; pass < 3; pass++) {
      for (const item of roadmapItems) {
        for (const depId of item.dependencies) {
          const A = positions.get(depId);
          const B = positions.get(item.id);
          if (!A || !B) continue;

          const yMin = Math.min(A.y, B.y);
          const yMax = Math.max(A.y, B.y);

          if (yMax - yMin < 10) continue; // same level, skip

          for (const [id, pos] of positions.entries()) {
            if (id === depId || id === item.id) continue;

            if (pos.y > yMin + 5 && pos.y < yMax - 5) {
              const t = (pos.y - A.y) / (B.y - A.y);
              const edgeX = A.x + (B.x - A.x) * t;

              const diffX = pos.x - edgeX;
              if (Math.abs(diffX) < safeDistance) {
                const shift = diffX >= 0 ? safeDistance - diffX : -safeDistance - diffX;
                const level = levels.get(id);
                const levelItems = groupedItems.get(level ?? 0) ?? [];

                for (const sibling of levelItems) {
                  const siblingPos = positions.get(sibling.id);
                  if (siblingPos && siblingPos.y === pos.y) {
                    if (shift > 0 && siblingPos.x >= pos.x) {
                      positions.set(sibling.id, { x: siblingPos.x + shift, y: siblingPos.y });
                    } else if (shift < 0 && siblingPos.x <= pos.x) {
                      positions.set(sibling.id, { x: siblingPos.x + shift, y: siblingPos.y });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    // Horizontal layout
    const nodeHeight = 80; // approximate height of node
    const safeDistance = nodeHeight / 2 + 50; // half height + margin

    for (let pass = 0; pass < 3; pass++) {
      for (const item of roadmapItems) {
        for (const depId of item.dependencies) {
          const A = positions.get(depId);
          const B = positions.get(item.id);
          if (!A || !B) continue;

          const xMin = Math.min(A.x, B.x);
          const xMax = Math.max(A.x, B.x);

          if (xMax - xMin < 10) continue; // same column, skip

          for (const [id, pos] of positions.entries()) {
            if (id === depId || id === item.id) continue;

            if (pos.x > xMin + 5 && pos.x < xMax - 5) {
              const t = (pos.x - A.x) / (B.x - A.x);
              const edgeY = A.y + (B.y - A.y) * t;

              const diffY = pos.y - edgeY;
              if (Math.abs(diffY) < safeDistance) {
                const shift = diffY >= 0 ? safeDistance - diffY : -safeDistance - diffY;
                const level = levels.get(id);
                const levelItems = groupedItems.get(level ?? 0) ?? [];

                for (const sibling of levelItems) {
                  const siblingPos = positions.get(sibling.id);
                  if (siblingPos && siblingPos.x === pos.x) {
                    if (shift > 0 && siblingPos.y >= pos.y) {
                      positions.set(sibling.id, { x: siblingPos.x, y: siblingPos.y + shift });
                    } else if (shift < 0 && siblingPos.y <= pos.y) {
                      positions.set(sibling.id, { x: siblingPos.x, y: siblingPos.y + shift });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Shift entire graph so that the bounding box is centered around 0
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const pos of positions.values()) {
    if (pos.x < minX) minX = pos.x;
    if (pos.x > maxX) maxX = pos.x;
    if (pos.y < minY) minY = pos.y;
    if (pos.y > maxY) maxY = pos.y;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  for (const [id, pos] of positions.entries()) {
    positions.set(id, {
      x: pos.x - centerX,
      y: pos.y - centerY,
    });
  }

  return positions;
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
  const layoutPositions = useMemo(() => getLayoutPositions(layout), [layout]);

  const nodes: Node<RoadmapNodeData>[] = useMemo(
    () =>
      visibleItems.map((item) => ({
        id: item.id,
        type: "roadmapNode",
        position: layoutPositions.get(item.id) ?? { x: 0, y: 0 },
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
    [completedSet, layout, layoutPositions, selectedId, visibleItems]
  );

  const edges: Edge[] = useMemo(
    () =>
      roadmapItems.flatMap((item) =>
        item.dependencies
          .filter((dependencyId) => visibleIds.has(dependencyId) && visibleIds.has(item.id))
          .map((dependencyId) => {
            const status = getRoadmapStatus(item, completedSet);
            const isHighlighted = selectedId
              ? item.id === selectedId || dependencyId === selectedId
              : false;

            const isDimmed = selectedId && !isHighlighted;

            let strokeColor = "#71717a"; // zinc-500 (brighter than zinc-600)
            if (status === "completed") {
              strokeColor = "#34d399";
            } else if (status === "available") {
              strokeColor = "#67e8f9";
            }

            if (isHighlighted) {
              if (status === "completed") {
                strokeColor = "#10b981"; // Bright emerald
              } else if (status === "available") {
                strokeColor = "#22d3ee"; // Bright cyan
              } else {
                strokeColor = "#cbd5e1"; // Slate-300 (clearly visible highlighted locked)
              }
            }

            const strokeWidth = isHighlighted
              ? 3.5
              : isDimmed
                ? 1.5
                : status === "available"
                  ? 2.5
                  : 2;

            return {
              id: `${dependencyId}-${item.id}`,
              source: dependencyId,
              target: item.id,
              animated: isHighlighted ? true : (isDimmed ? false : status === "available"),
              type: "default",
              zIndex: isHighlighted ? 10 : 1,
              style: {
                stroke: strokeColor,
                strokeWidth,
                transition: "stroke 0.2s, stroke-width 0.2s, opacity 0.2s",
                opacity: isHighlighted ? 1 : isDimmed ? 0.35 : 0.7,
              },
            };
          })
      ),
    [completedSet, visibleIds, selectedId]
  );

  return (
    <main className="h-dvh overflow-hidden bg-neutral-950 text-white">
      <div className="flex h-dvh flex-col">
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
              <Controls className="roadmap-controls" />
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
