import Link from "next/link";
import CodeBlock from "@/components/python/CodeBlock";
import DataTable from "@/components/DataTable";
import SystemArchitectureFigure from "@/components/stack/SystemArchitectureFigure";
import type { Snippet } from "@/data/python";
import {
  apiSnippets,
  buildOrder,
  fineTuneLadder,
  fineTuneRules,
  fineTuneSnippet,
  frameworkTable,
  hfSnippets,
  mcpSecurity,
  mcpSnippets,
  mcpTable,
  modelTable,
  promptParts,
  promptRules,
  promptSnippets,
  referenceStacks,
  requestAnatomy,
  selfHostTable,
  servingTable,
  stackSections,
  tokenLevers,
  tokenSnippets,
  vectorDbTable,
  vectorOps,
  vectorSnippets,
  workflowSnippet,
} from "@/data/stack";

function Uses({ usedIn }: { usedIn: Snippet["usedIn"] }) {
  return (
    <span className="uses">
      {usedIn.includes("rag") ? <span className="use-tag use-tag-rag">RAG</span> : null}
      {usedIn.includes("agents") ? <span className="use-tag use-tag-agt">Agents</span> : null}
    </span>
  );
}

function Snippets({ items, ext = "py" }: { items: Snippet[]; ext?: string }) {
  return (
    <div className="snips">
      {items.map((s) => (
        <article className="snip" id={s.id} key={s.id}>
          <div className="snip-head">
            <h3>{s.title}</h3>
            <Uses usedIn={s.usedIn} />
          </div>
          <p className="why">{s.why}</p>
          <CodeBlock code={s.code} label={`${s.id.replace(/-/g, "_")}.${s.id === "pgvector" ? "sql" : ext}`} />
          <p className="note">{s.note}</p>
        </article>
      ))}
    </div>
  );
}

