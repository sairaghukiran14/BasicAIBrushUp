export default function BlastRadiusFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 310"
          role="img"
          aria-label="The same model error in two systems: in a retrieval system it ends at a wrong answer the user reads and you fix forward; in an agent it commits a write, so detection must be followed by compensation, rollback and notification."
        >
          <defs>
            <marker id="br-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="br-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#A8410F" />
            </marker>
          </defs>

          <text x="0" y="16" className="svg-mono" fontSize="11" fill="#1D6B54" letterSpacing="1.3">
            RETRIEVAL — THE ERROR ENDS ON A SCREEN
          </text>

          <g fill="currentColor" fontSize="11.5">
            <rect x="0" y="34" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="70" y="62" textAnchor="middle">Wrong passage</text>

            <rect x="178" y="34" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="248" y="62" textAnchor="middle">Wrong answer</text>

            <rect x="356" y="34" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="426" y="62" textAnchor="middle">User reads it</text>

            <rect x="534" y="34" width="160" height="46" fill="none" stroke="currentColor" />
            <text x="614" y="56" textAnchor="middle">Detect</text>
            <text x="614" y="71" textAnchor="middle" fontSize="9.5" opacity="0.65">thumbs · escalation · audit</text>

            <rect x="732" y="34" width="168" height="46" fill="none" stroke="#1D6B54" strokeWidth="1.6" />
            <text x="816" y="56" textAnchor="middle" fill="#1D6B54">Fix forward</text>
            <text x="816" y="71" textAnchor="middle" fontSize="9.5" fill="#1D6B54" opacity="0.8">reindex · prompt · threshold</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#br-ar)">
            <line x1="140" y1="57" x2="172" y2="57" />
            <line x1="318" y1="57" x2="350" y2="57" />
            <line x1="496" y1="57" x2="528" y2="57" />
            <line x1="694" y1="57" x2="726" y2="57" />
          </g>
          <text x="0" y="104" fontSize="11.5" fill="currentColor" opacity="0.8">
            Blast radius: one answer, one reader. The remedy is a better system tomorrow.
          </text>

          <line x1="0" y1="122" x2="900" y2="122" stroke="currentColor" opacity="0.2" />

          <text x="0" y="150" className="svg-mono" fontSize="11" fill="#A8410F" letterSpacing="1.3">
            AGENT — THE ERROR ENDS IN A SYSTEM OF RECORD
          </text>

          <g fill="currentColor" fontSize="11.5">
            <rect x="0" y="168" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="70" y="196" textAnchor="middle">Wrong decision</text>

            <rect x="178" y="168" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="248" y="190" textAnchor="middle">Gate allows</text>
            <text x="248" y="205" textAnchor="middle" fontSize="9.5" opacity="0.65">it was in policy</text>

            <rect x="356" y="168" width="140" height="46" fill="none" stroke="#A8410F" strokeWidth="1.6" />
            <text x="426" y="196" textAnchor="middle" fill="#A8410F">Write commits</text>

            <rect x="534" y="168" width="160" height="46" fill="none" stroke="currentColor" />
            <text x="614" y="190" textAnchor="middle">Detect</text>
            <text x="614" y="205" textAnchor="middle" fontSize="9.5" opacity="0.65">verify · anomaly · complaint</text>

            <rect x="732" y="168" width="168" height="46" fill="none" stroke="#A8410F" strokeWidth="1.6" />
            <text x="816" y="190" textAnchor="middle" fill="#A8410F">Compensate</text>
            <text x="816" y="205" textAnchor="middle" fontSize="9.5" fill="#A8410F" opacity="0.8">reverse · notify · restate</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#br-ar)">
            <line x1="140" y1="191" x2="172" y2="191" />
            <line x1="318" y1="191" x2="350" y2="191" />
            <line x1="496" y1="191" x2="528" y2="191" />
          </g>
          <line x1="694" y1="191" x2="726" y2="191" stroke="#A8410F" fill="none" markerEnd="url(#br-ar-a)" />

          <path d="M426 214 L426 240" stroke="#A8410F" strokeDasharray="4 3" fill="none" markerEnd="url(#br-ar-a)" />
          <rect x="330" y="242" width="192" height="34" fill="none" stroke="#A8410F" strokeDasharray="4 3" />
          <text x="426" y="264" textAnchor="middle" fontSize="11" fill="#A8410F">
            downstream effects
          </text>
          <text x="536" y="264" fontSize="11.5" fill="currentColor" opacity="0.8">
            emails sent, ledgers posted, jobs triggered — each with its own reversal
          </text>

          <text x="0" y="300" fontSize="12" fill="currentColor">
            Same model error, two costs: a re-read on one side, a compensating transaction on the other. Reliability work
            concentrates on the three orange boxes.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 2 — Why the reliability budget splits unevenly. A retrieval system can be fixed forward; an agent has already
        changed something, so detection is only useful if a reversal exists. That is why every agent action needs a defined
        inverse before the tool is enabled, and why verification-after-write is not optional instrumentation.
      </figcaption>
    </figure>
  );
}
