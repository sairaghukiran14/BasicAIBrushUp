export default function TrainingPipelineFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 300"
          role="img"
          aria-label="A training pipeline: raw sources are cleaned and deduplicated, tokenised and packed into sequences, then fed to a training loop that writes checkpoints; evaluation reads each checkpoint and decides which one is exported for serving, and its verdict feeds back into the data mixture."
        >
          <defs>
            <marker id="tr-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="tr-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#B07714" />
            </marker>
          </defs>

          <text x="0" y="16" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            OFFLINE — EVERY STAGE IS VERSIONED AND HASHED
          </text>

          <g fill="currentColor" fontSize="12">
            <rect x="0" y="36" width="120" height="48" fill="none" stroke="currentColor" />
            <text x="60" y="58" textAnchor="middle">Sources</text>
            <text x="60" y="73" textAnchor="middle" fontSize="9.5" opacity="0.6">licence · provenance</text>

            <rect x="158" y="36" width="132" height="48" fill="none" stroke="currentColor" />
            <text x="224" y="58" textAnchor="middle">Clean + dedup</text>
            <text x="224" y="73" textAnchor="middle" fontSize="9.5" opacity="0.6">filter · decontaminate</text>

            <rect x="328" y="36" width="132" height="48" fill="none" stroke="currentColor" />
            <text x="394" y="58" textAnchor="middle">Tokenise + pack</text>
            <text x="394" y="73" textAnchor="middle" fontSize="9.5" opacity="0.6">fixed-length sequences</text>

            <rect x="498" y="36" width="142" height="48" fill="none" stroke="#B07714" strokeWidth="1.8" />
            <text x="569" y="58" textAnchor="middle" fill="#B07714" fontWeight="600">Training loop</text>
            <text x="569" y="73" textAnchor="middle" fontSize="9.5" fill="#B07714" opacity="0.85">forward · loss · step</text>

            <rect x="678" y="36" width="120" height="48" fill="none" stroke="currentColor" />
            <text x="738" y="58" textAnchor="middle">Checkpoints</text>
            <text x="738" y="73" textAnchor="middle" fontSize="9.5" opacity="0.6">every N steps</text>
          </g>

          <g stroke="currentColor" fill="none" markerEnd="url(#tr-ar)">
            <line x1="120" y1="60" x2="152" y2="60" />
            <line x1="290" y1="60" x2="322" y2="60" />
            <line x1="460" y1="60" x2="492" y2="60" />
            <line x1="640" y1="60" x2="672" y2="60" />
          </g>

          <path d="M738 84 L738 132" stroke="currentColor" fill="none" markerEnd="url(#tr-ar)" />

          <g fill="currentColor" fontSize="12">
            <rect x="642" y="134" width="192" height="48" fill="none" stroke="currentColor" />
            <text x="738" y="156" textAnchor="middle">Evaluate</text>
            <text x="738" y="171" textAnchor="middle" fontSize="9.5" opacity="0.6">held-out loss + task evals</text>

            <rect x="642" y="212" width="192" height="48" fill="none" stroke="currentColor" />
            <text x="738" y="234" textAnchor="middle">Export + serve</text>
            <text x="738" y="249" textAnchor="middle" fontSize="9.5" opacity="0.6">safetensors · card · quantise</text>
          </g>
          <path d="M738 182 L738 206" stroke="currentColor" fill="none" markerEnd="url(#tr-ar)" />
          <text x="748" y="200" fontSize="10" className="svg-mono" fill="currentColor" opacity="0.7">
            the best checkpoint, not the last
          </text>

          <path
            d="M642 158 L224 158 L224 90"
            stroke="#B07714"
            strokeDasharray="5 3"
            fill="none"
            markerEnd="url(#tr-ar-a)"
          />
          <text x="240" y="150" fontSize="11" fill="#B07714">
            the only loop that matters: what the eval says goes back into the data mixture
          </text>

          <rect x="0" y="212" width="600" height="48" fill="none" stroke="currentColor" opacity="0.5" />
          <text x="16" y="234" fontSize="11.5" fill="currentColor">
            Run manifest — data snapshot hash · tokenizer version · model config · seed · library versions
          </text>
          <text x="16" y="250" fontSize="10" fill="currentColor" opacity="0.65" className="svg-mono">
            without all five, the run is an anecdote rather than an experiment
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 1 — The stages are ordinary; the two things that decide whether the run was worth doing are the dashed arrow and
        the manifest. Nearly every improvement in a real training project comes from changing the data and re-running, which is
        only possible if you can say exactly what the last run was trained on.
      </figcaption>
    </figure>
  );
}
