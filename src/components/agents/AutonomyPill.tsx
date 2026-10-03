import { LEVEL_NAME, type Level } from "@/data/agents";

export default function AutonomyPill({ level }: { level: Level }) {
  return (
    <span className={`pill lv${level}`}>
      <span className="steps" aria-hidden="true">
        <i className={level >= 1 ? "on" : ""} />
        <i className={level >= 2 ? "on" : ""} />
        <i className={level >= 3 ? "on" : ""} />
      </span>
      L{level} · {LEVEL_NAME[level]}
    </span>
  );
}
