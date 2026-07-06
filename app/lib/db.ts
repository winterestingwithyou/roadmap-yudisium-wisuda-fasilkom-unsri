import Dexie, { type Table } from "dexie";
import type { RoadmapNodeId } from "~/types/roadmap";

type ProgressRecord = {
  id: RoadmapNodeId;
  completedAt: string;
};

class RoadmapDatabase extends Dexie {
  progress!: Table<ProgressRecord, RoadmapNodeId>;

  constructor() {
    super("fasilkom-unsri-roadmap");
    this.version(1).stores({
      progress: "id, completedAt",
    });
  }
}

export const roadmapDb = new RoadmapDatabase();

export async function loadCompletedProgress() {
  const rows = await roadmapDb.progress.toArray();
  return rows.map((row) => row.id);
}

export async function saveCompletedProgress(ids: RoadmapNodeId[]) {
  const completedAt = new Date().toISOString();

  await roadmapDb.transaction("rw", roadmapDb.progress, async () => {
    await roadmapDb.progress.clear();
    await roadmapDb.progress.bulkPut(ids.map((id) => ({ id, completedAt })));
  });
}
