import Link from "next/link";
import CodeBlock from "@/components/python/CodeBlock";
import DataTable from "@/components/DataTable";
import LifecycleFigure from "@/components/ml/LifecycleFigure";
import type { Snippet } from "@/data/python";
import {
  dataSnippets,
  driftTable,
  frameworkSnippets,
  frameworksTable,
  leakageList,
  metricsTable,
  mlPractice,
  mlSections,
  mlWorkflow,
  mlopsSnippets,
  mlopsTable,
  mlopsVsLlmops,
  sklearnSnippets,
  whereClassicalTable,
} from "@/data/ml";

function Code({ item }: { item: Snippet }) {
  return (
    <article className="snip" id={item.id}>
      <div className="snip-head">
        <h3>{item.title}</h3>
      </div>
      <p className="why">{item.why}</p>
      <CodeBlock code={item.code} label={`${item.id.replace(/-/g, "_")}.py`} />
      <p className="note">{item.note}</p>
    </article>
  );
}

function Snippets({ items }: { items: Snippet[] }) {
  return (
    <div className="snips">
      {items.map((s) => (
        <Code item={s} key={s.id} />
      ))}
    </div>
  );
}

export default function MlPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">Volume V · part one of two</p>
          <h1>ML foundations</h1>
          <p className="lede">
            The discipline that came before the models you rent: arrays and dataframes, a classifier that costs nothing to run,
            the metrics that tell you whether it works, the two frameworks everything is written in, and the operational
            machinery — tracking, registries, feature stores, drift — that keeps a trained thing honest. Most of it applies
            directly inside a RAG or agent system, and the parts that do not are the parts worth knowing you can skip.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/training">
              Part two: training a model
            </Link>
            <Link className="btn btn-ghost" href="/python">
              The language layer
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="ML sections">
            {mlSections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="where">
            <span className="n">PART 01</span>Where classical ML still wins
          </h3>
          <p className="prose">
            A language model can do almost every job on this page, and for several of them it is the wrong tool by a factor of
            a hundred in cost and latency. The question is never which is more capable — it is which is more capable{" "}
            <em>per millisecond and per cent</em> on a task whose shape you already know.
          </p>
          <DataTable
            head={whereClassicalTable.head}
            rows={whereClassicalTable.rows}
            nowrapFirst
            caption="Classical ML versus an LLM call, job by job"
          />
          <h4 className="sub">The workflow, in the order that avoids the usual pain</h4>
          <ul className="list">
            {mlWorkflow.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="data">
            <span className="n">PART 02</span>Python for data: lambda, numpy, pandas
          </h3>
          <p className="prose">
            Three tools with one idea between them — stop looping in Python. A lambda passes behaviour into something that
            loops for you; numpy moves the loop into C; pandas moves it into a query you can read.
          </p>
          <Snippets items={dataSnippets} />

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="sklearn">
            <span className="n">PART 03</span>scikit-learn: the whole workflow in one object
          </h3>
          <p className="prose">
            scikit-learn&rsquo;s real contribution is not its algorithms, it is the <code>Pipeline</code> — the thing that makes
            it structurally hard to fit a transformer on data the model should never have seen. Learn that and most applied ML
            mistakes stop being possible.
          </p>
          <Snippets items={sklearnSnippets} />
          <div className="callout">
            <span className="lbl">Leakage: the bug that makes everything look great</span>
            <p>
              Leakage is information from outside the training set reaching the model — and it always announces itself as
              excellent offline numbers followed by disappointing production ones. Every item below has cost someone a quarter.
            </p>
          </div>
          <ul className="list">
            {leakageList.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="metrics">
            <span className="n">PART 04</span>Metrics, and how each one lies
          </h3>
          <p className="prose">
            Pick the metric from the cost of being wrong, in each direction. A model that misses fraud and a model that blocks
            good customers can score identically on accuracy and be worth wildly different amounts of money.
          </p>
          <DataTable head={metricsTable.head} rows={metricsTable.rows} nowrapFirst caption="Classification metrics and when each applies" />
          <p className="prose">
            Then choose the threshold deliberately. The default 0.5 is an arbitrary line through a probability, and moving it is
            usually a bigger win than changing the model — the same move as setting the abstention threshold in the{" "}
            <Link href="/playbook#generate" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
              RAG playbook
            </Link>
            , trading coverage for precision on purpose.
          </p>

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="frameworks">
            <span className="n">PART 05</span>PyTorch and TensorFlow
          </h3>
          <p className="prose">
            Both train neural networks well. The honest difference for anyone in this app is gravitational: the language-model
            ecosystem — transformers, adapters, serving runtimes, nearly every paper implementation — is written in PyTorch, so
            choosing TensorFlow near an LLM means porting rather than importing.
          </p>
          <DataTable head={frameworksTable.head} rows={frameworksTable.rows} nowrapFirst caption="PyTorch versus TensorFlow and Keras" />
          <Snippets items={frameworkSnippets} />

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="mlops">
            <span className="n">PART 06</span>MLOps: the machinery around a trained thing
          </h3>
          <p className="prose">
            A model is not a file, it is a claim: this artefact, trained on that data, with these parameters, scored this well.
            MLOps is the set of components that keep the claim checkable a year later, when the person who trained it has left
            and the numbers have moved.
          </p>
          <LifecycleFigure />
          <DataTable head={mlopsTable.head} rows={mlopsTable.rows} nowrapFirst caption="MLOps components and what breaks without each" />
          <Snippets items={mlopsSnippets} />
          <h4 className="sub">MLOps and LLMOps are not the same discipline</h4>
          <p className="prose">
            They share the instincts — version everything, evaluate before shipping, monitor after — and differ in where the
            quality actually comes from. That difference decides what a fix looks like when the numbers move.
          </p>
          <DataTable head={mlopsVsLlmops.head} rows={mlopsVsLlmops.rows} nowrapFirst caption="Classical MLOps compared with LLM operations" />

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="drift">
            <span className="n">PART 07</span>Drift, and when to retrain
          </h3>
          <p className="prose">
            Trained models decay because the world moves. Labels usually arrive late — sometimes never — so the first signal is
            the shape of the inputs and the predictions, not the accuracy.
          </p>
          <DataTable head={driftTable.head} rows={driftTable.rows} nowrapFirst caption="Kinds of drift and the response to each" />
          <p className="prose">
            Write the retraining rule down before you need it: on a schedule, on a drift threshold, or on measured performance
            loss — and always through the same pipeline, with the same eval, and a shadow deployment before promotion. An
            unplanned retrain in the middle of an incident is how a bad week becomes a bad quarter.
          </p>

          {/* ------------------------------------------------------------ */}
          <h3 className="step" id="practice">
            <span className="n">PART 08</span>Practice, with acceptance numbers
          </h3>
          <p className="prose">
            Each of these is a weekend, uses data an LLM system already produces, and ends with a number you can defend.
          </p>
          <ul className="list">
            {mlPractice.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className="callout" style={{ marginTop: 34 }}>
            <span className="lbl">Where this connects</span>
            <p>
              The classifier here is the router in{" "}
              <Link href="/agents/patterns#routing" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                agent pattern P2
              </Link>{" "}
              and the cheap first step in the{" "}
              <Link href="/stack#tokens" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                model-routing plan
              </Link>
              . The drift work is the classical sibling of the{" "}
              <Link href="/operations#quality" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                quality loops
              </Link>
              , and the training loop appears in full in{" "}
              <Link href="/training" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                part two
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
