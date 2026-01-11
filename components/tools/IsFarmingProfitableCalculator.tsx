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

export default function IsFarmingProfitableCalculator() {
  // Revenue + costs
  const [annualRevenue, setAnnualRevenue] = useState<number>(320000);
  const [variableCosts, setVariableCosts] = useState<number>(210000);
  const [fixedCosts, setFixedCosts] = useState<number>(55000);

  // Stress
  const [revenueDropPct, setRevenueDropPct] = useState<number>(10);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(5);

  const r = useMemo(() => {
    const rev = clampMin(annualRevenue, 0);
    const varC = clampMin(variableCosts, 0);
    const fixC = clampMin(fixedCosts, 0);

    const drop = clampMin(revenueDropPct, 0);
    const inc = clampMin(costIncreasePct, 0);

    const totalCost = varC + fixC;
    const netProfit = rev - totalCost;
    const margin = rev > 0 ? (netProfit / rev) * 100 : 0;

    const stressedRevenue = rev * (1 - drop / 100);
    const stressedCosts = totalCost * (1 + inc / 100);
    const stressedProfit = stressedRevenue - stressedCosts;
    const stressedMargin = stressedRevenue > 0 ? (stressedProfit / stressedRevenue) * 100 : 0;

    const note =
      rev <= 0
        ? "Enter an annual revenue greater than 0 to calculate margin."
        : stressedProfit < 0
        ? "Under stress, profitability turns negative—consider price/yield hedging, cost reductions, or a smaller scale plan."
        : "Tip: Try harsher stress (e.g., -20% revenue, +10% costs) to find your break point.";

    return {
      rev,
      totalCost,
      netProfit,
      margin,
      stressedRevenue,
      stressedCosts,
      stressedProfit,
      stressedMargin,
      note,
    };
  }, [annualRevenue, variableCosts, fixedCosts, revenueDropPct, costIncreasePct]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Quick profitability check: <strong>Revenue</strong> minus <strong>Variable + Fixed Costs</strong>.
        Includes a simple downside stress (revenue drop + cost increase).
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Annual inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total annual sales (price × volume).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Variable costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={variableCosts}
              onChange={(e) => setVariableCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Seed, feed, fertilizer, fuel, labor, etc.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Fixed costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Rent, insurance, equipment depreciation, overhead, etc.</p>
          </div>
        </div>
      </div>

      {/* Stress */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Downside stress</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Revenue drop (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={revenueDropPct}
              onChange={(e) => setRevenueDropPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Models price drop, yield loss, or demand weakness.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Cost increase (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Models input inflation (fertilizer, fuel, labor, etc.).</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Baseline</p>
            <p className="text-sm">
              Total costs: <strong>${money0(r.totalCost)}</strong>
              <br />
              Net profit: <strong>{profitLabel(r.netProfit)}</strong>
              <br />
              Profit margin: <strong>{pct2(r.margin)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Stressed scenario</p>
            <p className="text-sm">
              Revenue: <strong>${money0(r.stressedRevenue)}</strong>
              <br />
              Costs: <strong>${money0(r.stressedCosts)}</strong>
              <br />
              Net profit: <strong>{profitLabel(r.stressedProfit)}</strong>
              <br />
              Profit margin: <strong>{pct2(r.stressedMargin)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Total costs = variable costs + fixed costs.</li>
          <li>Net profit = revenue − total costs.</li>
          <li>Profit margin = net profit ÷ revenue.</li>
          <li>Stress applies revenue drop and cost increase to estimate downside.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this the same as a full farm budget?</span>
            <br />
            No—this is a fast decision tool. A full budget breaks costs into categories and timing (seasonality).
          </p>
          <p>
            <span className="font-medium">What’s a realistic stress test?</span>
            <br />
            Many farms test at least -10% revenue and +5% to +10% costs, then see whether cash stays positive.
          </p>
          <p>
            <span className="font-medium">Should I include debt payments as a cost?</span>
            <br />
            Not here. This tool focuses on operating profitability; use DSCR tools for debt capacity.
          </p>
        </div>
      </div>
    </div>
  );
}
