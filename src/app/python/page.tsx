import Link from "next/link";
import CodeBlock from "@/components/python/CodeBlock";
import DataTable from "@/components/DataTable";
import {
  advanced,
  concurrency,
  ecosystemTable,
  foundations,
  fundamentals,
  pythonSections,
  stdlibTable,
  structuresTable,
  traps,
  type Snippet,
} from "@/data/python";

function Uses({ usedIn }: { usedIn: Snippet["usedIn"] }) {
  return (
    <span className="uses">
      {usedIn.includes("rag") ? <span className="use-tag use-tag-rag">RAG</span> : null}
      {usedIn.includes("agents") ? <span className="use-tag use-tag-agt">Agents</span> : null}
    </span>
  );
}

function Snippets({ items }: { items: Snippet[] }) {
  return (
    <div className="snips">
      {items.map((s) => (
        <article className="snip" id={s.id} key={s.id}>
          <div className="snip-head">
            <h3>{s.title}</h3>
            <Uses usedIn={s.usedIn} />
          </div>
          <p className="why">{s.why}</p>
          <CodeBlock code={s.code} label={s.id.replace(/-/g, "_") + ".py"} />
          <p className="note">{s.note}</p>
        </article>
      ))}
    </div>
  );
}

export default function PythonPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">The language layer · {foundations.length + fundamentals.length + concurrency.length + advanced.length} worked snippets</p>
          <h1>Python for these systems</h1>
          <p className="lede">
            Not a tour of the language — the specific parts of it that RAG pipelines and agent loops are made of, each shown
            doing the job it does in a real build. Where the playbooks say “parallelise the retrieval channels”, “make
            abstention mechanical” or “put the ceiling in code”, this is the code they are describing.
          </p>

          <div className="legend" style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span className="use-tag use-tag-rag">RAG</span>
            <span className="use-tag use-tag-agt">Agents</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em" }}>
              every snippet is tagged with where it earns its place
            </span>
          </div>

          <div className="cta-row">
            <Link className="btn" href="/playbook">
              RAG playbook
            </Link>
            <Link className="btn btn-ghost" href="/agents/playbook">
              Agent playbook
            </Link>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="Python sections">
            {pythonSections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          <h3 className="step" id="foundations">
            <span className="n">PART 00</span>Foundations, in the shape these systems use them
          </h3>
          <p className="prose">
            Lists, dictionaries, sets, loops, functions, files and HTTP calls — the ordinary language, shown doing the specific
            jobs a pipeline gives it. The point of this part is not that these constructs exist; it is that choosing the wrong
            one here is what makes an ingestion job quadratic or a refusal condition stop firing.
          </p>
          <h4 className="sub">Which container, and why</h4>
          <p className="prose">
            Pick the structure from the question you are going to ask it, not from the data you happen to have. The right-hand
            column is where each one actually shows up in these two systems.
          </p>
          <DataTable
            head={structuresTable.head}
            rows={structuresTable.rows}
            nowrapFirst
            caption="Python data structures and when to use each"
          />
          <Snippets items={foundations} />

          <h3 className="step" id="fundamentals">
            <span className="n">PART 01</span>The building blocks that carry the weight
          </h3>
          <p className="prose">
Eight further constructs do most of the remaining work in both systems. None of them is exotic; what makes them worth writing down is
            that each one maps to a specific requirement from the playbooks — the chunk record that must keep its metadata, the
            tool ceiling that must live in code, the retry that must not stampede.
          </p>
          <Snippets items={fundamentals} />

          <h3 className="step" id="concurrency">
            <span className="n">PART 02</span>Concurrency, where the latency actually goes
          </h3>
          <p className="prose">
            Both systems are almost entirely I/O: waiting on a vector store, a reranker, a model, a downstream API. That makes
            asyncio the single highest-leverage part of the language here — and the place where a small mistake costs every
            request on the worker, not just the one that made it.
          </p>
          <div className="callout">
            <span className="lbl">The rule that decides which tool</span>
            <p>
              Waiting on the network is <strong>asyncio</strong>. CPU work inside a C extension — numpy, a fast tokeniser, a
              PDF parser — is <strong>asyncio.to_thread</strong>, because the extension releases the GIL. Pure-Python CPU work
              is a <strong>process pool</strong>, because it does not. Guessing which of the three you have is how an async
              service ends up slower than the sync one it replaced.
            </p>
          </div>
          <Snippets items={concurrency} />

          <h3 className="step" id="advanced">
            <span className="n">PART 03</span>Advanced techniques
          </h3>
          <p className="prose">
            These are the ones that show up when the system stops being a prototype: dispatching a model&rsquo;s tool call
            safely, scoring a hundred thousand vectors without a Python loop, quantising an index, surviving a crash mid-run,
            and measuring the tail instead of the mean.
          </p>
          <Snippets items={advanced} />

          <h3 className="step" id="stdlib">
            <span className="n">TOOLBOX</span>The standard library does more than you think
          </h3>
          <p className="prose">
            Before adding a dependency, check whether one of these already covers it. Every row is something these systems need
            and the interpreter already ships.
          </p>
          <DataTable head={stdlibTable.head} rows={stdlibTable.rows} nowrapFirst caption="Standard library modules used in RAG and agent systems" />

          <h3 className="step" id="ecosystem">
            <span className="n">TOOLBOX</span>And the nine dependencies you will add anyway
          </h3>
          <DataTable head={ecosystemTable.head} rows={ecosystemTable.rows} nowrapFirst caption="Common third-party libraries and why" />

          <h3 className="step" id="traps">
            <span className="n">LOOKUP</span>The traps that bite in production
          </h3>
          <p className="prose">
            Each of these is cheap to avoid and expensive to discover under load. Most of them do not fail in development,
            which is precisely the problem.
          </p>
          <ul className="traps">
            {traps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="callout" style={{ marginTop: 34 }}>
            <span className="lbl">How to use this page</span>
            <p>
              Read it beside a build, not on its own. Each snippet is the smallest honest version of something the{" "}
              <Link href="/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                RAG playbook
              </Link>{" "}
              or the{" "}
              <Link href="/agents/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                agent playbook
              </Link>{" "}
              asks for, and the numbers they produce are what{" "}
              <Link href="/operations" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                operations
              </Link>{" "}
              turns into SLOs. Type them out rather than pasting them — the traps section is a list of things people learn by
              pasting.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
