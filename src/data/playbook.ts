export type Row = string[];

export const chunkingTable: { head: Row; rows: Row[] } = {
  head: ["Content type", "Chunking strategy", "Why"],
  rows: [
    ["Prose / policy", "Recursive, 400 tok, 15% overlap, heading path prepended", "Overlap saves answers that straddle a boundary"],
    ["Legal contracts", "Clause-level segmentation, one clause per chunk", "The clause is the unit people actually argue about"],
    ["API / code docs", "Section-level, code fences kept whole", "A half-snippet is worse than no snippet"],
    ["Tables", "Row-wise with headers repeated, plus a table summary chunk", "Lets both “what is the fee” and “what does this table cover” hit"],
    ["Transcripts", "Speaker turns grouped to ~60s, timestamps preserved", "Citation must be playable, not approximate"],
    ["Tickets / logs", "One event or ticket per chunk, templated fields", "They are already atomic — do not merge them"],
  ],
};

export const latencyTable: { head: Row; rows: Row[] } = {
  head: ["Stage", "Typical p95", "How it gets slow", "The lever"],
  rows: [
    ["Query rewrite", "80 ms", "Big model for a small job", "Small fast model; skip when there is no history"],
    ["Embed query", "15 ms", "Cold remote call per request", "Co-locate or cache; batch under load"],
    ["ANN + BM25 search", "40 ms", "efSearch cranked for recall", "Run channels in parallel; tune on the recall–latency curve"],
    ["Fusion (RRF)", "2 ms", "—", "—"],
    ["Rerank 100 → 8", "120 ms", "Reranking everything, sequentially", "Cap candidates; batch; distilled reranker"],
    ["Context assembly", "10 ms", "Re-fetching parent docs one by one", "Multi-get; keep parents in a KV store"],
    ["Generation (TTFT)", "500 ms", "Huge prompt, no streaming", "Stream; cut k; cache the static prompt prefix"],
    ["Grounding check", "60 ms", "A second full LLM pass", "Check citations by string match; sample the LLM audit"],
    ["Total before first token", "≈ 830 ms", "—", "Everything above runs before the user sees a word"],
  ],
};

export const evalTable: { head: Row; rows: Row[] } = {
  head: ["Layer", "Metric", "Ship target", "What it tells you"],
  rows: [
    ["Retrieval", "Recall@20", "≥ 0.90", "Is the answer even in the candidate set — the ceiling on everything downstream"],
    ["Retrieval", "nDCG@10", "≥ 0.70", "Is the reranker putting the right passage first"],
    ["Generation", "Faithfulness", "≥ 0.95", "Every claim traceable to a retrieved passage"],
    ["Generation", "Citation precision", "≥ 0.90", "The cited passage actually supports the sentence"],
    ["Generation", "Abstention accuracy", "≥ 0.90", "Refuses when it should, answers when it can"],
    ["Online", "Deflection / accept rate", "domain-set", "Whether the system is worth running at all"],
    ["Online", "p95 latency, cost per query", "budgeted", "Whether it survives contact with traffic"],
  ],
};

export const failureTable: { head: Row; rows: Row[] } = {
  head: ["Symptom", "Usual cause", "Fix"],
  rows: [
    [
      "The right document exists but never comes back",
      "Chunks too large; no lexical channel; jargon the embedder never saw",
      "Add BM25 and fuse; shrink chunks; verify with recall@50 before touching anything else",
    ],
    [
      "Retrieval looks right, answer is wrong",
      "Too many passages, the best one buried mid-prompt",
      "Rerank, cut to 5–8, best first, cite per claim",
    ],
    [
      "Confidently answers what it does not know",
      "No abstention gate and no unanswerable questions in the eval set",
      "Score threshold before the model call; add refusal cases to the golden set",
    ],
    [
      "Cites a superseded or deleted document",
      "No effective-date metadata; rebuild-only indexing",
      "Effective-date filters; tombstones on delete; staleness alert",
    ],
    [
      "Table questions get the wrong number",
      "Table split mid-way; headers lost in the chunk",
      "Table-aware parsing; row-wise serialisation; a summary chunk per table",
    ],
    [
      "Fast in dev, slow in production",
      "Sequential calls, efSearch too high, no caching, cold embedder",
      "Parallelise channels; tune on the recall–latency curve; add all three caches",
    ],
    [
      "Cost per query keeps climbing",
      "Reranking everything, 30-passage prompts, large model for every step",
      "Cascade; cap context tokens; small models for rewrite and classify",
    ],
    [
      "A user sees another tenant's content",
      "Filtering applied after retrieval",
      "ACL tags in the index, pre-filtered search, 10k-probe permission audit in CI",
    ],
  ],
};

