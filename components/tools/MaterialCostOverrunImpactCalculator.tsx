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

export default function MaterialCostOverrunImpactCalculator() {
  const [projectRevenue, setProjectRevenue] = useState<number>(1500000);
  const [plannedMaterialCost, setPlannedMaterialCost] = useState<number>(420000);
  const [otherProjectCosts, setOtherProjectCosts] = useState<number>(850000);

  const [overrunMode, setOverrunMode] = useState<"percent" | "amount">("percent");
  const [overrunPct, setOverrunPct] = useState<number>(12);
  const [overrunAmount, setOverrunAmount] = useState<number>(50000);

  const r = useMemo(() => {
    const rev = clampMin(projectRevenue, 0);
    const mat = clampMin(plannedMaterialCost, 0);
    const other = clampMin(otherProjectCosts, 0);

    const overPct = n(overrunPct);
    const overAmt = clampMin(overrunAmount, 0);

    const overrunValue =
      overrunMode === "percent" ? mat * (overPct / 100) : overAmt;

    const newMaterialCost = mat + overrunValue;

    const currentTotalCost = mat + other;
    const newTotalCost = newMaterialCost + other;

    const currentProfit = rev - currentTotalCost;
    const newProfit = rev - newTotalCost;

    const currentMargin = rev > 0 ? (currentProfit / rev) * 100 : 0;
    const newMargin = rev > 0 ? (newProfit / rev) * 100 : 0;

    // Keep original margin%: (R - newCost)/R = m => R = newCost/(1-m)
    const m = rev > 0 ? currentProfit / rev : 0;
    const requiredRevenue =
      m < 1 ? newTotalCost / Math.max(1e-9, 1 - m) : rev;

    const requiredRevenueIncrease = Math.max(0, requiredRevenue - rev);
    const requiredRevenueIncreasePct = rev > 0 ? (requiredRevenueIncrease / rev) * 100 : 0;

    const note =
      rev <= 0
        ? "Enter project revenue (contract price) to evaluate profit impact."
        : "Tip: Use percent mode for inflation scenarios and amount mode for specific change orders.";

    return {
      overrunValue,
      newMaterialCost,
      currentProfit,
      newProfit,
      currentMargin,
      newMargin,
      requiredRevenue,
      requiredRevenueIncrease,
      requiredRevenueIncreasePct,
      note,
    };
  }, [
    projectRevenue,
    plannedMaterialCost,
    otherProjectCosts,
    overrunMode,
    overrunPct,
    overrunAmount,
  ]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>material cost overrun</strong> affects total cost, profit, and margin—
        helpful for construction and manufacturing projects.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Project inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Project revenue / contract price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={projectRevenue}
              onChange={(e) => setProjectRevenue(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total revenue for the project (or annual contract).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Planned material cost ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={plannedMaterialCost}
              onChange={(e) => setPlannedMaterialCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Baseline material budget before overrun.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other project costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={otherProjectCosts}
              onChange={(e) => setOtherProjectCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Labor, equipment, overhead, subcontractors, etc.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Overrun</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${overrunMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setOverrunMode("percent")}
          >
            Percent
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${overrunMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setOverrunMode("amount")}
          >
            Amount
          </button>
        </div>

        {overrunMode === "percent" ? (
          <div>
            <label className="block text-sm font-medium">Material overrun (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={overrunPct}
              onChange={(e) => setOverrunPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use this for inflation-driven overruns.</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Material overrun amount ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={overrunAmount}
              onChange={(e) => setOverrunAmount(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use this for known change orders.</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Impact results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Material cost</p>
            <p className="text-sm">
              Overrun value: <strong>${money0(r.overrunValue)}</strong>
              <br />
              New material cost: <strong>${money0(r.newMaterialCost)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Profit & margin</p>
            <p className="text-sm">
              Profit: <strong>{profitLabel(r.currentProfit)}</strong> → <strong>{profitLabel(r.newProfit)}</strong>
              <br />
              Margin: <strong>{pct2(r.currentMargin)} → {pct2(r.newMargin)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Revenue needed to keep original margin (simple)</p>
          <p className="text-sm">
            Required revenue: <strong>${money0(r.requiredRevenue)}</strong>
            <br />
            Required increase: <strong>${money0(r.requiredRevenueIncrease)}</strong> (
            <strong>{pct2(r.requiredRevenueIncreasePct)}</strong>)
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Overrun adds to planned material cost (percent or fixed amount).</li>
          <li>New profit = revenue − (new material cost + other costs).</li>
          <li>Required revenue keeps your original margin constant (simple estimate).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Percent vs amount—when should I use each?</span>
            <br />
            Percent is best for inflation scenarios; amount is best for change orders with known values.
          </p>
          <p>
            <span className="font-medium">Does this include schedule delays?</span>
            <br />
            No. This tool focuses on cost overruns. Use a delay cost tool for time-driven overruns.
          </p>
        </div>
      </div>
    </div>
  );
}
