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

export default function MaterialCostIncreaseProfitImpactCalculator() {
  // Financials
  const [annualRevenue, setAnnualRevenue] = useState<number>(1000000);
  const [materialCosts, setMaterialCosts] = useState<number>(280000);
  const [otherCosts, setOtherCosts] = useState<number>(540000);

  // Shock
  const [materialIncreasePct, setMaterialIncreasePct] = useState<number>(15);

  const r = useMemo(() => {
    const rev = clampMin(annualRevenue, 0);
    const mat = clampMin(materialCosts, 0);
    const other = clampMin(otherCosts, 0);
    const inc = clampMin(materialIncreasePct, 0);

    const currentTotalCosts = mat + other;
    const currentProfit = rev - currentTotalCosts;
    const currentMargin = rev > 0 ? (currentProfit / rev) * 100 : 0;

    const newMat = mat * (1 + inc / 100);
    const newTotalCosts = newMat + other;
    const newProfit = rev - newTotalCosts;
    const newMargin = rev > 0 ? (newProfit / rev) * 100 : 0;

    const profitChange = newProfit - currentProfit;

    // Required revenue to keep the original profit margin (simple pass-through)
    // Keep margin% constant: (R - newCosts)/R = m  => R*(1-m) = newCosts => R = newCosts/(1-m)
    const m = rev > 0 ? currentProfit / rev : 0; // margin in decimal
    const requiredRevenue =
      m < 1 ? (newTotalCosts / Math.max(1e-9, 1 - m)) : rev; // guard
    const requiredRevenueIncrease = Math.max(0, requiredRevenue - rev);
    const requiredRevenueIncreasePct = rev > 0 ? (requiredRevenueIncrease / rev) * 100 : 0;

    const note =
      rev <= 0
        ? "Enter annual revenue to evaluate profit impact."
        : currentTotalCosts <= 0
        ? "Enter a realistic cost base to evaluate the impact."
        : newProfit < 0
        ? "After the increase, profit turns negative. Consider price increases, cost reduction, or hedging."
        : "Tip: The 'required revenue increase' is a simple pass-through estimate—real markets may not allow full pass-through.";

    return {
      rev,
      mat,
      other,
      currentProfit,
      currentMargin,
      newMat,
      newProfit,
      newMargin,
      profitChange,
      requiredRevenue,
      requiredRevenueIncrease,
      requiredRevenueIncreasePct,
      note,
    };
  }, [annualRevenue, materialCosts, otherCosts, materialIncreasePct]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);
  const signedMoney = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>material cost increase</strong> affects profit and margin. Includes a simple{" "}
        <strong>price pass-through</strong> estimate to maintain your original margin.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Financial inputs</div>

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
            <label className="block text-sm font-medium">Material costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={materialCosts}
              onChange={(e) => setMaterialCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Raw materials, components, or key inputs.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={otherCosts}
              onChange={(e) => setOtherCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Labor, overhead, rent, logistics, admin, etc.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Material cost increase (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.5"
              value={materialIncreasePct}
              onChange={(e) => setMaterialIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Applies only to the material cost portion.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Impact results</div>

        <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Material cost</p>
            <p className="text-sm">
              Current: <strong>${money0(r.mat)}</strong>
              <br />
              New: <strong>${money0(r.newMat)}</strong>
              <br />
              Increase: <strong>${money0(r.newMat - r.mat)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Price pass-through (simple)</p>
          <p className="text-sm">
            Required revenue (to keep original margin): <strong>${money0(r.requiredRevenue)}</strong>
            <br />
            Required revenue increase: <strong>${money0(r.requiredRevenueIncrease)}</strong> (
            <strong>{pct2(r.requiredRevenueIncreasePct)}</strong>)
          </p>
          <p className="text-xs opacity-70 mt-1">
            This is a simplified estimate assuming volume stays constant.
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New material costs = material costs × (1 + increase%).</li>
          <li>New profit = revenue − (new material costs + other costs).</li>
          <li>Required revenue keeps your original margin constant (simple pass-through estimate).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What if I can’t raise prices?</span>
            <br />
            Then margin compresses. Use the “profit change” and “new margin” as your downside estimate.
          </p>
          <p>
            <span className="font-medium">What if volume changes when I raise prices?</span>
            <br />
            This tool assumes constant volume. For pricing elasticity, use a separate demand model tool.
          </p>
        </div>
      </div>
    </div>
  );
}
