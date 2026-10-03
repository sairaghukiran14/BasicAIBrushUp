"use client";

import { useState } from "react";
import { lossCurve } from "@/data/training";

const W = 900;
const H = 360;
const L = 74;
const R = 828;
const T = 34;
const B = 288;

const Y_MIN = 1.6;
const Y_MAX = 4.6;
const X_MAX = 12000;

const x = (step: number) => L + (step / X_MAX) * (R - L);
const y = (loss: number) => B - ((loss - Y_MIN) / (Y_MAX - Y_MIN)) * (B - T);

const path = (values: number[]) => lossCurve.steps.map((s, i) => `${x(s)},${y(values[i])}`).join(" ");

const Y_TICKS = [2, 3, 4];
const X_TICKS = [0, 3000, 6000, 9000, 12000];

export default function LossChart() {
  const [hover, setHover] = useState<number | null>(null);

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * W;
    if (px < L - 10 || px > R + 10) {
      setHover(null);
      return;
    }
    const step = ((px - L) / (R - L)) * X_MAX;
    let nearest = 0;
    for (let i = 1; i < lossCurve.steps.length; i++) {
      if (Math.abs(lossCurve.steps[i] - step) < Math.abs(lossCurve.steps[nearest] - step)) nearest = i;
    }
    setHover(nearest);
  }

  const stopIndex = lossCurve.steps.indexOf(lossCurve.stopAt);

  return (
    <figure>
      <figcaption className="chart-title">
        Training and validation loss for a 124M model — the scissors, and where to stop
      </figcaption>

      <div className="chart-legend" aria-hidden="true">
        <span>
          <i style={{ background: "var(--series-train)" }} />
          Training loss
        </span>
        <span>
          <i style={{ background: "var(--series-val)" }} />
          Validation loss
        </span>
      </div>

      <div className="fig-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="A line chart of training and validation loss over 12,000 steps. Training loss falls steadily from 4.35 to 1.82. Validation loss falls to a minimum of 2.37 at step 7,000 and then rises to 2.71 — the point where the model starts memorising rather than learning."
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          className="chart"
        >
          {/* grid */}
          <g stroke="currentColor" opacity="0.16">
            {Y_TICKS.map((t) => (
              <line key={t} x1={L} y1={y(t)} x2={R} y2={y(t)} />
            ))}
          </g>
          <line x1={L} y1={T} x2={L} y2={B} stroke="currentColor" opacity="0.35" />
          <line x1={L} y1={B} x2={R} y2={B} stroke="currentColor" opacity="0.35" />

          {/* axes labels */}
          <g className="svg-mono chart-tick" fontSize="11" fill="currentColor">
            {Y_TICKS.map((t) => (
              <text key={t} x={L - 12} y={y(t) + 4} textAnchor="end">
                {t.toFixed(1)}
              </text>
            ))}
            {X_TICKS.map((t) => (
              <text key={t} x={x(t)} y={B + 20} textAnchor="middle">
                {t === 0 ? "0" : `${t / 1000}k`}
              </text>
            ))}
          </g>
          <text x={L - 12} y={T - 12} textAnchor="end" fontSize="11" fill="currentColor" className="svg-mono chart-tick">
            loss
          </text>
          <text x={R} y={B + 42} textAnchor="end" fontSize="11" fill="currentColor" className="svg-mono chart-tick">
            training step
          </text>

          {/* stop marker */}
          <line
            x1={x(lossCurve.stopAt)}
            y1={T}
            x2={x(lossCurve.stopAt)}
            y2={B}
            stroke="currentColor"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          <text x={x(lossCurve.stopAt) + 8} y={T + 12} fontSize="11" fill="currentColor" opacity="0.75">
            validation minimum — stop here
          </text>

          {/* series */}
          <polyline points={path(lossCurve.val)} fill="none" stroke="var(--series-val)" strokeWidth="2" strokeLinejoin="round" />
          <polyline points={path(lossCurve.train)} fill="none" stroke="var(--series-train)" strokeWidth="2" strokeLinejoin="round" />

          {/* the one marked point */}
          <circle
            cx={x(lossCurve.stopAt)}
            cy={y(lossCurve.val[stopIndex])}
            r="5"
            fill="var(--series-val)"
            stroke="var(--surface)"
            strokeWidth="2"
          />

          {/* direct labels */}
          <text x={R + 6} y={y(lossCurve.train[lossCurve.train.length - 1]) + 4} fontSize="12" fill="currentColor">
            train
          </text>
          <text x={R + 6} y={y(lossCurve.val[lossCurve.val.length - 1]) + 4} fontSize="12" fill="currentColor">
            val
          </text>

          {/* hover layer */}
          {hover !== null ? (
            <g>
              <line
                x1={x(lossCurve.steps[hover])}
                y1={T}
                x2={x(lossCurve.steps[hover])}
                y2={B}
                stroke="currentColor"
                opacity="0.35"
              />
              <circle cx={x(lossCurve.steps[hover])} cy={y(lossCurve.train[hover])} r="4.5" fill="var(--series-train)" />
              <circle cx={x(lossCurve.steps[hover])} cy={y(lossCurve.val[hover])} r="4.5" fill="var(--series-val)" />
              <g transform={`translate(${Math.min(x(lossCurve.steps[hover]) + 12, R - 150)}, ${T + 26})`}>
                <rect width="150" height="62" fill="var(--surface)" stroke="currentColor" opacity="0.96" />
                <text x="10" y="20" fontSize="11" fill="currentColor" className="svg-mono">
                  step {lossCurve.steps[hover].toLocaleString()}
                </text>
                <text x="10" y="38" fontSize="11" fill="currentColor" className="svg-mono">
                  train {lossCurve.train[hover].toFixed(2)}
                </text>
                <text x="10" y="54" fontSize="11" fill="currentColor" className="svg-mono">
                  val&nbsp;&nbsp; {lossCurve.val[hover].toFixed(2)}
                </text>
              </g>
            </g>
          ) : null}
        </svg>
      </div>

      <figcaption>
        Fig. 2 — Every training run you will ever read is a version of this picture. Training loss keeps falling because the
        model keeps fitting the data it has seen; validation loss turns upward at the point where it starts memorising instead
        of generalising. The checkpoint you ship is the one at the turn, not the one at the end.
      </figcaption>

      <details className="chart-data">
        <summary>Show the numbers</summary>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col" className="numeric">
                  Training loss
                </th>
                <th scope="col" className="numeric">
                  Validation loss
                </th>
              </tr>
            </thead>
            <tbody>
              {lossCurve.steps.map((s, i) => (
                <tr key={s}>
                  <td className="nowrap">{s.toLocaleString()}</td>
                  <td className="numeric">{lossCurve.train[i].toFixed(2)}</td>
                  <td className="numeric">{lossCurve.val[i].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
