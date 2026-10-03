import Link from "next/link";
import VolumeMapFigure from "@/components/VolumeMapFigure";
import { agents } from "@/data/agents";
import { projects, TIER_BLURB, TIER_MECHANISM, TIER_NAME, type Tier } from "@/data/projects";

const TIERS: Tier[] = [1, 2, 3];

export default function HomePage() {
  const count = (t: Tier) => projects.filter((p) => p.tier === t).length;
  const industries = new Set(projects.map((p) => p.industry)).size;

  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">
            {projects.length + agents.length} build specs · two volumes · one shelf
          </p>
          <h1>RAG Field Manual</h1>
          <p className="lede">
            Sixty build specifications in two volumes: retrieval systems ordered by the machinery they force you to build, and
            agents ordered by the authority you hand them. Every entry states its requirements, what goes in, what comes out,
            and the number that says it is finished — and each volume ends in the playbook its thirty builds share.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/catalog">
              Browse the catalog
            </Link>
            <Link className="btn btn-ghost" href="/playbook">
              Read the playbook
            </Link>
          </div>

          <div className="stats">
            <div className="stat">
              <b>{projects.length}</b>
              <span>Project specs</span>
            </div>
            <div className="stat">
              <b>{industries}</b>
              <span>Distinct industries</span>
            </div>
            <div className="stat">
              <b>9</b>
              <span>Playbook stages</span>
            </div>
            <div className="stat">
              <b>{agents.length}</b>
              <span>Agent builds</span>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-num">01</span>
            <h2>Two volumes</h2>
          </div>
          <p className="sec-lede">
            Retrieval systems answer; agents act. They share a spine — tools, evaluation, grounding, budgets — but the failure
            you are designing against is different, so each volume has its own catalog, its own playbook and its own look.
          </p>

          <div className="track-band">
            <Link href="/catalog" className="track">
              <span className="eyebrow">Volume I · {projects.length} specs</span>
              <h3>RAG catalog</h3>
              <p>
                Retrieval projects from a single-corpus policy bot to a permission-aware index of a hundred million chunks, plus
                the nine-stage architecture they share.
              </p>
              <span className="go">Browse the catalog →</span>
            </Link>
            <Link href="/agents" className="track track-agents">
              <span className="eyebrow">Volume II · {agents.length} builds</span>
              <h3>Agent workbench</h3>
              <p>
                Agent builds graded by the authority they hold — assisted, supervised, autonomous — with the twelve agentic
                patterns, the eleven decisions, the control plane and the scaling levers behind them.
              </p>
              <span className="go">Open the workbench →</span>
            </Link>
            <Link href="/operations" className="track track-ops">
              <span className="eyebrow">Both volumes · in production</span>
              <h3>Operations</h3>
              <p>
                Monitoring, quality, reliability, latency and cost for both kinds of system — what to instrument, what to
                promise, and where the money goes, split retrieval-side and agent-side throughout.
              </p>
              <span className="go">Read the ops layer →</span>
            </Link>
            <Link href="/stack" className="track track-stack">
              <span className="eyebrow">The parts · 9 topics</span>
              <h3>The stack</h3>
              <p>
                Model APIs, tokens and cost control, prompt engineering, vector databases, open models and Hugging Face,
                fine-tuning, workflows and frameworks, MCP — and the order to assemble them in.
              </p>
              <span className="go">Open the stack →</span>
            </Link>
            <Link href="/ml" className="track track-train">
              <span className="eyebrow">Volume V · part one</span>
              <h3>ML foundations</h3>
              <p>
                numpy, pandas and lambda; a scikit-learn classifier that costs nothing to run; the metrics that lie; PyTorch
                versus TensorFlow; and the MLOps machinery — tracking, registries, feature stores, drift.
              </p>
              <span className="go">Open ML foundations →</span>
            </Link>
            <Link href="/training" className="track track-train">
              <span className="eyebrow">The other direction · weights</span>
              <h3>Training a model</h3>
              <p>
                Building one rather than using one: the data pipeline that decides the outcome, a transformer in thirty lines,
                the loop, the memory arithmetic, reading loss curves, and fine-tuning for a fraction of the cost.
              </p>
              <span className="go">Open the training route →</span>
            </Link>
            <Link href="/python" className="track track-py">
              <span className="eyebrow">The language layer · 30 snippets</span>
              <h3>Python</h3>
              <p>
                The parts of the language both systems are actually made of — typed records, generators, asyncio, numpy
                scoring, checkpointing — each shown doing its real job, plus the traps that only bite under load.
              </p>
              <span className="go">Open the snippets →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <VolumeMapFigure />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-num">02</span>
            <h2>Difficulty is a statement about mechanism</h2>
          </div>
          <p className="sec-lede">
            Not about how specialised the subject matter is. A clinical guideline bot and a returns bot can look equally hard
            from the outside; what separates them is whether you need a lexical channel, a reranker, version-aware filters and
            an audit trail. Each tier below names the machinery it adds.
          </p>

          <div className="tier-cards">
            {TIERS.map((t) => (
              <div className={`tier-card t${t}`} key={t}>
                <div className="meter" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="tier-name">
                  {TIER_NAME[t]} · {count(t)} projects
                </div>
                <h3>{TIER_MECHANISM[t]}</h3>
                <p>{TIER_BLURB[t]}</p>
                <p className="what">
                  <Link href="/catalog">See the {TIER_NAME[t].toLowerCase()} ten →</Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-num">03</span>
            <h2>How to use this</h2>
          </div>
          <ul className="list">
            <li>
              <strong>Pick one project a tier above what you have already built.</strong> The specs are written so the
              requirements, not the domain, are what stretch you.
            </li>
            <li>
              <strong>Build the golden set first.</strong> Every spec carries a &ldquo;ships when&rdquo; number; that number is
              only measurable if you wrote down the questions and their answering passages before the code.
            </li>
            <li>
              <strong>Treat the inputs list as a shopping list.</strong> If you cannot get a rough stand-in for each input, the
              project will stall at week two — pick a different one.
            </li>
            <li>
              <strong>Keep the playbook open beside the build.</strong> The failure-mode table is written as a lookup: symptom
              first, cause second, fix third.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
