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
function num0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function UnitCostIncreaseBreakEvenYieldCalculator() {
  const [pricePerUnit, setPricePerUnit] = useState<number>(12);
  const [costPerUnit, setCostPerUnit] = useState<number>(8);

  const [costIncreaseMode, setCostIncreaseMode] = useState<"percent" | "amount">("percent");
  const [costIncreasePct, setCostIncreasePct] = useState<number>(10);
  const [costIncreaseAmount, setCostIncreaseAmount] = useState<number>(0.8);

  const [currentUnits, setCurrentUnits] = useState<number>(50000);

  const r = useMemo(() => {
    const p = clampMin(pricePerUnit, 0);
    const c = clampMin(costPerUnit, 0);
    const q0 = clampMin(currentUnits, 0);

    const incPct = n(costIncreasePct) / 100;
    const incAmt = clampMin(costIncreaseAmount, 0);

    const newCost =
      costIncreaseMode === "percent" ? c * (1 + incPct) : c + incAmt;

    const profitPerUnitBefore = p - c;
    const profitPerUnitAfter = p - newCost;

    const totalProfitBefore = profitPerUnitBefore * q0;

    // "Break-even yield" here means: keep total profit constant after cost increase
    // Required units q1 satisfies: profitAfter * q1 = totalProfitBefore
    const requiredUnits =
      profitPerUnitAfter > 0 ? totalProfitBefore / profitPerUnitAfter : 0;

    const additionalUnits = Math.max(0, requiredUnits - q0);
    const requiredVolumeIncreasePct =
      q0 > 0 ? (additionalUnits / q0) * 100 : 0;

    let note =
      "This assumes selling price stays constant and you try to offset lower margin by selling more units.";
    if (q0 <= 0) note = "Enter current units to estimate the required new volume.";
    else if (profitPerUnitBefore <= 0) note = "Your baseline profit per unit is zero or negative.";
    else if (profitPerUnitAfter <= 0)
      note = "After the cost increase, profit per unit becomes zero or negative. Volume cannot fix this without raising price or reducing costs.";

    return {
      newCost,
      profitPerUnitBefore,
      profitPerUnitAfter,
      totalProfitBefore,
      requiredUnits,
      additionalUnits,
      requiredVolumeIncreasePct,
      note,
    };
  }, [
    pricePerUnit,
    costPerUnit,
    costIncreaseMode,
    costIncreasePct,
    costIncreaseAmount,
    currentUnits,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how many <strong>additional units</strong> you must sell to
        maintain your baseline total profit after a <strong>unit cost increase</strong> (assuming price stays the same).
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Baseline inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Selling price ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Assumed constant for this scenario.</p>
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
            <p className="text-xs opacity-70 mt-1">Your baseline unit cost.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Unit cost increase</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costIncreaseMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostIncreaseMode("percent")}
          >
            Increase (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costIncreaseMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostIncreaseMode("amount")}
          >
            Increase ($)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {costIncreaseMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">Cost increase (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={costIncreasePct}
                onChange={(e) => setCostIncreasePct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Example: 10 means +10%.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Cost increase ($ / unit)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={costIncreaseAmount}
                onChange={(e) => setCostIncreaseAmount(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Absolute increase per unit.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Current units sold</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={currentUnits}
              onChange={(e) => setCurrentUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Baseline volume.</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          New unit cost after increase: <strong>${money2(r.newCost)}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Margin</p>
            <p className="text-sm">
              Profit/unit (before): <strong>${money2(r.profitPerUnitBefore)}</strong>
              <br />
              Profit/unit (after): <strong>${money2(r.profitPerUnitAfter)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Volume needed</p>
            <p className="text-sm">
              Required units: <strong>{num0(r.requiredUnits)}</strong>
              <br />
              Additional units: <strong>{num0(r.additionalUnits)}</strong>
              <br />
              Volume increase: <strong>{pct2(r.requiredVolumeIncreasePct)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Profit/unit before = price − cost.</li>
          <li>Profit/unit after = price − new cost.</li>
          <li>Total profit before = profit/unit before × current units.</li>
          <li>Required units = total profit before ÷ profit/unit after.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this true “break-even”?</span>
            <br />
            Here, “break-even yield” means keeping baseline total profit constant by increasing volume.
            If you want profit = 0, use the break-even price tool instead.
          </p>
          <p>
            <span className="font-medium">What if demand can’t grow?</span>
            <br />
            Then you likely need price increases, cost reduction, or hedging instead of volume expansion.
          </p>
        </div>
      </div>
    </div>
  );
}
