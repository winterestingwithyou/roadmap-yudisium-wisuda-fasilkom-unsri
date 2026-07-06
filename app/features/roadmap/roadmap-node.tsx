import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { Check, Clock, LockKeyhole, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ComputedRoadmapStatus, RoadmapItem } from "~/types/roadmap";

export type RoadmapNodeData = {
  item: RoadmapItem;
  status: ComputedRoadmapStatus;
  dependencyCount: number;
};

const statusConfig: Record<
  ComputedRoadmapStatus,
  {
    label: string;
    className: string;
    icon: typeof Check;
  }
> = {
  completed: {
    label: "Selesai",
    className: "border-emerald-400/70 bg-emerald-400/15 text-emerald-100 shadow-emerald-500/20",
    icon: Check,
  },
  available: {
    label: "Bisa dikerjakan",
    className: "border-cyan-300/70 bg-cyan-300/15 text-cyan-50 shadow-cyan-500/20",
    icon: Sparkles,
  },
  locked: {
    label: "Terkunci",
    className: "border-zinc-600 bg-zinc-900/85 text-zinc-300 shadow-black/20",
    icon: LockKeyhole,
  },
  "coming-soon": {
    label: "Coming soon",
    className: "border-amber-300/70 bg-amber-300/15 text-amber-50 shadow-amber-500/20",
    icon: Clock,
  },
};

function RoadmapNode({ data, selected }: NodeProps) {
  const nodeData = data as RoadmapNodeData;
  const { item, status, dependencyCount } = nodeData;
  const Icon = statusConfig[status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: selected ? 1.04 : 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-[230px] rounded-lg border p-4 shadow-xl backdrop-blur-md transition-colors",
        statusConfig[status].className,
        selected && "ring-2 ring-white/70"
      )}
    >
      <Handle type="target" position={Position.Left} className="!border-neutral-950 !bg-white" />
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-[0.68rem] font-semibold uppercase tracking-normal text-current/70">
            {statusConfig[status].label}
          </div>
          <div className="mt-1 text-sm font-semibold leading-snug text-white">{item.title}</div>
          <div className="mt-2 text-xs leading-relaxed text-current/70">
            {item.estimate ?? "Menunggu info"} · {dependencyCount} dependency
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!border-neutral-950 !bg-white" />
    </motion.div>
  );
}

export default memo(RoadmapNode);
