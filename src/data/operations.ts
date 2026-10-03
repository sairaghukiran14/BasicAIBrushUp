export type Row = string[];
export type Table = { head: Row; rows: Row[] };

/** Column 2 is the RAG side, column 3 the agent side, in every table on this page. */
export const SPLIT_HEAD_CLASSES = [undefined, "col-rag", "col-agt"] as const;

export const instrumentTable: Table = {
  head: ["Emit", "In a RAG system", "In an agent", "Why it earns its storage"],
  rows: [
    [
      "Trace id + span per stage",
      "rewrite, retrieve, rerank, generate, check",
      "every loop turn: decide, gate, act, observe",
      "Without spans you can only see total latency, which tells you nothing about which stage moved",
    ],
    [
      "Retrieved ids and scores",
      "chunk ids, channel, pre- and post-rerank scores",
      "same, for every retrieval the agent performs",
      "The only way to answer “was the passage even there” after the fact",
    ],
    [
      "Decision record",
      "abstained or answered, and the threshold it cleared",
      "tool chosen, arguments, gate verdict, why",
      "Turns an angry ticket into a five-minute replay instead of a theory",
    ],
    [
      "Token and cost meter",
      "context tokens in, tokens out, per model",
      "the same, per step, plus the running task total",
      "Cost is a per-request property; aggregated monthly billing cannot be debugged",
    ],
    [
      "Outcome signal",
      "citation coverage, thumbs, escalation, reformulation",
      "task success against a checkable end state, interventions",
      "The quality metric you actually optimise, joined to the trace that produced it",
    ],
    [
      "Version stamp",
      "prompt, model, embedding model, index version",
      "prompt, model, tool schema version, policy version",
      "Every quality shift is a change in one of these; without stamps you cannot bisect",
    ],
    [
      "Cache disposition",
      "exact, semantic, retrieval or miss",
      "tool-result cache hit or miss",
      "Cache hit rate is a cost SLI, and a silent drop is a bill increase nobody notices",
    ],
    [
      "Safety events",
      "ACL filter applied, refusal fired, PII redacted",
      "gate denial, approval requested, rollback executed",
      "These are the events you will be asked about; they must be queryable, not grepped",
    ],
  ],
};

export const sloTable: Table = {
  head: ["Dimension", "SLI — how you measure it", "Starting SLO", "Alert when"],
  rows: [
    ["Availability", "Requests that returned a usable answer or a clean refusal ÷ total", "99.9%", "Fast burn: 2% of the monthly budget in an hour"],
    ["Latency (RAG)", "p95 time to first token, measured at the edge", "< 2.0 s", "p95 above target for 10 minutes"],
    ["Latency (agent)", "p50 and p95 task completion, plus time to first visible progress", "p95 < 3× p50", "The ratio widens — the tail is where cost hides"],
    ["Quality (RAG)", "Faithfulness and citation precision on a weekly stratified sample", "≥ 0.95 / ≥ 0.90", "Two consecutive samples below target"],
    ["Quality (agent)", "Task success against a checkable end state, on the eval suite and in production", "domain-set", "Any drop greater than the sample's confidence interval"],
    ["Freshness", "Source change to searchable, p95", "< 5 min", "Staleness p95 doubles, or the indexer queue grows monotonically"],
    ["Safety", "ACL violations, gate bypasses, unapproved irreversible actions", "0", "Any occurrence — this is a page, not a dashboard tile"],
    ["Containment", "Deflection rate (RAG) · human intervention rate (agent)", "trending", "A step change in either direction — both mean behaviour changed"],
    ["Cost", "Cost per answered query · cost per completed task, p50 and p95", "budgeted", "p95 cost per unit exceeds 2× p50, or the daily total breaks its ceiling"],
  ],
};

