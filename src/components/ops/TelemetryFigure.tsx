export default function TelemetryFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 330"
          role="img"
          aria-label="Every stage of a request emits into one trace record, and that single record is read by three different consumers: health alerting, quality evaluation, and cost and capacity."
        >
          <defs>
            <marker id="tf-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          <text x="0" y="16" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            ONE REQUEST — OR ONE AGENT RUN
          </text>

          <g fill="currentColor" fontSize="11.5">
            <rect x="0" y="34" width="140" height="44" fill="none" stroke="currentColor" />
            <text x="70" y="55" textAnchor="middle">Request</text>
            <text x="70" y="70" textAnchor="middle" fontSize="9.5" opacity="0.6">user, tenant, intent</text>

            <rect x="180" y="34" width="150" height="44" fill="none" stroke="currentColor" />
            <text x="255" y="55" textAnchor="middle">Retrieve</text>
            <text x="255" y="70" textAnchor="middle" fontSize="9.5" opacity="0.6">ids, scores, filters</text>

            <rect x="370" y="34" width="150" height="44" fill="none" stroke="currentColor" />
            <text x="445" y="55" textAnchor="middle">Generate or act</text>
            <text x="445" y="70" textAnchor="middle" fontSize="9.5" opacity="0.6">model, tools, tokens</text>

            <rect x="560" y="34" width="150" height="44" fill="none" stroke="currentColor" />
            <text x="635" y="55" textAnchor="middle">Respond or commit</text>
            <text x="635" y="70" textAnchor="middle" fontSize="9.5" opacity="0.6">citations, writes</text>

            <rect x="750" y="34" width="150" height="44" fill="none" stroke="currentColor" />
            <text x="825" y="55" textAnchor="middle">Outcome</text>
            <text x="825" y="70" textAnchor="middle" fontSize="9.5" opacity="0.6">feedback, escalation</text>
          </g>

          <g stroke="currentColor" fill="none" markerEnd="url(#tf-ar)">
            <line x1="140" y1="56" x2="174" y2="56" />
            <line x1="330" y1="56" x2="364" y2="56" />
            <line x1="520" y1="56" x2="554" y2="56" />
            <line x1="710" y1="56" x2="744" y2="56" />
          </g>

          <g stroke="currentColor" strokeDasharray="3 3" opacity="0.6" fill="none" markerEnd="url(#tf-ar)">
            <line x1="70" y1="78" x2="70" y2="134" />
            <line x1="255" y1="78" x2="255" y2="134" />
            <line x1="445" y1="78" x2="445" y2="134" />
            <line x1="635" y1="78" x2="635" y2="134" />
            <line x1="825" y1="78" x2="825" y2="134" />
          </g>

          <rect x="0" y="140" width="900" height="54" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <text x="450" y="164" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
            ONE TRACE RECORD
          </text>
          <text x="450" y="182" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.75">
            trace id · versions (prompt, model, index, policy) · retrieved ids + scores · tool calls + args · tokens · cost · decision · outcome
          </text>

          <g stroke="currentColor" fill="none" markerEnd="url(#tf-ar)">
            <path d="M155 194 L155 236" />
            <path d="M450 194 L450 236" />
            <path d="M745 194 L745 236" />
          </g>

          <g fill="currentColor" fontSize="12">
            <rect x="40" y="242" width="230" height="52" fill="none" stroke="currentColor" />
            <text x="155" y="264" textAnchor="middle" fontWeight="600">Health &amp; alerting</text>
            <text x="155" y="281" textAnchor="middle" fontSize="10" opacity="0.65">SLO burn · latency · errors</text>

            <rect x="335" y="242" width="230" height="52" fill="none" stroke="currentColor" />
            <text x="450" y="264" textAnchor="middle" fontWeight="600">Quality &amp; regression</text>
            <text x="450" y="281" textAnchor="middle" fontSize="10" opacity="0.65">samples · eval sets · drift</text>

            <rect x="630" y="242" width="230" height="52" fill="none" stroke="currentColor" />
            <text x="745" y="264" textAnchor="middle" fontWeight="600">Cost &amp; capacity</text>
            <text x="745" y="281" textAnchor="middle" fontSize="10" opacity="0.65">per-unit cost · tokens · caching</text>
          </g>

          <text x="450" y="320" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor" opacity="0.7">
            three readers, one emission — instrument for one of them and you will build the other two twice
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 1 — Monitoring, evaluation and cost analysis are three questions asked of the same record. Decide its schema once,
        early, and every later question is a query rather than a re-instrumentation project. The record is also what makes a
        complaint replayable months later, which is the difference between a five-minute answer and a theory.
      </figcaption>
    </figure>
  );
}
