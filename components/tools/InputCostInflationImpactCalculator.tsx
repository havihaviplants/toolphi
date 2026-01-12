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

export default function InputCostInflationImpactCalculator() {
  // Revenue & cost base
  const [annualRevenue, setAnnualRevenue] = useState<number>(1200000);

  // Optional breakdown (lets user be more precise)
  const [materialCosts, setMaterialCosts] = useState<number>(320000);
  const [nonMaterialCosts, setNonMaterialCosts] = useState<number>(460000);

  // Inflation
  const [inflationPct, setInflationPct] = useState<number>(8);

  const r = useMemo(() => {
    const rev = clampMin(annualRevenue, 0);
    const mat = clampMin(materialCosts, 0);
    const nonMat = clampMin(nonMaterialCosts, 0);
    const infl = clampMin(inflationPct, 0);

    const currentTotalCosts = mat + nonMat;
    const currentProfit = rev - currentTotalCosts;
    const currentMargin = rev > 0 ? (currentProfit / rev) * 100 : 0;

    const newTotalCosts = currentTotalCosts * (1 + infl / 100);
    const costIncrease = newTotalCosts - currentTotalCosts;

    const newProfit = rev - newTotalCosts;
    const newMargin = rev > 0 ? (newProfit / rev) * 100 : 0;

    const profitChange = newProfit - currentProfit;

    const breakEvenRevenue = newTotalCosts; // revenue needed to get profit = 0 (simple view)
    const extraRevenueNeeded = Math.max(0, breakEvenRevenue - rev);

    const note =
      rev <= 0
        ? "Enter annual revenue to evaluate profit impact."
        : currentTotalCosts <= 0
        ? "Enter a realistic cost base to evaluate inflation impact."
        : newProfit < 0
        ? "After inflation, profit turns negative. Consider raising prices, improving efficiency, or reducing cost exposure."
        : "Tip: Try multiple inflation scenarios to understand your margin sensitivity.";

    return {
      rev,
      currentTotalCosts,
      currentProfit,
      currentMargin,
      newTotalCosts,
      costIncrease,
      newProfit,
      newMargin,
      profitChange,
      breakEvenRevenue,
      extraRevenueNeeded,
      note,
    };
  }, [annualRevenue, materialCosts, nonMaterialCosts, inflationPct]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);
  const signedMoney = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        A fast way to estimate how <strong>input cost inflation</strong> impacts total costs, profit,
        and margin using your current annual revenue and cost base.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost base</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total annual sales.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Material / input costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={materialCosts}
              onChange={(e) => setMaterialCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Raw materials, components, fertilizer, fuel, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={nonMaterialCosts}
              onChange={(e) => setNonMaterialCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Labor, overhead, rent, logistics, admin, etc.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Input cost inflation (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.5"
              value={inflationPct}
              onChange={(e) => setInflationPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Applies to your total cost base (materials + other costs).</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Impact results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Costs</p>
            <p className="text-sm">
              Current: <strong>${money0(r.currentTotalCosts)}</strong>
              <br />
              New: <strong>${money0(r.newTotalCosts)}</strong>
              <br />
              Increase: <strong>${money0(r.costIncrease)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Profit & margin</p>
            <p className="text-sm">
              Profit: <strong>{profitLabel(r.currentProfit)}</strong> → <strong>{profitLabel(r.newProfit)}</strong>
              <br />
              Profit change: <strong>{signedMoney(r.profitChange)}</strong>
              <br />
              Margin: <strong>{pct2(r.currentMargin)} → {pct2(r.newMargin)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Break-even check (simple)</p>
          <p className="text-sm">
            Revenue needed to break even: <strong>${money0(r.breakEvenRevenue)}</strong>
            <br />
            Extra revenue needed (if any): <strong>${money0(r.extraRevenueNeeded)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            Assumes you don’t change prices or volume. Use this as a quick stress-test baseline.
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Total costs = material/input costs + other costs.</li>
          <li>New costs = total costs × (1 + inflation%).</li>
          <li>Profit = revenue − costs (margin = profit ÷ revenue).</li>
          <li>Break-even revenue = new costs (profit = 0).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does inflation apply only to materials?</span>
            <br />
            In reality it varies. This tool applies inflation to the whole cost base for a quick estimate.
            If you want “materials only,” set other costs inflation to 0 in a more advanced tool.
          </p>
          <p>
            <span className="font-medium">What if I pass costs to customers via price increases?</span>
            <br />
            This tool assumes revenue stays constant. Pair it with a pricing pass-through calculator for that scenario.
          </p>
        </div>
      </div>
    </div>
  );
}
