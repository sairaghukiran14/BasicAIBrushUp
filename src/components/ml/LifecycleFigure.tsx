export default function LifecycleFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 400"
          role="img"
          aria-label="The MLOps loop: data becomes features, training produces a candidate, an eval gate admits it to the registry, serving uses it, monitoring detects drift, and drift triggers retraining. A feature store feeds both the training and the serving paths from one definition."
        >
          <defs>
            <marker id="ml-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
            <marker id="ml-ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#8A6414" />
            </marker>
          </defs>

          {/* top row */}
          <g fill="currentColor" fontSize="12">
            <rect x="0" y="40" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="70" y="62" textAnchor="middle">Data</text>
            <text x="70" y="77" textAnchor="middle" fontSize="9.5" opacity="0.6">snapshot id</text>

            <rect x="180" y="40" width="150" height="46" fill="none" stroke="currentColor" />
            <text x="255" y="62" textAnchor="middle">Feature pipeline</text>
            <text x="255" y="77" textAnchor="middle" fontSize="9.5" opacity="0.6">split by time or entity</text>

            <rect x="370" y="40" width="150" height="46" fill="none" stroke="currentColor" />
            <text x="445" y="62" textAnchor="middle">Training run</text>
            <text x="445" y="77" textAnchor="middle" fontSize="9.5" opacity="0.6">params + metrics logged</text>

            <rect x="560" y="40" width="160" height="46" fill="none" stroke="#8A6414" strokeWidth="1.8" />
            <text x="640" y="62" textAnchor="middle" fill="#8A6414" fontWeight="600">Eval gate</text>
            <text x="640" y="77" textAnchor="middle" fontSize="9.5" fill="#8A6414" opacity="0.85">held-out test set</text>

            <rect x="760" y="40" width="140" height="46" fill="none" stroke="currentColor" />
            <text x="830" y="62" textAnchor="middle">Registry</text>
            <text x="830" y="77" textAnchor="middle" fontSize="9.5" opacity="0.6">versioned + staged</text>
          </g>
          <g stroke="currentColor" fill="none" markerEnd="url(#ml-ar)">
            <line x1="140" y1="63" x2="174" y2="63" />
            <line x1="330" y1="63" x2="364" y2="63" />
            <line x1="520" y1="63" x2="554" y2="63" />
            <line x1="720" y1="63" x2="754" y2="63" />
          </g>

          {/* gate rejection */}
          <path d="M640 86 L640 112 L445 112 L445 90" stroke="#8A6414" strokeDasharray="4 3" fill="none" markerEnd="url(#ml-ar-a)" />
          <text x="543" y="106" textAnchor="middle" className="svg-mono" fontSize="9.5" fill="#8A6414">
            regression → never promoted
          </text>

          {/* feature store */}
          <rect x="255" y="168" width="270" height="60" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <text x="390" y="192" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
            Feature store
          </text>
          <text x="390" y="210" textAnchor="middle" fontSize="9.5" fill="currentColor" opacity="0.65">
            one definition, computed the same way for both paths
          </text>
          <path d="M300 168 L300 90" stroke="currentColor" fill="none" markerEnd="url(#ml-ar)" />
          <path d="M525 198 L640 198 L640 268" stroke="currentColor" fill="none" markerEnd="url(#ml-ar)" />
          <text x="655" y="240" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">
            same features at serving
          </text>
          <text x="200" y="140" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">
            skew lives here when this box is missing
          </text>

          {/* bottom row */}
          <g fill="currentColor" fontSize="12">
            <rect x="740" y="274" width="160" height="52" fill="none" stroke="currentColor" />
            <text x="820" y="298" textAnchor="middle">Serving</text>
            <text x="820" y="314" textAnchor="middle" fontSize="9.5" opacity="0.6">batch or online</text>

            <rect x="470" y="274" width="200" height="52" fill="none" stroke="currentColor" />
            <text x="570" y="298" textAnchor="middle">Monitoring</text>
            <text x="570" y="314" textAnchor="middle" fontSize="9.5" opacity="0.6">inputs · predictions · labels when they land</text>

            <rect x="230" y="274" width="170" height="52" fill="none" stroke="currentColor" />
            <text x="315" y="298" textAnchor="middle">Drift detected</text>
            <text x="315" y="314" textAnchor="middle" fontSize="9.5" opacity="0.6">PSI · KS · performance</text>
          </g>
          <path d="M830 86 L830 268" stroke="currentColor" fill="none" markerEnd="url(#ml-ar)" />
          <text x="840" y="180" className="svg-mono" fontSize="9.5" fill="currentColor" opacity="0.7">promote</text>
          <g stroke="currentColor" fill="none" markerEnd="url(#ml-ar)">
            <line x1="740" y1="300" x2="676" y2="300" />
            <line x1="470" y1="300" x2="406" y2="300" />
          </g>

          {/* retrain trigger */}
          <path d="M230 300 L70 300 L70 92" stroke="#8A6414" strokeWidth="1.6" fill="none" markerEnd="url(#ml-ar-a)" />
          <text x="82" y="200" className="svg-mono" fontSize="9.5" fill="#8A6414">
            retrain trigger —
          </text>
          <text x="82" y="213" className="svg-mono" fontSize="9.5" fill="#8A6414">
            a human decides
          </text>

          <line x1="0" y1="356" x2="900" y2="356" stroke="currentColor" opacity="0.2" />
          <text x="0" y="378" fontSize="11.5" fill="currentColor" opacity="0.85">
            The loop only closes if the trigger is written down in advance — on drift, on schedule, or on measured loss.
          </text>
        </svg>
      </div>
      <figcaption>
        Fig. 2 — The MLOps loop. Two boxes do the work everyone else attributes to luck: the <strong>eval gate</strong>, which is
        the only thing standing between a training run and production, and the <strong>feature store</strong>, which is what
        stops training and serving from quietly computing the same feature two different ways.
      </figcaption>
    </figure>
  );
}
