"use client";

import { useMemo, useState } from "react";
import { agents, agentSearchIndex, LEVEL_NAME, type Level } from "@/data/agents";
import AgentEntry from "./AgentEntry";

const INDEX = agents.map((a) => ({ agent: a, haystack: agentSearchIndex(a) }));
const LEVELS: Level[] = [1, 2, 3];

export default function AgentBrowser() {
  const [level, setLevel] = useState<"all" | Level>("all");
  const [term, setTerm] = useState("");

  const shown = useMemo(() => {
    const q = term.trim().toLowerCase();
    return INDEX.filter(
      ({ agent, haystack }) => (level === "all" || agent.level === level) && (q === "" || haystack.includes(q)),
    ).map(({ agent }) => agent);
  }, [level, term]);

  return (
    <>
      <div className="filters">
        <button type="button" className="chip" aria-pressed={level === "all"} onClick={() => setLevel("all")}>
          All 30
        </button>
        {LEVELS.map((l) => (
          <button key={l} type="button" className="chip" aria-pressed={level === l} onClick={() => setLevel(l)}>
            L{l} {LEVEL_NAME[l]}
          </button>
        ))}

        <input
          className="search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="filter by domain, tool, guardrail…"
          aria-label="Filter agents by domain, tool or guardrail"
        />

        <span className="count" role="status">
          {shown.length} shown
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="empty">No agent matches that filter.</p>
      ) : (
        <div className="runs">
          {shown.map((a) => (
            <AgentEntry key={a.slug} agent={a} />
          ))}
        </div>
      )}
    </>
  );
}
