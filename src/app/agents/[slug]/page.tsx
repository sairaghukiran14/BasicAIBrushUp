import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { agentBySlug, agents, LEVEL_AUTONOMY, LEVEL_MECHANISM, LEVEL_NAME } from "@/data/agents";
import AutonomyPill from "@/components/agents/AutonomyPill";

export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/agents/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) return { title: "Agent not found" };
  return {
    title: agent.title,
    description: `L${agent.level} ${LEVEL_NAME[agent.level]} · ${agent.domain} — ${agent.objective}`,
  };
}

export default async function AgentPage({ params }: PageProps<"/agents/[slug]">) {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) notFound();

  const index = agents.findIndex((a) => a.slug === agent.slug);
  const prev = index > 0 ? agents[index - 1] : null;
  const next = index < agents.length - 1 ? agents[index + 1] : null;
  const related = agents.filter((a) => a.level === agent.level && a.slug !== agent.slug).slice(0, 4);

  return (
    <>
      <div className={`agent-head lv${agent.level}`}>
        <div className="wrap">
          <Link href="/agents" className="crumb">
            ← All 30 agent builds
          </Link>

          <div className="agent-meta">
            <span className="mono" style={{ fontSize: 13, opacity: 0.45 }}>
              {String(agent.id).padStart(2, "0")}
            </span>
            <AutonomyPill level={agent.level} />
            <span className="mono" style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {agent.domain}
            </span>
          </div>

          <h1>{agent.title}</h1>
          <p className="lede">{agent.objective}</p>
          <p className="autonomy-line" style={{ marginTop: 14 }}>
            {LEVEL_AUTONOMY[agent.level]}
          </p>

          <ul className="tags" style={{ marginTop: 16 }}>
            {agent.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="block-grid">
            <div className="block">
              <h2>Requirements</h2>
              <ul>
                {agent.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="block">
              <h2>Tool surface</h2>
              <ul>
                {agent.tools.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="block danger">
              <h2>Guardrails — in code, not in the prompt</h2>
              <ul>
                {agent.guardrails.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="block">
              <h2>Outputs</h2>
              <ul>
                {agent.outputs.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 34 }}>
            <h2>Ships when</h2>
            <p>{agent.ship}</p>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <h2>Machinery this level adds</h2>
            <p>
              L{agent.level} {LEVEL_NAME[agent.level]} — <code>{LEVEL_MECHANISM[agent.level]}</code>. Build it at{" "}
              <Link href="/agents/playbook#path" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                read-only first
              </Link>{" "}
              and earn each rung; the{" "}
              <Link href="/agents/playbook#decisions" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                decision table
              </Link>{" "}
              covers the choices this spec assumes.
            </p>
          </div>

          <div className="pager">
            {prev ? (
              <Link href={`/agents/${prev.slug}`}>
                <span>← Previous</span>
                <b>{prev.title}</b>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/agents/${next.slug}`}>
                <span>Next →</span>
                <b>{next.title}</b>
              </Link>
            ) : (
              <span />
            )}
          </div>

          {related.length > 0 ? (
            <>
              <h2 className="sub" style={{ marginTop: 44, marginBottom: 12 }}>
                Other L{agent.level} builds
              </h2>
              <div className="related">
                {related.map((r) => (
                  <Link key={r.slug} href={`/agents/${r.slug}`}>
                    <span className="industry">{r.domain}</span>
                    <b>{r.title}</b>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
