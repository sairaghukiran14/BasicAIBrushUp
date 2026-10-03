import Link from "next/link";
import type { Project } from "@/data/projects";
import TierMeter from "./TierMeter";

export default function ProjectEntry({ project }: { project: Project }) {
  const n = String(project.id).padStart(2, "0");

  return (
    <article className={`entry t${project.tier}`}>
      <div className="entry-rail">
        <div className="num">{n}</div>
        <TierMeter tier={project.tier} />
        <div className="industry">{project.industry}</div>
        <ul className="tags">
          {project.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="use">{project.use}</p>

        <div className="specs">
          <div className="spec">
            <h4>Requirements</h4>
            <ul>
              {project.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="spec">
            <h4>Inputs</h4>
            <ul>
              {project.inputs.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="spec">
            <h4>Outputs</h4>
            <ul>
              {project.outputs.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="ship">
          <b>Ships when</b>
          {project.ship}
        </p>
      </div>
    </article>
  );
}
