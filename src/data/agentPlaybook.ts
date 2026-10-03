export type Row = string[];

/** The decisions you make once and live with. Each row: decision, options, default, change it when. */
export const decisionTable: { head: Row; rows: Row[] } = {
  head: ["Decision", "The options", "Default", "Change it when"],
  rows: [
    [
      "Workflow or agent",
      "Fixed chain with edges you wrote · model chooses the next step",
      "Workflow",
      "The path genuinely varies per input and you cannot enumerate the branches",
    ],
    [
      "Loop shape",
      "Single-pass · ReAct loop · plan-then-execute · explicit state machine",
      "ReAct with a step cap",
      "Long horizons or auditability push you to a state machine you can resume and inspect",
    ],
    [
      "One agent or several",
      "One agent with many tools · specialists behind a coordinator",
      "One agent",
      "Context genuinely conflicts, or sub-tasks parallelise — never for tidiness alone",
    ],
    [
      "Tool granularity",
      "Many narrow tools · few broad tools · one code-execution tool",
      "8–15 narrow, well-named tools",
      "Above ~20 tools, group them behind a router or let the agent write code instead",
    ],
    [
      "Autonomy level",
      "Propose · act inside limits · act and report",
      "Propose, then earn each step up",
      "Move up only when the action has an inverse and the eval suite covers it",
    ],
    [
      "Memory",
      "None · scratchpad within a run · episodic across runs · retrieval over a corpus",
      "Scratchpad only",
      "Add memory when repeated runs demonstrably repeat work — not before",
    ],
    [
      "State and durability",
      "In-process · database checkpoint per step · durable execution engine",
      "Checkpoint per step",
      "Runs longer than a request timeout, or anything that must survive a deploy",
    ],
    [
      "Model routing",
      "One model everywhere · small for routing and extraction, large for reasoning",
      "Split by step",
      "Cost or latency per task exceeds budget — usually the cheapest win available",
    ],
    [
      "Error handling",
      "Retry · reflect and retry · replan · escalate to a human",
      "Retry twice, then escalate",
      "Reflection helps on tool-argument errors; it rarely rescues a wrong plan",
    ],
    [
      "Human in the loop",
      "Never · before irreversible actions · sampled review · always",
      "Before anything irreversible",
      "Sampled review replaces gating only once the eval suite predicts failures reliably",
    ],
    [
      "Evaluation",
      "Outcome only · trajectory only · both, with a regression suite from production",
      "Outcome plus tool-call validity",
      "Trajectory eval earns its cost when the same wrong step keeps recurring",
    ],
  ],
};

export const scaleTable: { head: Row; rows: Row[] } = {
  head: ["Pressure", "What breaks first", "The lever"],
  rows: [
    ["More concurrent runs", "Provider rate limits, then your database connections", "Queue per tenant, token-bucket per provider key, backpressure instead of retries"],
    ["Longer tasks", "Context window fills with stale observations", "Compact the scratchpad on a schedule; keep artefacts in a store, references in context"],
    ["More tools", "Tool selection accuracy falls off a cliff", "Route to a tool subset per task type; name and document tools like public API"],
    ["Higher cost per task", "The large model doing extraction and routing", "Split by step; cache tool results; cap steps; batch what is batchable"],
    ["Higher latency", "Sequential tool calls that could run together", "Parallelise independent calls; stream partials; speculate on the likely next read"],
    ["More failure surface", "Silent partial completion after a crash", "Idempotency keys, checkpoint per step, resume rather than restart"],
    ["More users", "One tenant's runaway run starves everyone", "Per-tenant step and spend budgets, enforced by the runtime not the prompt"],
    ["More scrutiny", "Nobody can explain what the agent did last Tuesday", "Structured trace per run: inputs, tool calls, args, results, decisions, cost"],
  ],
};

export const agentEvalTable: { head: Row; rows: Row[] } = {
  head: ["Layer", "Metric", "Ship target", "What it tells you"],
  rows: [
    ["Outcome", "Task success rate", "domain-set", "Whether the thing works, judged on the end state, not the transcript"],
    ["Outcome", "Human intervention rate", "trending down", "How much supervision the autonomy level is actually costing"],
    ["Trajectory", "Tool-call argument validity", "≥ 0.99", "Schema errors are the most common and most fixable failure"],
    ["Trajectory", "Correct tool selected", "≥ 0.95", "Whether your tool descriptions are doing their job"],
    ["Trajectory", "Steps to success (p50 / p95)", "bounded", "Loops, thrash and creeping cost show up here first"],
    ["Safety", "Guardrail violations", "0", "Any non-zero value is a release blocker, not a metric"],
    ["Safety", "Rollback correctness", "100%", "Every reversible action must actually reverse when tested"],
    ["Economics", "Cost per completed task", "budgeted", "The number that decides whether this ships at all"],
  ],
};

