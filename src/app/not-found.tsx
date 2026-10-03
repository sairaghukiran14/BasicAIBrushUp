import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="kicker">404 · nothing retrieved</p>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 46px)", fontWeight: 700, lineHeight: 1.05 }}>
          No passage above threshold
        </h1>
        <p className="lede">
          That page is not in the corpus. Which is the right behaviour — a system that answers anyway is the one you have to
          fix.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/catalog">
            Back to the catalog
          </Link>
          <Link className="btn btn-ghost" href="/playbook">
            Read the playbook
          </Link>
        </div>
      </div>
    </section>
  );
}