export default function StackPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">The parts, and how they fit</p>
          <h1>The stack</h1>
          <p className="lede">
            Everything between the language and the system: how a model API actually behaves, what a token costs and how to
            spend fewer of them, how to write a prompt that survives an eval set, which vector store to run, when an open model
            beats a hosted one, when to fine-tune instead, what a framework gives you, and what MCP is for. Each part with the
            code, and the decision that comes before the code.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/python">
              The language layer
            </Link>
            <Link className="btn btn-ghost" href="/operations">
              Running it in production
            </Link>
          </div>

          <div className="parts">
            <div className="part">
              <span className="n">01–02</span>
              <h3>Model APIs, tokens and cost</h3>
              <p>The request, the loop, the usage record, and the levers that move the bill.</p>
            </div>
            <div className="part">
              <span className="n">03</span>
              <h3>Prompt engineering</h3>
              <p>Structure, precision, examples, output contracts, and refinement as an experiment.</p>
            </div>
            <div className="part">
              <span className="n">04–06</span>
              <h3>Stores and models</h3>
              <p>Vector databases, open models and Hugging Face, and when a fine-tune is the right answer.</p>
            </div>
            <div className="part">
              <span className="n">07–09</span>
              <h3>Workflows, MCP, assembly</h3>
              <p>Multi-step pipelines, frameworks worth adopting, a shared tool protocol, and the build order.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <nav className="toc" aria-label="Stack sections">
            {stackSections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="api">
            <span className="n">PART 01</span>Talking to a model over an API
          </h3>
          <p className="prose">
            The API is stateless. Every call carries the whole conversation, you pay for all of it, and the response is a list
            of typed blocks with a reason for stopping and a usage record attached. Internalise those four facts and most of
            what looks like magic in a framework turns out to be bookkeeping.
          </p>
          <DataTable head={requestAnatomy.head} rows={requestAnatomy.rows} nowrapFirst caption="Anatomy of a request" />
          <Snippets items={apiSnippets} />

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="tokens">
            <span className="n">PART 02</span>Tokens: the unit you are actually buying
          </h3>
          <p className="prose">
            A token is roughly three-quarters of an English word, and it is the unit of both cost and context. Two numbers
            follow from that: what one request costs, and how much of the window you have left. Both should be measured before
            you send, not discovered on the invoice.
          </p>
          <DataTable head={modelTable.head} rows={modelTable.rows} numericCols={[3, 4]} nowrapFirst caption="Current model tiers and list prices" />
          <p className="prose">
            Read the table as a routing plan rather than a menu. Most systems end up with a cheap model doing classification,
            extraction and query rewriting — the steps that run on every request — and a capable model doing the one step whose
            quality the user actually sees.
          </p>
          <DataTable head={tokenLevers.head} rows={tokenLevers.rows} nowrapFirst caption="Levers that reduce token spend" />
          <Snippets items={tokenSnippets} />
          <div className="callout">
            <span className="lbl">Budget arithmetic worth doing once</span>
            <p>
              Cost per request is <code>(input tokens × input price) + (output tokens × output price)</code>, and output tokens
              cost several times input tokens on every tier. So the two questions that matter are how much context you are
              resending on every call — which caching and compaction attack — and how much prose you are asking for that nobody
              reads. Multiply by your monthly volume before you build, not after.
            </p>
          </div>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="prompting">
            <span className="n">PART 03</span>Prompt engineering, without the folklore
          </h3>
          <p className="prose">
            A prompt is an interface specification written in prose. The useful skill is not phrasing — it is deciding what the
            model must be told, what it must never do, and what shape the answer has to arrive in so the next piece of code can
            rely on it.
          </p>
          <DataTable head={promptParts.head} rows={promptParts.rows} nowrapFirst caption="The six parts of a working prompt" />
          <Snippets items={promptSnippets} />
          <h4 className="sub">Rules that survive contact with an eval set</h4>
          <ul className="rules">
            {promptRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="vectors">
            <span className="n">PART 04</span>Vector databases
          </h3>
          <p className="prose">
            A vector database is an index with filters and a durability story. The interesting decisions are not which product
            — they are how the schema encodes tenancy and time, whether filtering happens inside the search, and what happens
            when a document is deleted.
          </p>
          <DataTable head={vectorDbTable.head} rows={vectorDbTable.rows} nowrapFirst caption="Vector store options" />
          <Snippets items={vectorSnippets} />
          <h4 className="sub">Operating one</h4>
          <ul className="rules">
            {vectorOps.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="open">
            <span className="n">PART 05</span>Open models, Hugging Face and running it yourself
          </h3>
          <p className="prose">
            Self-hosting is an arithmetic decision, not an ideological one. A GPU costs the same whether it is busy or idle, so
            open models win where volume is steady, the workload is narrow, or the data cannot leave — and lose where traffic is
            spiky and quality is the constraint.
          </p>
          <DataTable head={selfHostTable.head} rows={selfHostTable.rows} nowrapFirst caption="Hosted API versus self-hosted open model" />
          <Snippets items={hfSnippets} />
          <h4 className="sub">Serving runtimes</h4>
          <DataTable head={servingTable.head} rows={servingTable.rows} nowrapFirst caption="Where to run an open model" />
          <div className="callout">
            <span className="lbl">The sizing rule</span>
            <p>
              Weights need roughly <code>parameters × 2 bytes</code> at bf16, or about half a byte per parameter at 4-bit — so
              an 8B model is ~16 GB or ~5 GB — and then the KV cache grows with batch size and sequence length on top. If the
              model only just fits, throughput collapses under concurrency; leave headroom or quantise.
            </p>
          </div>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="tuning">
            <span className="n">PART 06</span>Fine-tuning, and the four things to try first
          </h3>
          <p className="prose">
            Fine-tuning teaches behaviour, not facts. If the failure is “it does not know”, retrieval fixes it and a fine-tune
            will not. If the failure is “it will not consistently produce our format, in our vocabulary, at our latency”, that
            is what an adapter is for.
          </p>
          <DataTable head={fineTuneLadder.head} rows={fineTuneLadder.rows} nowrapFirst caption="What to try before fine-tuning" />
          <Snippets items={[fineTuneSnippet]} />
          <ul className="rules">
            {fineTuneRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="workflows">
            <span className="n">PART 07</span>Multi-step workflows and the frameworks around them
          </h3>
          <p className="prose">
            A workflow is several model calls in an order you chose, with ordinary code between them. That is most production
            systems, and it is worth writing one by hand before adopting anything that writes it for you — the abstraction is
            much easier to judge once you know what it replaced.
          </p>
          <Snippets items={[workflowSnippet]} />
          <DataTable head={frameworkTable.head} rows={frameworkTable.rows} nowrapFirst caption="Frameworks: what each gives you" />
          <p className="prose">
            The honest rule: adopt a framework for the parts you would otherwise write badly — connectors, durable state,
            retries, tracing — and keep the parts you need to debug in your own code. Retrieval scores and prompts are the two
            things you will be staring at during an incident, so keep them where you can see them.
          </p>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="mcp">
            <span className="n">PART 08</span>MCP: one tool surface, many hosts
          </h3>
          <p className="prose">
            The Model Context Protocol is a standard interface between an assistant (the host) and whatever provides its tools,
            data and prompts (the server). Its value is not new capability — it is that the retrieval tool you wrote for your
            own agent becomes callable from an IDE, a desktop assistant or another team&rsquo;s system without a bespoke
            integration each time.
          </p>
          <DataTable head={mcpTable.head} rows={mcpTable.rows} nowrapFirst caption="What an MCP server exposes" />
          <Snippets items={mcpSnippets} />
          <h4 className="sub">Security, because this is a new door into the loop</h4>
          <ul className="rules">
            {mcpSecurity.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {/* ---------------------------------------------------------- */}
          <h3 className="step" id="assemble">
            <span className="n">PART 09</span>Assembling it, in the order that works
          </h3>
          <p className="prose">
            Here is what the parts look like once they are wired together. Every box below is something from the eight parts
            above; the arrows are the only thing this page adds.
          </p>
          <SystemArchitectureFigure />
          <p className="prose">
            Every layer below can be a weekend&rsquo;s work or a team&rsquo;s quarter. The mistake is picking the enterprise
            column on day one: it triples the moving parts before you know which of them your problem actually needs.
          </p>
          <DataTable head={referenceStacks.head} rows={referenceStacks.rows} nowrapFirst caption="Reference stacks at three sizes" />
          <h4 className="sub">The build order</h4>
          <ol className="steps">
            {buildOrder.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>

          <div className="callout" style={{ marginTop: 34 }}>
            <span className="lbl">Where this connects</span>
            <p>
              The retrieval decisions behind these parts are in the{" "}
              <Link href="/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                RAG playbook
              </Link>
              , the loop and gate decisions in the{" "}
              <Link href="/agents/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                agent playbook
              </Link>
              , the language in{" "}
              <Link href="/python" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                Python
              </Link>
              , and what happens once real traffic arrives in{" "}
              <Link href="/operations" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
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
