"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clamp(v: number, min: number) {
  return Math.max(min, n(v));
}
function money0(v: number) {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  return `${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export default function FixedVsVariableCostExposureCalculator() {
  const [revenue, setRevenue] = useState(1000000);
  const [fixedCosts, setFixedCosts] = useState(400000);
  const [variableCostPct, setVariableCostPct] = useState(35);
  const [revenueShockPct, setRevenueShockPct] = useState(-10);

  const r = useMemo(() => {
    const rev = clamp(revenue, 0);
    const fixed = clamp(fixedCosts, 0);
    const varPct = clamp(variableCostPct, 0) / 100;
    const shock = revenueShockPct / 100;

    const baseVariableCost = rev * varPct;
    const baseProfit = rev - fixed - baseVariableCost;

    const shockedRevenue = rev * (1 + shock);

    // Fixed-cost structure
    const fixedProfitAfter =
      shockedRevenue - fixed - baseVariableCost;

    // Variable-cost structure (variable cost scales with revenue)
    const variableCostAfter = shockedRevenue * varPct;
    const variableProfitAfter =
      shockedRevenue - fixed - variableCostAfter;

    const fixedProfitChange = fixedProfitAfter - baseProfit;
    const variableProfitChange = variableProfitAfter - baseProfit;

    let note =
      "Fixed costs amplify profit volatility under revenue shocks (operating leverage).";
    if (shock > 0)
      note = "Revenue upside benefits fixed-cost structures more.";
    if (rev <= 0)
      note = "Enter revenue to evaluate cost structure exposure.";

    return {
      baseProfit,
      fixedProfitAfter,
      variableProfitAfter,
      fixedProfitChange,
      variableProfitChange,
      note,
    };
  }, [revenue, fixedCosts, variableCostPct, revenueShockPct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare how <strong>fixed-cost-heavy</strong> vs{" "}
        <strong>variable-cost-heavy</strong> structures respond to revenue shocks.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost structure</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              step="10000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Fixed costs ($)</label>
            <input
              className="input"
              type="number"
              step="10000"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Variable cost (% of revenue)
            </label>
            <input
              className="input"
              type="number"
              step="1"
              value={variableCostPct}
              onChange={(e) => setVariableCostPct(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Revenue shock (%)
            </label>
            <input
              className="input"
              type="number"
              step="1"
              value={revenueShockPct}
              onChange={(e) => setRevenueShockPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Example: -10 = revenue drops 10%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <p className="text-sm">
          Base profit: <strong>${money0(r.baseProfit)}</strong>
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Fixed-cost structure</p>
            <p className="text-sm">
              Profit after shock:{" "}
              <strong>${money0(r.fixedProfitAfter)}</strong>
              <br />
              Change:{" "}
              <strong>
                {r.fixedProfitChange >= 0 ? "+" : "-"}$
                {money0(Math.abs(r.fixedProfitChange))}
              </strong>
            </p>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm opacity-70">Variable-cost structure</p>
            <p className="text-sm">
              Profit after shock:{" "}
              <strong>${money0(r.variableProfitAfter)}</strong>
              <br />
              Change:{" "}
              <strong>
                {r.variableProfitChange >= 0 ? "+" : "-"}$
                {money0(Math.abs(r.variableProfitChange))}
              </strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Fixed costs stay constant regardless of revenue.</li>
          <li>Variable costs scale with revenue.</li>
          <li>Higher fixed costs increase operating leverage and volatility.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Which structure is safer?</span>
            <br />
            Variable-cost-heavy structures are more resilient during downturns.
          </p>
          <p>
            <span className="font-medium">Why keep fixed costs then?</span>
            <br />
            Fixed costs can amplify profits when revenue grows.
          </p>
        </div>
      </div>
    </div>
  );
}