export type Rung = { id: string; title: string; body: string; note: string };

export const qualityLadder: Rung[] = [
  { id: "R1", title: "Dense top-k", body: "One embedding, one index, k=5. The baseline you should never ship but must measure.", note: "baseline" },
  { id: "R2", title: "Hybrid + metadata filters", body: "BM25 alongside dense, fused with RRF, pre-filtered by tenant, date, product, language.", note: "+10–25 recall" },
  { id: "R3", title: "Cross-encoder reranking", body: "Score 100 candidates jointly with the query. Fixes precision and lets you shrink the prompt.", note: "+10–20 nDCG" },
  { id: "R4", title: "Query transformation", body: "Rewrite with conversation history, extract filters, decompose multi-part questions, HyDE on sparse corpora.", note: "fixes hard queries" },
  { id: "R5", title: "Agentic and graph retrieval", body: "A planner that routes to SQL, vector or graph traversal and retrieves in several passes. Only when the question genuinely spans documents.", note: "multi-hop only" },
];

export const buildPath: Rung[] = [
  { id: "P1", title: "Golden set, before any code", body: "50 real questions from real users, the passages that answer them, and 10 that nothing answers. Without this you are tuning blind.", note: "1–2 days" },
  { id: "P2", title: "Thin end-to-end slice", body: "One corpus, layout-aware parsing, fixed chunking, dense retrieval, citations rendered. Measure recall@20 and faithfulness. Do not optimise yet.", note: "week 1" },
  { id: "P3", title: "Fix retrieval", body: "Hybrid + RRF, metadata filters, cross-encoder rerank, small-to-big context. Re-measure after each change, one at a time.", note: "week 2" },
  { id: "P4", title: "Fix generation", body: "Prompt with cite-or-abstain, the score-threshold gate, structured output, grounding check on the response.", note: "week 3" },
  { id: "P5", title: "Make it fast and cheap", body: "Three caches, parallel retrieval channels, int8 quantisation, streaming, model right-sizing. Hold the latency table.", note: "week 4" },
  { id: "P6", title: "Make it operable", body: "Incremental indexing with tombstones, ACL pre-filtering, full request logging, CI eval gate, feedback loop into the golden set.", note: "ongoing" },
];

export const antiPatterns: string[] = [
  "Reaching for a framework abstraction before you can explain your own retrieval scores. Frameworks are fine — starting there means you cannot debug what they hide.",
  "One giant knowledge base spanning unrelated domains. Separate corpora with a router beat one index that dilutes every query.",
  "Evaluating by vibes in a demo. Three people trying ten questions is not a measurement.",
  "Re-embedding the entire corpus on every content change, then wondering why indexing costs more than inference.",
  "Stuffing fifty passages in “just in case”. It lowers accuracy and raises the bill at the same time.",
  "Treating a bigger model as the fix for bad retrieval. If the passage is not in the prompt, no model can read it.",
];

export const playbookSections = [
  { id: "loops", label: "The two loops" },
  { id: "parse", label: "01 Parse" },
  { id: "chunk", label: "02 Chunk" },
  { id: "embed", label: "03 Embed" },
  { id: "retrieve", label: "04 Retrieve" },
  { id: "assemble", label: "05 Assemble" },
  { id: "generate", label: "06 Generate" },
  { id: "budget", label: "07 Latency" },
  { id: "scale", label: "08 Scale" },
  { id: "eval", label: "09 Evaluate" },
  { id: "failures", label: "Failure modes" },
  { id: "path", label: "Build path" },
];
