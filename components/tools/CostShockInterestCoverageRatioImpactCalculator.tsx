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
function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
function x2(v: number) {
  if (!Number.isFinite(v)) return "—";
  return `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
}

export default function CostShockInterestCoverageRatioImpactCalculator() {
  const [revenue, setRevenue] = useState<number>(5_000_000);
  const [cogs, setCogs] = useState<number>(3_000_000);
  const [opex, setOpex] = useState<number>(1_200_000);
  const [interestExpense, setInterestExpense] = useState<number>(250_000);

  const [costShockPct, setCostShockPct] = useState<number>(8);
  const [applyShockTo, setApplyShockTo] = useState<"cogs" | "totalCosts">("cogs");

  const r = useMemo(() => {
    const rev = clampMin(revenue, 0);
    const c0 = clampMin(cogs, 0);
    const o0 = clampMin(opex, 0);
    const i = clampMin(interestExpense, 0);

    const shock = n(costShockPct) / 100;

    const c1 = applyShockTo === "cogs" ? c0 * (1 + shock) : c0;
    const o1 = applyShockTo === "totalCosts" ? o0 * (1 + shock) : o0;

    const ebit0 = rev - c0 - o0;
    const ebit1 = rev - c1 - o1;

    const icr0 = i > 0 ? ebit0 / i : Infinity;
    const icr1 = i > 0 ? ebit1 / i : Infinity;

    const deltaEBIT = ebit1 - ebit0;

    let risk = "Healthy";
    if (i <= 0) risk = "No interest expense entered (ICR not meaningful).";
    else if (icr1 < 1) risk = "Critical: EBIT < interest (ICR < 1.0x).";
    else if (icr1 < 1.5) risk = "High risk: low interest coverage (< 1.5x).";
    else if (icr1 < 2) risk = "Watch: coverage is getting tight (< 2.0x).";

    let note =
      "ICR measures how many times EBIT covers interest expense. Cost shocks that raise COGS or operating costs reduce EBIT and weaken coverage.";
    if (rev <= 0) note = "Enter revenue to compute EBIT and interest coverage.";
    else if (applyShockTo === "cogs" && c0 <= 0) note = "Enter COGS to apply the cost shock.";
    else if (applyShockTo === "totalCosts" && (c0 + o0) <= 0)
      note = "Enter costs (COGS/Opex) to apply the cost shock.";

    return {
      c1,
      o1,
      ebit0,
      ebit1,
      icr0,
      icr1,
      deltaEBIT,
      risk,
      note,
    };
  }, [revenue, cogs, opex, interestExpense, costShockPct, applyShockTo]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>cost shock</strong> reduces <strong>EBIT</strong> and worsens the{" "}
        <strong>interest coverage ratio</strong> (ICR = EBIT / interest expense).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Financial inputs</div>

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
            <label className="block text-sm font-medium">Annual interest expense ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={interestExpense}
              onChange={(e) => setInterestExpense(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Used to compute ICR = EBIT / interest.</p>
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
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost shock</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Shock size (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={costShockPct}
              onChange={(e) => setCostShockPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 8% means costs increase by 8%.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Apply shock to</label>
            <select
              className="input"
              value={applyShockTo}
              onChange={(e) => setApplyShockTo(e.target.value as "cogs" | "totalCosts")}
            >
              <option value="cogs">COGS only (input cost shock)</option>
              <option value="totalCosts">COGS + Opex (broad cost inflation)</option>
            </select>
            <p className="text-xs opacity-70 mt-1">
              Choose “COGS only” for raw material/input shocks.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">EBIT</p>
            <p className="text-sm">
              Before: <strong>${money0(r.ebit0)}</strong>
              <br />
              After: <strong>${money0(r.ebit1)}</strong>
              <br />
              Change: <strong>{signedMoney0(r.deltaEBIT)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Interest coverage ratio (ICR)</p>
            <p className="text-sm">
              Before: <strong>{x2(r.icr0)}</strong>
              <br />
              After: <strong>{x2(r.icr1)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              ICR = EBIT ÷ interest expense
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Risk flag</p>
            <p className="text-sm">
              <strong>{r.risk}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              Typical lender comfort varies by industry; lower coverage generally increases risk.
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>EBIT = Revenue − COGS − Operating expenses.</li>
          <li>Apply cost shock to COGS (or total costs) to get “after” EBIT.</li>
          <li>ICR = EBIT ÷ Interest expense.</li>
          <li>Lower ICR indicates weaker ability to cover interest from operating profit.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">How is this different from DSCR?</span>
            <br />
            ICR uses <strong>EBIT</strong>. DSCR typically uses <strong>cash flow</strong> (after taxes, capex, working capital) and compares against total debt service.
          </p>
          <p>
            <span className="font-medium">What if EBIT is negative?</span>
            <br />
            ICR becomes negative; in practice, coverage is effectively not met.
          </p>
        </div>
      </div>
    </div>
  );
}
