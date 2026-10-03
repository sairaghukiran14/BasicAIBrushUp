import type { Rung } from "@/data/playbook";

export default function Ladder({ rungs }: { rungs: Rung[] }) {
  return (
    <div className="ladder">
      {rungs.map((r) => (
        <div className="rung" key={r.id}>
          <span className="r">{r.id}</span>
          <div>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </div>
          <span className="gain">{r.note}</span>
        </div>
      ))}
    </div>
  );
}
