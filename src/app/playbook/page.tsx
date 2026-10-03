import type { Metadata } from "next";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import Ladder from "@/components/Ladder";
import PipelineFigure from "@/components/figures/PipelineFigure";
import CascadeFigure from "@/components/figures/CascadeFigure";
import {
  antiPatterns,
  buildPath,
  chunkingTable,
  evalTable,
  failureTable,
  latencyTable,
  playbookSections,
  qualityLadder,
} from "@/data/playbook";

export const metadata: Metadata = {
  title: "Build playbook",
  description:
    "How a scalable, efficient RAG system works stage by stage: parsing, chunking, embeddings, hybrid retrieval, reranking, context assembly, latency budget, scaling and evaluation.",
};

export default function PlaybookPage() {
  return (
    <section className="section-tight">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-num">02</span>
          <h2>How a scalable RAG system actually works</h2>
        </div>
        <p className="sec-lede">
          A RAG system is two loops that meet at an index. One runs offline and turns documents into retrievable units. The
          other runs per request and turns a question into a grounded answer. Almost every production failure is a defect in one
          specific stage of one specific loop — so the useful mental model is the stage list, not the word &ldquo;RAG&rdquo;.
        </p>

        <nav className="toc" aria-label="Playbook sections">
          {playbookSections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>

        <h3 className="step" id="loops">
          <span className="n">THE SHAPE</span>Two loops, one index
        </h3>
        <PipelineFigure />

        <h3 className="step" id="parse">
          <span className="n">STAGE 01</span>Parse before you chunk
        </h3>
        <p className="prose">
          Retrieval quality is capped by extraction quality, and most teams discover this three weeks late. A PDF table
          flattened into a single line of space-separated numbers cannot be retrieved correctly no matter which embedding model
          you buy. Use a layout-aware parser, keep headings as a hierarchy you can attach to each chunk, serialise tables
          row-wise with the header repeated on every row, and run OCR only where you must — it is the slowest and least reliable
          step you own.
        </p>
        <ul className="list">
          <li>
            <strong>Keep structure:</strong> heading path, page number, section id, effective date. These become metadata
            filters later and you cannot recover them after chunking.
          </li>
          <li>
            <strong>Never split an atomic unit:</strong> a code fence, a table, a clause, a numbered procedure step.
          </li>
          <li>
            <strong>Hash every source unit</strong> so re-ingestion can skip unchanged content — this is what makes incremental
            indexing possible at stage 8.
          </li>
        </ul>

        <h3 className="step" id="chunk">
          <span className="n">STAGE 02</span>Chunk for the question, not for the model
        </h3>
        <p className="prose">
          The chunk is the unit of retrieval, so its size is a statement about what a single answer needs. 300–500 tokens with
          10–15% overlap is a defensible default for prose. Better than tuning the number is <strong>small-to-big</strong>:
          embed a small precise chunk, but pass its parent section to the model. You get the precision of a tight embedding and
          the context of a whole section.
        </p>
        <DataTable head={chunkingTable.head} rows={chunkingTable.rows} nowrapFirst caption="Chunking strategy by content type" />

        <h3 className="step" id="embed">
          <span className="n">STAGE 03</span>Embeddings: pick on your data, then freeze
        </h3>
        <p className="prose">
          Leaderboard rank predicts almost nothing about your corpus. Take fifty real questions, label the passages that answer
          them, and measure recall@20 for three candidate models — that experiment takes an afternoon and settles the argument.
          768–1024 dimensions is the practical sweet spot; larger vectors cost linearly in memory and buy little once a reranker
          is in the pipeline.
        </p>
        <p className="prose">
          Treat the embedding model as part of the index&rsquo;s identity. Changing it invalidates every vector you have stored,
          so a model swap is a migration: build the new index alongside the old, dual-write, compare on the golden set, then cut
          over. Never mix two models&rsquo; vectors in one index.
        </p>

        <h3 className="step" id="retrieve">
          <span className="n">STAGE 04</span>Retrieval: hybrid first, then rerank
        </h3>
        <p className="prose">
          Pure dense retrieval fails on exactly the tokens your users care most about: part numbers, drug names, error codes,
          ticker symbols, statute references. BM25 nails those and fails at paraphrase; dense does the reverse. Run both and
          fuse with Reciprocal Rank Fusion — no score normalisation, no tuning, roughly <code>score = Σ 1/(60 + rank)</code>.
          Then rerank the fused top 50–100 with a cross-encoder. Hybrid plus rerank is the single highest-return upgrade in the
          whole pipeline and it is available on day one.
        </p>
        <CascadeFigure />

        <h4 className="sub">The retrieval quality ladder</h4>
        <Ladder rungs={qualityLadder} />
        <p className="prose">
          Climb one rung at a time and re-measure. Teams that jump to R5 usually have an R2 problem and now have two problems.
        </p>

        <h3 className="step" id="assemble">
          <span className="n">STAGE 05</span>Context assembly is a budget, not a dump
        </h3>
        <p className="prose">
          More context is not more grounding. Long prompts lose the middle, cost linearly, and hide the reranker&rsquo;s work.
          Pack 5–8 passages, best first, each with its source id, date and heading path so the model can cite precisely.
          Deduplicate near-identical passages before packing — three copies of the same wire story crowd out the passage that
          actually answers the question. Set a hard token ceiling and drop from the bottom.
        </p>

        <h3 className="step" id="generate">
          <span className="n">STAGE 06</span>Generation: cite, or abstain
        </h3>
        <p className="prose">
          Ground the instruction in the retrieved set: answer only from the passages, cite the id after each claim, and say
          plainly when the passages do not contain the answer. Then make abstention <strong>mechanical</strong> rather than
          hoped-for — if the top reranker score is below your threshold, do not call the model at all; return the fallback.
          Every domain in the catalog that touches health, money, safety or law needs this gate, and it is twenty lines of code.
        </p>

        <h3 className="step" id="budget">
          <span className="n">STAGE 07</span>The latency budget
        </h3>
        <p className="prose">
          Decide the budget before you build, then hold every stage to its line. A 2-second p95 for a fully grounded answer is
          achievable on ordinary infrastructure; here is where it goes.
        </p>
        <DataTable
          head={latencyTable.head}
          rows={latencyTable.rows}
          numericCols={[1]}
          nowrapFirst
          caption="Per-stage latency budget for a 2 second p95"
        />
        <div className="callout">
          <span className="lbl">Three caches, three different keys</span>
          <p>
            <strong>Exact cache</strong> — hash of (normalised query + filters + corpus version). Hits 15–30% of production
            traffic on support-style workloads. <strong>Semantic cache</strong> — embed the query, return a stored answer above
            ~0.95 similarity; powerful and dangerous, so scope it per tenant and expire it on corpus change.{" "}
            <strong>Retrieval cache</strong> — key on the rewritten query and filter set, store the reranked passage ids; it
            survives prompt changes, which the answer caches do not.
          </p>
        </div>

        <h3 className="step" id="scale">
          <span className="n">STAGE 08</span>Scaling: memory, freshness, tenancy
        </h3>
        <p className="prose">
          Vector search scale is mostly an arithmetic problem. Ten million chunks at 1024 dimensions in fp32 is about 41 GB of
          raw vectors, plus roughly 3 GB of HNSW graph. Quantise to int8 and the vectors drop to about 10 GB — a single machine
          instead of a cluster — at a recall cost you can measure and usually cannot perceive once a reranker follows. Binary
          quantisation with a full-precision rescoring pass goes further still.
        </p>
        <ul className="list">
          <li>
            <strong>Shard by a filter people actually use</strong> — tenant, region, year, product line. A shard you can skip
            entirely is faster than any index tuning.
          </li>
          <li>
            <strong>Pre-filter, never post-filter, for access control.</strong> ACL tags live in the index next to the chunk and
            the filter is applied inside the search. Post-filtering a leaked passage after it reached the prompt is not access
            control, it is a breach with a tidy log line.
          </li>
          <li>
            <strong>Incremental upsert with content hashes and tombstones.</strong> Full rebuilds are how &ldquo;the answer
            cites a deleted document&rdquo; happens. Track and alert on a staleness SLO: time from source change to searchable.
          </li>
          <li>
            <strong>Tier your storage.</strong> Hot shards in memory, cold years on disk or object storage, promoted on access.
            Most corpora have a brutal recency skew — exploit it.
          </li>
          <li>
            <strong>Right-size the models.</strong> Small model for rewriting and classification, large model only for the final
            answer. This one split often halves the bill.
          </li>
          <li>
            <strong>Ingest asynchronously.</strong> Queue-driven workers, idempotent by hash, with a dead-letter queue for
            documents that fail parsing — they will, and you need to see them.
          </li>
        </ul>

        <h3 className="step" id="eval">
          <span className="n">STAGE 09</span>Evaluation: the part that makes the rest possible
        </h3>
        <p className="prose">
          Build the golden set before the pipeline. Fifty to two hundred real questions, each with the passages that answer it
          and a reference answer, including <strong>unanswerable</strong> questions — a system that never abstains will fail
          exactly where the stakes are highest. Then split the scoreboard, because a retrieval bug and a generation bug have
          nothing in common.
        </p>
        <DataTable head={evalTable.head} rows={evalTable.rows} numericCols={[2]} nowrapFirst caption="Evaluation metrics and ship targets" />
        <p className="prose">
          Wire the golden set into CI and block merges on regression. Log every request with its retrieved ids, scores and final
          answer, so a complaint on Tuesday can be replayed exactly on Wednesday. Feed thumbs-down cases back into the golden
          set — that loop, not any model upgrade, is what makes the system better over a year.
        </p>

        <div className="callout">
          <span className="lbl">Once it is live</span>
          <p>
            These targets become SLOs, and the golden set becomes one of three quality loops.{" "}
            <Link href="/operations" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
              Operations
            </Link>{" "}
            covers what to instrument, which numbers to promise, how to sample quality in production, and where the money goes.
          </p>
        </div>

        <h3 className="step" id="failures">
          <span className="n">LOOKUP</span>Failure modes and what they actually mean
        </h3>
        <DataTable head={failureTable.head} rows={failureTable.rows} caption="Failure modes, causes and fixes" />

        <h3 className="step" id="path">
          <span className="n">SEQUENCE</span>The build path
        </h3>
        <Ladder rungs={buildPath} />

        <h4 className="sub">Anti-patterns worth naming</h4>
        <ul className="list">
          {antiPatterns.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
