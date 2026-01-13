"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function money2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function money0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function CostInflationBreakEvenPriceCalculator() {
  const [sellingPrice, setSellingPrice] = useState<number>(25);
  const [unitsSold, setUnitsSold] = useState<number>(10000);

  const [costPerUnit, setCostPerUnit] = useState<number>(15);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(12);

  const r = useMemo(() => {
    const price = clampMin(sellingPrice, 0);
    const units = clampMin(unitsSold, 0);

    const cost = clampMin(costPerUnit, 0);
    const inc = n(costIncreasePct) / 100;

    const newCost = cost * (1 + inc);

    // For profit=0 break-even per unit, price must equal cost per unit (new cost).
    const breakEvenPrice = newCost;

    const requiredPriceChange = breakEvenPrice - price;
    const requiredPriceChangePct = price > 0 ? (requiredPriceChange / price) * 100 : 0;

    // Total impact if you do nothing:
    const profitPerUnitBefore = price - cost;
    const profitPerUnitAfter = price - newCost;

    const profitChangeTotal = (profitPerUnitAfter - profitPerUnitBefore) * units;

    let note = "Break-even price is the minimum price that avoids losses at the new cost level.";
    if (units <= 0) note = "Enter units sold to see total impact.";
    else if (price >= breakEvenPrice) note = "Your current price is already above break-even (you still avoid losses).";
    else if (price < breakEvenPrice) note = "Your current price is below break-even after inflation (loss likely).";

    return {
      newCost,
      breakEvenPrice,
      requiredPriceChange,
      requiredPriceChangePct,
      profitPerUnitBefore,
      profitPerUnitAfter,
      profitChangeTotal,
      note,
    };
  }, [sellingPrice, unitsSold, costPerUnit, costIncreasePct]);

  const signedMoney2 = (v: number) => (v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`);
  const signedMoney0 = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Calculate the <strong>break-even selling price</strong> needed after cost inflation so that
        profit does not turn negative.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Current unit economics</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current selling price ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Units sold</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={unitsSold}
              onChange={(e) => setUnitsSold(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Used to estimate total profit impact.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Current cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current cost per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Cost increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Expected cost inflation.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">After inflation</p>
            <p className="text-sm">
              New cost per unit: <strong>${money2(r.newCost)}</strong>
              <br />
              Break-even price: <strong>${money2(r.breakEvenPrice)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Price adjustment</p>
            <p className="text-sm">
              Required price change: <strong>{signedMoney2(r.requiredPriceChange)}</strong>
              <br />
              Required change (% of current): <strong>{pct2(r.requiredPriceChangePct)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Profit impact if price stays the same</p>
          <p className="text-sm">
            Profit/unit before: <strong>${money2(r.profitPerUnitBefore)}</strong>
            <br />
            Profit/unit after: <strong>${money2(r.profitPerUnitAfter)}</strong>
            <br />
            Total profit change: <strong>{signedMoney0(r.profitChangeTotal)}</strong>
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New cost = current cost × (1 + inflation%).</li>
          <li>Break-even price (profit = 0) equals the new cost per unit.</li>
          <li>Required price change = break-even price − current price.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why is break-even price equal to cost?</span>
            <br />
            This tool defines break-even as profit = 0 per unit (ignoring fixed costs). It’s a quick unit-level break-even.
          </p>
          <p>
            <span className="font-medium">What if I have fixed costs?</span>
            <br />
            Then break-even price is higher. Use a full contribution margin or fixed-cost break-even model for that case.
          </p>
        </div>
      </div>
    </div>
  );
}
