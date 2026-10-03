import Link from "next/link";
import GlossaryBrowser from "@/components/glossary/GlossaryBrowser";
import { DOMAIN_LABEL, domains, terms } from "@/data/glossary";

export default function GlossaryPage() {
  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">{terms.length} terms · {terms.length} worked examples · {domains.length} volumes</p>
          <h1>Glossary</h1>
          <p className="lede">
            Every term the manual uses, in three lines: what it is, what it costs you to get wrong, and one concrete case
            where it did. The colour on each entry is the colour of the volume it belongs to, so a term tells you where to go
            and read the rest.
          </p>

          <nav className="jump" aria-label="Jump to a section">
            {domains.map((d) => (
              <a key={d} href={`#${d}`} className={`dom-${d}`}>
                {DOMAIN_LABEL[d]}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <GlossaryBrowser />

          <div className="callout" style={{ marginTop: 40 }}>
            <span className="lbl">Reading order</span>
            <p>
              If a definition raises more questions than it answers, that is the point — each one is a doorway. Retrieval terms
              are worked through in the{" "}
              <Link href="/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                RAG playbook
              </Link>
              , agent terms in the{" "}
              <Link href="/agents/patterns" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                patterns
              </Link>{" "}
              and{" "}
              <Link href="/agents/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                playbook
              </Link>
              , API and model terms in{" "}
              <Link href="/stack" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                the stack
              </Link>
              , training terms in{" "}
              <Link href="/training" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                training a model
              </Link>
              , and the operational vocabulary in{" "}
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
