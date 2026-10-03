export type Row = string[];
export type Table = { head: Row; rows: Row[] };

export type Pattern = {
  id: string;
  n: string;
  name: string;
  tagline: string;
  use: string;
  avoid: string;
  code: string;
  /** A build-this exercise with its own acceptance number. */
  problem: string;
};

export const glossary: Table = {
  head: ["Term", "What it actually means", "Why it matters"],
  rows: [
    ["Agent", "A loop where a model chooses the next action from a tool set until a stop condition", "If the path is fixed, it is a workflow — and workflows are cheaper and debuggable"],
    ["Harness / scaffold", "The code around the model: loop, gate, budgets, state, traces", "Almost all engineering effort lives here, not in the prompt"],
    ["Trajectory", "The ordered sequence of thoughts, tool calls and observations in one run", "The unit you replay when debugging and grade when evaluating the path"],
    ["Episode / run", "One task from goal to terminal state", "The unit of cost, of success measurement, and of checkpointing"],
    ["Observation", "What comes back from a tool, as the model sees it", "Untrusted data; also the thing that fills the context window"],
    ["Action space", "The set of tools the agent may call right now", "Wide action spaces lower selection accuracy — scope them per task"],
    ["Gate", "The code that decides whether a proposed action is allowed", "The only real safety boundary; a prompt rule is not one"],
    ["Blast radius", "Everything the agent's credentials could change if it were wrong", "Sets how much verification and reversibility you owe"],
    ["Reversibility", "Whether a defined inverse exists for an action", "The property that separates “act autonomously” from “ask first”"],
    ["Checkpoint", "Durable state written after a step commits", "What lets a crashed run resume rather than replay a write"],
    ["Compaction", "Summarising old observations into running state", "Keeps long runs inside the window and stops cost growing superlinearly"],
    ["Stop condition", "The written rule for when the loop ends", "Goal met, budget spent, step cap, or escalation — all four need a defined result"],
  ],
};

