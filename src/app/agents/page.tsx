import Link from "next/link";
import { agents, LEVEL_AUTONOMY, LEVEL_BLURB, LEVEL_MECHANISM, LEVEL_NAME, type Level } from "@/data/agents";
import AgentBrowser from "@/components/agents/AgentBrowser";

const LEVELS: Level[] = [1, 2, 3];

export default function AgentsPage() {
  const count = (l: Level) => agents.filter((a) => a.level === l).length;
  const domains = new Set(agents.map((a) => a.domain)).size;

  return (
    <>
      <div className="masthead">
        <div className="wrap">
          <p className="kicker">Volume II · 30 agent builds · {domains} domains</p>
          <h1>Agent Workbench</h1>
          <p className="lede">
            Thirty agent problem statements, ordered by how much authority the agent is given rather than how clever it sounds.
            Each one states what it must be able to do, the tools it needs, the guardrails that belong in code rather than in a
            prompt, and the number that says it is finished. The playbook covers the decisions behind all thirty and how to run
            them at scale.
          </p>

          <div className="cta-row">
            <Link className="btn" href="/agents/playbook">
              Read the agent playbook
            </Link>
            <Link className="btn btn-ghost" href="/agents/patterns">
              The 12 agentic patterns
            </Link>
          </div>

          <div className="stats">
            <div className="stat">
              <b>30</b>
              <span>Agent specs</span>
            </div>
            <div className="stat">
              <b>{domains}</b>
              <span>Domains</span>
            </div>
            <div className="stat">
              <b>11</b>
              <span>Build decisions</span>
            </div>
            <div className="stat">
              <b>12</b>
              <span>Agentic patterns</span>
            </div>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-num">01</span>
            <h2>Levels are authority, not intelligence</h2>
          </div>
          <p className="sec-lede">
            What makes an agent hard to build is rarely the reasoning. It is what happens when it is wrong while holding a write
            credential. So the tiers here track how much the agent is allowed to do on its own, and what machinery you owe the
            user at each step up.
          </p>

          <div className="lvl-cards">
            {LEVELS.map((l) => (
              <div className={`lvl-card lv${l}`} key={l}>
                <span className={`pill lv${l}`}>
                  <span className="steps" aria-hidden="true">
                    <i className={l >= 1 ? "on" : ""} />
                    <i className={l >= 2 ? "on" : ""} />
                    <i className={l >= 3 ? "on" : ""} />
                  </span>
                  L{l} · {LEVEL_NAME[l]} · {count(l)} builds
                </span>
                <h3>{LEVEL_MECHANISM[l]}</h3>
                <p>{LEVEL_BLURB[l]}</p>
                <p className="foot">{LEVEL_AUTONOMY[l]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-num">02</span>
            <h2>The thirty builds</h2>
          </div>
          <p className="sec-lede">
            Read the guardrail column first. On every one of these, it is the column that decides whether the thing can ship —
            and each guardrail listed is one you implement in a credential scope, a schema or a ceiling, never in a sentence
            addressed to the model.
          </p>

          <AgentBrowser />
        </div>
      </section>
    </>
  );
}
