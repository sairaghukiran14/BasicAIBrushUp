"use client";

import { useMemo, useState } from "react";
import { projects, searchIndex, TIER_NAME, type Tier } from "@/data/projects";
import ProjectEntry from "./ProjectEntry";

const INDEX = projects.map((p) => ({ project: p, haystack: searchIndex(p) }));
const TIERS: Tier[] = [1, 2, 3];

export default function CatalogBrowser({ initialTier = "all" }: { initialTier?: "all" | Tier }) {
  const [tier, setTier] = useState<"all" | Tier>(initialTier);
  const [term, setTerm] = useState("");

  const shown = useMemo(() => {
    const q = term.trim().toLowerCase();
    return INDEX.filter(
      ({ project, haystack }) => (tier === "all" || project.tier === tier) && (q === "" || haystack.includes(q)),
    ).map(({ project }) => project);
  }, [tier, term]);

  return (
    <>
      <div className="filters">
        <button type="button" className="chip" aria-pressed={tier === "all"} onClick={() => setTier("all")}>
          All 30
        </button>
        {TIERS.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={tier === t} onClick={() => setTier(t)}>
            {TIER_NAME[t]}
          </button>
        ))}

        <input
          className="search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="filter by industry, technique, format…"
          aria-label="Filter projects by industry, technique or format"
        />

        <span className="count" role="status">
          {shown.length} shown
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="empty">No project matches that filter.</p>
      ) : (
        shown.map((p) => <ProjectEntry key={p.slug} project={p} />)
      )}
    </>
  );
}