export const patterns: Pattern[] = [
  {
    id: "chaining",
    n: "P1",
    name: "Prompt chaining",
    tagline: "Decompose a task into fixed steps, each one a call whose output feeds the next.",
    use: "The task has a stable shape you can write down: extract, then classify, then draft.",
    avoid: "The next step depends on what an earlier step discovered in a way you cannot enumerate.",
    code: `def handle(email: str) -> Reply:
    facts = extract(email)                       # small model, typed output
    category = classify(facts)                   # small model, closed set
    passages = search(email, filters={"category": category})
    reply = draft(facts, passages)               # capable model, one call
    return reply if guard(reply) else escalate(email)`,
    problem:
      "Build a returns-triage chain for an e-commerce inbox: extract order id and issue, classify into six reasons, retrieve the matching policy, draft a reply. Ships when 80% of drafts need no edit and the chain costs under $0.01 per email.",
  },
  {
    id: "routing",
    n: "P2",
    name: "Routing",
    tagline: "Classify the input first, then send it to the handler built for that class.",
    use: "Inputs fall into distinct kinds that deserve different prompts, tools or models.",
    avoid: "The classes overlap heavily — you will spend more on routing errors than routing saves.",
    code: `HANDLERS = {"billing": billing_flow, "outage": incident_flow, "howto": rag_answer}

def route(question: str, user: User):
    label = classifier(question)                 # local model: milliseconds, no API call
    if label.confidence < 0.6:
        return to_human(question, reason="ambiguous")     # the explicit unsure class
    return HANDLERS[label.name](question, user)`,
    problem:
      "Route a support inbox across three handlers plus a human queue. Ships when misroute rate is under 5% against the team's own labels and the routing decision costs under 200 ms at p95.",
  },
  {
    id: "parallel",
    n: "P3",
    name: "Parallelisation — sectioning and voting",
    tagline: "Split independent work across calls, or sample the same work several times and aggregate.",
    use: "Sectioning when the input divides cleanly; voting when one judgement is high-stakes and noisy.",
    avoid: "Voting on anything cheap to verify directly — run the check instead of asking three times.",
    code: `async def review(contract: str) -> list[Finding]:
    clauses = split_clauses(contract)                     # sectioning: independent units
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(check_clause(c)) for c in clauses]
    return [f for t in tasks for f in t.result()]

async def is_high_risk(clause: str) -> bool:              # voting: n samples, majority
    votes = await asyncio.gather(*(judge(clause) for _ in range(3)))
    return sum(votes) >= 2`,
    problem:
      "Review a 40-page contract clause by clause in parallel, with majority voting on the risk label. Ships when high-risk recall is at or above 0.90 and wall-clock stays under 60 seconds.",
  },
  {
    id: "orchestrator",
    n: "P4",
    name: "Orchestrator–workers",
    tagline: "A planner decides the subtasks at runtime; workers run them in parallel; a synthesiser combines the results.",
    use: "The number and shape of subtasks genuinely depend on the input — research, multi-entity comparisons.",
    avoid: "You could have written the subtask list yourself. Then it is sectioning, and much cheaper.",
    code: `async def orchestrate(goal: str) -> Report:
    plan = await planner(goal)                     # subtasks chosen per request
    validate(plan)                                 # tools exist, count and budget capped
    async with asyncio.TaskGroup() as tg:
        work = [tg.create_task(worker(t, budget=plan.per_task_budget))
                for t in plan.tasks]
    return await synthesise(goal, [w.result() for w in work])`,
    problem:
      "Build a competitor-research desk: the planner splits a question into per-company subtasks, workers gather evidence in parallel, the synthesiser writes a cited brief. Ships at expert-rated 4/5 with a predictable cost ceiling per report.",
  },
  {
    id: "evaluator",
    n: "P5",
    name: "Evaluator–optimiser",
    tagline: "Generate, critique against a written rubric, revise — for a bounded number of rounds.",
    use: "Quality is judgeable against explicit criteria and the first draft is reliably close but not right.",
    avoid: "There is no rubric. “Make it better” loops produce different, not better.",
    code: `def refine(task: str, max_rounds: int = 2) -> str:
    draft = generate(task)
    for _ in range(max_rounds):
        verdict = evaluate(draft, RUBRIC)          # explicit criteria, not a vibe score
        if verdict.passes:
            return draft
        draft = revise(draft, issues=verdict.issues)   # the issues, not the score
    return draft                                    # bounded: it never loops forever`,
    problem:
      "Generate marketing variants checked against brand and claims rules, revising until they pass. Ships when 85% pass on the first evaluation and no item takes more than two rounds.",
  },
  {
    id: "react",
    n: "P6",
    name: "ReAct — reason and act, interleaved",
    tagline: "The model reasons about the state, picks one action, sees the result, and reasons again.",
    use: "The next useful action depends on what the last one returned. This is the default agent loop.",
    avoid: "The whole plan is knowable up front — then plan-then-execute is cheaper and easier to audit.",
    code: `state = State(goal=goal)
for step in range(MAX_STEPS):
    decision = model(state.as_messages())          # thought + one action
    if decision.final:
        return state.finish(decision.answer)
    gate.check(decision.tool, decision.args)       # in code, before anything runs
    observation = run(decision.tool, decision.args)
    state = state.observe(decision, observation).compact()
return state.finish(reason="step_cap")`,
    problem:
      "Build an on-call triage agent with read-only tools that forms and tests hypotheses. Ships when the on-call engineer agrees with the first hypothesis 70% of the time and the median run is six steps or fewer.",
  },
  {
    id: "plan-execute",
    n: "P7",
    name: "Plan-then-execute",
    tagline: "Produce a full plan, validate it, execute it, and replan only when a step actually fails.",
    use: "Long horizons where a human should see the plan before it runs, and where steps have dependencies.",
    avoid: "Short tasks — the planning call costs more than the work it organises.",
    code: `plan = planner(goal)                     # steps with ids and dependencies
validate(plan)                           # tools exist, no cycles, inside budget
results: dict[str, Any] = {}

for step in topological(plan):
    try:
        results[step.id] = execute(step, results)
    except Retryable as e:
        plan = replan(goal, plan, results, failed=step, error=e)   # not a blind retry
    except Denied:
        return escalate(goal, plan, results)`,
    problem:
      "Build a migration agent that plans a framework upgrade across a dependency graph of services, executes per service, and replans when a build fails. Ships when 70% of services need no human edit and CI is green on every opened PR.",
  },
  {
    id: "reflexion",
    n: "P8",
    name: "Reflection with an external signal",
    tagline: "Let the model critique its own work only when something outside the model can say it was wrong.",
    use: "Tests, schema validation, a compiler, a retrieval check — anything that returns ground truth.",
    avoid: "Pure self-critique. Without an external signal a model mostly rewrites confidently and moves sideways.",
    code: `feedback = None
for attempt in range(3):
    patch = generate_patch(bug, feedback)
    result = run_tests(patch)                    # the external signal
    if result.passed:
        return patch
    feedback = result.failures[:3]               # concrete errors beat "try harder"
raise GiveUp("three attempts, still red")`,
    problem:
      "Build a bug-fix agent that writes a failing test, patches until the suite is green, and opens a PR. Ships when 60% of assigned bugs reach green with no human edit and zero patches weaken an existing assertion.",
  },
  {
    id: "tool-search",
    n: "P9",
    name: "Scoped action space",
    tagline: "Show the model the eight tools this task needs, not the sixty your platform has.",
    use: "Any agent whose tool count has grown past roughly twenty and whose selection accuracy has fallen.",
    avoid: "Small tool sets — the routing step adds latency and a new failure mode for no gain.",
    code: `TOOLSETS = {"finance": FINANCE_TOOLS, "hr": HR_TOOLS, "it": IT_TOOLS}
ALWAYS = [search_docs, ask_human]

def tools_for(task: str) -> list[Tool]:
    domain = classify_domain(task)               # cheap, local, cached
    return TOOLSETS[domain] + ALWAYS             # ~8 tools in the window, not 60

# a deterministic order matters too: a reshuffled tool list invalidates the cache`,
    problem:
      "Take an enterprise assistant with sixty registered tools and scope the action space per task. Ships when correct-tool selection is at or above 95% and the tool block stops dominating the prompt.",
  },
  {
    id: "codeact",
    n: "P10",
    name: "Code as action",
    tagline: "Instead of twenty tool calls, the model writes one small program against a safe API.",
    use: "Work with loops, joins, filtering or arithmetic over results — data analysis, bulk operations.",
    avoid: "Anything where you cannot sandbox execution properly. This pattern is only as safe as its sandbox.",
    code: `program = model(CODEACT_PROMPT, task, api_docs=SAFE_API_DOCS)

result = sandbox.run(                            # no network, no host filesystem
    program,
    api=read_only_warehouse,                     # the only surface it can touch
    timeout=30,
    memory_mb=512,
)
if result.error:
    program = model(CODEACT_PROMPT, task, feedback=result.error)   # one retry`,
    problem:
      "Build an analysis agent that answers questions over a read-only warehouse by writing and running Python in a sandbox. Ships when numbers reconcile to source tables 100% of the time and no program escapes the sandbox in a red-team test.",
  },
  {
    id: "blackboard",
    n: "P11",
    name: "Blackboard — artefacts, not chat",
    tagline: "Several agents read and write a shared store instead of passing conversation transcripts.",
    use: "Multi-agent work where each contribution is a document, a finding or a table others build on.",
    avoid: "Two agents that could be two function calls. Every hand-off loses context and adds latency.",
    code: `board = ArtefactStore(run_id)                 # durable, inspectable, replayable

async with asyncio.TaskGroup() as tg:
    tg.create_task(researcher(board, budget=0.10))
    tg.create_task(analyst(board, budget=0.10))
    tg.create_task(fact_checker(board, budget=0.05))

report = writer(board.read_all())                # artefacts in, one document out
assert all(claim.artefact_id for claim in report.claims)   # traceable by construction`,
    problem:
      "Build a three-role research desk that writes findings to a shared store, with a critic that can send one section back. Ships when every sentence in the final report traces to a stored artefact and the total cost per report is predictable.",
  },
  {
    id: "hitl",
    n: "P12",
    name: "Interrupt and resume",
    tagline: "Pause at the gate, hand the decision to a human with context, and continue from the checkpoint.",
    use: "Any action outside the policy envelope — and every irreversible one, at every autonomy level.",
    avoid: "Blocking the whole run in memory while you wait. The process will be restarted; the run must survive it.",
    code: `action = plan_next(state)

if gate.requires_approval(action):
    checkpoint(run_id, state)                    # durable: this process may die here
    await approvals.request(
        run_id, action,
        context=explain(action, state),          # what, why, what it would change
        expires_in=timedelta(hours=4),
    )
    return Paused(run_id)                        # resume(run_id) picks it up later

state = apply(action, state)`,
    problem:
      "Add an approval queue to a refund agent so anything above the ceiling pauses with context and resumes on approval. Ships when a paused run survives a deploy, resumes without re-executing a committed action, and expires cleanly if nobody answers.",
  },
];

