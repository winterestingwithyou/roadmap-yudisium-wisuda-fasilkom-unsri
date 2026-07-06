import type { Route } from "./+types/home";
import { RoadmapApp } from "~/features/roadmap/roadmap-app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roadmap Yudisium & Wisuda FASILKOM UNSRI" },
    {
      name: "description",
      content:
        "Roadmap interaktif syarat yudisium dan wisuda FASILKOM UNSRI berbasis alur syarat.",
    },
  ];
}

export default function Home() {
  return <RoadmapApp />;
}
