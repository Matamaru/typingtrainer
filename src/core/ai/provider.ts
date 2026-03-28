import type { Lesson } from "../../shared/types/domain";

export type DrillGenerationRequest = {
  focusAreas: string[];
  language: "prose" | "python" | "micropython" | "c";
  strictness: "strict" | "guided" | "relaxed";
};

export interface LocalAiProvider {
  generateDrillLesson(request: DrillGenerationRequest): Promise<Lesson>;
}
