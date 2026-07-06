import { useEffect } from "react";
import { useRoadmapStore } from "~/store/roadmap-store";

export function useRoadmapHydration() {
  const hydrate = useRoadmapStore((state) => state.hydrate);
  const isHydrated = useRoadmapStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      void hydrate();
    }
  }, [hydrate, isHydrated]);

  return isHydrated;
}
