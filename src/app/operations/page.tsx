import Link from "next/link";
import DataTable from "@/components/DataTable";
import Ladder from "@/components/Ladder";
import TelemetryFigure from "@/components/ops/TelemetryFigure";
import BlastRadiusFigure from "@/components/ops/BlastRadiusFigure";
import DeployFigure from "@/components/ops/DeployFigure";
import {
  costDriverTable,
  costModelTable,
  dashboards,
  deployList,
  deployTable,
  degradationLadder,
  instrumentTable,
  latencyFactorTable,
  opsChecklist,
  qualityTable,
  reliabilityTable,
  rolloutList,
  sloTable,
  SPLIT_HEAD_CLASSES,
} from "@/data/operations";

const SECTIONS = [
  { id: "frame", label: "The four questions" },
  { id: "instrument", label: "Monitoring" },
  { id: "slo", label: "SLIs & SLOs" },
  { id: "quality", label: "Quality" },
  { id: "reliability", label: "Reliability" },
  { id: "latency", label: "Latency" },
  { id: "cost", label: "Cost" },
  { id: "dashboards", label: "Dashboards" },
  { id: "rollout", label: "Change" },
  { id: "shipping", label: "CI/CD" },
  { id: "checklist", label: "Checklist" },
];

export default function OperationsPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">Both volumes · running it in production</p>
          <h1>Operations</h1>
          <p className="lede">
            A demo is judged on its best answer; a production system is judged on its worst hour. This is the layer both
            volumes share — what to instrument, which numbers to promise, how to know quality moved before a customer tells
            you, what to do when a dependency fails, and where the money actually goes. Every table below splits the retrieval
            side from the agent side, because the disciplines are shared and the failure you are designing against is not.
          </p>

          <div className="legend">
            <span className="k-rag">
              <i />
              Retrieval systems answer
            </span>
            <span className="k-agt">
              <i />
              Agents act
            </span>
          </div>

          <div className="cta-row">
            <Link className="btn" href="/playbook">
              Volume I playbook
            </Link>
            <Link className="btn btn-ghost" href="/agents/playbook">
              Volume II playbook
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="Operations sections">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <h3 className="step" id="frame">
            <span className="n">THE FRAME</span>Four questions, asked continuously
          </h3>
          <p className="prose">
            Operations is not one discipline but four, and they trade against each other constantly — every latency fix costs
            quality or money, every quality fix costs latency or money. Keep them on one screen so the trade is visible rather
            than accidental.
          </p>

          <div className="q-grid">
            <div className="q-card">
              <span className="q">Question 01</span>
              <h3>Is it up?</h3>
              <p>
                Availability and errors, per dependency. Cheap to measure, and the only one most teams start with — which is
                why the other three arrive as surprises.
              </p>
              <p className="metric">availability · error rate · queue depth</p>
            </div>
            <div className="q-card">
              <span className="q">Question 02</span>
              <h3>Is it right?</h3>
              <p>
                Quality does not fail loudly. It drifts, as the corpus grows, the query mix shifts and a provider updates a
                model underneath a version string you thought was pinned.
              </p>
              <p className="metric">faithfulness · task success · drift</p>
            </div>
            <div className="q-card">
              <span className="q">Question 03</span>
              <h3>Does it hold?</h3>
              <p>
                Reliability is what happens on the bad day: timeouts, partial writes, a rebuilt index, a provider brownout.
                Design the degraded modes before you need them.
              </p>
              <p className="metric">degraded modes · rollback · kill switch</p>
            </div>
            <div className="q-card">
              <span className="q">Question 04</span>
              <h3>What does it cost?</h3>
              <p>
                In milliseconds and in currency, per unit of work — and at p95, not on average, because the tail is what
                decides both the bill and whether anyone waits for it.
              </p>
              <p className="metric">p95 latency · cost per query or task</p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="instrument">
            <span className="n">01</span>Monitoring: emit once, read three ways
          </h3>
          <TelemetryFigure />
          <p className="prose">
            The unit of observability is the <strong>trace</strong>, not the log line. One record per request or run, with a
            span per stage, carrying enough to answer every later question: what was retrieved and at what score, which
            versions were in play, what the model was given, what it did, how much it cost, and what happened next. Sample the
            payload bodies if volume demands it — keep the identifiers and metrics for everything.
          </p>
          <DataTable
            head={instrumentTable.head}
            rows={instrumentTable.rows}
            headClasses={SPLIT_HEAD_CLASSES}
            nowrapFirst
            caption="What to instrument in each system"
          />
          <div className="callout">
            <span className="lbl">The two mistakes that cost the most later</span>
            <p>
              Not stamping versions — you cannot bisect a quality regression without knowing which prompt, model, index and
              policy produced each answer. And not joining outcomes to traces — thumbs in one system and traces in another
              means the day you want to know &ldquo;what did the bad answers have in common&rdquo;, you cannot ask.
            </p>
          </div>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="slo">
            <span className="n">02</span>SLIs, SLOs and what wakes someone
          </h3>
          <p className="prose">
            An <strong>SLI</strong> is a measurement, an <strong>SLO</strong> is the target you promise, and the error budget
            is the policy — how much failure you will spend before feature work stops and reliability work starts. Alert on
            user-facing symptoms and burn rate, never on causes; a CPU graph has never told anyone whether answers were wrong.
          </p>
          <DataTable head={sloTable.head} rows={sloTable.rows} numericCols={[2]} nowrapFirst caption="Starting SLIs and SLOs" />
          <p className="prose">
            Two rules keep this honest. Measure latency <strong>at the edge</strong>, including queueing — server-side timers
            flatter you by exactly the amount your users are waiting. And treat safety and cost as first-class SLOs, not as
            reports: an ACL violation should page, and a cost-per-task that doubles overnight should behave like an outage,
            because it is one for the business.
          </p>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="quality">
            <span className="n">03</span>Quality: three loops at three cadences
          </h3>
          <p className="prose">
            Nobody has enough labels to measure quality continuously and nobody can wait a week to find a regression, so run
            three loops at different speeds: a fast one that blocks merges, a continuous one made of free signals, and a slow
            one where humans look at real output.
          </p>
          <DataTable
            head={qualityTable.head}
            rows={qualityTable.rows}
            headClasses={[undefined, undefined, "col-rag", "col-agt"]}
            nowrapFirst
            caption="Quality measurement by layer and system"
          />
          <ul className="list">
            <li>
              <strong>Sample sizes are smaller than you fear.</strong> For a rate, roughly 380 samples gives ±5 points at 95%
              confidence and 200 gives about ±7. A weekly stratified 200 — by intent, tenant and whether the system refused —
              is a real measurement; ten cherry-picked examples are not.
            </li>
            <li>
              <strong>Calibrate the judge before you trust it.</strong> If an LLM grades quality, measure its agreement with
              human labels on a few hundred cases (a kappa around 0.6 or better), and re-measure whenever the judge prompt or
              model changes. An uncalibrated judge is a random number generator with a confident tone.
            </li>
            <li>
              <strong>Watch the canary rates.</strong> Refusal rate, no-result rate, reformulation rate, intervention rate,
              retries per task. These move days before anyone files a complaint, and they cost nothing to compute.
            </li>
            <li>
              <strong>Every incident becomes a test case.</strong> The regression suite should be mostly things that already
              went wrong once, in production, to a real user.
            </li>
          </ul>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="reliability">
            <span className="n">04</span>Reliability: design the bad day
          </h3>
          <BlastRadiusFigure />
          <DataTable
            head={reliabilityTable.head}
            rows={reliabilityTable.rows}
            nowrapFirst
            caption="Dependency failure modes and their degraded modes"
          />
          <h4 className="sub">The degradation ladder</h4>
          <p className="prose">
            Decide in advance what you drop, in what order, and what the user is told at each step. A system that has only two
            states — perfect and down — will spend its bad hours down.
          </p>
          <Ladder rungs={degradationLadder} />
          <ul className="list">
            <li>
              <strong>Timeouts on everything, retries with jitter, circuit breakers per dependency.</strong> A retry storm
              against a struggling provider is how a brownout becomes an outage.
            </li>
            <li>
              <strong>Bulkheads per tenant.</strong> One customer&rsquo;s runaway agent must not consume the pool everyone
              else is queued on.
            </li>
            <li>
              <strong>Idempotency on every write, a defined inverse on every agent action.</strong> Detection without a
              reversal is just a faster way to learn bad news.
            </li>
            <li>
              <strong>Drill it.</strong> Kill the reranker in staging during business hours. Revert an index snapshot. Pull the
              kill switch. The first time must not be the real time.
            </li>
          </ul>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="latency">
            <span className="n">05</span>Latency: percentiles, per stage, at the edge
          </h3>
          <p className="prose">
            Averages hide everything that matters. Track p50, p95 and p99 per stage, and for streaming systems track time to
            first token separately from total time — a 4-second answer that starts in 500 ms feels fast, and a 2-second answer
            that arrives all at once does not. For agents, the equivalent pair is time to first visible progress and total task
            time, and the p95/p50 ratio is the number to watch: a widening tail means the loop is thrashing.
          </p>
          <DataTable
            head={latencyFactorTable.head}
            rows={latencyFactorTable.rows}
            headClasses={SPLIT_HEAD_CLASSES}
            nowrapFirst
            caption="What drives latency in each system"
          />
          <p className="prose">
            The per-stage budget for a retrieval answer is in the{" "}
            <Link href="/playbook#budget" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
              Volume I latency table
            </Link>
            . For agents there is no single budget to hold — there is a per-step budget and a step cap, and their product is
            your worst case. Publish that worst case; it is what your queue depth and your bill are made of.
          </p>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="cost">
            <span className="n">06</span>Cost: per unit, at p95
          </h3>
          <p className="prose">
            Monthly spend is not a metric you can act on. Cost per answered query and cost per completed task are, and they
            belong on the same dashboard as quality, because every quality lever moves them.
          </p>

          <div className="formula">
            <h4>The two arithmetic models</h4>
            <code>{`RAG    cost/query = (context_tokens x in_price) + (out_tokens x out_price)
                    + rerank + embed + (index_infra / queries)
                    - cache_hit_rate x the LLM lines

AGENT  cost/task  = SUM over steps of [ (context_tokens_s x in_price)
                                      + (out_tokens_s x out_price) ]
                    + tool costs + runtime
                    ... and context_tokens_s grows with s`}</code>
            <p className="note">
              That last line is the whole difference. A retrieval answer has a bounded context, so its cost has a ceiling an
              architect can compute. An agent&rsquo;s context grows as observations accumulate, so cost grows faster than step
              count — which is why compaction and a step cap beat any model swap, and why the p95 task, not the median one,
              should size your budget.
            </p>
          </div>

          <DataTable head={costDriverTable.head} rows={costDriverTable.rows} nowrapFirst caption="Cost drivers and levers" />

          <h4 className="sub">A worked example</h4>
          <p className="prose">
            Illustrative unit prices of $3 per million input tokens and $15 per million output tokens — substitute your own,
            and re-run this the day you change models. The shape matters more than the figures.
          </p>
          <DataTable
            head={costModelTable.head}
            rows={costModelTable.rows}
            headClasses={SPLIT_HEAD_CLASSES}
            nowrapFirst
            caption="Illustrative monthly cost model for each system"
          />
          <ul className="list">
            <li>
              <strong>Roughly twenty times the unit cost.</strong> An agent task costs what twenty retrieval answers cost,
              because it is twenty model calls with a growing prompt. That ratio, not the absolute number, is the thing to
              carry into a design review.
            </li>
            <li>
              <strong>Cap spend in code, per run and per tenant.</strong> A budget that exists only in a spreadsheet is
              discovered at the end of the month.
            </li>
            <li>
              <strong>Cache hit rate is a cost SLI.</strong> Alert when it drops; it is usually the first sign that a prompt
              change quietly invalidated a cache key.
            </li>
            <li>
              <strong>Count the human minutes.</strong> Review and intervention time is often the largest real cost in the
              system and the one that never appears on a provider invoice.
            </li>
          </ul>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="dashboards">
            <span className="n">07</span>Three dashboards, no more
          </h3>
          {dashboards.map((d) => (
            <div className="dash" key={d.name}>
              <h3>{d.name}</h3>
              <p>{d.body}</p>
            </div>
          ))}
          <p className="prose" style={{ marginTop: 18 }}>
            The on-call runbook should name the first three things to look at, in order: the SLO that is burning, the
            dependency error rates, and the last deploy or version change. Most incidents in these systems are a change,
            and the trace record tells you which one.
          </p>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="rollout">
            <span className="n">08</span>Change management: a prompt is a deploy
          </h3>
          <ul className="list">
            {rolloutList.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ---------------------------------------------------------------- */}

          <h3 className="step" id="shipping">
            <span className="n">09</span>Shipping it: the pipeline and what gates it
          </h3>
          <DeployFigure />
          <p className="prose">
            The pipeline looks like any other service&rsquo;s until the eval gate, which is where these systems differ. A prompt,
            a model id, a chunking parameter and an index snapshot all change behaviour without changing a line of application
            logic, so the suite that measures behaviour has to sit in front of the merge button.
          </p>
          <DataTable head={deployTable.head} rows={deployTable.rows} nowrapFirst caption="Pipeline stages and their gates" />
          <ul className="list">
            {deployList.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <h3 className="step" id="checklist">
            <span className="n">10</span>Before you call it production
          </h3>
          <ul className="check">
            {opsChecklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="callout" style={{ marginTop: 36 }}>
            <span className="lbl">Where to go next</span>
            <p>
              The stage-level numbers behind these SLOs live in the{" "}
              <Link href="/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                RAG playbook
              </Link>{" "}
              and the{" "}
              <Link href="/agents/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                agent playbook
              </Link>
              . Both catalogs state a &ldquo;ships when&rdquo; metric per build — those are the SLOs for a single project;
              this page is what you run once several of them are live at the same time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
