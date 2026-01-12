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

export default function RawMaterialPriceIncreaseImpactCalculator() {
  // Material inputs
  const [unitCost, setUnitCost] = useState<number>(2.5);
  const [annualUsage, setAnnualUsage] = useState<number>(120000);
  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(12);

  // Financials
  const [annualRevenue, setAnnualRevenue] = useState<number>(900000);
  const [otherCosts, setOtherCosts] = useState<number>(520000);

  const r = useMemo(() => {
    const cost = clampMin(unitCost, 0);
    const qty = clampMin(annualUsage, 0);
    const inc = clampMin(priceIncreasePct, 0);

    const revenue = clampMin(annualRevenue, 0);
    const nonMaterial = clampMin(otherCosts, 0);

    const currentMaterialCost = cost * qty;
    const newUnitCost = cost * (1 + inc / 100);
    const newMaterialCost = newUnitCost * qty;

    const materialCostIncrease = newMaterialCost - currentMaterialCost;

    const currentTotalCost = currentMaterialCost + nonMaterial;
    const newTotalCost = newMaterialCost + nonMaterial;

    const currentProfit = revenue - currentTotalCost;
    const newProfit = revenue - newTotalCost;

    const currentMargin = revenue > 0 ? (currentProfit / revenue) * 100 : 0;
    const newMargin = revenue > 0 ? (newProfit / revenue) * 100 : 0;

    const note =
      revenue <= 0
        ? "Enter annual revenue to evaluate profit impact."
        : newProfit < 0
        ? "After the price increase, profitability turns negative—consider price pass-through or cost hedging."
        : "Tip: Try multiple price increase scenarios to identify your cost sensitivity.";

    return {
      currentMaterialCost,
      newMaterialCost,
      materialCostIncrease,
      currentProfit,
      newProfit,
      currentMargin,
      newMargin,
      note,
    };
  }, [unitCost, annualUsage, priceIncreasePct, annualRevenue, otherCosts]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>raw material price increase</strong> impacts total cost, profit,
        and margin—useful for stress testing pricing and procurement risk.
      </p>

      {/* Material inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Raw material inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current unit cost ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Current purchase cost per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual usage (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={annualUsage}
              onChange={(e) => setAnnualUsage(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total units consumed per year.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Price increase (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={priceIncreasePct}
              onChange={(e) => setPriceIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Expected raw material price inflation.</p>
          </div>
        </div>
      </div>

      {/* Financial inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Financial inputs</div>

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
            <p className="text-xs opacity-70 mt-1">Total annual sales.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Other annual costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={otherCosts}
              onChange={(e) => setOtherCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Labor, overhead, rent, logistics, etc.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Impact results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Material cost</p>
            <p className="text-sm">
              Current: <strong>${money0(r.currentMaterialCost)}</strong>
              <br />
              New: <strong>${money0(r.newMaterialCost)}</strong>
              <br />
              Increase: <strong>${money0(r.materialCostIncrease)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Profit impact</p>
            <p className="text-sm">
              Before: <strong>{profitLabel(r.currentProfit)}</strong>
              <br />
              After: <strong>{profitLabel(r.newProfit)}</strong>
              <br />
              Margin: <strong>{pct2(r.currentMargin)} → {pct2(r.newMargin)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Material cost = unit cost × annual usage.</li>
          <li>New cost applies the expected price increase.</li>
          <li>Profit impact is calculated assuming revenue is unchanged.</li>
          <li>Margin shows how much pricing power you need to offset inflation.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Should revenue change with cost increases?</span>
            <br />
            This tool isolates cost impact. Use a separate pricing tool to model pass-through.
          </p>
          <p>
            <span className="font-medium">Can I use this for manufacturing or construction?</span>
            <br />
            Yes. Any business with material inputs can apply this framework.
          </p>
        </div>
      </div>
    </div>
  );
}
