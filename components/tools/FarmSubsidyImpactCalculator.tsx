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

type CostMode = "total" | "perUnit";
type SubsidyMode = "total" | "perUnit";

export default function FarmSubsidyImpactCalculator() {
  // Production
  const [yieldUnits, setYieldUnits] = useState<number>(60000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(4.5);

  // Costs
  const [costMode, setCostMode] = useState<CostMode>("total");
  const [totalCosts, setTotalCosts] = useState<number>(220000);
  const [costPerUnit, setCostPerUnit] = useState<number>(3.67);

  // Subsidy
  const [subsidyMode, setSubsidyMode] = useState<SubsidyMode>("perUnit");
  const [subsidyTotal, setSubsidyTotal] = useState<number>(18000);
  const [subsidyPerUnit, setSubsidyPerUnit] = useState<number>(0.3);

  const r = useMemo(() => {
    const y = clampMin(yieldUnits, 0);
    const p = clampMin(pricePerUnit, 0);

    const costs =
      costMode === "total" ? clampMin(totalCosts, 0) : y * clampMin(costPerUnit, 0);

    const subsidy =
      subsidyMode === "total" ? clampMin(subsidyTotal, 0) : y * clampMin(subsidyPerUnit, 0);

    const revenue = y * p;

    const incomeNoSubsidy = revenue - costs;
    const incomeWithSubsidy = revenue + subsidy - costs;

    const breakEvenPriceNoSub = y > 0 ? costs / y : 0;
    const breakEvenPriceWithSub = y > 0 ? Math.max(0, (costs - subsidy) / y) : 0;

    const incomeDelta = incomeWithSubsidy - incomeNoSubsidy;

    const cushionNoSub = p - breakEvenPriceNoSub;
    const cushionWithSub = p - breakEvenPriceWithSub;

    const hint =
      y <= 0
        ? "Enter a positive yield to calculate break-even price changes."
        : "Tip: If you’re unsure about subsidies, test a conservative case (50% of expected) and compare buffers.";

    return {
      y,
      p,
      costs,
      subsidy,
      revenue,
      incomeNoSubsidy,
      incomeWithSubsidy,
      incomeDelta,
      breakEvenPriceNoSub,
      breakEvenPriceWithSub,
      cushionNoSub,
      cushionWithSub,
      hint,
    };
  }, [
    yieldUnits,
    pricePerUnit,
    costMode,
    totalCosts,
    costPerUnit,
    subsidyMode,
    subsidyTotal,
    subsidyPerUnit,
  ]);

  const deltaLabel =
    r.incomeDelta >= 0 ? `+$${money0(r.incomeDelta)}` : `-$${money0(Math.abs(r.incomeDelta))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Subsidies can materially change your <strong>net income</strong> and your <strong>break-even price</strong>.
        This tool shows side-by-side outcomes with and without subsidy.
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
            <p className="text-xs opacity-70 mt-1">Use any unit (bushels/tons/etc.) if prices and costs match.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Price ($ per unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Expected selling price (not including subsidy).</p>
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
            <p className="text-xs opacity-70 mt-1">Operating + fixed costs (consistent across both scenarios).</p>
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
            <p className="text-xs opacity-70 mt-1">Total costs = yield × cost per unit.</p>
          </div>
        )}
      </div>

      {/* Subsidy */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Subsidy</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1.5 rounded border text-sm ${
              subsidyMode === "total" ? "font-semibold" : "opacity-80"
            }`}
            onClick={() => setSubsidyMode("total")}
          >
            Total subsidy
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded border text-sm ${
              subsidyMode === "perUnit" ? "font-semibold" : "opacity-80"
            }`}
            onClick={() => setSubsidyMode("perUnit")}
          >
            Subsidy per unit
          </button>
        </div>

        {subsidyMode === "total" ? (
          <div>
            <label className="block text-sm font-medium">Subsidy total ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={subsidyTotal}
              onChange={(e) => setSubsidyTotal(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">If you know your expected total payment for the season/year.</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Subsidy per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={subsidyPerUnit}
              onChange={(e) => setSubsidyPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">If subsidy scales with production or eligible units.</p>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Net income (no subsidy)</p>
            <p className="text-xl font-bold">${money0(r.incomeNoSubsidy)}</p>
            <p className="text-xs opacity-70">
              Revenue: <strong>${money0(r.revenue)}</strong> · Costs: <strong>${money0(r.costs)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Net income (with subsidy)</p>
            <p className="text-xl font-bold">${money0(r.incomeWithSubsidy)}</p>
            <p className="text-xs opacity-70">
              Subsidy used: <strong>${money0(r.subsidy)}</strong> · Change: <strong>{deltaLabel}</strong>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Break-even price (no subsidy)</p>
            <p className="font-semibold">${money2(r.breakEvenPriceNoSub)} / unit</p>
            <p className="text-xs opacity-70">Cushion at current price: <strong>${money2(r.cushionNoSub)}</strong></p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">Break-even price (with subsidy)</p>
            <p className="font-semibold">${money2(r.breakEvenPriceWithSub)} / unit</p>
            <p className="text-xs opacity-70">Cushion at current price: <strong>${money2(r.cushionWithSub)}</strong></p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.hint}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Revenue = yield × price.</li>
          <li>Net income (no subsidy) = revenue − costs.</li>
          <li>Net income (with subsidy) = revenue + subsidy − costs.</li>
          <li>Break-even price (with subsidy) = (costs − subsidy) ÷ yield.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does subsidy always reduce break-even price?</span>
            <br />
            If it’s truly incremental cash and costs are unchanged, yes—it offsets costs, lowering effective break-even.
          </p>
          <p>
            <span className="font-medium">What if subsidy eligibility caps out?</span>
            <br />
            Use “Total subsidy” mode and enter the capped amount rather than per-unit.
          </p>
          <p>
            <span className="font-medium">What’s a good conservative scenario?</span>
            <br />
            Try 0% subsidy (worst case), then 50% of expected (conservative), then full expected.
          </p>
        </div>
      </div>
    </div>
  );
}
