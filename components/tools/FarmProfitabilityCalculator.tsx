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

export default function FarmProfitabilityCalculator() {
  // Production
  const [yieldUnits, setYieldUnits] = useState<number>(80000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(3.75);

  // Costs
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(2.2);
  const [fixedCostsPerYear, setFixedCostsPerYear] = useState<number>(60000);

  // Optional overhead
  const [landRentPerYear, setLandRentPerYear] = useState<number>(0);
  const [equipmentPaymentsPerYear, setEquipmentPaymentsPerYear] = useState<number>(25000);

  const r = useMemo(() => {
    const y = clampMin(yieldUnits, 0);
    const p = clampMin(pricePerUnit, 0);

    const vcpu = clampMin(variableCostPerUnit, 0);
    const fixed = clampMin(fixedCostsPerYear, 0);

    const rent = clampMin(landRentPerYear, 0);
    const equip = clampMin(equipmentPaymentsPerYear, 0);

    const revenue = y * p;
    const variableCosts = y * vcpu;
    const totalCosts = variableCosts + fixed + rent + equip;

    const netProfit = revenue - totalCosts;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const breakEvenPrice = y > 0 ? totalCosts / y : 0;
    const priceBuffer = p - breakEvenPrice;

    const note =
      y <= 0
        ? "Enter a positive yield to calculate break-even price."
        : revenue <= 0
        ? "Enter a selling price to calculate revenue and margin."
        : netProfit < 0
        ? "Profit is negative. Try reducing variable costs, renegotiating rent/equipment terms, or testing a higher price scenario."
        : "Tip: Use break-even price as your 'survival line'—then stress test with lower price or yield.";

    return {
      y,
      p,
      vcpu,
      fixed,
      rent,
      equip,
      revenue,
      variableCosts,
      totalCosts,
      netProfit,
      margin,
      breakEvenPrice,
      priceBuffer,
      note,
    };
  }, [
    yieldUnits,
    pricePerUnit,
    variableCostPerUnit,
    fixedCostsPerYear,
    landRentPerYear,
    equipmentPaymentsPerYear,
  ]);

  const profitLabel = (v: number) => (v >= 0 ? `$${money0(v)}` : `-$${money0(Math.abs(v))}`);
  const bufferLabel = (v: number) =>
    v >= 0 ? `+$${money2(v)} / unit` : `-$${money2(Math.abs(v))} / unit`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        A farm profitability calculator built around the core decision loop:
        <strong> yield × price</strong> versus <strong>variable + fixed + rent + equipment</strong>.
      </p>

      {/* Production */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Production</div>

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
            <p className="text-xs opacity-70 mt-1">Use any unit as long as price and costs match.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Selling price ($ per unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average realized selling price.</p>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Costs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Variable cost ($ per unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Seed/feed, fertilizer, fuel, labor, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Fixed costs ($ per year)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={fixedCostsPerYear}
              onChange={(e) => setFixedCostsPerYear(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Overhead, insurance, admin, depreciation, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Land rent ($ per year) (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={landRentPerYear}
              onChange={(e) => setLandRentPerYear(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">If you lease land rather than own it.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Equipment payments ($ per year) (optional)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={equipmentPaymentsPerYear}
              onChange={(e) => setEquipmentPaymentsPerYear(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Lease, loan payments, or major equipment overhead.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Revenue</p>
            <p className="text-xl font-bold">${money0(r.revenue)}</p>
            <p className="text-xs opacity-70">
              {money0(r.y)} units × ${money2(r.p)} / unit
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Total costs</p>
            <p className="text-xl font-bold">${money0(r.totalCosts)}</p>
            <p className="text-xs opacity-70">
              Variable ${money0(r.variableCosts)} + Fixed ${money0(r.fixed)} + Rent ${money0(r.rent)} + Equipment $
              {money0(r.equip)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm opacity-70">Net profit</p>
            <p className="text-xl font-bold">{profitLabel(r.netProfit)}</p>
            <p className="text-xs opacity-70">Profit margin: <strong>{pct2(r.margin)}</strong></p>
          </div>

          <div className="space-y-1">
            <p className="text-sm opacity-70">Break-even price</p>
            <p className="text-xl font-bold">${money2(r.breakEvenPrice)} / unit</p>
            <p className="text-xs opacity-70">
              Buffer at current price: <strong>{bufferLabel(r.priceBuffer)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      {/* How it works + FAQ */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Revenue = yield × price.</li>
          <li>Variable costs = yield × variable cost per unit.</li>
          <li>Total costs = variable + fixed + rent + equipment.</li>
          <li>Net profit = revenue − total costs.</li>
          <li>Break-even price = total costs ÷ yield.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Should equipment payments be included in “cost”?</span>
            <br />
            If you want a cash-focused view, yes. If you want pure operating profitability, set equipment payments to 0.
          </p>
          <p>
            <span className="font-medium">What if I own land (no rent)?</span>
            <br />
            Keep rent at 0. If you want to include opportunity cost, model it as an annual “rent equivalent.”
          </p>
          <p>
            <span className="font-medium">How do I stress test this?</span>
            <br />
            Lower price or yield, and increase variable cost per unit to simulate bad years.
          </p>
        </div>
      </div>
    </div>
  );
}
