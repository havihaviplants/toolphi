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

export default function ProductionCostIncreaseImpactCalculator() {
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<number>(25);
  const [currentUnitCost, setCurrentUnitCost] = useState<number>(18);
  const [annualVolume, setAnnualVolume] = useState<number>(80000);

  const [costIncreasePct, setCostIncreasePct] = useState<number>(6);

  const r = useMemo(() => {
    const sell = clampMin(sellingPricePerUnit, 0);
    const cost = clampMin(currentUnitCost, 0);
    const vol = clampMin(annualVolume, 0);
    const inc = clampMin(costIncreasePct, 0);

    const newUnitCost = cost * (1 + inc / 100);

    const currentUnitMargin = sell - cost;
    const newUnitMargin = sell - newUnitCost;

    const unitMarginChange = newUnitMargin - currentUnitMargin;

    const currentAnnualProfit = currentUnitMargin * vol;
    const newAnnualProfit = newUnitMargin * vol;
    const annualProfitChange = newAnnualProfit - currentAnnualProfit;

    const currentMarginPct = sell > 0 ? (currentUnitMargin / sell) * 100 : 0;
    const newMarginPct = sell > 0 ? (newUnitMargin / sell) * 100 : 0;

    // Price needed to keep the original unit margin
    const requiredPricePerUnit = newUnitCost + currentUnitMargin;
    const requiredPriceIncreasePerUnit = Math.max(0, requiredPricePerUnit - sell);
    const requiredPriceIncreasePct = sell > 0 ? (requiredPriceIncreasePerUnit / sell) * 100 : 0;

    const note =
      vol <= 0
        ? "Enter an annual volume to estimate annual profit impact."
        : sell <= 0
        ? "Enter a selling price to evaluate margin."
        : currentUnitMargin < 0
        ? "Your current unit margin is negative. Consider revisiting your baseline inputs."
        : "Tip: This tool assumes volume stays constant. Combine with elasticity assumptions if you expect demand changes.";

    return {
      newUnitCost,
      currentUnitMargin,
      newUnitMargin,
      unitMarginChange,
      currentAnnualProfit,
      newAnnualProfit,
      annualProfitChange,
      currentMarginPct,
      newMarginPct,
      requiredPricePerUnit,
      requiredPriceIncreasePerUnit,
      requiredPriceIncreasePct,
      note,
    };
  }, [sellingPricePerUnit, currentUnitCost, annualVolume, costIncreasePct]);

  const signedMoney2 = (v: number) =>
    v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`;
  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>production cost increase</strong> affects unit cost, unit margin,
        and annual profit. Includes a simple <strong>price pass-through</strong> estimate.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Selling price per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={sellingPricePerUnit}
              onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average realized selling price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Current unit cost ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={currentUnitCost}
              onChange={(e) => setCurrentUnitCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total cost per unit (materials + labor + overhead).</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual volume (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={annualVolume}
              onChange={(e) => setAnnualVolume(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Units produced/sold per year.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Cost increase (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.5"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Applies to the unit cost baseline.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Unit cost & margin</p>
            <p className="text-sm">
              Unit cost: <strong>${money2(currentUnitCost)}</strong> → <strong>${money2(r.newUnitCost)}</strong>
              <br />
              Unit margin: <strong>${money2(r.currentUnitMargin)}</strong> → <strong>${money2(r.newUnitMargin)}</strong>
              <br />
              Margin %: <strong>{pct2(r.currentMarginPct)} → {pct2(r.newMarginPct)}</strong>
              <br />
              Margin change: <strong>{signedMoney2(r.unitMarginChange)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Annual profit impact</p>
            <p className="text-sm">
              Annual profit: <strong>${money0(r.currentAnnualProfit)}</strong> → <strong>${money0(r.newAnnualProfit)}</strong>
              <br />
              Profit change: <strong>{signedMoney0(r.annualProfitChange)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">Annual profit ≈ unit margin × annual volume.</p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Price pass-through (simple)</p>
          <p className="text-sm">
            Required selling price to keep original unit margin: <strong>${money2(r.requiredPricePerUnit)}</strong>
            <br />
            Required price increase: <strong>${money2(r.requiredPriceIncreasePerUnit)}</strong> (
            <strong>{pct2(r.requiredPriceIncreasePct)}</strong>)
          </p>
          <p className="text-xs opacity-70 mt-1">Assumes volume stays constant.</p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New unit cost = current unit cost × (1 + cost increase%).</li>
          <li>Unit margin = selling price − unit cost.</li>
          <li>Annual profit ≈ unit margin × annual volume.</li>
          <li>Pass-through shows the selling price needed to keep the original unit margin.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this only for manufacturing?</span>
            <br />
            No. Any business with per-unit economics can use it (food, retail bundles, services packaged per unit).
          </p>
          <p>
            <span className="font-medium">What if volume changes after a price increase?</span>
            <br />
            This tool assumes constant volume. Use a demand model tool for elasticity scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
