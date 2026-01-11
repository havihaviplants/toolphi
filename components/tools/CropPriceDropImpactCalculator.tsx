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

type CostMode = "total" | "perUnit";

export default function CropPriceDropImpactCalculator() {
  // Production
  const [yieldUnits, setYieldUnits] = useState<number>(50000);
  const [baselinePrice, setBaselinePrice] = useState<number>(5);

  // Costs
  const [costMode, setCostMode] = useState<CostMode>("total");
  const [totalCosts, setTotalCosts] = useState<number>(180000);
  const [costPerUnit, setCostPerUnit] = useState<number>(3.6);

  // Shock
  const [priceDropPct, setPriceDropPct] = useState<number>(15);

  const r = useMemo(() => {
    const y = clampMin(yieldUnits, 0);
    const p0 = clampMin(baselinePrice, 0);

    const drop = clampMin(priceDropPct, 0);
    const p1 = p0 * (1 - drop / 100);

    const revenue0 = y * p0;
    const revenue1 = y * p1;

    const costs =
      costMode === "total" ? clampMin(totalCosts, 0) : y * clampMin(costPerUnit, 0);

    const profit0 = revenue0 - costs;
    const profit1 = revenue1 - costs;

    const revenueDelta = revenue1 - revenue0;
    const profitDelta = profit1 - profit0;

    const breakEvenPrice = y > 0 ? costs / y : 0;
    const cushion0 = p0 - breakEvenPrice;
    const cushion1 = p1 - breakEvenPrice;

    const margin0 = revenue0 > 0 ? (profit0 / revenue0) * 100 : 0;
    const margin1 = revenue1 > 0 ? (profit1 / revenue1) * 100 : 0;

    const hint =
      y <= 0
        ? "Enter a positive yield to estimate revenue and profit impact."
        : p0 <= 0
        ? "Enter a baseline price greater than 0."
        : "Tip: Stress test multiple drop levels (10%, 20%, 30%) and compare cushion vs break-even.";

    return {
      y,
      p0,
      p1,
      drop,
      revenue0,
      revenue1,
      costs,
      profit0,
      profit1,
      revenueDelta,
      profitDelta,
      breakEvenPrice,
      cushion0,
      cushion1,
      margin0,
      margin1,
      hint,
    };
  }, [yieldUnits, baselinePrice, costMode, totalCosts, costPerUnit, priceDropPct]);

  const revenueDeltaLabel = r.revenueDelta >= 0 ? `+$${money0(r.revenueDelta)}` : `-$${money0(Math.abs(r.revenueDelta))}`;
  const profitDeltaLabel = r.profitDelta >= 0 ? `+$${money0(r.profitDelta)}` : `-$${money0(Math.abs(r.profitDelta))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Model how a <strong>crop price drop</strong> impacts revenue and profit assuming yield and costs stay the same.
        Use this as a fast downside-risk check.
      </p>

      {/* Production */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Production assumptions</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Expected yield (total units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={yieldUnits}
              onChange={(e) => setYieldUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Bushels/tons/pounds—any unit works if price matches.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Baseline price ($ per unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={baselinePrice}
              onChange={(e) => setBaselinePrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your expected selling price before the shock.</p>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Costs</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1.5 rounded border text-sm ${
              costMode === "total" ? "font-semibold" : "opacity-80"
            }`}
            onClick={() => setCostMode("total")}
          >
            Total costs
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded border text-sm ${
              costMode === "perUnit" ? "font-semibold" : "opacity-80"
            }`}
            onClick={() => setCostMode("perUnit")}
          >
            Cost per unit
          </button>
        </div>

        {costMode === "total" ? (
          <div>
            <label className="block text-sm font-medium">Total costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={totalCosts}
              onChange={(e) => setTotalCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Includes operating costs (and optionally fixed costs). Keep consistent for both scenarios.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Cost per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              If you know cost per bushel/ton/unit, this mode auto-computes total costs from yield.
            </p>
          </div>
        )}
      </div>

      {/* Shock */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Price shock</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Price drop (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={priceDropPct}
              onChange={(e) => setPriceDropPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 15 means price becomes 85% of baseline.</p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">New price</p>
            <p className="text-xl font-bold">${money2(r.p1)} / unit</p>
            <p className="text-xs opacity-70">
              Baseline: ${money2(r.p0)} · Drop: {pct2(r.drop)}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Revenue (baseline → new)</p>
            <p className="font-semibold">
              ${money0(r.revenue0)} → ${money0(r.revenue1)}
            </p>
            <p className="text-xs opacity-70">Revenue change: <strong>{revenueDeltaLabel}</strong></p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Profit (baseline → new)</p>
            <p className="font-semibold">
              ${money0(r.profit0)} → ${money0(r.profit1)}
            </p>
            <p className="text-xs opacity-70">Profit change: <strong>{profitDeltaLabel}</strong></p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Break-even price</p>
            <p className="font-semibold">${money2(r.breakEvenPrice)} / unit</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-70">Cushion (baseline)</p>
            <p className="font-semibold">${money2(r.cushion0)} / unit</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm opacity-70">Cushion (new)</p>
            <p className="font-semibold">${money2(r.cushion1)} / unit</p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Margin (baseline → new)</p>
            <p className="font-semibold">
              {r.margin0.toLocaleString("en-US", { maximumFractionDigits: 1 })}% →{" "}
              {r.margin1.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">Costs used</p>
            <p className="font-semibold">${money0(r.costs)}</p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.hint}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Revenue = yield × price.</li>
          <li>Profit = revenue − costs (costs assumed unchanged under the price shock).</li>
          <li>Break-even price = costs ÷ yield.</li>
          <li>Cushion = (price − break-even price) per unit.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What if yield also drops?</span>
            <br />
            This tool isolates price risk. For combined shocks, reduce yield and run again (or use a stress-test tool).
          </p>
          <p>
            <span className="font-medium">Do costs change when prices drop?</span>
            <br />
            Usually not immediately. Over time, you can cut variable inputs—try adjusting cost per unit to reflect that.
          </p>
          <p>
            <span className="font-medium">How should I choose the drop %?</span>
            <br />
            Use historical volatility, forward curves, or conservative scenarios like 10%/20%/30%.
          </p>
        </div>
      </div>
    </div>
  );
}
