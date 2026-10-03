export type Tier = 1 | 2 | 3;

export type Project = {
  id: number;
  slug: string;
  tier: Tier;
  industry: string;
  title: string;
  use: string;
  requirements: string[];
  inputs: string[];
  outputs: string[];
  tags: string[];
  ship: string;
};

export const TIER_NAME: Record<Tier, string> = {
  1: "Easy",
  2: "Medium",
  3: "Advanced",
};

export const TIER_BLURB: Record<Tier, string> = {
  1: "One corpus, one retrieval pass, citations and a refusal path. Everything you need to learn the shape of the pipeline.",
  2: "Hybrid search, metadata filters, reranking, or a second data type. The tier where retrieval quality stops being luck.",
  3: "Several of: multi-hop planning, knowledge graphs, structured fusion, streaming, multimodality, per-user ACL, audit-grade traceability.",
};

export const TIER_MECHANISM: Record<Tier, string> = {
  1: "chunk → embed → retrieve → cite",
  2: "+ BM25 fusion · rerank · filters · second modality",
  3: "+ planner · graph · streams · ACL · replayable audit",
};

export const projects: Project[] = [
  /* ---------------------------------- EASY --------------------------------- */
  {
    id: 1,
    slug: "returns-and-policy-concierge",
    tier: 1,
    industry: "Retail & E-commerce",
    title: "Returns and policy concierge",
    use: "A shopper asks whether a swimsuit can go back after 40 days and gets the policy-accurate answer with the clause it came from.",
    requirements: [
      "Single corpus of ~300 policy pages, re-indexed nightly",
      "Every answer cites the policy section and its effective date",
      "Below the score threshold, hand off to a human instead of guessing",
    ],
    inputs: [
      "Help-centre HTML and returns, shipping and warranty policy PDFs",
      "Product care and category attributes from the catalogue feed (CSV)",
      "Historical contact-centre questions for the golden set",
    ],
    outputs: [
      "A two to four sentence answer in the shopper's words",
      "Deep link to the exact policy clause plus its effective date",
      "Deflect-or-escalate decision passed to the support widget",
    ],
    tags: ["recursive chunking", "dense top-k", "citation rendering", "abstention"],
    ship: "85% clause-exact accuracy on 100 labelled shopper questions and p95 under 2s.",
  },
  {
    id: 2,
    slug: "registrar-and-syllabus-desk",
    tier: 1,
    industry: "Higher Education",
    title: "Registrar and syllabus desk",
    use: "Students ask about deadlines, prerequisites and grading policy across 400 syllabi and the academic calendar.",
    requirements: [
      "Term and programme metadata filters so a 2026 answer never quotes a 2023 syllabus",
      "Scope to a single course when the student names one",
      "Route eligibility and appeals questions to a human advisor",
    ],
    inputs: [
      "Syllabus PDFs and DOCX, one per course section",
      "Academic calendar table and programme requirement catalogue",
      "Course code and prerequisite list from the student system",
    ],
    outputs: [
      "Direct answer with course code and syllabus page cited",
      "Dates normalised to ISO format with the term named",
      "Advisor hand-off for anything policy-discretionary",
    ],
    tags: ["metadata filters", "per-course scoping", "date normalisation"],
    ship: "Zero cross-term contamination on 50 probe questions; recall@5 at or above 0.90.",
  },
  {
    id: 3,
    slug: "permits-and-city-services-desk",
    tier: 1,
    industry: "Local Government",
    title: "Permits and city services desk",
    use: "Residents ask which permit they need, what it costs and what to bring to the counter.",
    requirements: [
      "Plain-language answers at roughly an eighth-grade reading level",
      "English and Spanish served from the same index with parity checks",
      "Every answer links the actual application form",
    ],
    inputs: [
      "Municipal code chapters and fee schedules with tables",
      "Department FAQ pages and office-hours listings",
      "Fillable form PDFs with their form numbers",
    ],
    outputs: [
      "Ordered step list with required documents checklist",
      "Fee amount with its effective date",
      "Link to the correct form plus the office and its hours",
    ],
    tags: ["table-aware parsing", "multilingual index", "readability check"],
    ship: "90% of answers carry the correct form link; bilingual parity verified on 40 paired questions.",
  },
  {
    id: 4,
    slug: "handbook-and-benefits-answers",
    tier: 1,
    industry: "Human Resources",
    title: "Handbook and benefits answers",
    use: "Employees ask about PTO accrual, parental leave and expense rules without opening a ticket.",
    requirements: [
      "Entity-scoped retrieval so the US handbook never answers a German employee",
      "No personal data written to query logs",
      "Eligibility edge cases escalate to an HR business partner",
    ],
    inputs: [
      "Employee handbook per legal entity and benefits summary documents",
      "Expense and travel policy, holiday calendars per country",
      "Job-family definitions for role-specific policies",
    ],
    outputs: [
      "Answer with the handbook section and entity named",
      "Entity-specific caveat when policies diverge",
      "Pre-filled HR ticket draft when escalation triggers",
    ],
    tags: ["entity pre-filter", "PII redaction", "escalation policy"],
    ship: "100% entity-correct on the audit set and zero personal data rows in the query log.",
  },
  {
    id: 5,
    slug: "api-documentation-copilot",
    tier: 1,
    industry: "Developer Tools SaaS",
    title: "API documentation copilot",
    use: "Developers ask how to authenticate, paginate or handle a 429, and get an answer grounded in the version of the docs they are on.",
    requirements: [
      "Version-aware retrieval keeping v2 and v3 strictly separate",
      "Code fences never split by chunking",
      "Re-index automatically on every documentation deploy",
    ],
    inputs: [
      "Markdown and MDX documentation, OpenAPI specification",
      "Changelog, migration guides and SDK reference",
      "Language preference and SDK version from the caller",
    ],
    outputs: [
      "Prose answer plus a snippet in the caller's language",
      "Anchored deep links into the docs and a version badge",
      "Related-endpoint suggestions from the spec",
    ],
    tags: ["code-aware chunking", "version namespaces", "CI-triggered indexing"],
    ship: "Snippets compile in CI for 95% of the eval set; docs deploy to searchable in under 10 minutes.",
  },
  {
    id: 6,
    slug: "allergen-and-menu-lookup",
    tier: 1,
    industry: "Restaurants & Hospitality",
    title: "Allergen and menu lookup",
    use: "Staff and guests check ingredients, allergens and substitutions across a sixty-location restaurant group.",
    requirements: [
      "Location-scoped menus, since the same dish differs by kitchen",
      "Conservative allergen behaviour: unknown means ask the kitchen, never a guess",
      "Sub-second responses on floor-staff tablets",
    ],
    inputs: [
      "Menu spreadsheets per location and seasonal updates",
      "Supplier ingredient sheets (PDF) and the allergen matrix",
      "Preparation notes covering shared fryers and cross-contact",
    ],
    outputs: [
      "Verdict of contains, may contain, or free-of, with the source line",
      "Full ingredient list and a substitution suggestion",
      "Explicit prompt to confirm with the kitchen when uncertain",
    ],
    tags: ["strict abstention", "structured field retrieval", "per-location index"],
    ship: "Zero false allergen-free answers on the red-team set; p95 under 800 ms.",
  },
  {
    id: 7,
    slug: "lease-clause-explainer",
    tier: 1,
    industry: "Real Estate",
    title: "Lease clause explainer",
    use: "Property managers and tenants ask what a specific lease says about pets, subletting or early termination.",
    requirements: [
      "Per-document scoping with tenant-level access control",
      "Quote the clause verbatim before paraphrasing it",
      "Jurisdiction disclaimer on every answer",
    ],
    inputs: [
      "Scanned lease PDFs run through OCR, plus addenda and riders",
      "State landlord-tenant summaries and property rulebooks",
      "Tenant-to-lease mapping from the management system",
    ],
    outputs: [
      "Verbatim clause text followed by a plain-English reading",
      "Page and section reference into the source lease",
      "Not-legal-advice notice and escalation to the manager",
    ],
    tags: ["OCR ingestion", "per-document ACL", "quote-then-explain"],
    ship: "Clause retrieval accuracy at or above 90% across 60 leases; every answer contains a verbatim quote.",
  },
  {
    id: 8,
    slug: "grant-eligibility-pre-screen",
    tier: 1,
    industry: "Nonprofit & Grants",
    title: "Grant eligibility pre-screen",
    use: "Programme staff check whether an organisation and project qualify before spending a week on the application.",
    requirements: [
      "Retrieval across many funders with funder and deadline filters",
      "Produce a checklist of requirements, never a yes-or-no verdict",
      "Flag requirements that conflict between funders",
    ],
    inputs: [
      "Funder RFP and guideline PDFs with eligibility criteria",
      "The organisation's own profile: budget, status, service area",
      "Prior successful applications for language reuse",
    ],
    outputs: [
      "Checklist marking each requirement met, unmet or unknown",
      "Supporting quote from the guideline for each item",
      "Deadline, submission format and the gaps left to resolve",
    ],
    tags: ["multi-source retrieval", "per-funder filters", "structured JSON output"],
    ship: "Recall of hard eligibility requirements at or above 0.90 across 25 RFPs.",
  },
  {
    id: 9,
    slug: "fare-rules-and-disruption-desk",
    tier: 1,
    industry: "Airlines & Travel",
    title: "Fare rules and disruption desk",
    use: "Agents and passengers ask about change fees, baggage allowances and entitlements when a flight is cancelled.",
    requirements: [
      "Scope retrieval by fare family, route and cabin",
      "Keep carrier policy distinguishable from regulation (EU261, DOT)",
      "Show the effective date on every rule quoted",
    ],
    inputs: [
      "Fare rule text, conditions of carriage, baggage tables",
      "Irregular-operations playbook and rebooking rules",
      "Regulator entitlement summaries by jurisdiction",
    ],
    outputs: [
      "Entitlement answer with the fee or allowance figure",
      "Attribution separating airline policy from regulation",
      "Next action for the agent and the wording to read aloud",
    ],
    tags: ["table extraction", "source-type tagging", "effective-date filter"],
    ship: "95% correct fee figures across 80 scenarios with no policy-versus-regulation mix-ups.",
  },
  {
    id: 10,
    slug: "manual-driven-troubleshooting",
    tier: 1,
    industry: "Consumer Electronics",
    title: "Manual-driven troubleshooting",
    use: "An owner types a symptom such as E4 on the display and gets the fix from the right model's manual.",
    requirements: [
      "Identify the model from the question or serial before retrieving",
      "Return repair steps in order, with the referenced figure",
      "Know when to stop and book a service visit",
    ],
    inputs: [
      "Product manuals as PDF with figures and error-code tables",
      "Service bulletins and firmware release notes",
      "Warranty terms and the registered product record",
    ],
    outputs: [
      "Ordered repair steps with the error code's meaning",
      "The relevant diagram image alongside its step",
      "Warranty status hint and a service-booking trigger",
    ],
    tags: ["model metadata filter", "figure extraction", "code table lookup first"],
    ship: "Correct model chosen 98% of the time and first-answer resolution at or above 80% on 100 real tickets.",
  },

  /* --------------------------------- MEDIUM -------------------------------- */
  {
    id: 11,
    slug: "clinical-guideline-and-formulary-assistant",
    tier: 2,
    industry: "Healthcare Provider",
    title: "Clinical guideline and formulary assistant",
    use: "Clinicians ask dosing, interaction and care-pathway questions answered only from the institution's approved guidelines and formulary.",
    requirements: [
      "Hybrid BM25 and dense retrieval — drug names and codes fail on embeddings alone",
      "Every claim tied to a guideline version and section",
      "Hard refusal outside the approved corpus, with a full audit record",
    ],
    inputs: [
      "Institutional care pathways, formulary tables, drug monographs",
      "National guideline PDFs and their revision history",
      "RxNorm and ICD code sets for lexical matching",
    ],
    outputs: [
      "Answer with inline citations to guideline, section and version",
      "Contraindication and interaction callouts pulled from the monograph",
      "Immutable audit record of the context used, plus a decision-support banner",
    ],
    tags: ["hybrid + rerank", "lexical code boost", "abstention gate", "audit trail"],
    ship: "Faithfulness at or above 0.95 on a clinician-reviewed set; 100% of answers cite an in-corpus source.",
  },
  {
    id: 12,
    slug: "live-contact-centre-agent-assist",
    tier: 2,
    industry: "Retail Banking",
    title: "Live contact-centre agent assist",
    use: "While the call is still going, the right procedure, policy quote and next step appear on the agent's screen.",
    requirements: [
      "Under 1.5s from transcript segment to suggestion",
      "Filter by product, customer segment and region, with agent entitlement checks",
      "Suggestions must be quotable to the customer verbatim",
    ],
    inputs: [
      "Policy and procedure manuals, product terms and conditions",
      "Streaming call transcript from ASR and CRM case notes",
      "Regulator guidance and mandated disclosure scripts",
    ],
    outputs: [
      "Ranked answer cards with procedure steps and the quoted policy",
      "The compliance disclosure to read aloud",
      "Suggested disposition code written back to the CRM",
    ],
    tags: ["streaming query formation", "hybrid + rerank", "ACL filters", "semantic cache"],
    ship: "p95 suggestion latency under 1.5s, agent accept rate at or above 40%, handle time down 15%.",
  },
  {
    id: 13,
    slug: "claims-adjuster-coverage-copilot",
    tier: 2,
    industry: "Insurance",
    title: "Claims adjuster coverage copilot",
    use: "An adjuster asks whether a specific loss is covered under a specific policy, endorsements included.",
    requirements: [
      "Assemble the policy as it stood on the loss date: base wording plus endorsements",
      "Reason across limit, deductible and sub-limit tables",
      "Separate what the wording says from what the adjuster must decide",
    ],
    inputs: [
      "Policy wordings, endorsement PDFs and schedules of limits",
      "First notice of loss, claim file notes and loss photographs",
      "Prior claims on the same policy and jurisdictional bulletins",
    ],
    outputs: [
      "Draft coverage position with clause-level citations",
      "Limits and deductible summary table for this claim",
      "Exclusions triggered and the open questions the adjuster must answer",
    ],
    tags: ["effective-dated assembly", "table-aware chunking", "multi-doc synthesis"],
    ship: "Correct wording version selected 100% of the time; agreement with a senior adjuster at or above 80%.",
  },
  {
    id: 14,
    slug: "field-service-technician-assistant",
    tier: 2,
    industry: "Industrial Manufacturing",
    title: "Field-service technician assistant",
    use: "On the plant floor a technician asks how to service an asset and gets the procedure plus what failed on this machine before.",
    requirements: [
      "Works on a tablet through intermittent connectivity via a local index that syncs",
      "Fuse OEM procedures with this asset's own work-order history",
      "Return the diagram with the step that references it",
    ],
    inputs: [
      "OEM manuals (S1000D or PDF) and parts catalogue",
      "CMMS work orders, alarm history and prior repair photographs",
      "Asset register with model, serial and installed options",
    ],
    outputs: [
      "Step-by-step procedure with safety and lockout warnings",
      "Parts and tools list validated against the catalogue",
      "The last three failures on this asset and how they were resolved",
    ],
    tags: ["on-device quantised index", "asset-id join", "multimodal figures", "offline-first sync"],
    ship: "Fully usable offline for an eight-hour shift; median time-to-procedure under 30s; parts accuracy at or above 90%.",
  },
  {
    id: 15,
    slug: "contract-review-against-a-playbook",
    tier: 2,
    industry: "Legal Services",
    title: "Contract review against a playbook",
    use: "An incoming contract is reviewed clause by clause against the firm's negotiation playbook, with deviations flagged.",
    requirements: [
      "Clause-level segmentation rather than fixed-size chunks",
      "For each clause type, retrieve the playbook position and precedent language",
      "Every flag carries a suggested redline and a fallback position",
    ],
    inputs: [
      "Incoming contract in DOCX or PDF, plus the negotiation playbook",
      "Precedent clause bank and prior executed agreements",
      "Risk taxonomy and approval thresholds",
    ],
    outputs: [
      "Clause table: type, risk rating, deviation, playbook position, redline",
      "Summary memo of the material issues in negotiation order",
      "Reviewer queue with the model's confidence per clause",
    ],
    tags: ["clause classification", "per-type indexes", "structured output", "human review"],
    ship: "90% of high-risk clauses flagged on a 40-contract benchmark with a false-flag rate under 15%.",
  },
  {
    id: 16,
    slug: "newsroom-archive-research-desk",
    tier: 2,
    industry: "News & Media",
    title: "Newsroom archive research desk",
    use: "A reporter asks what the paper has published about a company's safety record since 2019 and gets a sourced brief.",
    requirements: [
      "Recency- and entity-aware retrieval across two million articles",
      "Collapse wire duplicates and reruns before ranking",
      "Never blend archival claims with today's facts without dates attached",
    ],
    inputs: [
      "Thirty-year article archive, wire feeds and photo captions",
      "Reporter notes and the newsroom entity and topic taxonomy",
      "Corrections log, so retracted claims are excluded",
    ],
    outputs: [
      "Chronological brief with per-claim citation to article and date",
      "Entity timeline of the events found",
      "Deduplicated source list with the earliest publication first",
    ],
    tags: ["time-decay ranking", "near-duplicate detection", "entity linking", "map-reduce summary"],
    ship: "nDCG@10 at or above 0.70 against librarian judgements; duplicates under 5% of returned results.",
  },
  {
    id: 17,
    slug: "course-tutor-over-textbook-and-lectures",
    tier: 2,
    industry: "EdTech",
    title: "Course tutor over textbook and lectures",
    use: "A learner asks a concept question and gets an explanation anchored to the textbook section and the exact lecture minute.",
    requirements: [
      "Align transcript chunks to video timestamps within a few seconds",
      "Adapt explanation depth to the learner's level in the course",
      "Never surface answers to graded assessments",
    ],
    inputs: [
      "Textbook with chapter and section structure, slide decks",
      "Lecture video with ASR transcripts and word-level timings",
      "Problem sets with solutions in a restricted namespace",
    ],
    outputs: [
      "Explanation with the textbook section referenced",
      "Deep link to the video at the timestamp that covers it",
      "A practice question, with graded-item answers withheld",
    ],
    tags: ["timestamped chunking", "section hierarchy metadata", "restricted namespace"],
    ship: "Citations land within 10s of the right moment 95% of the time; zero solution leakage in red-team tests.",
  },
  {
    id: 18,
    slug: "customs-classification-and-tariff-advisor",
    tier: 2,
    industry: "Logistics & Trade",
    title: "Customs classification and tariff advisor",
    use: "An analyst describes a product and gets a defensible HS code with duty rate and the documents the shipment needs.",
    requirements: [
      "Retrieval across a hierarchy — chapter, heading, subheading — not flat text",
      "Combine legal notes with prior binding rulings before ranking codes",
      "Show the reasoning that separates the top candidates",
    ],
    inputs: [
      "HS and HTS nomenclature with explanatory notes",
      "Binding rulings database and rules of origin for active trade agreements",
      "Past shipment declarations and product specifications",
    ],
    outputs: [
      "Ranked candidate codes with duty rate and the deciding note quoted",
      "Required documents and origin evidence for the chosen code",
      "Confidence score and a seek-broker-review flag under threshold",
    ],
    tags: ["hierarchy-aware retrieval", "rules + retrieval hybrid", "JSON to TMS"],
    ship: "Top-1 matches the broker decision at or above 80% and top-3 at or above 95% across 200 historical shipments.",
  },
  {
    id: 19,
    slug: "soc-alert-triage-assistant",
    tier: 2,
    industry: "Cybersecurity",
    title: "SOC alert triage assistant",
    use: "For a firing alert, the runbook, the similar past incidents and the relevant intel arrive together with a proposed first step.",
    requirements: [
      "Join a structured alert payload with unstructured knowledge",
      "Threat intel searchable within minutes of publication",
      "Strictly read-only: it proposes containment, it never executes it",
    ],
    inputs: [
      "Detection runbooks, past incident tickets and postmortems",
      "Threat intel feeds (STIX) and vendor advisories",
      "Asset inventory and the alert payload itself (JSON)",
    ],
    outputs: [
      "Triage summary with matched runbook steps in order",
      "Similar prior incidents and how each was resolved",
      "ATT&CK technique mapping and a recommended next action with confidence",
    ],
    tags: ["structured-to-query templating", "freshness-weighted ranking", "streaming ingest", "no-write tools"],
    ship: "Analyst agreement with the proposed step at or above 75%; intel searchable within 15 minutes of publication.",
  },
  {
    id: 20,
    slug: "agronomy-advisory-for-smallholder-networks",
    tier: 2,
    industry: "Agriculture",
    title: "Agronomy advisory for smallholder networks",
    use: "Field agents and farmers ask what to spray, when to plant and how to treat a symptom, in their own language, on a weak connection.",
    requirements: [
      "Multilingual retrieval over an English plus local-language corpus",
      "Fuse static agronomy protocols with this location's weather and soil records",
      "Answers must fit an SMS or WhatsApp message on 2G",
    ],
    inputs: [
      "Crop protocol PDFs, extension bulletins, pesticide label registry",
      "Weather history and forecast API, soil test records by plot",
      "Farmer-submitted photographs of the affected crop",
    ],
    outputs: [
      "Advice under 320 characters, in the language of the question",
      "Dosage inside the label's legal limits, with the label cited",
      "Timing window tied to the local forecast, plus an escalate-to-agronomist flag",
    ],
    tags: ["multilingual embeddings", "structured data join", "response compression", "edge cache"],
    ship: "Agronomist-rated correctness at or above 85% across three languages, answering in under 5s on 2G.",
  },

  /* -------------------------------- ADVANCED ------------------------------- */
  {
    id: 21,
    slug: "evidence-synthesis-over-a-knowledge-graph",
    tier: 3,
    industry: "Pharmaceutical R&D",
    title: "Evidence synthesis over a knowledge graph",
    use: "A scientist asks whether a target has support in an indication and gets a synthesis across papers, trials and internal study reports, with the contradictions named.",
    requirements: [
      "Multi-hop retrieval over a target–compound–trial–indication graph, fused with vector search",
      "Label evidence strength and surface contradictions rather than averaging them",
      "Paragraph-level provenance; internal documents never leave the private deployment",
    ],
    inputs: [
      "Full-text literature, ClinicalTrials records, patents",
      "Internal clinical study reports and lab notebooks",
      "Ontologies: MeSH, ChEBI, UniProt, plus an in-house target dictionary",
    ],
    outputs: [
      "Synthesis with an evidence table: claim, direction, study, n, quality",
      "Explicit contradiction list with both sides cited",
      "The graph path behind the conclusion and an exportable citation set",
    ],
    tags: ["GraphRAG", "multi-hop planner", "evidence grading", "on-prem inference"],
    ship: "Expert-rated synthesis at or above 4 of 5; every claim traceable to a paragraph; zero cross-corpus leakage in audit.",
  },
  {
    id: 22,
    slug: "multi-hop-analyst-copilot",
    tier: 3,
    industry: "Investment Research",
    title: "Multi-hop analyst copilot",
    use: "How segment margin moved across five peers since a tariff change, and what each management team said about it — answered in one pass.",
    requirements: [
      "Route sub-questions: text-to-SQL for figures, vector for narrative, transcript index for commentary",
      "Decompose multi-entity questions and resolve entities across tickers and CIKs",
      "Every number reconciles to its source table or the answer is blocked; MNPI stays segregated",
    ],
    inputs: [
      "SEC filings with XBRL facts and narrative text",
      "Earnings-call audio, transcripts with speaker labels and timestamps",
      "Broker notes, internal models and market time-series (Parquet)",
    ],
    outputs: [
      "Analyst brief with a peer comparison table sourced cell by cell",
      "Quoted management commentary with speaker and timestamp",
      "Chart-ready series and a full audit trail of the queries run",
    ],
    tags: ["agentic planner", "tool routing SQL + vector", "numeric verification", "entity resolution"],
    ship: "Numeric reconciliation at 100% — any mismatch blocks the answer — and multi-hop accuracy at or above 70% on 150 analyst questions.",
  },
  {
    id: 23,
    slug: "grid-asset-condition-intelligence",
    tier: 3,
    industry: "Energy & Utilities",
    title: "Grid asset condition intelligence",
    use: "An engineer asks why a transformer bank is flagged and gets telemetry trends, inspection imagery findings and the standard that sets the threshold.",
    requirements: [
      "Fuse time-series telemetry, thermal and drone imagery, and standards text in one answer",
      "Temporal reasoning: has this worsened since June, and by how much",
      "Geospatial and regional filtering across more than ten million assets",
    ],
    inputs: [
      "SCADA and PMU time-series, inspection reports",
      "Drone and thermal imagery with geotags and EXIF",
      "IEEE and IEC standards, maintenance history, GIS asset layers",
    ],
    outputs: [
      "Condition assessment with trend data and the change since last inspection",
      "Annotated image evidence with the defect located",
      "The standard's threshold quoted, plus a prioritised intervention",
    ],
    tags: ["multimodal embeddings", "time-series to text", "geo + temporal filters", "regional sharding"],
    ship: "Engineer agreement at or above 80% on 100 flagged assets, with p95 under 3s across a ten-million-asset index.",
  },
  {
    id: 24,
    slug: "airworthiness-compliance-assistant",
    tier: 3,
    industry: "Aerospace MRO",
    title: "Airworthiness compliance assistant",
    use: "A mechanic asks for the current approved procedure and gets it only from the revision in force — inside an air-gapped facility.",
    requirements: [
      "Revision-controlled retrieval with a diff showing what changed between revisions",
      "Runs fully offline on self-hosted models inside the secure network",
      "Answers replayable years later: archive the retrieved context, validate every part number against the parts master",
    ],
    inputs: [
      "S1000D data modules, AMM and CMM manuals",
      "Airworthiness Directives and Service Bulletins with applicability",
      "Parts master, effectivity data and prior signed task cards",
    ],
    outputs: [
      "Procedure with the effective revision and AD applicability stated",
      "Revision diff highlighting what changed since the last release",
      "Validated parts list and a signed audit record of the context used",
    ],
    tags: ["air-gapped stack", "versioned index snapshots", "entity validation", "deterministic decoding"],
    ship: "100% correct revision on the audit set, zero unvalidated part numbers emitted, and any answer replayable from its snapshot.",
  },
  {
    id: 25,
    slug: "cross-lingual-outbreak-signal-briefing",
    tier: 3,
    industry: "Public Health",
    title: "Cross-lingual outbreak signal briefing",
    use: "An epidemiologist opens a daily brief of emerging signals drawn from news, ministry bulletins and surveillance reports in twenty languages.",
    requirements: [
      "Continuous ingestion with deduplication and entity resolution across transliterations",
      "Rank by signal novelty against a rolling baseline, not by similarity",
      "Tier sources explicitly so confirmed reports never read like rumour",
    ],
    inputs: [
      "Multilingual news feeds, health-ministry bulletins, ProMED posts",
      "WHO and ECDC situation reports, lab surveillance summaries",
      "Historical baseline of reported events by location and pathogen",
    ],
    outputs: [
      "Ranked signals with location, pathogen, counts and source tier",
      "Original-language quote beside its translation",
      "Change-since-yesterday delta and a human review queue",
    ],
    tags: ["streaming ingest", "cross-lingual embeddings", "near-duplicate clustering", "novelty scoring"],
    ship: "Under 30 minutes from publication to brief, duplicate-cluster purity at or above 0.90, expert-rated precision at or above 0.80 on the top 20.",
  },
  {
    id: 26,
    slug: "permission-aware-company-wide-search",
    tier: 3,
    industry: "Enterprise Knowledge Ops",
    title: "Permission-aware company-wide search",
    use: "Any employee asks anything and gets an answer built only from documents they are actually allowed to see.",
    requirements: [
      "Access control enforced inside the search, never as a post-filter",
      "Connectors to a dozen SaaS sources with incremental sync and deletion propagation",
      "More than one hundred million chunks under a per-user latency budget, with a staleness SLO",
    ],
    inputs: [
      "Drive, SharePoint, Confluence, Slack, Jira, Salesforce, Zendesk, GitHub, HRIS",
      "Each source's permission graph, synced continuously",
      "Org chart and group membership for group-level grants",
    ],
    outputs: [
      "Answer with citations to source system, document and permission-checked link",
      "A notice when related documents exist but are not visible to this user",
      "Freshness stamp per cited document",
    ],
    tags: ["ACL tags in index", "permission-graph sync", "tombstoned upserts", "tiered shards"],
    ship: "Zero unauthorised passages in a ten-thousand-probe permission audit, p95 under 2.5s at 100M chunks, deletions reflected within 5 minutes.",
  },
  {
    id: 27,
    slug: "silicon-bring-up-debug-agent",
    tier: 3,
    industry: "Semiconductor",
    title: "Silicon bring-up debug agent",
    use: "An engineer pastes a failing signature and asks what is wrong; the agent searches specs, RTL and the bug database before it answers.",
    requirements: [
      "Agentic loop that can query the bug database, search RTL and retrieve spec sections across several passes",
      "Machine logs parsed into templated, retrievable events rather than raw text",
      "Propose the next experiment, not a summary — and keep the whole loop inside the design network",
    ],
    inputs: [
      "Design specifications and integration guides, RTL and testbench code",
      "Simulation and lab logs, waveform metadata",
      "Bug database and ECO history",
    ],
    outputs: [
      "Ranked hypotheses, each with its own supporting evidence",
      "Spec sections quoted and similar prior bugs linked",
      "A concrete next test to run, with the signal to watch",
    ],
    tags: ["tool-using agent", "log templating", "hypothesis ranking", "self-hosted models"],
    ship: "Root cause inside the top three hypotheses for at least 60% of 100 closed bugs, with a median loop under 60s.",
  },
  {
    id: 28,
    slug: "prior-authorisation-decision-support",
    tier: 3,
    industry: "Health Payer",
    title: "Prior-authorisation decision support",
    use: "A nurse reviewer sees, criterion by criterion, whether the submitted clinical evidence meets the medical policy.",
    requirements: [
      "Decompose each policy into checkable criteria and evaluate them individually",
      "Fuse structured clinical data (FHIR) with policy text and faxed notes",
      "Appeal-grade reproducible rationales; recommendation only — never an autonomous denial",
    ],
    inputs: [
      "Medical policy documents, LCD and NCD coverage determinations",
      "Member record as FHIR R4, claims history, code sets (CPT, ICD, HCPCS)",
      "Submitted clinical notes and faxes requiring OCR",
    ],
    outputs: [
      "Criteria table marking met, not met or insufficient, each with an evidence pointer",
      "Recommended disposition with an appeal-ready rationale",
      "Audit bundle reproducing the decision on re-run, pending human sign-off",
    ],
    tags: ["criteria decomposition", "structured + unstructured fusion", "OCR pipeline", "deterministic evaluation"],
    ship: "Nurse agreement at or above 90% on criterion-level labels, 100% rationale reproducibility, zero autonomous denials.",
  },
  {
    id: 29,
    slug: "root-cause-analysis-over-the-network-graph",
    tier: 3,
    industry: "Telecommunications",
    title: "Root-cause analysis over the network graph",
    use: "When alarms storm, the system explains what actually broke by walking the topology instead of summarising the noise.",
    requirements: [
      "Graph traversal over live topology fused with vendor documentation and change history",
      "Ingest alarm and syslog streams at fifty thousand events per minute",
      "Correlate symptom to upstream cause and propose a fix with a rollback path",
    ],
    inputs: [
      "Topology and inventory graph, updated continuously",
      "Alarm and syslog streams, KPI time-series",
      "Vendor manuals, release notes and change tickets",
    ],
    outputs: [
      "Root-cause statement with the causal path through the topology drawn",
      "Correlated alarm cluster collapsed to one incident",
      "Vendor procedure for the fix, blast-radius estimate and rollback steps",
    ],
    tags: ["GraphRAG on a live graph", "streaming ingestion", "causal path search", "incremental graph updates"],
    ship: "Correct root cause at top-1 for at least 65% of past incidents, alarm to hypothesis under 90s at 50k events per minute.",
  },
  {
    id: 30,
    slug: "timestamp-grounded-video-library-qa",
    tier: 3,
    industry: "Video Streaming",
    title: "Timestamp-grounded video library Q&A",
    use: "Search and ask questions across a hundred thousand hours of video and land on the exact second that answers it.",
    requirements: [
      "Index speech, on-screen text and visual scenes as separate modalities, fused at query time",
      "Every answer cites a playable timestamp within a few seconds of the moment",
      "Bounded ingest cost per hour, with rights and geo restrictions enforced inside retrieval",
    ],
    inputs: [
      "Video files with shot boundaries and frame embeddings",
      "ASR transcripts with word timings and subtitles in several languages",
      "OCR of on-screen text, plus rights and territory metadata",
    ],
    outputs: [
      "Answer with playable deep links carrying start and end times",
      "Ranked matching clips with the modality that matched shown",
      "Per-clip rights and geo status for the requesting viewer",
    ],
    tags: ["multimodal indexing", "late fusion", "shot-level chunking", "tiered ingest"],
    ship: "Correct clip in the top three for at least 75% of queries, citations within 3s, ingest cost held under the per-hour target.",
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const industries = [...new Set(projects.map((p) => p.industry))].sort();

export function searchIndex(p: Project) {
  return [p.industry, p.title, p.use, ...p.tags, ...p.requirements, ...p.inputs, ...p.outputs, p.ship]
    .join(" ")
    .toLowerCase();
}
