export default function WorkflowVsAgentFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 320"
          role="img"
          aria-label="Side by side: a workflow whose edges are fixed at build time, and an agent where the model chooses the next edge each turn from a set of tools."
        >
          <defs>
            <marker id="wa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="wa-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#A8410F" />
            </marker>
          </defs>

          <text x="0" y="16" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            WORKFLOW — YOU CHOSE THE EDGES
          </text>

          <g fill="currentColor" fontSize="12">
            <rect x="0" y="92" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="56" y="120" textAnchor="middle">Extract</text>
            <rect x="146" y="92" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="202" y="120" textAnchor="middle">Classify</text>
            <rect x="292" y="92" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="348" y="120" textAnchor="middle">Write row</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#wa-ar)">
            <line x1="112" y1="115" x2="140" y2="115" />
            <line x1="258" y1="115" x2="286" y2="115" />
          </g>
          <g className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7" textAnchor="middle">
            <text x="126" y="107">always</text>
            <text x="272" y="107">always</text>
          </g>
          <g fontSize="11.5" fill="currentColor" opacity="0.85">
            <text x="0" y="182">Same path every run. Cost and latency are known</text>
            <text x="0" y="199">before you ship, and a failure is a bug with a</text>
            <text x="0" y="216">line number. Most &ldquo;agent&rdquo; projects are this.</text>
          </g>

          <line x1="450" y1="0" x2="450" y2="284" stroke="currentColor" opacity="0.25" strokeDasharray="4 4" />

          <text x="500" y="16" className="svg-mono" fontSize="11" fill="#A8410F" letterSpacing="1.3">
            AGENT — THE MODEL CHOOSES THE EDGE
          </text>

          <g fill="currentColor" fontSize="11.5">
            <rect x="500" y="40" width="118" height="38" fill="none" stroke="currentColor" />
            <text x="559" y="64" textAnchor="middle">search</text>
            <rect x="770" y="40" width="118" height="38" fill="none" stroke="currentColor" />
            <text x="829" y="64" textAnchor="middle">read record</text>
            <rect x="500" y="176" width="118" height="38" fill="none" stroke="currentColor" />
            <text x="559" y="200" textAnchor="middle">write record</text>
            <rect x="770" y="176" width="118" height="38" fill="none" stroke="currentColor" />
            <text x="829" y="200" textAnchor="middle">ask a human</text>
          </g>

          <rect x="624" y="94" width="140" height="66" fill="none" stroke="#A8410F" strokeWidth="1.8" />
          <text x="694" y="120" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#A8410F">
            Model
          </text>
          <text x="694" y="138" textAnchor="middle" className="svg-mono" fontSize="10" fill="#A8410F">
            picks 1 of n
          </text>

          <g stroke="#A8410F" fill="none" markerEnd="url(#wa-ar-a)" opacity="0.9">
            <path d="M654 94 L620 78" />
            <path d="M736 94 L770 78" />
            <path d="M654 160 L620 176" />
            <path d="M736 160 L770 176" />
          </g>
          <path
            d="M624 150 L596 150 L596 232 L792 232 L792 214"
            stroke="currentColor"
            fill="none"
            strokeDasharray="4 3"
            markerEnd="url(#wa-ar)"
            opacity="0.7"
          />
          <text x="694" y="248" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">
            observation returns, and it chooses again
          </text>

          <line x1="0" y1="284" x2="900" y2="284" stroke="currentColor" opacity="0.25" />
          <text x="0" y="306" fontSize="12" fill="currentColor">
            The only structural difference is who picks the next edge — and the cost, latency, eval difficulty and blast radius
            all follow from that one change.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 2 — Choose the left one until you can name the branch the model has to decide that you could not enumerate
        yourself. Every property that makes agents hard to operate arrives with that single arrow.
      </figcaption>
    </figure>
  );
}