export const memoryTable: Table = {
  head: ["Kind", "Where it lives", "Written when", "Read when", "The risk"],
  rows: [
    ["Working (scratchpad)", "The run's state object", "Every step", "Every step", "Grows without compaction until the goal scrolls out of the window"],
    ["Episodic", "A store keyed by user or task type", "At the end of a run", "A similar task starts", "Replays an approach that was wrong last time, with confidence"],
    ["Semantic", "A vector index over documents and facts", "On ingest", "Retrieved as a tool call", "Ordinary RAG staleness — it needs the same freshness discipline"],
    ["Procedural", "Reviewed rule or skill files loaded into the prompt", "When a human approves a learned rule", "Always in context", "Silent behaviour change; version it and diff it like code"],
  ],
};

export const contextTechniques: string[] = [
  "Compact, do not accumulate. After each observation, fold what matters into a running state object and drop the raw payload — the model needs the finding, not the API response.",
  "Keep artefacts outside the window. Write long outputs to a store and pass ids; a file path costs ten tokens and a document costs four thousand.",
  "Load just in time. Fetch the schema, the policy or the runbook at the step that needs it rather than pre-loading everything at the start.",
  "Isolate with sub-agents. A worker with its own window can read a hundred pages and return a paragraph — the orchestrator never pays for the hundred pages.",
  "Restate the goal each turn. It is cheap, and it is the single most effective fix for an agent that drifts after step twenty.",
  "Put stable content first. Instructions and tool definitions before volatile state, so the prompt cache can hold the prefix.",
];

