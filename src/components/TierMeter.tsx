import type { Tier } from "@/data/projects";
import { TIER_NAME } from "@/data/projects";

export default function TierMeter({ tier, showLabel = true }: { tier: Tier; showLabel?: boolean }) {
  return (
    <>
      <div className="meter" role="img" aria-label={`Difficulty: ${TIER_NAME[tier]}, ${tier} of 3`}>
        <i />
        <i />
        <i />
      </div>
      {showLabel ? <div className="tier-name">{TIER_NAME[tier]}</div> : null}
    </>
  );
}
