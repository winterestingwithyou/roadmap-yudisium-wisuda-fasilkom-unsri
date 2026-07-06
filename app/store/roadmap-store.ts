import { create } from "zustand";
import { loadCompletedProgress, saveCompletedProgress } from "~/lib/db";
import { getDependencyTreeIds, getDescendantTreeIds } from "~/lib/roadmap";
import type { RoadmapFilter, RoadmapLayout, RoadmapNodeId } from "~/types/roadmap";

type RoadmapState = {
  completedIds: RoadmapNodeId[];
  selectedId: RoadmapNodeId;
  filter: RoadmapFilter;
  layout: RoadmapLayout;
  query: string;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  selectNode: (id: RoadmapNodeId) => void;
  setFilter: (filter: RoadmapFilter) => void;
  setLayout: (layout: RoadmapLayout) => void;
  setQuery: (query: string) => void;
  completeNode: (id: RoadmapNodeId, includeDependencies?: boolean) => void;
  uncompleteNode: (id: RoadmapNodeId) => void;
};

function persist(completedIds: RoadmapNodeId[]) {
  void saveCompletedProgress(completedIds);
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  completedIds: [],
  selectedId: "repository",
  filter: "all",
  layout: "vertical",
  query: "",
  isHydrated: false,
  hydrate: async () => {
    const completedIds = await loadCompletedProgress();
    set({ completedIds, isHydrated: true });
  },
  selectNode: (id) => set({ selectedId: id }),
  setFilter: (filter) => set({ filter }),
  setLayout: (layout) => set({ layout }),
  setQuery: (query) => set({ query }),
  completeNode: (id, includeDependencies = false) => {
    const next = new Set(get().completedIds);

    if (includeDependencies) {
      for (const dependencyId of getDependencyTreeIds(id)) {
        next.add(dependencyId);
      }
    }

    next.add(id);
    const completedIds = Array.from(next);
    set({ completedIds });
    persist(completedIds);
  },
  uncompleteNode: (id) => {
    const next = new Set(get().completedIds);

    next.delete(id);

    for (const descendantId of getDescendantTreeIds(id)) {
      next.delete(descendantId);
    }

    const completedIds = Array.from(next);
    set({ completedIds });
    persist(completedIds);
  },
}));
