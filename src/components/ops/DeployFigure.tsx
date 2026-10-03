export default function DeployFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 250"
          role="img"
          aria-label="A deployment pipeline where a commit passes tests, then an eval gate that blocks on regression, then builds a pinned artefact, then runs as a canary that either rolls back automatically on SLO burn or is promoted."
        >
          <defs>
            <marker id="dp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          <g fill="currentColor" fontSize="11.5">
            <rect x="0" y="70" width="118" height="46" fill="none" stroke="currentColor" />
            <text x="59" y="92" textAnchor="middle">Commit</text>
            <text x="59" y="107" textAnchor="middle" fontSize="9.5" opacity="0.6">code · prompt · config</text>

            <rect x="152" y="70" width="118" height="46" fill="none" stroke="currentColor" />
            <text x="211" y="92" textAnchor="middle">Tests</text>
            <text x="211" y="107" textAnchor="middle" fontSize="9.5" opacity="0.6">types · units · contracts</text>

            <rect x="304" y="70" width="140" height="46" fill="none" stroke="#2F5566" strokeWidth="1.8" />
            <text x="374" y="92" textAnchor="middle" fill="#2F5566" fontWeight="600">Eval gate</text>
            <text x="374" y="107" textAnchor="middle" fontSize="9.5" fill="#2F5566" opacity="0.85">golden set + adversarial</text>

            <rect x="478" y="70" width="126" height="46" fill="none" stroke="currentColor" />
            <text x="541" y="92" textAnchor="middle">Build</text>
            <text x="541" y="107" textAnchor="middle" fontSize="9.5" opacity="0.6">pin all six artefacts</text>

            <rect x="638" y="70" width="126" height="46" fill="none" stroke="currentColor" />
            <text x="701" y="92" textAnchor="middle">Canary 5%</text>
            <text x="701" y="107" textAnchor="middle" fontSize="9.5" opacity="0.6">real traffic, watched</text>

            <rect x="798" y="70" width="102" height="46" fill="none" stroke="currentColor" />
            <text x="849" y="97" textAnchor="middle">Promote</text>
          </g>

          <g stroke="currentColor" fill="none" markerEnd="url(#dp-ar)">
            <line x1="118" y1="93" x2="146" y2="93" />
            <line x1="270" y1="93" x2="298" y2="93" />
            <line x1="444" y1="93" x2="472" y2="93" />
            <line x1="604" y1="93" x2="632" y2="93" />
            <line x1="764" y1="93" x2="792" y2="93" />
          </g>

          <path d="M374 116 L374 160" stroke="#2F5566" fill="none" markerEnd="url(#dp-ar)" />
          <rect x="286" y="162" width="176" height="38" fill="none" stroke="#2F5566" strokeDasharray="4 3" />
          <text x="374" y="185" textAnchor="middle" fontSize="11" fill="#2F5566">
            regression → merge blocked
          </text>

          <path d="M701 116 L701 160" stroke="currentColor" fill="none" markerEnd="url(#dp-ar)" />
          <rect x="614" y="162" width="176" height="38" fill="none" stroke="currentColor" strokeDasharray="4 3" />
          <text x="701" y="185" textAnchor="middle" fontSize="11" fill="currentColor">
            SLO burn → auto rollback
          </text>

          <text x="0" y="30" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            A PROMPT CHANGE IS A DEPLOY — IT TAKES THE SAME PATH AS CODE
          </text>
          <text x="0" y="232" fontSize="12" fill="currentColor">
            The two dashed boxes are the whole point: one gate a human can read before merging, one that acts without waiting
            for a human at all.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 3 — The eval gate is the only stage that is specific to these systems, and it is the one most pipelines are
        missing. Without it, a prompt edit reaches production having passed nothing but a linter.
      </figcaption>
    </figure>
  );
}