export const agentFailureTable: { head: Row; rows: Row[] } = {
  head: ["Symptom", "Usual cause", "Fix"],
  rows: [
    [
      "The agent loops on the same two tools",
      "No progress check and no step budget; the observation never changes",
      "Cap steps, detect repeated (tool, args) pairs, force a different action or stop",
    ],
    [
      "Correct plan, wrong arguments",
      "Loose tool schemas and prose parameter descriptions",
      "Strict typed schemas, enums over free text, validate and return the error for one retry",
    ],
    [
      "Great at step 3, lost at step 30",
      "Context filled with raw observations; the goal has scrolled out of reach",
      "Summarise observations into a running state object; restate the goal each turn",
    ],
    [
      "Works in testing, unsafe in production",
      "Guardrails written as prompt instructions",
      "Move every limit into code and credentials: scopes, ceilings, allowlists, interlocks",
    ],
    [
      "Silent partial completion",
      "Crash between two writes with no checkpoint or idempotency",
      "Idempotency keys per action, checkpoint per step, resume from the last committed step",
    ],
    [
      "Multi-agent output is worse than one agent",
      "Coordination overhead and context loss at every hand-off",
      "Collapse to one agent unless sub-tasks are genuinely parallel; pass artefacts, not chat",
    ],
    [
      "The agent followed instructions from a web page",
      "Tool output treated as instruction rather than data",
      "Wrap tool results as untrusted data; never let retrieved text reach the instruction slot",
    ],
    [
      "Cost per task quietly tripled",
      "Retries, re-reads and a large model on every step",
      "Per-run spend cap, cache tool results, small models for routing and extraction",
    ],
  ],
};

export type Rung = { id: string; title: string; body: string; note: string };

export const autonomyLadder: Rung[] = [
  { id: "A0", title: "Read only", body: "The agent gathers and summarises. Nothing changes state. Ship this first even when the goal is A3 — it proves retrieval, tools and prompts under real inputs.", note: "no blast radius" },
  { id: "A1", title: "Draft and propose", body: "It composes the write — the message, the ticket, the query — and a human commits it. You get accept-rate data, which is your first real eval signal.", note: "human commits" },
  { id: "A2", title: "Act inside an envelope", body: "Writes allowed under written limits: value ceilings, object types, one action per entity. Everything outside goes to an approval queue.", note: "limits in code" },
  { id: "A3", title: "Act reversibly", body: "Autonomous action where every action has a defined inverse, a canary and an automatic rollback trigger. Audit after the fact rather than approval before it.", note: "inverse required" },
  { id: "A4", title: "Act irreversibly", body: "Money moves, data is deleted, the physical world changes. Reserve for actions with an independent verifier and a named accountable human.", note: "rarely justified" },
];

export const agentBuildPath: Rung[] = [
  { id: "S1", title: "Write the task down as a procedure", body: "Describe how a competent person does it today, step by step, including where they stop and ask. If you cannot write it, you cannot evaluate it — and you are not ready to build it.", note: "day 1" },
  { id: "S2", title: "Build the tools before the agent", body: "Each tool tested independently, typed schema, useful error messages, idempotent where it writes. Most agent failures are tool failures wearing a costume.", note: "week 1" },
  { id: "S3", title: "One model, one loop, read only", body: "Simplest possible loop with a step cap, full tracing from the first line of code. Run it on 20 real tasks and read every trace yourself.", note: "week 1–2" },
  { id: "S4", title: "Build the eval set from those traces", body: "20–50 tasks with a checkable end state, including tasks that should end in a refusal or a hand-off. This becomes your regression suite forever.", note: "week 2" },
  { id: "S5", title: "Add writes behind an envelope", body: "Limits and scopes in code, approval queue for exceptions, idempotency keys on every write, and a defined inverse before each new action is enabled.", note: "week 3" },
  { id: "S6", title: "Make it durable and observable", body: "Checkpoint per step, resume on crash, per-run budgets, structured traces with cost. Now it can run unattended without becoming unexplainable.", note: "week 4" },
  { id: "S7", title: "Earn autonomy one rung at a time", body: "Move up the autonomy ladder only when the eval suite covers the new action class and the rollback has been tested in production, deliberately.", note: "ongoing" },
];

export const agentAntiPatterns: string[] = [
  "Building an agent for a task with one fixed path. That is a script, and a script does not hallucinate its next step.",
  "Guardrails written as prompt instructions. A limit that is not in code or in a credential scope is a suggestion.",
  "Spawning specialist sub-agents for tidiness. Every hand-off loses context and adds latency; earn the second agent.",
  "Shipping without traces. If you cannot replay a run, you cannot debug it, evaluate it or explain it after an incident.",
  "Letting the agent see secrets. Broker credentials outside the model; the context window is not a vault.",
  "Treating tool output as instructions. A retrieved page saying “ignore previous instructions” must be inert data.",
  "Measuring the transcript instead of the outcome. Plausible reasoning with a wrong end state is still a failure.",
  "Adding memory to fix a prompt problem. Persisted mistakes are worse than repeated ones.",
];

export const agentPlaybookSections = [
  { id: "loop", label: "The loop" },
  { id: "vs", label: "Workflow or agent" },
  { id: "decisions", label: "The decisions" },
  { id: "tools", label: "Tools" },
  { id: "control", label: "Control plane" },
  { id: "scale", label: "Scaling" },
  { id: "eval", label: "Evaluation" },
  { id: "failures", label: "Failure modes" },
  { id: "path", label: "Build path" },
];
