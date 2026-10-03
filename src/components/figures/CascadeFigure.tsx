export default function CascadeFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 300"
          role="img"
          aria-label="A retrieval cascade narrowing from ten million chunks to eight passages in four stages, each stage cheaper per item than the next and each with its own latency cost."
        >
          <defs>
            <marker id="cf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          <g fill="currentColor">
            <rect x="0" y="60" width="180" height="150" fill="none" stroke="currentColor" />
            <text x="90" y="120" textAnchor="middle" fontSize="13" fontWeight="600">Corpus</text>
            <text x="90" y="142" textAnchor="middle" fontSize="16" className="svg-mono">10,000,000</text>
            <text x="90" y="160" textAnchor="middle" fontSize="10" opacity="0.6">chunks</text>

            <rect x="232" y="82" width="170" height="106" fill="none" stroke="currentColor" />
            <text x="317" y="122" textAnchor="middle" fontSize="13" fontWeight="600">ANN + BM25</text>
            <text x="317" y="144" textAnchor="middle" fontSize="16" className="svg-mono">200</text>
            <text x="317" y="162" textAnchor="middle" fontSize="10" opacity="0.6">100 per channel</text>

            <rect x="454" y="100" width="160" height="70" fill="none" stroke="currentColor" />
            <text x="534" y="128" textAnchor="middle" fontSize="13" fontWeight="600">RRF fusion</text>
            <text x="534" y="150" textAnchor="middle" fontSize="16" className="svg-mono">100</text>

            <rect x="666" y="110" width="140" height="50" fill="none" stroke="#1D6B54" strokeWidth="1.6" />
            <text x="736" y="132" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1D6B54">Rerank</text>
            <text x="736" y="152" textAnchor="middle" fontSize="15" fill="#1D6B54" className="svg-mono">8</text>
          </g>

          <g stroke="currentColor" markerEnd="url(#cf-ar)" fill="none">
            <line x1="180" y1="135" x2="226" y2="135" />
            <line x1="402" y1="135" x2="448" y2="135" />
            <line x1="614" y1="135" x2="660" y2="135" />
          </g>

          <g fontSize="10" fill="currentColor" opacity="0.75" textAnchor="middle" className="svg-mono">
            <text x="203" y="126">~40 ms</text>
            <text x="425" y="126">~2 ms</text>
            <text x="637" y="126">~120 ms</text>
            <text x="203" y="228">graph walk,</text>
            <text x="203" y="241">cheap per item</text>
            <text x="425" y="228">rank-only fusion,</text>
            <text x="425" y="241">no score tuning</text>
            <text x="637" y="228">full attention,</text>
            <text x="637" y="241">expensive per item</text>
          </g>

          <text x="848" y="196" textAnchor="middle" fontSize="10" fill="#1D6B54" className="svg-mono">
            into the prompt
          </text>

          <line x1="0" y1="266" x2="900" y2="266" stroke="currentColor" opacity="0.25" />
          <text x="0" y="286" fontSize="10.5" fill="currentColor" opacity="0.7" className="svg-mono">
            Cost per item rises left to right; candidate count falls faster. That inversion is what makes the cascade affordable.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 2 — The cascade. Widening the first stage costs almost nothing and is how you fix recall; widening the last stage
        costs milliseconds per candidate and is how you blow the latency budget. When answers are wrong, raise the candidate
        count before you raise <code>k</code> into the prompt.
      </figcaption>
    </figure>
  );
}