export const qualityTable: Table = {
  head: ["Layer", "Cadence", "In a RAG system", "In an agent"],
  rows: [
    [
      "Golden set in CI",
      "Every change to prompt, model, index or tools",
      "Recall@20, nDCG@10, faithfulness, citation precision, abstention accuracy",
      "Task success on a fixed suite, tool-argument validity, guardrail violations at zero",
    ],
    [
      "Online proxies",
      "Continuous",
      "Thumbs, reformulation rate, escalation rate, citation click-through, refusal rate",
      "Intervention rate, retries per task, steps to success, rollback rate, abandonment",
    ],
    [
      "Human audit",
      "Weekly, stratified sample",
      "Score 150–200 answers on faithfulness and usefulness with a written rubric",
      "Replay 50–100 traces and grade end state plus whether the path was defensible",
    ],
    [
      "Drift watch",
      "Daily",
      "Query mix, retrieval score distribution, no-result rate, corpus growth",
      "Tool-error rates, step-count distribution, novel argument values, gate-denial mix",
    ],
    [
      "Adversarial",
      "Per release",
      "Prompt-injection corpus, unanswerable questions, cross-tenant probes",
      "Injected instructions in tool output, budget-exhaustion cases, irreversible-action attempts",
    ],
  ],
};

export const reliabilityTable: Table = {
  head: ["Dependency", "How it fails", "Detect it with", "Degrade to"],
  rows: [
    ["Embedding service", "Timeouts under load, or a silent model version change", "Latency p95 and vector-norm drift on a canary text", "Cached query embeddings; queue ingestion rather than drop it"],
    ["Vector index", "Node loss, rebuild in progress, shard unavailable", "Health per shard plus recall on a fixed probe set", "Lexical-only retrieval, response marked degraded"],
    ["Reranker", "Latency spike when candidate counts grow", "Time per candidate, not just total", "Skip reranking, cut k, tell the caller the answer is unranked"],
    ["LLM provider", "429s, 5xx, capacity brownouts, deprecation of a pinned model", "Error rate by status, TTFT, and a daily pinned-model check", "Retry with jitter → fallback model → queue with a promise, never a spinner"],
    ["Tool or downstream API (agent)", "Partial success: the write landed, the response did not", "Read-back verification after every write", "Retry with the same idempotency key; then compensating action; then escalate"],
    ["Orchestrator (agent)", "Crash or deploy mid-task", "Checkpoint age and orphaned-run count", "Resume from the last committed step — never restart a task that wrote"],
    ["Source systems (ingest)", "Schema change, auth expiry, silent truncation", "Row counts, parse-failure rate, dead-letter depth", "Keep serving the last good index and alert on staleness, rather than indexing garbage"],
  ],
};

export const latencyFactorTable: Table = {
  head: ["Factor", "Effect on a RAG answer", "Effect on an agent task", "The lever"],
  rows: [
    ["Context size", "Linear in prefill; dominates TTFT", "Compounds — every step carries the accumulated history", "Cut k, compact observations, cache the static prefix"],
    ["Step or stage count", "Fixed: 6–8 stages", "Variable: this is the whole tail, 4 steps or 40", "Step caps, better stopping rules, decompose long tasks"],
    ["Sequential calls", "Retrieval channels run one after another", "Independent tool calls run one after another", "Parallelise anything without a data dependency"],
    ["Model size", "Chosen once for the answer", "Chosen per step, and most steps are routing or extraction", "Route small models to the frequent cheap steps"],
    ["Retrieval breadth", "efSearch and candidate count trade recall for milliseconds", "Same, per retrieval, multiplied by steps", "Tune on the recall–latency curve, not by feel"],
    ["Queueing", "Rare — one request, one worker", "Real: concurrency limits and provider rate limits", "Per-tenant queues, backpressure, admission control"],
    ["Human in the loop", "Not applicable", "Approval waits dominate wall-clock", "Track system latency and cycle time as two different numbers"],
    ["Cold paths", "Cold embedder, cold shard, cold cache", "Cold sandbox or browser session", "Keep warm pools; measure the first request after a deploy separately"],
  ],
};

