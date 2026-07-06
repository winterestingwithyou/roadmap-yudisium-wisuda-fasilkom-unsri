import { motion } from "framer-motion";
import { Check, Clock3, ExternalLink, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { roadmapItemMap } from "~/data/roadmap";
import { getBlockedDependencies, getRoadmapStatus } from "~/lib/roadmap";
import { cn } from "~/lib/utils";
import { useRoadmapStore } from "~/store/roadmap-store";
import type { RoadmapItem, RoadmapNodeId } from "~/types/roadmap";

const statusLabel = {
  completed: "Selesai",
  available: "Bisa dikerjakan",
  locked: "Terkunci",
  "coming-soon": "Coming Soon",
};

type RoadmapDetailsProps = {
  item: RoadmapItem;
  compact?: boolean;
};

function DependencyPill({
  id,
  completedIds,
}: {
  id: RoadmapNodeId;
  completedIds: Set<RoadmapNodeId>;
}) {
  const item = roadmapItemMap.get(id);
  const done = completedIds.has(id);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
        done
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-zinc-700 bg-zinc-900 text-zinc-300"
      )}
    >
      {done ? <Check className="size-3" /> : <LockKeyhole className="size-3" />}
      {item?.title ?? id}
    </span>
  );
}

export function RoadmapDetails({ item, compact = false }: RoadmapDetailsProps) {
  const completedIds = useRoadmapStore((state) => state.completedIds);
  const completeNode = useRoadmapStore((state) => state.completeNode);
  const uncompleteNode = useRoadmapStore((state) => state.uncompleteNode);
  const completedSet = new Set(completedIds);
  const status = getRoadmapStatus(item, completedSet);
  const blockedDependencies = getBlockedDependencies(item, completedSet);
  const canComplete = status === "available";
  const canForceComplete = status === "locked";

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn("flex h-full flex-col", compact ? "gap-5" : "gap-6")}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-zinc-300">
            {statusLabel[status]}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
            <Clock3 className="size-3.5" />
            {item.estimate ?? "Belum tersedia"}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-white">{item.title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{item.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white">Syarat Pendahulu</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.dependencies.length > 0 ? (
            item.dependencies.map((dependencyId) => (
              <DependencyPill
                key={dependencyId}
                id={dependencyId}
                completedIds={completedSet}
              />
            ))
          ) : (
            <span className="text-sm text-zinc-400">Tidak ada syarat pendahulu.</span>
          )}
        </div>
      </div>

      {blockedDependencies.length > 0 && (
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          Syarat ini belum bisa dikerjakan karena masih menunggu{" "}
          {blockedDependencies
            .map((dependencyId) => roadmapItemMap.get(dependencyId)?.title ?? dependencyId)
            .join(", ")}
          .
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-white">Link</h3>
        <div className="mt-3">
          {item.links.length > 0 ? (
            item.links.map((link) => (
              <a
                key={link.href}
                className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <ExternalLink className="size-3.5" />
              </a>
            ))
          ) : (
            <span className="text-sm text-zinc-400">Belum ada link.</span>
          )}
        </div>
      </div>

      <div className="mt-auto grid gap-2">
        {status === "completed" ? (
          <Button
            type="button"
            variant="outline"
            className="border-red-400/30 bg-red-400/10 text-red-100 hover:bg-red-400/20"
            onClick={() => uncompleteNode(item.id)}
          >
            <RotateCcw className="size-4" />
            Tandai Belum Selesai
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={!canComplete}
              onClick={() => completeNode(item.id)}
              className="bg-cyan-300 text-neutral-950 hover:bg-cyan-200"
            >
              <Check className="size-4" />
              Tandai Selesai
            </Button>
            {canForceComplete && (
              <Button
                type="button"
                variant="outline"
                className="border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                onClick={() => completeNode(item.id, true)}
              >
                <Sparkles className="size-4" />
                Tetap Selesaikan
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
