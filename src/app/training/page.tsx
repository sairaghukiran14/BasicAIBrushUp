import Link from "next/link";
import CodeBlock from "@/components/python/CodeBlock";
import DataTable from "@/components/DataTable";
import LossChart from "@/components/training/LossChart";
import TrainingPipelineFigure from "@/components/training/PipelineFigure";
import type { Snippet } from "@/data/python";
import {
  buildLadder,
  dataRules,
  diagnostics,
  evalRules,
  hyperTable,
  memoryTable,
  practiceLadder,
  problems,
  shipRules,
  trainingSections,
  trainingSnippets,
  tuningMethods,
  tuningSnippets,
} from "@/data/training";

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

export default function TrainingPage() {
  const byId = (id: string) => trainingSnippets.find((s) => s.id === id)!;

  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">Weights, not prompts · from data to a served checkpoint</p>
          <h1>Training a model</h1>
          <p className="lede">
            Everything so far has been about using models. This is the other direction: what actually happens when one is
            built. The data pipeline that decides the outcome, a transformer written out in thirty lines, the training loop and
            the arithmetic that says whether it fits on your GPU, how to read a loss curve, and the fine-tuning techniques that
            get you most of the value for a fraction of the cost.
          </p>

          <div className="cta-row">
            <Link className="btn" href="#ladder">
              Should you train at all?
            </Link>
            <Link className="btn btn-ghost" href="/stack#open">
              Running open models
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="Sections">
            {trainingSections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <h3 className="step" id="ladder">
            <span className="n">DECISION</span>Six levels, and most projects stop at three
          </h3>
          <p className="prose">
            Training is a spectrum, not a switch. Each rung costs an order of magnitude more than the one above it and fixes a
            narrower problem — so the discipline is to climb only when the rung above has demonstrably failed on your own eval
            set, and to know what the next one buys before you pay for it.
          </p>
          <DataTable head={buildLadder.head} rows={buildLadder.rows} nowrapFirst caption="From prompting to training from scratch" />
          <div className="callout">
            <span className="lbl">Who should actually train from scratch</span>
            <p>
              Researchers, teams working in a modality nobody has pretrained, people building deliberately tiny specialist
              models — and anyone learning, because writing the loop yourself teaches more than any amount of reading. For a
              business problem with text, the honest answer is almost always retrieval plus an adapter, and the honest version
              of this page says so before it shows you the code.
            </p>
          </div>

          <h3 className="step" id="pipeline">
            <span className="n">SHAPE</span>The pipeline, end to end
          </h3>
          <TrainingPipelineFigure />

          <h3 className="step" id="data">
            <span className="n">STAGE 01</span>Data decides the outcome
          </h3>
          <p className="prose">
            Architecture research is fun and data work is not, which is exactly why data work is where the returns are. At a
            fixed compute budget, the difference between a good run and a wasted one is nearly always the corpus: what was in
            it, what was deduplicated out of it, and whether the evaluation set leaked into it.
          </p>
          <ul className="list">
            {dataRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Code item={byId("data-prep")} />
          <div className="spec-note">
            <b>How much data?</b> Compute-optimal pretraining is roughly <b>20 tokens per parameter</b> — so a 124M model wants
            about 2.5B tokens, and more if you intend to serve it for a long time (training past compute-optimal buys cheaper
            inference for the rest of the model&rsquo;s life).
            <br />
            <b>For fine-tuning</b>, the number is 500–5,000 curated examples. Ten times more scraped ones will do worse.
          </div>

          <h3 className="step" id="tokenizer">
            <span className="n">STAGE 02</span>The tokenizer is a design decision
          </h3>
          <p className="prose">
            The tokenizer sets how many tokens your text costs, which sets sequence length, which sets compute — and it fixes
            the vocabulary size, which is a real chunk of the parameter budget. A general-purpose tokenizer on domain text
            (code, logs, chemistry, a morphologically rich language) can inflate token counts by half.
          </p>
          <Code item={byId("tokenizer")} />

          <h3 className="step" id="model">
            <span className="n">STAGE 03</span>The model, written out
          </h3>
          <p className="prose">
            A decoder-only transformer is one block repeated. Pre-norm, attention, residual, MLP, residual — and the whole
            architecture debate of the last few years lives in the details: which normalisation, which position encoding, which
            activation, how many key-value heads. The skeleton below has not changed.
          </p>
          <Code item={byId("block")} />
          <Code item={byId("model")} />
          <div className="spec-note">
            <b>Parameter arithmetic.</b> non-embedding ≈ 12 · layers · d_model² &nbsp;+&nbsp; embeddings = vocab · d_model
            <br />
            d_model 768, 12 layers, 50k vocab → 85M + 38M ≈ <b>124M parameters</b>
            <br />
            <b>Compute arithmetic.</b> training FLOPs ≈ 6 · parameters · tokens → 124M over 10B tokens ≈ 7.4e18 FLOPs ≈{" "}
            <b>16 A100-hours</b> at a realistic 40% utilisation.
          </div>

          <h3 className="step" id="loop">
            <span className="n">STAGE 04</span>The training loop and what it costs in memory
          </h3>
          <Code item={byId("loop")} />
          <DataTable head={hyperTable.head} rows={hyperTable.rows} nowrapFirst caption="Hyperparameters and their symptoms" />
          <h4 className="sub">Why a 1B model does not fit on a 24 GB card</h4>
          <p className="prose">
            Weights are the small part. Gradients, the fp32 master copy and Adam&rsquo;s two moment buffers together cost about
            sixteen bytes per parameter before a single activation is stored — which is the whole reason sharded training
            exists.
          </p>
          <DataTable head={memoryTable.head} rows={memoryTable.rows} nowrapFirst caption="Training memory, per parameter" />
          <ul className="list">
            <li>
              <strong>Fits on one GPU?</strong> Plain training, or DDP across cards for speed — each rank holds a full copy.
            </li>
            <li>
              <strong>Optimiser state too big?</strong> FSDP or ZeRO stages 1–3, which shard optimiser state, then gradients,
              then parameters across ranks.
            </li>
            <li>
              <strong>A single layer too big?</strong> Now you need tensor parallelism, and you are in cluster engineering
              rather than model training.
            </li>
            <li>
              <strong>Still short?</strong> Activation checkpointing trades roughly 30% more compute for a large memory saving,
              and an 8-bit optimiser cuts the moment buffers by four.
            </li>
          </ul>

          <h3 className="step" id="watch">
            <span className="n">STAGE 05</span>Reading the run
          </h3>
          <p className="prose">
            Four numbers tell you almost everything while a run is going: training loss, validation loss, gradient norm and
            tokens per second. The first two produce the picture below, which is the one you will spend the most time looking
            at.
          </p>
          <LossChart />
          <DataTable head={diagnostics.head} rows={diagnostics.rows} nowrapFirst caption="Training symptoms and their causes" />
          <div className="callout">
            <span className="lbl">The debugging move that saves the most time</span>
            <p>
              Before a long run, overfit ten samples deliberately. A correct model and loop will drive the loss on ten
              sequences to near zero within a few hundred steps. If it cannot, the bug is in your masking, your label shift or
              your loss reduction — and finding it there costs minutes instead of a week of cluster time.
            </p>
          </div>

          <h3 className="step" id="tuning">
            <span className="n">STAGE 06</span>Fine-tuning and preference tuning
          </h3>
          <p className="prose">
            This is where nearly everyone who trains anything actually works. You start from someone else&rsquo;s pretraining
            bill and spend hours, not weeks, teaching a model your format, your vocabulary and your preferences.
          </p>
          <DataTable head={tuningMethods.head} rows={tuningMethods.rows} nowrapFirst caption="Fine-tuning and alignment methods" />
          {tuningSnippets.map((s) => (
            <Code item={s} key={s.id} />
          ))}

          <h3 className="step" id="evaluate">
            <span className="n">STAGE 07</span>Evaluating what you trained
          </h3>
          <ul className="list">
            {evalRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <h3 className="step" id="ship">
            <span className="n">STAGE 08</span>Shipping a model, reproducibly
          </h3>
          <ul className="list">
            {shipRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <h3 className="step" id="practice">
            <span className="n">PRACTICE</span>The ladder, in the order that teaches most
          </h3>
          <ol className="stages">
            {practiceLadder.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>

          <h4 className="sub">Problem statements</h4>
          <ul className="list">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className="callout" style={{ marginTop: 34 }}>
            <span className="lbl">Where this connects</span>
            <p>
              Serving what you trained is in{" "}
              <Link href="/stack#open" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                the stack
              </Link>
              ; the eval discipline it depends on is the same one in the{" "}
              <Link href="/playbook#eval" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                RAG playbook
              </Link>
              ; and a model release runs through the same canary and rollback machinery as any other deploy, in{" "}
              <Link href="/operations#shipping" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                operations
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