export const costDriverTable: Table = {
  head: ["Driver", "Typical share", "Lever", "Realistic saving"],
  rows: [
    ["Input tokens (context)", "45–70%", "Fewer passages, compaction, prompt-prefix caching, small models on cheap steps", "30–60%"],
    ["Output tokens", "10–25%", "Structured outputs, length limits, stop generating what nobody reads", "10–20%"],
    ["Repeat work", "10–30% of traffic", "Exact, semantic and retrieval caches; tool-result caching for agents", "15–30% of total spend"],
    ["Reranking", "5–15%", "Cascade — rerank 100, not 1,000; distilled cross-encoder", "5–10%"],
    ["Embeddings", "One-off, then drift", "Hash-based incremental re-embedding instead of full rebuilds", "Most of the ingest bill"],
    ["Vector memory", "Fixed monthly", "int8 quantisation with rescoring; tier cold shards to disk", "~75% of index memory"],
    ["Retries and loops", "0–40% (agents)", "Idempotency, step caps, repeated-call detection, better tool errors", "Whatever the loops were costing"],
    ["Human review", "Often the largest real cost", "Raise autonomy only where evals justify it; sample instead of gating", "Measured in hours, not dollars per call"],
  ],
};

export const costModelTable: Table = {
  head: ["Illustrative model", "RAG · 100k queries / month", "Agent · 10k tasks / month"],
  rows: [
    ["Shape of one unit", "1 answer: ~3.8k input, ~350 output tokens", "1 task: ~12 steps × (~6k input, ~400 output)"],
    ["Input tokens @ $2 / 1M", "380M → $760", "720M → $1,440"],
    ["Output tokens @ $10 / 1M", "35M → $350", "48M → $480"],
    ["Rerank / tools", "~$50", "~$200"],
    ["Index or runtime infra", "~$250 (10M chunks, int8, in memory)", "~$150 (workers, state store, sandboxes)"],
    ["Cache saving at 25% hit", "−$278", "−$220 (tool results)"],
    ["Total", "≈ $1,130 → $0.011 per query", "≈ $2,050 → $0.205 per task"],
    ["The p95 unit", "≈ $0.02 — bounded by context size", "≈ $0.68 at 40 steps — bounded by nothing until you cap it"],
  ],
};

export const deployTable: Table = {
  head: ["Stage", "Gate", "What it catches", "On failure"],
  rows: [
    ["Lint and types", "Blocking", "The ordinary half of the bugs", "Fail the build"],
    ["Unit tests", "Blocking", "Chunkers, parsers, filters, cost arithmetic — all pure functions", "Fail the build"],
    ["Contract tests on tools", "Blocking", "Tool schemas that changed without the callers changing", "Fail the build"],
    ["Golden-set eval", "Blocking on regression", "The prompt, model or index change that quietly lowers recall or task success", "Fail the merge, post the diff against the baseline"],
    ["Adversarial suite", "Blocking", "Injection, cross-tenant probes, unanswerable questions", "Fail the merge — any hit is a release blocker"],
    ["Build and pin", "Blocking", "Image, dependency lock, prompt files, model id, index snapshot id", "Nothing ships unpinned"],
    ["Canary 5%", "Automatic rollback", "What only real traffic finds: latency tail, cost per unit, error mix", "Roll back on SLO burn without waiting for a human"],
    ["Promote", "Manual or automatic", "—", "Keep the previous image and index snapshot warm for one cycle"],
  ],
};

