import type { ReactNode } from "react";

/**
 * A small Python highlighter. It emits React text nodes rather than HTML, so
 * nothing here can inject markup — the tokens are only ever given a class.
 * Order in the alternation matters: comments and strings must win over keywords.
 */
const TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[rbf]?"(?:\\.|[^"\\\n])*"|[rbf]?'(?:\\.|[^'\\\n])*')|(@[A-Za-z_][\w.]*)|\b(async|await|def|class|return|if|elif|else|for|while|with|as|import|from|try|except|finally|raise|yield|lambda|in|not|and|or|is|None|True|False|pass|break|continue|global|nonlocal|assert|del|match|case)\b|\b(str|int|float|bool|dict|list|set|tuple|bytes|len|range|enumerate|zip|open|isinstance|round|sorted|max|min|sum|type|super|print|Exception|self)\b|\b(\d[\d_]*\.?\d*)\b/g;

const CLASS_FOR_GROUP = ["tk-com", "tk-str", "tk-dec", "tk-kw", "tk-bi", "tk-num"];

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of code.matchAll(TOKEN)) {
    const start = match.index;
    if (start > last) out.push(code.slice(last, start));

    const groupIndex = match.slice(1).findIndex((g) => g !== undefined);
    out.push(
      <span className={CLASS_FOR_GROUP[groupIndex]} key={key++}>
        {match[0]}
      </span>,
    );
    last = start + match[0].length;
  }

  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code">
      {label ? <div className="code-label">{label}</div> : null}
      <pre tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
