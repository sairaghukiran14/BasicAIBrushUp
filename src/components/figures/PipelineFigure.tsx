export default function PipelineFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 380"
          role="img"
          aria-label="The ingestion loop writes chunks and vectors into a shared index; the serving loop reads from that index through rewrite, hybrid retrieval, rerank, context packing and generation, with a grounding check before the answer is returned."
        >
          <defs>
            <marker id="pf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="pf-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#1D6B54" />
            </marker>
          </defs>

          <text x="0" y="16" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.55" letterSpacing="1.4">
            OFFLINE — INGESTION LOOP (runs on document change)
          </text>

          <g fontSize="12" fill="currentColor">
            <rect x="0" y="32" width="118" height="46" fill="none" stroke="currentColor" />
            <text x="59" y="52" textAnchor="middle">Sources</text>
            <text x="59" y="68" textAnchor="middle" fontSize="10" opacity="0.6">PDF · HTML · DB · API</text>

            <rect x="158" y="32" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="214" y="52" textAnchor="middle">Parse</text>
            <text x="214" y="68" textAnchor="middle" fontSize="10" opacity="0.6">layout · tables · OCR</text>

            <rect x="310" y="32" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="366" y="52" textAnchor="middle">Chunk</text>
            <text x="366" y="68" textAnchor="middle" fontSize="10" opacity="0.6">300–500 tok + parent</text>

            <rect x="462" y="32" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="518" y="52" textAnchor="middle">Enrich</text>
            <text x="518" y="68" textAnchor="middle" fontSize="10" opacity="0.6">metadata · ACL · dates</text>

            <rect x="614" y="32" width="112" height="46" fill="none" stroke="currentColor" />
            <text x="670" y="52" textAnchor="middle">Embed</text>
            <text x="670" y="68" textAnchor="middle" fontSize="10" opacity="0.6">batch · dedup by hash</text>
          </g>

          <g stroke="currentColor" markerEnd="url(#pf-ar)" fill="none">
            <line x1="118" y1="55" x2="152" y2="55" />
            <line x1="270" y1="55" x2="304" y2="55" />
            <line x1="422" y1="55" x2="456" y2="55" />
            <line x1="574" y1="55" x2="608" y2="55" />
          </g>

          <path d="M726 55 L790 55 L790 150" stroke="currentColor" fill="none" markerEnd="url(#pf-ar)" />
          <text x="798" y="105" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">upsert +</text>
          <text x="798" y="118" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">tombstone</text>

          <rect x="286" y="150" width="504" height="56" fill="none" stroke="#1D6B54" strokeWidth="1.6" />
          <text x="538" y="174" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1D6B54">
            INDEX — vectors + inverted (BM25) + metadata filters
          </text>
          <text x="538" y="192" textAnchor="middle" className="svg-mono" fontSize="10" fill="#1D6B54" opacity="0.85">
            sharded · versioned · ACL tags stored beside every chunk
          </text>

          <text x="0" y="248" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.55" letterSpacing="1.4">
            ONLINE — SERVING LOOP (runs per request, budget ≈ 2s p95)
          </text>

          <g fontSize="12" fill="currentColor">
            <rect x="0" y="264" width="104" height="44" fill="none" stroke="currentColor" />
            <text x="52" y="284" textAnchor="middle">Question</text>
            <text x="52" y="299" textAnchor="middle" fontSize="10" opacity="0.6">+ history</text>

            <rect x="140" y="264" width="118" height="44" fill="none" stroke="currentColor" />
            <text x="199" y="284" textAnchor="middle">Rewrite</text>
            <text x="199" y="299" textAnchor="middle" fontSize="10" opacity="0.6">+ extract filters</text>

            <rect x="294" y="264" width="118" height="44" fill="none" stroke="#1D6B54" strokeWidth="1.4" />
            <text x="353" y="284" textAnchor="middle" fill="#1D6B54">Retrieve</text>
            <text x="353" y="299" textAnchor="middle" fontSize="10" fill="#1D6B54" opacity="0.8">dense + BM25 → RRF</text>

            <rect x="448" y="264" width="118" height="44" fill="none" stroke="#1D6B54" strokeWidth="1.4" />
            <text x="507" y="284" textAnchor="middle" fill="#1D6B54">Rerank</text>
            <text x="507" y="299" textAnchor="middle" fontSize="10" fill="#1D6B54" opacity="0.8">cross-encoder 100→8</text>

            <rect x="602" y="264" width="112" height="44" fill="none" stroke="currentColor" />
            <text x="658" y="284" textAnchor="middle">Generate</text>
            <text x="658" y="299" textAnchor="middle" fontSize="10" opacity="0.6">cite or abstain</text>

            <rect x="750" y="264" width="112" height="44" fill="none" stroke="currentColor" />
            <text x="806" y="284" textAnchor="middle">Check</text>
            <text x="806" y="299" textAnchor="middle" fontSize="10" opacity="0.6">grounding · policy</text>
          </g>

          <g stroke="currentColor" markerEnd="url(#pf-ar)" fill="none">
            <line x1="104" y1="286" x2="134" y2="286" />
            <line x1="258" y1="286" x2="288" y2="286" />
            <line x1="412" y1="286" x2="442" y2="286" />
            <line x1="566" y1="286" x2="596" y2="286" />
            <line x1="714" y1="286" x2="744" y2="286" />
          </g>

          <path d="M353 250 L353 212" stroke="#1D6B54" strokeWidth="1.4" fill="none" markerEnd="url(#pf-ar-a)" />
          <text x="363" y="234" className="svg-mono" fontSize="10" fill="#1D6B54">
            queries, ACL-pre-filtered
          </text>

          <path d="M199 320 L199 344 L806 344 L806 320" stroke="currentColor" strokeDasharray="4 3" fill="none" markerEnd="url(#pf-ar)" />
          <text x="452" y="360" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">
            cache hit on rewritten query + filter set returns here and skips retrieval entirely
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 1 — The two loops meet only at the index. Everything above it is a batch job you can re-run; everything below it is
        on the user&rsquo;s clock. The dashed path is the cache: it short-circuits four stages, which is why cache design belongs
        in the architecture and not in a later optimisation ticket.
      </figcaption>
    </figure>
  );
}
