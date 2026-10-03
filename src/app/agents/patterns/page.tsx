import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock from "@/components/python/CodeBlock";
import DataTable from "@/components/DataTable";
import TopologiesFigure from "@/components/agents/figures/TopologiesFigure";
import {
  agenticFailures,
  capstones,
  contextTechniques,
  glossary,
  memoryTable,
  patternSections,
  patterns,
  topologyTable,
} from "@/data/agentPatterns";

export const metadata: Metadata = {
  title: "Agentic patterns",
  description:
    "The twelve agentic patterns with worked code and a build-this problem for each, plus memory architectures, context engineering, multi-agent topologies and the failures specific to agents.",
};

export default function PatternsPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">Volume II · concepts · {patterns.length} patterns · {capstones.length} capstones</p>
          <h1>Agentic patterns</h1>
          <p className="lede">
            The vocabulary and the shapes. Almost every agent that works is one of twelve patterns, or two of them composed —
            and most agents that do not work are a pattern applied where a simpler one belonged. Each entry states what it is,
            when it earns its cost, when it does not, the code in its smallest honest form, and a problem to build with an
            acceptance number attached.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/agents">
              The 30 agent builds
            </Link>
            <Link className="btn btn-ghost" href="/agents/playbook">
              The agent playbook
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="Sections">
            {patternSections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <h3 className="step" id="vocab">
            <span className="n">CONCEPTS</span>The vocabulary, defined so it can be argued with
          </h3>
          <p className="prose">
            Most disagreements about agents are definitional. These twelve terms are the ones worth pinning down, because each
            of them corresponds to something you either build or do not build.
          </p>
          <DataTable head={glossary.head} rows={glossary.rows} nowrapFirst caption="Agentic vocabulary" />

          <h3 className="step" id="patterns">
            <span className="n">PATTERNS</span>Twelve shapes, and what each one costs
          </h3>
          <p className="prose">
            They are ordered roughly by how much freedom they hand the model. Read down until you reach the first one that
            covers your problem and stop there — the pattern below it is always more expensive and harder to evaluate.
          </p>

          <div className="snips">
            {patterns.map((p) => (
              <article className="snip" id={p.id} key={p.id}>
                <div className="snip-head">
                  <span className="mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em" }}>
                    {p.n}
                  </span>
                  <h3>{p.name}</h3>
                </div>
                <p className="why">{p.tagline}</p>

                <div className="run-grid" style={{ marginTop: 16 }}>
                  <div className="aspec">
                    <h4>Use it when</h4>
                    <ul>
                      <li>{p.use}</li>
                    </ul>
                  </div>
                  <div className="aspec danger">
                    <h4>Do not use it when</h4>
                    <ul>
                      <li>{p.avoid}</li>
                    </ul>
                  </div>
                </div>

                <CodeBlock code={p.code} label={`${p.id.replace(/-/g, "_")}.py`} />

                <p className="run-ship">
                  <b>Build this</b>
                  {p.problem}
                </p>
              </article>
            ))}
          </div>

          <h3 className="step" id="memory">
            <span className="n">CONCEPT</span>Memory is four different things
          </h3>
          <p className="prose">
            &ldquo;Add memory&rdquo; is not a requirement, it is four of them with different storage, different write triggers
            and different failure modes. Name which one you mean before you build it, and add each only when a real run
            demonstrably repeated work without it.
          </p>
          <DataTable head={memoryTable.head} rows={memoryTable.rows} nowrapFirst caption="Memory architectures for agents" />
          <div className="callout">
            <span className="lbl">The rule that saves the most pain</span>
            <p>
              Memory persists mistakes as readily as it persists lessons. Anything written to episodic or procedural memory
              should carry provenance and be reviewable — and anything learned automatically should be proposed to a human
              before it becomes a rule the agent follows on every future run.
            </p>
          </div>

          <h3 className="step" id="context">
            <span className="n">CONCEPT</span>Context engineering
          </h3>
          <p className="prose">
            The context window is a budget with an attention gradient, not a bucket. The skill is deciding what earns its place
            each turn: the goal, the current state, the tools in play, and the few observations that still matter. Everything
            else belongs in a store with an id.
          </p>
          <ul className="list">
            {contextTechniques.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h3 className="step" id="topologies">
            <span className="n">CONCEPT</span>Multi-agent topologies
          </h3>
          <TopologiesFigure />
          <DataTable head={topologyTable.head} rows={topologyTable.rows} nowrapFirst caption="Agent topologies compared" />
          <p className="prose">
            The honest default is one agent with good tools. Add a second only when you can name the thing it does that the
            first one cannot — genuinely parallel work, a context that must stay isolated, or a critic that needs a different
            objective. &ldquo;It felt tidier&rdquo; is how a working system becomes three systems that disagree.
          </p>

          <h3 className="step" id="failures">
            <span className="n">LOOKUP</span>Failures that only agents have
          </h3>
          <p className="prose">
            These are distinct from the operational failures in the playbook. They are behavioural: the loop keeps running and
            the traces look reasonable, and the outcome is still wrong.
          </p>
          <DataTable head={agenticFailures.head} rows={agenticFailures.rows} nowrapFirst caption="Agent-specific failure modes" />

          <h3 className="step" id="capstones">
            <span className="n">PRACTICE</span>Capstones: compose the patterns
          </h3>
          <p className="prose">
            Each of these needs three or more patterns working together, which is where the interesting problems live. Build
            them against the acceptance numbers, not against a demo.
          </p>
          <ul className="list">
            {capstones.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <div className="callout" style={{ marginTop: 34 }}>
            <span className="lbl">Where to go next</span>
            <p>
              The machinery each pattern assumes — gates, budgets, checkpoints, traces — is in the{" "}
              <Link href="/agents/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                agent playbook
              </Link>
              ; thirty domain problems to apply them to are in the{" "}
              <Link href="/agents" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                catalog
              </Link>
              ; the API and framework choices behind them are in{" "}
              <Link href="/stack" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                the stack
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
