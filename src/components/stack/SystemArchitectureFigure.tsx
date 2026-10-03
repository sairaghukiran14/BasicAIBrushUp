export default function SystemArchitectureFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 480"
          role="img"
          aria-label="A production architecture: the online request path runs client to edge to orchestrator, through caches, a policy gate, and the retrieval, model and tool planes; the offline ingest path writes into the same indexes; state and observability sit underneath everything."
        >
          <defs>
            <marker id="sa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="sa-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#33409B" />
            </marker>
          </defs>

          <text x="0" y="18" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            ONLINE — PER REQUEST
          </text>
          <text x="585" y="18" className="svg-mono" fontSize="11" fill="currentColor" opacity="0.6" letterSpacing="1.3">
            OFFLINE — ON DOCUMENT CHANGE
          </text>

          {/* online: client and edge */}
          <g fill="currentColor" fontSize="12">
            <rect x="0" y="34" width="140" height="44" fill="none" stroke="currentColor" />
            <text x="70" y="54" textAnchor="middle">Client</text>
            <text x="70" y="69" textAnchor="middle" fontSize="9.5" opacity="0.6">web · Slack · IDE</text>

            <rect x="185" y="34" width="185" height="44" fill="none" stroke="currentColor" />
            <text x="277" y="54" textAnchor="middle">Edge / API</text>
            <text x="277" y="69" textAnchor="middle" fontSize="9.5" opacity="0.6">auth · tenant · rate limit</text>

            {/* orchestrator */}
            <rect x="0" y="112" width="370" height="60" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <text x="185" y="136" textAnchor="middle" fontSize="13" fontWeight="600">Orchestrator</text>
            <text x="185" y="154" textAnchor="middle" fontSize="9.5" opacity="0.65">workflow or agent loop · step + spend budget · trace id</text>

            {/* caches */}
            <rect x="410" y="112" width="150" height="60" fill="none" stroke="currentColor" strokeDasharray="4 3" />
            <text x="485" y="136" textAnchor="middle">Caches</text>
            <text x="485" y="153" textAnchor="middle" fontSize="9.5" opacity="0.6">exact · semantic · tool</text>

            {/* gate */}
            <rect x="0" y="200" width="180" height="46" fill="none" stroke="#33409B" strokeWidth="1.8" />
            <text x="90" y="220" textAnchor="middle" fill="#33409B" fontWeight="600">Policy gate</text>
            <text x="90" y="236" textAnchor="middle" fontSize="9.5" fill="#33409B" opacity="0.85">scope · ceiling · reversible?</text>
          </g>

          <g stroke="currentColor" fill="none" markerEnd="url(#sa-ar)">
            <line x1="140" y1="56" x2="179" y2="56" />
            <line x1="277" y1="78" x2="277" y2="106" />
            <line x1="90" y1="172" x2="90" y2="194" />
          </g>
          <path d="M370 142 L404 142" stroke="currentColor" fill="none" markerEnd="url(#sa-ar)" />
          <path d="M410 158 L376 158" stroke="currentColor" fill="none" markerEnd="url(#sa-ar)" />
          <text x="388" y="106" textAnchor="middle" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">
            a hit skips
          </text>
          <text x="388" y="118" textAnchor="middle" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">
            everything below
          </text>

          {/* offline lane */}
          <g fill="currentColor" fontSize="12">
            <rect x="585" y="34" width="140" height="44" fill="none" stroke="currentColor" strokeDasharray="4 3" />
            <text x="655" y="54" textAnchor="middle">Sources</text>
            <text x="655" y="69" textAnchor="middle" fontSize="9.5" opacity="0.6">PDF · DB · SaaS</text>

            <rect x="760" y="34" width="140" height="44" fill="none" stroke="currentColor" strokeDasharray="4 3" />
            <text x="830" y="54" textAnchor="middle">Parse · chunk</text>
            <text x="830" y="69" textAnchor="middle" fontSize="9.5" opacity="0.6">+ metadata · ACL</text>

            <rect x="585" y="112" width="315" height="60" fill="none" stroke="currentColor" strokeDasharray="4 3" />
            <text x="742" y="136" textAnchor="middle">Index writer</text>
            <text x="742" y="154" textAnchor="middle" fontSize="9.5" opacity="0.65">content hash · upsert · tombstone · embed</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#sa-ar)" strokeDasharray="4 3">
            <line x1="725" y1="56" x2="754" y2="56" />
            <line x1="830" y1="78" x2="830" y2="106" />
            <path d="M655 172 L655 200 L300 200 L300 268" />
          </g>
          <text x="470" y="194" textAnchor="middle" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">
            writes the same index the request path reads
          </text>

          {/* planes */}
          <g fill="currentColor" fontSize="12">
            <rect x="0" y="274" width="270" height="78" fill="none" stroke="#33409B" strokeWidth="1.6" />
            <text x="135" y="296" textAnchor="middle" fontWeight="600" fill="#33409B">Retrieval plane</text>
            <text x="135" y="314" textAnchor="middle" fontSize="10" opacity="0.75">vector index (HNSW, int8)</text>
            <text x="135" y="329" textAnchor="middle" fontSize="10" opacity="0.75">lexical index (BM25)</text>
            <text x="135" y="344" textAnchor="middle" fontSize="10" opacity="0.75">reranker</text>

            <rect x="300" y="274" width="270" height="78" fill="none" stroke="currentColor" />
            <text x="435" y="296" textAnchor="middle" fontWeight="600">Model plane</text>
            <text x="435" y="314" textAnchor="middle" fontSize="10" opacity="0.7">small: route · extract · classify</text>
            <text x="435" y="329" textAnchor="middle" fontSize="10" opacity="0.7">large: the answer</text>
            <text x="435" y="344" textAnchor="middle" fontSize="10" opacity="0.7">embedder (self-hosted or API)</text>

            <rect x="600" y="274" width="300" height="78" fill="none" stroke="currentColor" />
            <text x="750" y="296" textAnchor="middle" fontWeight="600">Tool plane</text>
            <text x="750" y="314" textAnchor="middle" fontSize="10" opacity="0.7">internal APIs (scoped tokens)</text>
            <text x="750" y="329" textAnchor="middle" fontSize="10" opacity="0.7">MCP servers</text>
            <text x="750" y="344" textAnchor="middle" fontSize="10" opacity="0.7">sandbox (no egress)</text>
          </g>

          <path d="M135 172 L135 268" stroke="#33409B" fill="none" markerEnd="url(#sa-ar-a)" />
          <text x="145" y="212" className="svg-mono" fontSize="9.5" fill="#33409B">query, ACL pre-filtered</text>
          <path d="M300 172 L435 172 L435 268" stroke="currentColor" fill="none" markerEnd="url(#sa-ar)" />
          <text x="445" y="246" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">prompt, streamed back</text>
          <path d="M180 223 L750 223 L750 268" stroke="#33409B" fill="none" markerEnd="url(#sa-ar-a)" />
          <text x="470" y="217" textAnchor="middle" className="svg-mono" fontSize="9.5" fill="#33409B">only allowed calls reach the tools</text>

          {/* state + observability */}
          <g fill="currentColor" fontSize="12">
            <rect x="0" y="392" width="430" height="56" fill="none" stroke="currentColor" opacity="0.75" />
            <text x="215" y="414" textAnchor="middle" fontWeight="600">State</text>
            <text x="215" y="432" textAnchor="middle" fontSize="9.5" opacity="0.65">runs · checkpoints · approvals · permission graph · artefacts</text>

            <rect x="460" y="392" width="440" height="56" fill="none" stroke="currentColor" opacity="0.75" />
            <text x="680" y="414" textAnchor="middle" fontWeight="600">Observability</text>
            <text x="680" y="432" textAnchor="middle" fontSize="9.5" opacity="0.65">one trace per request: ids · scores · versions · tokens · cost</text>
          </g>
          <g stroke="currentColor" strokeDasharray="3 3" opacity="0.5" fill="none" markerEnd="url(#sa-ar)">
            <line x1="135" y1="352" x2="135" y2="386" />
            <line x1="435" y1="352" x2="560" y2="386" />
            <line x1="750" y1="352" x2="750" y2="386" />
          </g>

          <text x="0" y="470" fontSize="11.5" fill="currentColor" opacity="0.8">
            Everything solid is on the user&rsquo;s clock. Everything dashed is a batch job you can re-run.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 1 — The reference architecture, at component level. Three things are worth noticing: the cache sits <em>above</em>
        the planes, so a hit costs nothing downstream; the gate sits between the orchestrator and the tools, which is the only
        place a write is authorised; and the ingest path writes the same index the request path reads, which is why an
        embedding-model change is a migration rather than a config edit.
      </figcaption>
    </figure>
  );
}
