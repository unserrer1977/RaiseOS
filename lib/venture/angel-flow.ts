import type { Intake } from "@/lib/types";
import { selectFollowUps } from "@/lib/venture/rules";

/** Venture rule gaps that need the angel’s off-deck knowledge (0–4). */
export function angelGapQuestions(intake: Intake) {
  return selectFollowUps(intake);
}

export function angelNeedsGapStep(intake: Intake): boolean {
  return angelGapQuestions(intake).length > 0;
}
