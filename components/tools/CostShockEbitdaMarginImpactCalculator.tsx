"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function money0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function CostShockEbitdaMarginImpactCalculator() {
  const [revenue, setRevenue] = useState<number>(5_000_000);
  const [cogs, setCogs] = useState<number>(3_000_000);
  const [opex, setOpex] = useState<number>(1_200_000);

  const [shockPct, setShockPct] = useState<number>(8);
  const [applyShockTo, setApplyShockTo] = useState<"cogs" | "totalCosts">("cogs");

  const r = useMemo(() => {
    const rev = clampMin(revenue, 0);
    const c0 = clampMin(cogs, 0);
    const o0 = clampMin(opex, 0);

    const shock = n(shockPct) / 100;

    const c1 = applyShockTo === "cogs" ? c0 * (1 + shock) : c0;
    const o1 = applyShockTo === "totalCosts" ? o0 * (1 + shock) : o0;

    const ebitda0 = rev - c0 - o0;
    const ebitda1 = rev - c1 - o1;

    const m0 = rev > 0 ? ebitda0 / rev : 0;
    const m1 = rev > 0 ? ebitda1 / rev : 0;

    const deltaEbitda = ebitda1 - ebitda0;
    const deltaMarginPp = (m1 - m0) * 100;

    let flag = "Normal";
    if (rev <= 0) flag = "Enter revenue to compute margin.";
    else if (m1 < 0) flag = "Negative margin after shock (loss-making).";
    else if (m1 < 0.05) flag = "Very thin margin (< 5%).";
    else if (deltaMarginPp <= -5) flag = "Large compression (≥ 5pp).";

    const note =
      "EBITDA margin shows operating profitability before depreciation, amortization, interest, and taxes. Cost shocks compress margin unless prices rise or costs are offset elsewhere.";

    return {
      c1,
      o1,
      ebitda0,
      ebitda1,
      m0,
      m1,
      deltaEbitda,
      deltaMarginPp,
      flag,
      note,
    };
  }, [revenue, cogs, opex, shockPct, applyShockTo]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  const signedPp = (v: number) =>
    v >= 0
      ? `+${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pp`
      : `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pp`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>cost shock</strong> compresses <strong>EBITDA</strong> and{" "}
        <strong>EBITDA margin</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">COGS ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={cogs}
              onChange={(e) => setCogs(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Direct/variable costs tied to production.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Operating expenses (Opex) ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={opex}
              onChange={(e) => setOpex(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">SG&amp;A, overhead, fixed operating costs.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Shock assumptions</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Shock size (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={shockPct}
              onChange={(e) => setShockPct(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Apply shock to</label>
            <select
              className="input"
              value={applyShockTo}
              onChange={(e) => setApplyShockTo(e.target.value as "cogs" | "totalCosts")}
            >
              <option value="cogs">COGS only (input/raw material shock)</option>
              <option value="totalCosts">COGS + Opex (broad inflation)</option>
            </select>
            <p className="text-xs opacity-70 mt-1">
              Use “COGS only” for supplier/input price shocks.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">EBITDA</p>
            <p className="text-sm">
              Before: <strong>${money0(r.ebitda0)}</strong>
              <br />
              After: <strong>${money0(r.ebitda1)}</strong>
              <br />
              Change: <strong>{signedMoney0(r.deltaEbitda)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">EBITDA margin</p>
            <p className="text-sm">
              Before: <strong>{pct2(r.m0 * 100)}</strong>
              <br />
              After: <strong>{pct2(r.m1 * 100)}</strong>
              <br />
              Compression: <strong>{signedPp(r.deltaMarginPp)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Flag</p>
            <p className="text-sm">
              <strong>{r.flag}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>EBITDA = Revenue − COGS − Operating expenses.</li>
          <li>Apply the shock to COGS (or total costs) to get the “after” scenario.</li>
          <li>EBITDA margin = EBITDA ÷ Revenue.</li>
          <li>Margin compression is shown in percentage points (pp).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">How is this different from gross margin tools?</span>
            <br />
            Gross margin focuses on revenue minus COGS. EBITDA margin includes operating expenses too.
          </p>
          <p>
            <span className="font-medium">What if I pass costs to customers?</span>
            <br />
            Then revenue may rise too—use your expected revenue and re-run scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
