import { roadmapItems, roadmapItemMap } from "~/data/roadmap";
import type {
  ComputedRoadmapStatus,
  RoadmapFilter,
  RoadmapItem,
  RoadmapNodeId,
} from "~/types/roadmap";

export function getRoadmapStatus(
  item: RoadmapItem,
  completedIds: Set<RoadmapNodeId>
): ComputedRoadmapStatus {
  if (completedIds.has(item.id)) {
    return "completed";
  }

  if (item.baseStatus === "coming-soon") {
    return "coming-soon";
  }

  return item.dependencies.every((dependencyId) => completedIds.has(dependencyId))
    ? "available"
    : "locked";
}

export function getDependencyTreeIds(id: RoadmapNodeId) {
  const dependencies = new Set<RoadmapNodeId>();

  function visit(currentId: RoadmapNodeId) {
    const currentItem = roadmapItemMap.get(currentId);

    if (!currentItem) {
      return;
    }

    for (const dependencyId of currentItem.dependencies) {
      if (!dependencies.has(dependencyId)) {
        dependencies.add(dependencyId);
        visit(dependencyId);
      }
    }
  }

  visit(id);
  return dependencies;
}

export function getDescendantTreeIds(id: RoadmapNodeId) {
  const descendants = new Set<RoadmapNodeId>();

  function visit(currentId: RoadmapNodeId) {
    for (const item of roadmapItems) {
      if (item.dependencies.includes(currentId) && !descendants.has(item.id)) {
        descendants.add(item.id);
        visit(item.id);
      }
    }
  }

  visit(id);
  return descendants;
}

export function getBlockedDependencies(
  item: RoadmapItem,
  completedIds: Set<RoadmapNodeId>
) {
  return item.dependencies.filter((dependencyId) => !completedIds.has(dependencyId));
}

export function matchesRoadmapFilter(
  item: RoadmapItem,
  completedIds: Set<RoadmapNodeId>,
  filter: RoadmapFilter,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();
  const status = getRoadmapStatus(item, completedIds);
  const matchesFilter = filter === "all" || filter === status;
  const dependencyText = item.dependencies
    .map((dependencyId) => roadmapItemMap.get(dependencyId)?.title ?? dependencyId)
    .join(" ");
  const matchesQuery =
    normalizedQuery.length === 0 ||
    `${item.title} ${item.description} ${dependencyText}`
      .toLowerCase()
      .includes(normalizedQuery);

  return matchesFilter && matchesQuery;
}

export function getProgress(completedIds: Set<RoadmapNodeId>) {
  const completableItems = roadmapItems.filter((item) => item.baseStatus !== "coming-soon");
  const completedCount = completableItems.filter((item) => completedIds.has(item.id)).length;
  const percentage =
    completableItems.length === 0
      ? 0
      : Math.round((completedCount / completableItems.length) * 100);

  return {
    completedCount,
    totalCount: completableItems.length,
    percentage,
  };
}
