export default function AgentLoopFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 390"
          role="img"
          aria-label="An agent loop: the model decides an action, a policy gate in code allows it or sends it to a human approval queue, the tool runs, the result is verified and becomes new state, and every step is written to a trace and checkpoint store."
        >
          <defs>
            <marker id="al-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="al-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#A8410F" />
            </marker>
          </defs>

          <g fill="currentColor" fontSize="12.5">
            <rect x="0" y="150" width="130" height="50" fill="none" stroke="currentColor" />
            <text x="65" y="172" textAnchor="middle">Task + goal</text>
            <text x="65" y="188" textAnchor="middle" fontSize="10" opacity="0.6">and its budget</text>

            <rect x="200" y="60" width="160" height="54" fill="none" stroke="currentColor" />
            <text x="280" y="84" textAnchor="middle" fontWeight="600">Decide</text>
            <text x="280" y="101" textAnchor="middle" fontSize="10" opacity="0.6">model picks the next action</text>

            <rect x="430" y="60" width="160" height="54" fill="none" stroke="#A8410F" strokeWidth="1.8" />
            <text x="510" y="84" textAnchor="middle" fontWeight="600" fill="#A8410F">Policy gate</text>
            <text x="510" y="101" textAnchor="middle" fontSize="10" fill="#A8410F" opacity="0.85">in code, not in the prompt</text>

            <rect x="430" y="200" width="160" height="54" fill="none" stroke="currentColor" />
            <text x="510" y="224" textAnchor="middle" fontWeight="600">Act</text>
            <text x="510" y="241" textAnchor="middle" fontSize="10" opacity="0.6">tool call · inverse recorded</text>

            <rect x="200" y="200" width="160" height="54" fill="none" stroke="currentColor" />
            <text x="280" y="224" textAnchor="middle" fontWeight="600">Observe</text>
            <text x="280" y="241" textAnchor="middle" fontSize="10" opacity="0.6">verify, then compact</text>

            <rect x="666" y="60" width="176" height="54" fill="none" stroke="currentColor" strokeDasharray="5 3" />
            <text x="754" y="84" textAnchor="middle">Human approval</text>
            <text x="754" y="101" textAnchor="middle" fontSize="10" opacity="0.6">queue, with context</text>

            <rect x="0" y="286" width="130" height="50" fill="none" stroke="currentColor" />
            <text x="65" y="308" textAnchor="middle">Done</text>
            <text x="65" y="324" textAnchor="middle" fontSize="10" opacity="0.6">or budget spent</text>
          </g>

          <g stroke="currentColor" fill="none" markerEnd="url(#al-ar)">
            <path d="M130 175 L165 175 L165 87 L194 87" />
            <line x1="360" y1="87" x2="424" y2="87" />
            <line x1="430" y1="227" x2="366" y2="227" />
            <path d="M240 200 L240 120" />
          </g>
          <path d="M510 114 L510 194" stroke="#A8410F" fill="none" markerEnd="url(#al-ar-a)" />
          <path d="M590 87 L660 87" stroke="currentColor" strokeDasharray="5 3" fill="none" markerEnd="url(#al-ar)" />
          <path d="M215 114 L215 140 L65 140 L65 280" stroke="currentColor" fill="none" markerEnd="url(#al-ar)" />

          <g className="svg-mono" fontSize="10" fill="currentColor" opacity="0.75">
            <text x="392" y="80" textAnchor="middle">action + args</text>
            <text x="625" y="80" textAnchor="middle">outside the envelope</text>
            <text x="395" y="218" textAnchor="middle">result</text>
            <text x="250" y="162">new state</text>
            <text x="82" y="200">stop condition</text>
          </g>
          <text x="520" y="160" className="svg-mono" fontSize="10" fill="#A8410F">
            allowed: scope, ceiling, rate, reversibility
          </text>

          <g stroke="currentColor" strokeDasharray="3 3" opacity="0.55" fill="none" markerEnd="url(#al-ar)">
            <line x1="280" y1="254" x2="280" y2="336" />
            <line x1="510" y1="254" x2="510" y2="336" />
            <line x1="754" y1="114" x2="754" y2="336" />
          </g>

          <rect x="200" y="342" width="700" height="40" fill="none" stroke="currentColor" opacity="0.55" />
          <text x="550" y="360" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="600">
            Trace + checkpoint store
          </text>
          <text x="550" y="375" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">
            every step: inputs, tool, arguments, result, decision, cost — resume from here after a crash
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 1 — The loop is four boxes; everything that makes it safe sits on the edges. The gate is the only place a write is
        authorised, so it belongs in code where a prompt cannot argue with it. Remove the trace store and the loop still runs —
        you just can no longer debug it, evaluate it, or explain it after an incident.
      </figcaption>
    </figure>
  );
}
