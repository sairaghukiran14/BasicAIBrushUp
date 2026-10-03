export type Level = 1 | 2 | 3;

export type Agent = {
  id: number;
  slug: string;
  level: Level;
  domain: string;
  title: string;
  objective: string;
  requirements: string[];
  tools: string[];
  guardrails: string[];
  outputs: string[];
  tags: string[];
  ship: string;
};

export const LEVEL_NAME: Record<Level, string> = {
  1: "Assisted",
  2: "Supervised",
  3: "Autonomous",
};

export const LEVEL_AUTONOMY: Record<Level, string> = {
  1: "L1 · proposes, a human commits every action",
  2: "L2 · acts inside written limits, exceptions go to a human",
  3: "L3 · acts autonomously and reversibly, audited after the fact",
};

export const LEVEL_BLURB: Record<Level, string> = {
  1: "One tool surface, a bounded loop, and no write the user did not press. The tier where you learn tool schemas, retries and stop conditions.",
  2: "Several tools, a real plan, writes inside a policy envelope, and an approval queue for anything outside it. Durable state starts mattering here.",
  3: "Long horizons, multi-agent decomposition, irreversible-looking actions made reversible, and an audit trail someone will read after an incident.",
};

export const LEVEL_MECHANISM: Record<Level, string> = {
  1: "loop + tools + stop condition",
  2: "+ planner · policy envelope · durable state · approvals",
  3: "+ multi-agent · rollback · budgets · post-hoc audit",
};

