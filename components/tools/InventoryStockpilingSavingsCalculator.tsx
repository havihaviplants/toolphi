"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n(v)));
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

export default function InventoryStockpilingSavingsCalculator() {
  const [unitPrice, setUnitPrice] = useState<number>(3.2);
  const [expectedPriceIncreasePct, setExpectedPriceIncreasePct] = useState<number>(10);

  const [prebuyUnits, setPrebuyUnits] = useState<number>(120000);
  const [holdingMonths, setHoldingMonths] = useState<number>(4);

  // Carrying costs (annual)
  const [annualCostOfCapitalPct, setAnnualCostOfCapitalPct] = useState<number>(12);
  const [annualStorageInsurancePct, setAnnualStorageInsurancePct] = useState<number>(6);

  const r = useMemo(() => {
    const price = clampMin(unitPrice, 0);
    const inc = n(expectedPriceIncreasePct) / 100; // allow negative
    const units = clampMin(prebuyUnits, 0);
    const months = clamp(holdingMonths, 0, 60);

    const cap = clampMin(annualCostOfCapitalPct, 0) / 100;
    const stor = clampMin(annualStorageInsurancePct, 0) / 100;

    const inventoryValue = units * price;

    const grossSavings = units * price * inc; // negative if expected decrease
    const totalAnnualCarryRate = cap + stor;

    const holdingCost = inventoryValue * totalAnnualCarryRate * (months / 12);

    const netSavings = grossSavings - holdingCost;

    // Break-even price increase % for a given holding period & carry rate
    const breakEvenIncreasePct =
      price > 0 && units > 0 ? (holdingCost / (units * price)) * 100 : 0;

    const note =
      units <= 0
        ? "Enter pre-buy units to evaluate stockpiling."
        : months <= 0
        ? "Holding months is 0, so net savings equals gross savings."
        : inc < 0
        ? "You assumed prices fall. Stockpiling likely hurts unless you have other constraints (availability risk)."
        : "Tip: If availability risk matters, stockpiling can be worth it even if net savings is small.";

    return {
      inventoryValue,
      grossSavings,
      holdingCost,
      netSavings,
      totalAnnualCarryRate,
      breakEvenIncreasePct,
      note,
    };
  }, [
    unitPrice,
    expectedPriceIncreasePct,
    prebuyUnits,
    holdingMonths,
    annualCostOfCapitalPct,
    annualStorageInsurancePct,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Decide if <strong>stockpiling inventory</strong> before a price increase saves money after
        accounting for <strong>carrying costs</strong> (capital, storage, insurance).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Price & quantity</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current unit price ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Current purchase price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Expected price increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={expectedPriceIncreasePct}
              onChange={(e) => setExpectedPriceIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use negative for expected price declines.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Pre-buy units</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={prebuyUnits}
              onChange={(e) => setPrebuyUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Extra units you buy early.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Holding period (months)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={holdingMonths}
              onChange={(e) => setHoldingMonths(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">How long you’ll hold the extra inventory.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Carrying costs (annual %)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Cost of capital (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.5"
              value={annualCostOfCapitalPct}
              onChange={(e) => setAnnualCostOfCapitalPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Opportunity cost of cash tied up in inventory.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Storage + insurance (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.5"
              value={annualStorageInsurancePct}
              onChange={(e) => setAnnualStorageInsurancePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Warehousing, shrinkage, insurance, etc.</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Total carrying rate: <strong>{pct2(r.totalAnnualCarryRate * 100)}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Inventory value</p>
            <p className="text-sm">
              Pre-buy inventory value: <strong>${money0(r.inventoryValue)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Savings vs costs</p>
            <p className="text-sm">
              Gross savings: <strong>{signedMoney0(r.grossSavings)}</strong>
              <br />
              Holding cost: <strong>-${money0(r.holdingCost)}</strong>
              <br />
              Net savings: <strong>{signedMoney0(r.netSavings)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Break-even price increase</p>
          <p className="text-sm">
            Break-even increase (for this holding period): <strong>{pct2(r.breakEvenIncreasePct)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            If the expected price increase is above this, stockpiling tends to save money (ignoring other risks).
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Gross savings = units × unit price × expected increase%.</li>
          <li>Holding cost ≈ inventory value × (annual carry rate) × (months/12).</li>
          <li>Net savings = gross savings − holding cost.</li>
          <li>Break-even increase% = holding cost ÷ inventory value.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What about spoilage or obsolescence?</span>
            <br />
            Add an extra percentage into storage/insurance to approximate shrinkage or write-down risk.
          </p>
          <p>
            <span className="font-medium">What if I can’t store that much?</span>
            <br />
            Lower pre-buy units or increase storage cost to reflect capacity constraints.
          </p>
        </div>
      </div>
    </div>
  );
}
