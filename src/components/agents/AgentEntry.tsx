import Link from "next/link";
import type { Agent } from "@/data/agents";
import AutonomyPill from "./AutonomyPill";

export default function AgentEntry({ agent }: { agent: Agent }) {
  return (
    <article className={`run lv${agent.level}`}>
      <div className="run-head">
        <span className="id">{String(agent.id).padStart(2, "0")}</span>
        <AutonomyPill level={agent.level} />
        <span className="domain">{agent.domain}</span>
      </div>

      <div className="run-body">
        <h3>
          <Link href={`/agents/${agent.slug}`}>{agent.title}</Link>
        </h3>
        <p className="objective">{agent.objective}</p>

        <div className="run-grid">
          <div className="aspec">
            <h4>Requirements</h4>
            <ul>
              {agent.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="aspec">
            <h4>Tool surface</h4>
            <ul>
              {agent.tools.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="aspec danger">
            <h4>Guardrails</h4>
            <ul>
              {agent.guardrails.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="aspec">
            <h4>Outputs</h4>
            <ul>
              {agent.outputs.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="run-ship">
          <b>Ships when</b>
          {agent.ship}
        </p>
      </div>
    </article>
  );
}
