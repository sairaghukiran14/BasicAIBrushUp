export default function VolumeMapFigure() {
  return (
    <figure>
      <div className="fig-scroll">
        <svg
          viewBox="0 0 900 360"
          role="img"
          aria-label="How the volumes stack: Python, ML and training are the foundation; the stack sits on them; RAG and agents are built on the stack; operations wraps both; the glossary indexes every layer."
        >
          <defs>
            <marker id="vm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* operations band */}
          <rect x="90" y="24" width="810" height="52" fill="none" stroke="#2F5566" strokeWidth="1.8" />
          <text x="495" y="46" textAnchor="middle" fontSize="13" fontWeight="600" fill="#2F5566">
            OPERATIONS
          </text>
          <text x="495" y="64" textAnchor="middle" fontSize="10" fill="#2F5566" opacity="0.85">
            monitoring · quality · reliability · latency · cost — everything above it gets operated
          </text>

          {/* the two volumes */}
          <rect x="90" y="112" width="385" height="76" fill="none" stroke="#1D6B54" strokeWidth="1.8" />
          <text x="282" y="138" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1D6B54">
            VOLUME I — RETRIEVAL
          </text>
          <text x="282" y="157" textAnchor="middle" fontSize="10" fill="#1D6B54" opacity="0.85">
            30 builds · 9-stage playbook
          </text>
          <text x="282" y="175" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.75">
            it answers — a wrong answer is read
          </text>

          <rect x="515" y="112" width="385" height="76" fill="none" stroke="#A8410F" strokeWidth="1.8" />
          <text x="707" y="138" textAnchor="middle" fontSize="13" fontWeight="600" fill="#A8410F">
            VOLUME II — AGENTS
          </text>
          <text x="707" y="157" textAnchor="middle" fontSize="10" fill="#A8410F" opacity="0.85">
            30 builds · 12 patterns · playbook
          </text>
          <text x="707" y="175" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.75">
            it acts — a wrong action is committed
          </text>

          {/* stack */}
          <rect x="90" y="222" width="810" height="60" fill="none" stroke="#33409B" strokeWidth="1.8" />
          <text x="495" y="246" textAnchor="middle" fontSize="13" fontWeight="600" fill="#33409B">
            THE STACK
          </text>
          <text x="495" y="265" textAnchor="middle" fontSize="10" fill="#33409B" opacity="0.85">
            model APIs · tokens &amp; cost · prompting · vector stores · open models · frameworks · MCP
          </text>

          {/* foundations */}
          <rect x="90" y="308" width="810" height="44" fill="none" stroke="#8A6414" strokeWidth="1.8" />
          <text x="495" y="329" textAnchor="middle" fontSize="13" fontWeight="600" fill="#8A6414">
            FOUNDATIONS
          </text>
          <text x="495" y="345" textAnchor="middle" fontSize="10" fill="#8A6414" opacity="0.85">
            Python · ML foundations · training a model from scratch
          </text>

          {/* upward dependency arrows */}
          <g stroke="currentColor" fill="none" markerEnd="url(#vm-ar)" opacity="0.75">
            <line x1="282" y1="308" x2="282" y2="288" />
            <line x1="707" y1="308" x2="707" y2="288" />
            <line x1="282" y1="222" x2="282" y2="194" />
            <line x1="707" y1="222" x2="707" y2="194" />
            <line x1="282" y1="112" x2="282" y2="82" />
            <line x1="707" y1="112" x2="707" y2="82" />
          </g>

          {/* glossary spine */}
          <rect x="0" y="24" width="56" height="328" fill="none" stroke="currentColor" strokeDasharray="4 3" opacity="0.8" />
          <text
            transform="rotate(-90 28 188)"
            x="28"
            y="188"
            textAnchor="middle"
            className="svg-mono"
            fontSize="11"
            fill="currentColor"
            opacity="0.8"
          >
            GLOSSARY · 138 TERMS
          </text>
          <g stroke="currentColor" strokeDasharray="3 3" opacity="0.45" fill="none">
            <line x1="56" y1="50" x2="86" y2="50" />
            <line x1="56" y1="150" x2="86" y2="150" />
            <line x1="56" y1="252" x2="86" y2="252" />
            <line x1="56" y1="330" x2="86" y2="330" />
          </g>
        </svg>
      </div>
      <figcaption>
        Fig. — How the volumes stack. Each layer assumes the one below it, the two volumes differ in one thing (whether a
        mistake is read or committed), and operations applies to whatever you ship. Read upward if you are starting out, or
        drop straight into a volume and follow the glossary sideways when a term stops making sense.
      </figcaption>
    </figure>
  );
}
