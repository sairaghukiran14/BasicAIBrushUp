"use client";

import { useMemo, useState } from "react";
import { DOMAIN_BLURB, DOMAIN_LABEL, domains, terms, termAnchor, type Domain } from "@/data/glossary";

const INDEX = terms.map((term) => ({
  term,
  haystack: `${term.t} ${term.def} ${term.why} ${term.ex}`.toLowerCase(),
}));

export default function GlossaryBrowser() {
  const [domain, setDomain] = useState<"all" | Domain>("all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = INDEX.filter(
      ({ term, haystack }) => (domain === "all" || term.d === domain) && (q === "" || haystack.includes(q)),
    ).map(({ term }) => term);

    return domains
      .map((d) => ({ d, items: matched.filter((t) => t.d === d).sort((a, b) => a.t.localeCompare(b.t)) }))
      .filter((group) => group.items.length > 0);
  }, [domain, query]);

  const total = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <div className="filters">
        <button type="button" className="chip" aria-pressed={domain === "all"} onClick={() => setDomain("all")}>
          All {terms.length}
        </button>
        {domains.map((d) => (
          <button
            key={d}
            type="button"
            className={`chip chip-${d}`}
            aria-pressed={domain === d}
            onClick={() => setDomain(d)}
          >
            {DOMAIN_LABEL[d]}
          </button>
        ))}

        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="find a term…"
          aria-label="Search the glossary"
        />

        <span className="count" role="status">
          {total} shown
        </span>
      </div>

      {total === 0 ? (
        <p className="empty">No term matches that. Try a shorter word — the search covers definitions too.</p>
      ) : (
        shown.map((group) => (
          <section className="gloss-group" key={group.d} id={group.d}>
            <div className={`gloss-head dom-${group.d}`}>
              <h2>{DOMAIN_LABEL[group.d]}</h2>
              <p>{DOMAIN_BLURB[group.d]}</p>
            </div>

            <dl className="gloss">
              {group.items.map((term) => (
                <div className={`entry-term dom-${term.d}`} key={term.t} id={termAnchor(term.t)}>
                  <dt>{term.t}</dt>
                  <dd>
                    <p className="def">{term.def}</p>
                    <p className="so-what">{term.why}</p>
                    <p className="eg">
                      <span className="eg-tag">e.g.</span>
                      {term.ex}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </>
  );
}
