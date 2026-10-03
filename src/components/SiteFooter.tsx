import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap cols">
        <div>
          <h3>RAG Field Manual</h3>
          <p>
            Two volumes — 30 retrieval projects and 30 agent builds — with the architecture behind each. Tiers reflect system
            mechanism and authority, not domain expertise.
          </p>
        </div>
        <div>
          <h3>Sections</h3>
          <p>
            <Link href="/catalog">Project catalog</Link>
            <br />
            <Link href="/playbook">Build playbook</Link>
            <br />
            <Link href="/playbook#budget">Latency budget</Link>
            <br />
            <Link href="/playbook#failures">Failure modes</Link>
            <br />
            <Link href="/agents">Agent workbench</Link>
            <br />
            <Link href="/agents/playbook">Agent playbook</Link>
            <br />
            <Link href="/agents/patterns">Agentic patterns</Link>
            <br />
            <Link href="/operations">Operations</Link>
            <br />
            <Link href="/stack">The stack</Link>
            <br />
            <Link href="/python">Python</Link>
            <br />
            <Link href="/ml">ML foundations</Link>
            <br />
            <Link href="/training">Training a model</Link>
            <br />
            <Link href="/glossary">Glossary</Link>
          </p>
        </div>
        <div>
          <h3>Read the numbers this way</h3>
          <p>
            Latency and sizing figures are order-of-magnitude planning numbers. Measure on your own corpus before committing to
            any of them.
          </p>
        </div>
      </div>
    </footer>
  );
}
