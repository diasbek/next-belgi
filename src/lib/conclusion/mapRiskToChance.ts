import type { ClassRisk } from "@/lib/check/types";
import type { ConclusionClassVerdict } from "./types";

/** Map class risk percent (conflict risk) → chance of positive expertise. */
export function mapRiskToChance(risk: ClassRisk): ConclusionClassVerdict {
  const conflict = Math.max(0, Math.min(100, risk.percent));
  let chanceMin: number;
  let chanceMax: number;

  if (conflict >= 70) {
    chanceMin = 5;
    chanceMax = 15;
  } else if (conflict >= 40) {
    chanceMin = 25;
    chanceMax = 40;
  } else if (conflict >= 20) {
    chanceMin = 45;
    chanceMax = 60;
  } else if (conflict > 0) {
    chanceMin = 60;
    chanceMax = 80;
  } else {
    chanceMin = 70;
    chanceMax = 85;
  }

  return {
    classNumber: risk.classNumber,
    chanceMin,
    chanceMax,
    chanceLabel: `${chanceMin}–${chanceMax}%`,
  };
}

export function mapRisksToVerdict(
  risks: ClassRisk[],
): ConclusionClassVerdict[] {
  if (!risks.length) {
    return [
      {
        classNumber: 0,
        chanceMin: 60,
        chanceMax: 80,
        chanceLabel: "60–80%",
      },
    ];
  }
  return risks.map(mapRiskToChance);
}