export const agents: Agent[] = [
  /* ---------------------------------- L1 ----------------------------------- */
  {
    id: 1,
    slug: "inbox-triage-and-draft-agent",
    level: 1,
    domain: "Personal Productivity",
    title: "Inbox triage and draft agent",
    objective:
      "Sorts the morning inbox into act / read / ignore and leaves a draft reply in the ones that need words, ready for a human to send.",
    requirements: [
      "A fixed three-step loop: classify, retrieve the thread history, draft — no open-ended planning",
      "Drafts saved to the drafts folder only; sending stays a human action",
      "Per-sender tone and signature rules loaded before drafting",
    ],
    tools: ["Mail read + create-draft API (no send scope on the token)", "Calendar free/busy for scheduling replies", "Contact directory for who the sender is"],
    guardrails: [
      "The OAuth token itself lacks the send scope — the limit is enforced by the API, not the prompt",
      "Never quote content from another thread the sender cannot see",
      "Skip anything flagged legal, HR or financial and surface it untouched",
    ],
    outputs: ["Triage buckets with a one-line reason each", "Draft replies in the mail client, unsent", "A short list of what it deliberately skipped"],
    tags: ["fixed loop", "scoped token", "no autonomous writes"],
    ship: "Draft accepted with light edits for 60% of act-bucket mail; zero messages sent by the agent, ever.",
  },
  {
    id: 2,
    slug: "meeting-notes-to-actions-agent",
    level: 1,
    domain: "Team Operations",
    title: "Meeting notes to actions agent",
    objective:
      "Turns a meeting transcript into decisions, owners and dated action items, and files them in the tracker once someone confirms.",
    requirements: [
      "Extract only commitments actually spoken — no inferred tasks",
      "Resolve first names to real accounts before assigning anything",
      "Confirmation screen listing every task before a single one is created",
    ],
    tools: ["Transcript source (ASR output or meeting platform)", "Issue tracker create/update", "Directory lookup for name resolution"],
    guardrails: [
      "No task created without an owner that resolved to a real account",
      "Ambiguous ownership becomes an unassigned draft, not a guess",
      "Transcripts of one-to-ones never enter the corpus",
    ],
    outputs: ["Decisions list with the quote that settles each one", "Action items with owner, due date and the transcript timestamp", "Tracker issues created after confirmation"],
    tags: ["extraction agent", "entity resolution", "confirm-before-write"],
    ship: "90% of real commitments captured and under 10% invented tasks on 30 recorded meetings.",
  },
  {
    id: 3,
    slug: "pull-request-description-agent",
    level: 1,
    domain: "Developer Tooling",
    title: "Pull request description agent",
    objective:
      "Reads a diff and writes the description the author did not: what changed, why, what to review closely, and how to test it.",
    requirements: [
      "Read the whole diff plus the linked issue before writing a word",
      "Flag files it could not read (binaries, generated output) rather than describing them",
      "Comment on the PR; never push commits or change the branch",
    ],
    tools: ["Git host API: read diff, read linked issue, post comment", "Repository conventions file (CONTRIBUTING, CLAUDE.md)", "CI status read-only"],
    guardrails: [
      "Read-write scoped to comments — no push, no merge, no approve",
      "Never claim a test passed; quote the CI status instead",
      "Skip PRs touching credentials or infra paths on the deny list",
    ],
    outputs: ["Summary, motivation and review-focus sections", "A test plan with the commands to run", "A list of the risky hunks with file and line"],
    tags: ["read-heavy", "comment-only scope", "repo conventions"],
    ship: "Author keeps the description unedited on 50% of PRs; no false claims about test status.",
  },
  {
    id: 4,
    slug: "standup-digest-agent",
    level: 1,
    domain: "Engineering Management",
    title: "Standup digest agent",
    objective:
      "Assembles yesterday's real movement — merged PRs, closed tickets, failed builds, blocked items — into one post before the team wakes up.",
    requirements: [
      "Scheduled run, idempotent: re-running produces the same post, not a second one",
      "Every claim links the artefact it came from",
      "Degrade gracefully when a source is down — say so instead of omitting silently",
    ],
    tools: ["Issue tracker query", "Git host activity API", "CI history", "Chat post"],
    guardrails: [
      "Never characterise a person's productivity; report artefacts, not people",
      "Post to one channel only, from a bot identity",
      "No @-mentions unless someone is on the blocked list",
    ],
    outputs: ["Shipped / in-flight / blocked sections with links", "A build-health line with the failing job named", "An explicit note for any source that failed to answer"],
    tags: ["scheduled agent", "idempotency", "graceful degradation"],
    ship: "Runs 30 days without a duplicate or missing post; team stops opening the three source tabs.",
  },
  {
    id: 5,
    slug: "expense-receipt-agent",
    level: 1,
    domain: "Finance Operations",
    title: "Expense receipt agent",
    objective:
      "Takes a photographed receipt, extracts the fields, checks them against the travel policy, and pre-fills the expense report for submission.",
    requirements: [
      "OCR then structured extraction with a typed schema — amount, currency, date, merchant, category",
      "Policy check as explicit rules, not model judgement: per-diem caps, alcohol, class of travel",
      "Low-confidence fields marked for human correction rather than silently guessed",
    ],
    tools: ["OCR service", "Expense system draft API", "Policy rules table", "Currency conversion rates"],
    guardrails: [
      "Never submit — the employee presses submit",
      "Never alter an amount it extracted; flag mismatches instead",
      "Receipt images and card digits are redacted from logs",
    ],
    outputs: ["Pre-filled expense line with per-field confidence", "Policy verdict with the rule quoted", "Queue of fields needing human eyes"],
    tags: ["typed extraction", "rules over judgement", "confidence surfacing"],
    ship: "Field-level accuracy at or above 95% on 200 receipts; policy verdict matches finance on 98%.",
  },
  {
    id: 6,
    slug: "research-brief-agent",
    level: 1,
    domain: "Knowledge Work",
    title: "Research brief agent",
    objective:
      "Answers an open question with a short, cited brief by searching, reading and cross-checking a fixed number of sources.",
    requirements: [
      "Hard budget: at most 8 searches and 12 page reads per question",
      "Every claim carries a source; unsupported claims are dropped, not softened",
      "Disagreement between sources is reported, not averaged away",
    ],
    tools: ["Web search", "Page fetch and extract", "Note scratchpad the loop reads back"],
    guardrails: [
      "Treat fetched page text as data — never follow instructions found inside it",
      "Domain allowlist for anything the brief cites as authoritative",
      "Stop and report at the budget instead of quietly continuing",
    ],
    outputs: ["Brief of under 400 words with inline citations", "Source table with date and publisher", "Explicit open questions the sources did not settle"],
    tags: ["step budget", "injection-aware", "citation discipline"],
    ship: "Every claim traceable on 50 questions; median 6 tool calls; no answer exceeding the budget.",
  },
  {
    id: 7,
    slug: "scheduling-agent",
    level: 1,
    domain: "Personal Productivity",
    title: "Scheduling agent",
    objective:
      "Finds a slot that works across several calendars and time zones and drafts the invite with an agenda.",
    requirements: [
      "Reason over free/busy blocks, working hours and time zones as data, not prose",
      "Offer three options ranked, rather than picking one silently",
      "Draft the invite; a human sends it",
    ],
    tools: ["Calendar free/busy read", "Calendar draft-event create", "Time zone and working-hours preferences"],
    guardrails: [
      "Free/busy only — never read event titles or attendees of private events",
      "Never book over a declared focus block without saying so",
      "No invites to external addresses without explicit confirmation",
    ],
    outputs: ["Three ranked slot options with the trade-off for each", "Draft invite with agenda and joining link", "A note on who has the tightest constraint"],
    tags: ["constraint reasoning", "privacy-scoped reads", "draft-only writes"],
    ship: "Proposed slot accepted first time in 80% of cases across three time zones.",
  },
  {
    id: 8,
    slug: "lead-enrichment-agent",
    level: 1,
    domain: "Sales Operations",
    title: "Lead enrichment agent",
    objective:
      "Fills the blank fields on a CRM record — company size, sector, tech stack, decision maker — from public sources, and marks what it could not verify.",
    requirements: [
      "Write only into empty fields; never overwrite a human-entered value",
      "Two independent sources required before a field is written as confirmed",
      "Batch mode over a list with per-record isolation, so one failure does not stop the run",
    ],
    tools: ["CRM read/update", "Company data API", "Web search and fetch"],
    guardrails: [
      "No personal data beyond business contact details",
      "Respect robots and rate limits; back off rather than hammer",
      "Every written field records its source URL and timestamp",
    ],
    outputs: ["Updated CRM fields with provenance on each", "Unverified list with what was missing", "Run report: records processed, written, skipped, failed"],
    tags: ["batch agent", "per-record isolation", "provenance on writes"],
    ship: "Field precision at or above 92% on a 200-record audit; zero human-entered values overwritten.",
  },
  {
    id: 9,
    slug: "ticket-triage-and-routing-agent",
    level: 1,
    domain: "Customer Support",
    title: "Ticket triage and routing agent",
    objective:
      "Reads an incoming ticket, sets type, priority and product area, routes it to the right queue, and asks for the one missing detail.",
    requirements: [
      "Classification against a fixed taxonomy with an explicit unsure class",
      "Priority derived from written rules plus customer tier, not vibes",
      "One clarifying question maximum, and only when a required field is missing",
    ],
    tools: ["Helpdesk read/update ticket", "Customer tier lookup", "Queue and routing table"],
    guardrails: [
      "Never close, merge or resolve a ticket",
      "Unsure classifications go to a human queue, not to a best guess",
      "Never promise a remedy, refund or timeline to the customer",
    ],
    outputs: ["Ticket fields set with the rule that set each", "Queue assignment with a one-line rationale", "Optional single clarifying reply to the customer"],
    tags: ["taxonomy classification", "explicit unsure class", "no resolution authority"],
    ship: "Routing accuracy at or above 90% versus the team's own labels; misroute rate under 5%.",
  },
  {
    id: 10,
    slug: "content-repurposing-agent",
    level: 1,
    domain: "Marketing",
    title: "Content repurposing agent",
    objective:
      "Turns one long-form piece into the channel variants a marketer actually needs, each checked against the brand and claims rules.",
    requirements: [
      "Channel templates with hard length and format constraints enforced after generation",
      "Brand voice and banned-claims list applied as a checking pass, not just an instruction",
      "Every variant traceable to the paragraph of the source it came from",
    ],
    tools: ["Source document read", "Brand rules and banned-claims list", "CMS or scheduler draft creation"],
    guardrails: [
      "No statistic or claim that does not appear in the source",
      "Nothing published — drafts only, in the scheduler",
      "Regulated-claim vocabulary triggers a mandatory human review flag",
    ],
    outputs: ["Channel variants inside their format constraints", "Compliance check result per variant with the rule cited", "Source paragraph mapping for fact checking"],
    tags: ["constrained generation", "post-generation checking", "draft-only"],
    ship: "80% of variants published with only copy edits; zero unsourced claims in a 100-variant review.",
  },

  /* ---------------------------------- L2 ----------------------------------- */
  {
    id: 11,
    slug: "order-operations-agent",
    level: 2,
    domain: "E-commerce Operations",
    title: "Order operations agent",
    objective:
      "Handles refunds, replacements and address changes end to end inside a written policy envelope, and escalates everything outside it.",
    requirements: [
      "A policy envelope in code: value ceiling, order age, customer history, one action per order",
      "Every state-changing call carries an idempotency key so a retry cannot double-refund",
      "Compensating action defined for each write before that tool is enabled",
    ],
    tools: ["Order management read/update", "Payments refund API", "Shipping carrier API", "Customer messaging"],
    guardrails: [
      "Refund ceiling enforced server-side; above it the agent may only recommend",
      "One refund per order id, enforced by an idempotency key, not by the prompt",
      "Fraud-flagged accounts route straight to a human with no action taken",
    ],
    outputs: ["The action taken with the policy clause that authorised it", "Customer message sent, logged verbatim", "Escalation packet when the envelope is exceeded"],
    tags: ["policy envelope", "idempotency keys", "compensating actions"],
    ship: "Contained resolution on 55% of eligible contacts, zero double refunds, escalation precision above 90%.",
  },
  {
    id: 12,
    slug: "analytics-sql-agent",
    level: 2,
    domain: "Data & Analytics",
    title: "Analytics SQL agent",
    objective:
      "Turns a business question into a validated SQL query, runs it read-only, and returns the number with the query that produced it.",
    requirements: [
      "Schema and metric definitions retrieved before generation, not stuffed into the system prompt",
      "Generated SQL parsed and validated, then run with EXPLAIN and a row/cost ceiling before execution",
      "Self-correction loop on database errors, capped at three attempts",
    ],
    tools: ["Warehouse read-only role", "Schema and metric catalogue retrieval", "Query validator and cost estimator", "Chart spec renderer"],
    guardrails: [
      "Database role is physically read-only — no DDL, no DML, row limit enforced",
      "Queries touching PII columns require an entitlement check on the asking user",
      "Never present a number without the SQL and the metric definition beside it",
    ],
    outputs: ["Answer with the executed SQL and row count", "Chart spec when the shape suits it", "The metric definition used, so disputes resolve fast"],
    tags: ["schema retrieval", "validate before execute", "bounded self-correction"],
    ship: "Executable-and-correct on 80% of a 150-question benchmark; zero write statements ever reaching the warehouse.",
  },
  {
    id: 13,
    slug: "on-call-triage-agent",
    level: 2,
    domain: "Site Reliability",
    title: "On-call triage agent",
    objective:
      "When a page fires, gathers the evidence a human would gather — dashboards, recent deploys, logs, similar past incidents — and proposes the runbook step.",
    requirements: [
      "Read-only diagnostics run in parallel, with a wall-clock budget of 60 seconds",
      "Correlate the alert with deploys and config changes in the preceding hour",
      "Post a structured incident summary before proposing anything",
    ],
    tools: ["Metrics and logs query", "Deploy and change history", "Runbook retrieval", "Incident channel post", "Past incident search"],
    guardrails: [
      "No mutating infrastructure calls — the credentials cannot perform them",
      "Never page a second person; propose, and let the on-call escalate",
      "Say when evidence is inconclusive rather than picking a narrative",
    ],
    outputs: ["Incident summary: what fired, blast radius, what changed", "Ranked hypotheses with the evidence for each", "The runbook step to run next, with its rollback"],
    tags: ["parallel read-only tools", "time budget", "hypothesis ranking"],
    ship: "On-call rates the summary useful on 70% of pages; time-to-first-hypothesis under 90 seconds.",
  },
  {
    id: 14,
    slug: "candidate-screening-agent",
    level: 2,
    domain: "Recruiting",
    title: "Candidate screening agent",
    objective:
      "Scores applications against a written rubric, drafts the evidence for each score, and books interviews for the ones that clear the bar.",
    requirements: [
      "Rubric as explicit criteria with evidence required per criterion — no holistic score",
      "Structured scoring pass separate from the scheduling action",
      "Every rejection reviewable: score, evidence quote, and the rubric line applied",
    ],
    tools: ["ATS read/update", "CV parsing", "Calendar scheduling", "Candidate email templates"],
    guardrails: [
      "Protected characteristics excluded from the context the scorer sees",
      "The agent never rejects — it ranks; a human presses reject",
      "Adverse-impact stats logged per run and reviewed monthly",
    ],
    outputs: ["Criterion-level scores with the evidence quoted", "Ranked shortlist with the borderline band marked", "Interview invitations sent for confirmed advances"],
    tags: ["rubric decomposition", "evidence per score", "bias monitoring"],
    ship: "Agreement with recruiter scores at or above 85% on 200 applications, with adverse-impact ratio tracked every run.",
  },
  {
    id: 15,
    slug: "invoice-to-ledger-agent",
    level: 2,
    domain: "Accounts Payable",
    title: "Invoice to ledger agent",
    objective:
      "Extracts an invoice, three-way matches it against the purchase order and goods receipt, codes it, and posts it for approval.",
    requirements: [
      "Deterministic three-way match on quantities and amounts — the model extracts, arithmetic decides",
      "Tolerance rules configurable per vendor; anything outside goes to a human with the delta shown",
      "Duplicate invoice detection across vendor, number and amount before posting",
    ],
    tools: ["Document extraction", "ERP purchase order and receipt lookup", "ERP posting API", "Vendor master data"],
    guardrails: [
      "Payment is never released by the agent — posting and paying are separate authorities",
      "Bank detail changes always route to a human — the classic fraud vector",
      "Every posting carries the extracted document hash for audit",
    ],
    outputs: ["Coded invoice posted in draft with GL account and cost centre", "Match result showing PO, receipt and invoice side by side", "Exception queue with the reason and the numeric delta"],
    tags: ["deterministic matching", "tolerance rules", "separation of duties"],
    ship: "Touchless match rate at or above 70%, posting accuracy 99%+, zero payments initiated by the agent.",
  },
  {
    id: 16,
    slug: "test-writing-agent",
    level: 2,
    domain: "Software Quality",
    title: "Test-writing agent",
    objective:
      "Given a bug report or an uncovered module, writes tests, runs them, and iterates until they pass for the right reason.",
    requirements: [
      "Executes in a sandbox with the repository mounted and network disabled",
      "Loop is: write, run, read failure, revise — capped at six iterations and a wall-clock budget",
      "A test that passes by weakening the assertion is rejected by a diff check on assertions",
    ],
    tools: ["Sandboxed shell", "Test runner", "Repository read/write inside the sandbox", "Coverage report"],
    guardrails: [
      "No network egress from the sandbox",
      "Never modifies production source to make a test pass — tests directory only",
      "Opens a PR; a human merges",
    ],
    outputs: ["New test files with the failing case reproduced first", "Run output proving red then green", "Coverage delta and a PR ready for review"],
    tags: ["sandboxed execution", "iterate-until-green", "assertion integrity check"],
    ship: "Green, meaningful tests on 60% of assigned modules; zero production files modified.",
  },
  {
    id: 17,
    slug: "campaign-operations-agent",
    level: 2,
    domain: "Growth Marketing",
    title: "Campaign operations agent",
    objective:
      "Builds the segment, drafts the variants, schedules the send and reports the readout — inside consent, frequency and brand rules.",
    requirements: [
      "Segment built by query, previewed with a count, and approved before anything is scheduled",
      "Frequency capping and suppression lists enforced at build time, not at send time",
      "Holdout group created automatically so the readout means something",
    ],
    tools: ["Customer data platform query", "Email/push platform draft and schedule", "Consent and suppression service", "Analytics readout"],
    guardrails: [
      "Consent state checked per recipient at send, and the send blocked if stale",
      "Hard cap on audience size per run; above it, human approval",
      "No send between 21:00 and 08:00 in the recipient's local time",
    ],
    outputs: ["Segment definition with size and overlap warnings", "Variants with the holdout defined", "Scheduled send plus a post-send readout against the holdout"],
    tags: ["approval before scale", "consent enforcement", "automatic holdout"],
    ship: "Campaign setup time down 60% with zero consent violations and every send carrying a holdout.",
  },
  {
    id: 18,
    slug: "claims-intake-agent",
    level: 2,
    domain: "Insurance",
    title: "First-notice-of-loss intake agent",
    objective:
      "Runs the conversation that opens a claim: verifies the policy, gathers the facts in the right order, requests documents and creates the claim record.",
    requirements: [
      "Slot-filling conversation with a required-field schema, resilient to out-of-order answers",
      "Policy verification and coverage-in-force check before the claim is created",
      "Distress detection that hands over to a human immediately, mid-sentence if needed",
    ],
    tools: ["Policy administration lookup", "Claims system create", "Document request and upload", "Handover to human queue"],
    guardrails: [
      "Never states whether the loss is covered — intake only, coverage is an adjuster decision",
      "Injury, fatality or liability keywords force an immediate handover",
      "Recorded statements handled per jurisdiction rules, with consent captured",
    ],
    outputs: ["Claim record with the structured facts and timeline", "Document checklist sent to the claimant", "Handover packet when a human takes over"],
    tags: ["slot filling", "pre-condition checks", "hard handover triggers"],
    ship: "Claim created without human touch on 65% of straightforward losses; 100% handover on injury keywords.",
  },
  {
    id: 19,
    slug: "procurement-rfq-agent",
    level: 2,
    domain: "Procurement",
    title: "Procurement RFQ agent",
    objective:
      "Drafts the request for quote, sends it to approved vendors, chases responses, and lays the quotes side by side with the anomalies flagged.",
    requirements: [
      "Vendor list restricted to the approved master; no new vendors introduced by the agent",
      "Structured quote extraction into a comparable schema, including landed cost",
      "Timed follow-up loop with a maximum of two chases per vendor",
    ],
    tools: ["Vendor master read", "Email send/receive on a monitored mailbox", "Document extraction", "Procurement system draft PO"],
    guardrails: [
      "Never awards, signs or commits spend — comparison only",
      "No vendor sees another vendor's numbers; separate threads enforced structurally",
      "Anything from an unknown domain is quarantined, not parsed as a quote",
    ],
    outputs: ["Comparison table normalised to landed cost per unit", "Anomaly flags: outliers, changed terms, missing line items", "Draft PO for the buyer's chosen vendor"],
    tags: ["multi-party email loop", "normalised extraction", "no commit authority"],
    ship: "Cycle time down 40% with 100% of quotes normalised correctly on a 50-RFQ audit.",
  },
  {
    id: 20,
    slug: "finance-reconciliation-agent",
    level: 2,
    domain: "Personal & SMB Finance",
    title: "Reconciliation and subscription agent",
    objective:
      "Categorises transactions, matches them to invoices, finds duplicate charges and forgotten subscriptions, and prepares the cancellations for one click.",
    requirements: [
      "Rules first, model second: deterministic matchers run before anything is classified by a model",
      "Learned corrections persist as rules, so the same mistake is not repeated next month",
      "Every proposed action carries the evidence transactions that justify it",
    ],
    tools: ["Bank and card transaction feed (read-only)", "Invoice and receipt store", "Merchant enrichment", "Accounting system write"],
    guardrails: [
      "No money movement of any kind — the agent has no payment credentials",
      "Cancellations are prepared, never executed",
      "Account numbers masked everywhere they are logged or displayed",
    ],
    outputs: ["Reconciled ledger with unmatched items listed", "Duplicate and price-increase alerts with the two charges shown", "Prepared cancellation actions awaiting a click"],
    tags: ["rules before model", "persisted corrections", "no payment credentials"],
    ship: "Auto-match rate above 85% with under 1% mis-categorisation, and zero outbound money movement by design.",
  },

  /* ---------------------------------- L3 ----------------------------------- */
  {
    id: 21,
    slug: "autonomous-remediation-agent",
    level: 3,
    domain: "Site Reliability",
    title: "Autonomous remediation agent",
    objective:
      "Detects a degradation, forms a hypothesis, applies a reversible fix behind a canary, watches the metric, and rolls back itself if it was wrong.",
    requirements: [
      "Only actions with a defined inverse are enabled: scale, restart, shift traffic, toggle a flag, revert a deploy",
      "Every action is canaried, with an automatic rollback trigger on the guarding metric",
      "Durable state machine, so a crashed orchestrator resumes mid-remediation rather than reapplying",
    ],
    tools: ["Metrics and traces", "Deploy and rollback API", "Feature flag service", "Traffic shifting", "Incident record"],
    guardrails: [
      "Blast-radius cap: one service, one region, one action in flight",
      "Freeze windows and change-management blackout honoured mechanically",
      "Two consecutive failed hypotheses stops the loop and pages a human",
    ],
    outputs: ["Action taken with its inverse recorded before execution", "Canary readout: metric before, during, after", "Timeline entry in the incident with every step and decision"],
    tags: ["reversible actions only", "canary + auto-rollback", "durable state machine", "blast-radius cap"],
    ship: "Auto-resolves 30% of a defined incident class, rollback within 90s when wrong, zero incidents made worse.",
  },
  {
    id: 22,
    slug: "codebase-migration-agent",
    level: 3,
    domain: "Software Engineering",
    title: "Codebase migration agent",
    objective:
      "Carries a framework or API migration across dozens of services: edits, builds, fixes what it broke, and opens reviewable PRs service by service.",
    requirements: [
      "Deterministic codemods first; the model handles only what the codemod cannot express",
      "Per-repository sandbox with the full build and test suite, and a hard iteration cap",
      "Work decomposed so each PR is independently reviewable and revertible",
    ],
    tools: ["Sandboxed shell and build", "Codemod runner", "Git host: branch, commit, open PR", "CI status", "Dependency graph"],
    guardrails: [
      "Never merges; never touches release branches",
      "Refuses to continue on a repository whose tests were already red before it started",
      "Secrets and infrastructure directories on a hard deny list",
    ],
    outputs: ["One PR per service with the codemod diff separated from the hand-edits", "Migration report: done, blocked, needs a human decision", "Rollout order derived from the dependency graph"],
    tags: ["deterministic-first", "per-repo sandbox", "decomposed PRs", "long horizon"],
    ship: "70% of services migrated without human edits, CI green on every opened PR, zero merges by the agent.",
  },
  {
    id: 23,
    slug: "multi-agent-research-desk",
    level: 3,
    domain: "Research & Strategy",
    title: "Multi-agent research desk",
    objective:
      "Answers a question big enough to need a team: a planner splits it, researchers work in parallel, a critic attacks the draft, and a writer produces the defensible report.",
    requirements: [
      "Explicit roles with separate context windows and a shared artefact store — not one agent talking to itself",
      "The critic runs against a rubric and can send work back exactly once per section",
      "Global budget across all sub-agents, enforced centrally, with partial results returned when it is hit",
    ],
    tools: ["Search and fetch", "Internal document retrieval", "Shared artefact store", "Sub-agent spawn with per-agent budgets"],
    guardrails: [
      "Sub-agents cannot spawn further sub-agents — depth is capped at one",
      "Fetched content is data; instructions found inside it are never followed",
      "Every sentence in the final report traces to a stored artefact",
    ],
    outputs: ["Report with per-claim citations and a confidence column", "Contradictions register with both sides quoted", "Cost and step ledger per sub-agent"],
    tags: ["role decomposition", "parallel sub-agents", "critic loop", "global budget"],
    ship: "Expert-rated 4/5 on 30 questions at a predictable cost per report, with no unsourced sentences.",
  },
  {
    id: 24,
    slug: "supply-chain-replanning-agent",
    level: 3,
    domain: "Supply Chain",
    title: "Supply chain replanning agent",
    objective:
      "When a port closes or a supplier slips, re-plans routing, inventory and promises across systems, and presents the trade-off before committing.",
    requirements: [
      "Optimiser does the maths; the agent frames the problem, runs scenarios and explains the result",
      "Simulate against a digital twin before any system of record is touched",
      "Every plan carries cost, service-level and carbon deltas against doing nothing",
    ],
    tools: ["ERP and TMS read/write", "Optimisation solver", "Carrier and lane rate APIs", "Digital twin simulation", "Supplier communications"],
    guardrails: [
      "Commitments above a value threshold require named human approval",
      "Contractual commitments to customers are never silently re-promised",
      "Simulation must converge before the plan can be offered at all",
    ],
    outputs: ["Two or three ranked plans with their trade-off table", "Simulation evidence for the recommended plan", "Executed changes with the approval chain recorded"],
    tags: ["solver in the loop", "simulate before commit", "approval thresholds"],
    ship: "Replan proposed within 15 minutes of a disruption signal, accepted by planners on 60% of events.",
  },
  {
    id: 25,
    slug: "trade-surveillance-agent",
    level: 3,
    domain: "Capital Markets Compliance",
    title: "Trade surveillance investigation agent",
    objective:
      "Works surveillance alerts the way an analyst does: reconstructs the trading day, pulls communications, tests the benign explanations, and builds the case file.",
    requirements: [
      "Reconstruct order, execution and market context around the alert to the millisecond",
      "Test each benign hypothesis explicitly and record why it was or was not ruled out",
      "Immutable, timestamped work product that survives a regulatory examination years later",
    ],
    tools: ["Order and execution store", "Market data replay", "Communications archive (permissioned)", "Case management system"],
    guardrails: [
      "Zero trading authority — the credentials cannot place or cancel an order",
      "Communications access is per-case and logged; no broad fishing",
      "The agent never closes an alert as no-action; it recommends and a human signs",
    ],
    outputs: ["Case file: timeline, evidence, hypotheses tested, recommendation", "Linked exhibits with cryptographic hashes", "Audit record of every query the agent ran"],
    tags: ["evidence reconstruction", "hypothesis elimination", "immutable work product"],
    ship: "Analyst accepts the recommendation on 70% of alerts; investigation time halved; every step replayable.",
  },
  {
    id: 26,
    slug: "clinical-trial-monitoring-agent",
    level: 3,
    domain: "Clinical Research",
    title: "Trial site monitoring agent",
    objective:
      "Cross-checks case report forms against source documents across sites, raises queries on discrepancies, and ranks sites by risk for on-site visits.",
    requirements: [
      "Field-level comparison between EDC entries and source documents, with the discrepancy quantified",
      "Risk model combining query rates, protocol deviations, enrolment anomalies and timing",
      "Every query carries the protocol section and the two values that disagree",
    ],
    tools: ["EDC read", "Source document store with OCR", "Query management write", "Protocol retrieval", "Site metrics"],
    guardrails: [
      "Never edits clinical data — queries only, resolved by the site",
      "Patient identifiers never leave the validated environment",
      "Safety-relevant discrepancies escalate to a human within the hour, unconditionally",
    ],
    outputs: ["Queries with the discrepancy and protocol reference", "Site risk ranking with the drivers named", "Monitoring visit plan with the evidence per site"],
    tags: ["field-level reconciliation", "risk-based prioritisation", "validated environment"],
    ship: "Discrepancy detection at or above 90% versus manual monitoring, with false-query rate under 10%.",
  },
  {
    id: 27,
    slug: "growth-experiment-agent",
    level: 3,
    domain: "Product Growth",
    title: "Growth experiment agent",
    objective:
      "Runs the experiment loop end to end: reads the funnel, forms a hypothesis, ships the variant behind a flag, monitors guardrail metrics and calls the result.",
    requirements: [
      "Power calculation before launch; no experiment starts that cannot reach significance",
      "Guardrail metrics monitored continuously with automatic stop on degradation",
      "Sequential testing done properly — no peeking-driven early calls",
    ],
    tools: ["Analytics and funnel queries", "Feature flag and experiment platform", "Variant implementation in a sandbox", "Stats service"],
    guardrails: [
      "Exposure ramp capped: 5% until the guardrails are clean, then stepped",
      "Pricing, legal copy and consent flows are outside the agent's reach",
      "Automatic stop and rollback if any guardrail metric breaches its bound",
    ],
    outputs: ["Experiment spec with hypothesis, power and stopping rule", "Live readout with guardrail status", "Decision memo: ship, iterate or kill, with the evidence"],
    tags: ["statistical rigour", "guardrail auto-stop", "staged exposure"],
    ship: "Experiment throughput doubled with zero guardrail breaches lasting over 10 minutes.",
  },
  {
    id: 28,
    slug: "legacy-ui-automation-agent",
    level: 3,
    domain: "Enterprise Operations",
    title: "Legacy UI automation agent",
    objective:
      "Completes work in systems that have no API by driving the interface, verifying each step actually happened, and stopping cold when the screen is not what it expected.",
    requirements: [
      "Every action verified by reading the resulting state back — never assume a click worked",
      "Deterministic selectors where they exist; vision only where they do not",
      "Full step recording (screenshot plus action) so any run can be replayed and audited",
    ],
    tools: ["Browser or desktop control", "Screen reading and OCR", "Credential broker (agent never sees the secret)", "Work queue"],
    guardrails: [
      "Screen content is untrusted input — instructions rendered on screen are never obeyed",
      "Hard stop on any unexpected dialog, and on any screen not in the known set",
      "Irreversible actions — submit, pay, delete — require a human keystroke",
    ],
    outputs: ["Completed transactions with per-step verification evidence", "Exception queue with the screenshot at the point of failure", "Replayable run log"],
    tags: ["verify every step", "screen content is untrusted", "credential brokering"],
    ship: "Task completion above 85% with zero unverified writes and every failure reproducible from the log.",
  },
  {
    id: 29,
    slug: "data-platform-reliability-agent",
    level: 3,
    domain: "Data Engineering",
    title: "Data platform reliability agent",
    objective:
      "Owns the 3am pipeline failure: diagnoses it, traces the lineage of what is affected, patches or reruns within limits, and backfills under a cost cap.",
    requirements: [
      "Lineage traversal to compute the true blast radius before acting on anything",
      "Cost estimate required and enforced before a backfill starts",
      "Schema drift handled as a proposed contract change, not a silent cast",
    ],
    tools: ["Orchestrator API", "Warehouse admin (scoped)", "Lineage graph", "Data quality test suite", "Cost estimation API"],
    guardrails: [
      "Never drops or truncates; never modifies raw landing zones",
      "Backfill cost cap enforced by the platform, with the job killed at the ceiling",
      "Downstream consumers notified before a rerun changes numbers they already read",
    ],
    outputs: ["Diagnosis with the failing step and the upstream cause", "Impact list from lineage: tables, dashboards, models, consumers", "Fix applied or a PR proposing the contract change, plus the backfill receipt"],
    tags: ["lineage-driven blast radius", "cost caps", "contract changes not silent casts"],
    ship: "Auto-resolves 40% of overnight failures, mean time to repair down 60%, zero data loss events.",
  },
  {
    id: 30,
    slug: "fleet-operations-agent",
    level: 3,
    domain: "Robotics & IoT",
    title: "Fleet operations agent",
    objective:
      "Supervises a fleet of physical devices: reads telemetry, plans interventions, stages firmware and dispatches technicians — with the physical world's rules respected.",
    requirements: [
      "Safety interlocks live in the device firmware, not in the agent's reasoning",
      "Every fleet-wide change runs simulation, then a canary cohort, then staged rings",
      "Human takeover available at all times, and the agent yields instantly when it is invoked",
    ],
    tools: ["Fleet telemetry stream", "Device command channel (rate limited)", "Firmware staging and rollout", "Simulation environment", "Field dispatch system"],
    guardrails: [
      "No command that can injure or strand a device leaves the agent — those are firmware-gated",
      "Cohort size ceilings per ring, and an automatic halt on anomaly rate",
      "Geofence, duty-cycle and regulatory limits enforced outside the model",
    ],
    outputs: ["Intervention plan per cohort with the simulation evidence", "Rollout state per ring with halt conditions", "Technician dispatches with the diagnosis and parts needed"],
    tags: ["safety outside the model", "simulation-gated rollout", "instant human takeover"],
    ship: "Fleet availability up with zero safety incidents attributable to the agent, and every rollout halted correctly on its anomaly threshold.",
  },
];

export const agentBySlug = (slug: string) => agents.find((a) => a.slug === slug);

export function agentSearchIndex(a: Agent) {
  return [a.domain, a.title, a.objective, ...a.tags, ...a.requirements, ...a.tools, ...a.guardrails, ...a.outputs, a.ship]
    .join(" ")
    .toLowerCase();
}
