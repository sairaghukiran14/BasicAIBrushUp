import type { Row } from "@/data/playbook";

export default function DataTable({
  head,
  rows,
  numericCols = [],
  nowrapFirst = false,
  headClasses,
  caption,
}: {
  head: Row;
  rows: Row[];
  numericCols?: number[];
  nowrapFirst?: boolean;
  /** Per-column class on the header cell — used to colour-code split tables. */
  headClasses?: readonly (string | undefined)[];
  caption?: string;
}) {
  return (
    <div className="tbl-wrap" tabIndex={0} role="region" aria-label={caption ?? "Data table"}>
      <table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={[numericCols.includes(i) ? "numeric" : undefined, headClasses?.[i]].filter(Boolean).join(" ") || undefined}
                scope="col"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join("|")}>
              {r.map((cell, i) => (
                <td key={i} className={numericCols.includes(i) ? "numeric" : i === 0 && nowrapFirst ? "nowrap" : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