export const topologyTable: Table = {
  head: ["Topology", "Shape", "Good at", "The cost you pay"],
  rows: [
    ["Single agent", "One loop, many tools", "Almost everything. Start here and stay unless something forces you out", "Context fills up on long tasks"],
    ["Supervisor and workers", "One planner, n workers, one synthesiser", "Parallel sub-tasks with independent context", "Coordination overhead, and a planner that can be wrong about the split"],
    ["Pipeline", "Fixed stages, each specialised", "Predictable multi-stage work — this is usually a workflow in disguise", "Rigid; a mid-stage failure needs an explicit path"],
    ["Blackboard", "Shared artefact store, agents read and write", "Research and analysis where contributions are documents", "Needs conflict rules and a stopping condition someone owns"],
    ["Debate / critic", "Two roles arguing, or one generating and one attacking", "High-stakes judgements where a second opinion is worth the tokens", "Doubles cost; without a rubric it produces confident disagreement"],
  ],
};

export const agenticFailures: Table = {
  head: ["Failure", "What it looks like", "The fix"],
  rows: [
    ["Goal drift", "By step twenty the agent is solving a related, easier problem", "Restate the goal every turn; check each action against it; cap the horizon"],
    ["Tool fixation", "The same tool called repeatedly with near-identical arguments", "Detect repeated (tool, args) pairs and force a different action or stop"],
    ["Premature finalisation", "It answers confidently having gathered almost nothing", "Require evidence before a final answer; make the stop condition explicit"],
    ["Sycophantic loop", "Critic and generator agree with each other into a worse answer", "Ground the critic in a rubric or an external check, not the generator's output"],
    ["Context rot", "Early instructions stop being followed as observations pile up", "Compaction plus goal restatement; measure quality against step count"],
    ["Cascading multi-agent error", "One worker's wrong finding is treated as fact by everyone downstream", "Pass artefacts with provenance and confidence, not conclusions as chat"],
    ["Verifier gaming", "The agent optimises the check rather than the task — weakened tests, trivially passing schemas", "Diff what the verifier measures; keep a held-out check the agent cannot see"],
    ["Silent scope creep", "It fixes three things you did not ask about, one of them wrongly", "Constrain the diff, require an explicit plan, and review what it touched, not just what it reported"],
  ],
};

export const capstones: string[] = [
  "Compose P2 + P6 + P12: a support agent that routes, then runs a ReAct loop with read-only tools, and pauses for approval on any refund. Measure containment, intervention rate and cost per contact.",
  "Compose P4 + P11: a research desk with a planner, parallel workers writing to a blackboard, and a critic that can return one section. Measure claim traceability and cost variance per report.",
  "Compose P7 + P8: a migration agent that plans across services, executes in a sandbox, and uses the test suite as its external signal. Measure PRs green on open and human edits per service.",
  "Compose P5 + P3: a document generator with sectioned drafting and a rubric-based evaluator per section. Measure first-pass rate and rounds per section.",
  "Compose P10 + P9: an analysis agent with a scoped action space that writes sandboxed code against a read-only warehouse. Measure numeric reconciliation and sandbox escapes (must be zero).",
  "Compose P6 + P12 + durable state: an autonomous remediation agent limited to reversible actions, canaried, with automatic rollback and a kill switch. Measure auto-resolution rate, rollback correctness and incidents made worse (must be zero).",
];

export const patternSections = [
  { id: "vocab", label: "Vocabulary" },
  { id: "patterns", label: "The 12 patterns" },
  { id: "memory", label: "Memory" },
  { id: "context", label: "Context engineering" },
  { id: "topologies", label: "Topologies" },
  { id: "failures", label: "Agentic failures" },
  { id: "capstones", label: "Capstones" },
];
