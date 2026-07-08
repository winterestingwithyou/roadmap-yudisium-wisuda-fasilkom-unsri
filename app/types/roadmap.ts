export type RoadmapNodeId = string;

export type BaseRoadmapStatus = "available" | "coming-soon";

export type RoadmapCategory =
  | "academic"
  | "document"
  | "exam"
  | "graduation"
  | "library"
  | "repository"
  | "yudisium";

export type RoadmapDifficulty = "easy" | "medium" | "hard";

export type DurationType = "active" | "waiting";

export type ComputedRoadmapStatus =
  | "completed"
  | "available"
  | "locked"
  | "coming-soon";

export type RoadmapLink = {
  label: string;
  href: string;
};

export type RoadmapItem = {
  id: RoadmapNodeId;
  title: string;
  category: RoadmapCategory;
  baseStatus: BaseRoadmapStatus;
  difficulty: RoadmapDifficulty;
  location: string;
  description: string;
  estimate?: string;
  durationType: DurationType;
  estimateMin: number;
  estimateMax: number;
  requirements: string[];
  dependencies: RoadmapNodeId[];
  warnings: string[];
  tips: string[];
  links: RoadmapLink[];
};

export type RoadmapFilter = "all" | ComputedRoadmapStatus;

export type RoadmapLayout = "vertical" | "horizontal";
