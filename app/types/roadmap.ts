export type RoadmapNodeId =
  | "repository"
  | "book"
  | "library"
  | "sks112"
  | "usept"
  | "yudisium"
  | "graduation";

export type BaseRoadmapStatus = "available" | "coming-soon";

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
  baseStatus: BaseRoadmapStatus;
  description: string;
  estimate?: string;
  dependencies: RoadmapNodeId[];
  links: RoadmapLink[];
  position: {
    x: number;
    y: number;
  };
};

export type RoadmapFilter = "all" | ComputedRoadmapStatus;

export type RoadmapLayout = "vertical" | "horizontal";
