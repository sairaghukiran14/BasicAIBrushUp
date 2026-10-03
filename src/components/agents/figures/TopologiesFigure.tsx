export default function TopologiesFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 260"
          role="img"
          aria-label="Four agent topologies side by side: a single agent with tools, a supervisor with parallel workers and a synthesiser, a fixed pipeline of specialised stages, and a blackboard where several agents read and write one shared artefact store."
        >
          <defs>
            <marker id="tp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="tp-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#A8410F" />
            </marker>
          </defs>

          <g className="svg-mono" fontSize="10.5" fill="currentColor" opacity="0.6" letterSpacing="1.2">
            <text x="0" y="14">SINGLE AGENT</text>
            <text x="238" y="14">SUPERVISOR + WORKERS</text>
            <text x="520" y="14">PIPELINE</text>
            <text x="738" y="14">BLACKBOARD</text>
          </g>

          {/* single agent */}
          <g fill="currentColor" fontSize="11">
            <rect x="40" y="90" width="94" height="40" fill="none" stroke="#A8410F" strokeWidth="1.6" />
            <text x="87" y="114" textAnchor="middle" fill="#A8410F">agent</text>
            <rect x="0" y="34" width="72" height="28" fill="none" stroke="currentColor" />
            <text x="36" y="52" textAnchor="middle" fontSize="10">tool</text>
            <rect x="102" y="34" width="72" height="28" fill="none" stroke="currentColor" />
            <text x="138" y="52" textAnchor="middle" fontSize="10">tool</text>
            <rect x="40" y="162" width="94" height="28" fill="none" stroke="currentColor" />
            <text x="87" y="180" textAnchor="middle" fontSize="10">tool</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#tp-ar)" opacity="0.85">
            <line x1="70" y1="88" x2="48" y2="66" />
            <line x1="106" y1="88" x2="128" y2="66" />
            <line x1="87" y1="132" x2="87" y2="158" />
          </g>
          <text x="87" y="216" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">one window,</text>
          <text x="87" y="230" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">one budget</text>

          <line x1="208" y1="20" x2="208" y2="240" stroke="currentColor" opacity="0.2" />

          {/* supervisor + workers */}
          <g fill="currentColor" fontSize="11">
            <rect x="290" y="34" width="110" height="32" fill="none" stroke="#A8410F" strokeWidth="1.6" />
            <text x="345" y="55" textAnchor="middle" fill="#A8410F">planner</text>
            <rect x="238" y="104" width="66" height="30" fill="none" stroke="currentColor" />
            <text x="271" y="124" textAnchor="middle" fontSize="10">worker</text>
            <rect x="312" y="104" width="66" height="30" fill="none" stroke="currentColor" />
            <text x="345" y="124" textAnchor="middle" fontSize="10">worker</text>
            <rect x="386" y="104" width="66" height="30" fill="none" stroke="currentColor" />
            <text x="419" y="124" textAnchor="middle" fontSize="10">worker</text>
            <rect x="290" y="170" width="110" height="32" fill="none" stroke="currentColor" />
            <text x="345" y="191" textAnchor="middle">synthesise</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#tp-ar)" opacity="0.85">
            <path d="M320 66 L271 100" />
            <line x1="345" y1="66" x2="345" y2="100" />
            <path d="M370 66 L419 100" />
            <path d="M271 134 L320 166" />
            <line x1="345" y1="134" x2="345" y2="166" />
            <path d="M419 134 L370 166" />
          </g>
          <text x="345" y="230" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">
            n windows · n budgets · one hand-off each way
          </text>

          <line x1="490" y1="20" x2="490" y2="240" stroke="currentColor" opacity="0.2" />

          {/* pipeline */}
          <g fill="currentColor" fontSize="10.5">
            <rect x="510" y="96" width="62" height="32" fill="none" stroke="currentColor" />
            <text x="541" y="116" textAnchor="middle">extract</text>
            <rect x="592" y="96" width="62" height="32" fill="none" stroke="currentColor" />
            <text x="623" y="116" textAnchor="middle">classify</text>
            <rect x="674" y="96" width="62" height="32" fill="none" stroke="currentColor" />
            <text x="705" y="116" textAnchor="middle">draft</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#tp-ar)">
            <line x1="572" y1="112" x2="586" y2="112" />
            <line x1="654" y1="112" x2="668" y2="112" />
          </g>
          <text x="623" y="230" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">
            fixed edges — this is a workflow
          </text>

          <line x1="752" y1="20" x2="752" y2="240" stroke="currentColor" opacity="0.2" />

          {/* blackboard */}
          <g fill="currentColor" fontSize="10.5">
            <rect x="782" y="96" width="106" height="34" fill="none" stroke="#A8410F" strokeWidth="1.6" />
            <text x="835" y="112" textAnchor="middle" fill="#A8410F" fontSize="11">artefacts</text>
            <text x="835" y="124" textAnchor="middle" fill="#A8410F" fontSize="9" opacity="0.8">shared store</text>
            <rect x="770" y="36" width="60" height="26" fill="none" stroke="currentColor" />
            <text x="800" y="53" textAnchor="middle" fontSize="9.5">research</text>
            <rect x="842" y="36" width="58" height="26" fill="none" stroke="currentColor" />
            <text x="871" y="53" textAnchor="middle" fontSize="9.5">analyse</text>
            <rect x="806" y="166" width="60" height="26" fill="none" stroke="currentColor" />
            <text x="836" y="183" textAnchor="middle" fontSize="9.5">critic</text>
          </g>
          <g stroke="#A8410F" fill="none" opacity="0.9">
            <path d="M800 64 L812 92" markerEnd="url(#tp-ar-a)" />
            <path d="M818 92 L806 64" markerEnd="url(#tp-ar-a)" />
            <path d="M866 64 L854 92" markerEnd="url(#tp-ar-a)" />
            <path d="M836 164 L836 134" markerEnd="url(#tp-ar-a)" />
          </g>
          <text x="835" y="230" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">
            artefacts, not transcripts
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 3 — The same work, four shapes. Read them by what crosses each arrow: a single agent passes nothing, a supervisor
        passes a task down and a result up, a pipeline passes a fixed payload, and a blackboard passes documents with
        provenance. Every arrow is a place context is lost, which is the real argument for staying on the left as long as you
        can.
      </figcaption>
    </figure>
  );
}
