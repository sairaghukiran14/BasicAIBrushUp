import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bySlug, projects, TIER_MECHANISM, TIER_NAME } from "@/data/projects";
import TierMeter from "@/components/TierMeter";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: `${TIER_NAME[project.tier]} · ${project.industry} — ${project.use}`,
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  const related = projects.filter((p) => p.tier === project.tier && p.slug !== project.slug).slice(0, 4);

  return (
    <>
      <div className={`detail-head t${project.tier}`}>
        <div className="wrap">
          <Link href="/catalog" className="crumb">
            ← All 30 projects
          </Link>

          <div className="detail-meta">
            <span className="mono" style={{ fontSize: 13, opacity: 0.4 }}>
              {String(project.id).padStart(2, "0")}
            </span>
            <TierMeter tier={project.tier} />
            <span className="detail-industry">{project.industry}</span>
          </div>

          <h1>{project.title}</h1>
          <p className="lede">{project.use}</p>

          <ul className="tags" style={{ marginTop: 18 }}>
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="spec-grid">
            <div className="spec-block">
              <h2>Requirements</h2>
              <ul>
                {project.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="spec-block">
              <h2>Inputs</h2>
              <ul>
                {project.inputs.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="spec-block">
              <h2>Outputs</h2>
              <ul>
                {project.outputs.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 34 }}>
            <h2>Ships when</h2>
            <p>{project.ship}</p>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <h2>Machinery this tier adds</h2>
            <p>
              {TIER_NAME[project.tier]} — <code>{TIER_MECHANISM[project.tier]}</code>. Work the stages in{" "}
              <Link href="/playbook" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                the playbook
              </Link>{" "}
              in order; do not climb the retrieval ladder faster than your golden set can measure.
            </p>
          </div>

          <div className="pager">
            {prev ? (
              <Link href={`/projects/${prev.slug}`}>
                <span>← Previous</span>
                <b>{prev.title}</b>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/projects/${next.slug}`}>
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
                Other {TIER_NAME[project.tier].toLowerCase()} projects
              </h2>
              <div className="related">
                {related.map((r) => (
                  <Link key={r.slug} href={`/projects/${r.slug}`}>
                    <span className="industry">{r.industry}</span>
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