export const deployList: string[] = [
  "The deployable unit is not just the image. It is the image plus the prompt files, the model id, the tool schemas, the policy config and the index snapshot id — pin all six or you cannot reproduce a bug.",
  "Model providers update models behind unversioned names. Pin the exact model id, and treat a provider deprecation notice as a scheduled migration with an eval run attached.",
  "Index changes deploy like code: build the new collection alongside, dual-write, compare on the golden set, cut over, keep the old one until the next cycle.",
  "Secrets come from the secret manager at runtime, never from the image or the repository, and CI gets short-lived credentials scoped to the job.",
  "Run the eval suite against recorded provider responses in CI so it is deterministic and free; run it against the live provider nightly so drift still surfaces.",
  "Autoscale on queue depth and concurrency, not CPU — these workloads are I/O-bound and a CPU-based policy will scale at exactly the wrong moments.",
  "Keep GPU capacity separate from web capacity. Embedding and reranking backlogs should not be able to starve the request path.",
];

export type Rung = { id: string; title: string; body: string; note: string };

export const degradationLadder: Rung[] = [
  { id: "D0", title: "Full service", body: "Hybrid retrieval, reranking, full context, grounding check. Everything green.", note: "normal" },
  { id: "D1", title: "Drop the reranker", body: "Rerank latency or errors spike: skip it, widen k slightly, mark the response unranked in the trace. Quality dips, service holds.", note: "quality −, speed +" },
  { id: "D2", title: "Single-channel retrieval", body: "Vector index degraded: serve BM25 only (or the reverse). Log it as degraded so the weekly quality sample can be read correctly.", note: "recall −" },
  { id: "D3", title: "Cache and refuse", body: "Generation unavailable: serve cached answers where they match, and refuse cleanly with a next step where they do not. Never spin.", note: "coverage −" },
  { id: "D4", title: "Read-only mode (agents)", body: "Tool writes disabled fleet-wide by one flag. The agent still triages and drafts; humans commit. This is the kill switch, and it is tested.", note: "authority = 0" },
];

export const rolloutList: string[] = [
  "Version and pin everything that can change the output: prompt, model id, embedding model, index snapshot, tool schema, policy. A change to any one is a deploy.",
  "Shadow first — run the new configuration on live traffic without showing the result, and diff against the current one.",
  "Canary by percentage with automatic rollback on the SLO burn rate, not on someone watching a dashboard.",
  "Keep a permanent holdback for anything where you want to keep measuring lift rather than assume it.",
  "Gate merges on the golden set. A prompt change that regresses recall or task success should fail CI like any other bug.",
  "Rehearse the rollback. The first time you revert an index snapshot should not be during an incident.",
];

export const dashboards: { name: string; body: string }[] = [
  {
    name: "Health",
    body: "SLO burn rates, availability, latency percentiles by stage, error rate by dependency, queue depth. This is the one on the wall and the one the pager points at.",
  },
  {
    name: "Quality and drift",
    body: "Rolling faithfulness or task success from the sample, refusal and intervention rate, retrieval score distribution, tool error rates, top failing intents. A weekly reading, not a real-time one.",
  },
  {
    name: "Cost and capacity",
    body: "Cost per unit at p50 and p95, daily spend against ceiling, cache hit rate, tokens per request, spend by tenant and model. Read beside quality, never separately — they trade against each other.",
  },
];

export const opsChecklist: string[] = [
  "Every request emits one trace with stage spans, retrieved ids, versions, tokens and cost.",
  "A trace can be replayed from its stored inputs, months later.",
  "SLOs are written down with owners and error budgets, and alerts fire on user-facing symptoms.",
  "Safety events page a human; they are not a dashboard tile nobody opens.",
  "A weekly stratified sample is scored against a rubric, by a judge whose agreement with humans has been measured.",
  "Golden set runs in CI and blocks merges on regression.",
  "Every dependency has a timeout, a retry policy and a defined degraded mode.",
  "Every write is idempotent, and every agent action has a defined inverse or a human gate.",
  "A kill switch disables writes fleet-wide, and someone has used it in a drill.",
  "Cost per unit is on a dashboard beside quality, with a per-run and per-tenant ceiling enforced in code.",
  "Rollback for prompt, model and index is one command, and it has been rehearsed.",
  "The on-call runbook names the first three things to look at, in order.",
];
