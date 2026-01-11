"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FarmBreakEvenPriceCalculator() {
  // Costs
  const [fixedCosts, setFixedCosts] = useState<number>(40000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(1.2);

  // Production
  const [expectedYieldUnits, setExpectedYieldUnits] = useState<number>(25000);

  const r = useMemo(() => {
    const fixed = Math.max(0, n(fixedCosts));
    const varUnit = Math.max(0, n(variableCostPerUnit));
    const y = Math.max(0, n(expectedYieldUnits));

    const totalVariable = y * varUnit;
    const totalCost = fixed + totalVariable;

    const breakEvenPrice = y > 0 ? totalCost / y : 0;
    const fixedPerUnit = y > 0 ? fixed / y : 0;

    return {
      fixed,
      varUnit,
      y,
      totalVariable,
      totalCost,
      breakEvenPrice,
      fixedPerUnit,
    };
  }, [fixedCosts, variableCostPerUnit, expectedYieldUnits]);

  const priceLabel = r.y > 0 ? `$${money2(r.breakEvenPrice)} / unit` : "—";

  const riskHint =
    r.y <= 0
      ? "Enter a positive expected yield to calculate break-even price."
      : r.breakEvenPrice < r.varUnit
      ? "This implies fixed costs are near zero. Double-check fixed costs."
      : "Tip: Try a lower yield or higher variable cost to stress test downside risk.";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Break-even price answers: <strong>“What minimum price per unit do I need to avoid losses?”</strong>{" "}
        It combines <strong>fixed costs</strong> (overhead) and <strong>variable costs</strong> (per-unit).
      </p>

      {/* Costs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Costs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Fixed costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Rent/land payment, equipment payments, insurance, overhead, admin, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Variable cost (per unit, $)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Seed/feed, fertilizer, chemicals, drying, hauling—anything that scales with yield.
            </p>
          </div>
        </div>
      </div>

      {/* Production */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Production assumption</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Expected yield (total units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={expectedYieldUnits}
              onChange={(e) => setExpectedYieldUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Use bushels/tons/pounds—any unit is fine as long as price and variable cost match.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Total cost</p>
            <p className="font-semibold">${money0(r.totalCost)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Break-even price</p>
            <p className="text-xl font-bold">{priceLabel}</p>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <p className="text-sm opacity-70">
            Fixed cost per unit: <span className="font-semibold">${money2(r.fixedPerUnit)} / unit</span>
          </p>
          <p className="text-sm opacity-70">
            Total variable cost: <span className="font-semibold">${money0(r.totalVariable)}</span>
          </p>
          <p className="text-sm opacity-80">{riskHint}</p>
        </div>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Total variable cost = expected yield × variable cost per unit</li>
          <li>Total cost = fixed costs + total variable cost</li>
          <li>Break-even price = total cost ÷ expected yield</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does break-even include profit?</span><br />
            No. It’s the minimum price to avoid losses. Add a target profit per unit on top if needed.
          </p>
          <p>
            <span className="font-medium">What yield should I use?</span><br />
            Use a realistic base case, then stress test with a lower yield (bad weather) to see price risk.
          </p>
          <p>
            <span className="font-medium">What if I don’t know variable cost per unit?</span><br />
            Start with an estimate, then adjust as you get better input costs. Variable cost matters a lot when yield is high.
          </p>
        </div>
      </div>
    </div>
  );
}
