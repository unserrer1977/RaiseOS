import type { Intake } from "@/lib/types";
import { selectFollowUps } from "@/lib/venture/rules";

/** Venture rule misses used in the report (not shown to the angel as a form). */
export function angelStructuralGaps(intake: Intake) {
  return selectFollowUps(intake);
}
