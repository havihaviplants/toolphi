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

export default function RequiredVolumeIncreaseToOffsetCostInflationCalculator() {
  const [price, setPrice] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(60);
  const [baselineUnits, setBaselineUnits] = useState<number>(10000);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(10);

  const r = useMemo(() => {
    const p = clampMin(price, 0);
    const c0 = clampMin(unitCost, 0);
    const q0 = clampMin(baselineUnits, 0);
    const inc = n(costIncreasePct) / 100;

    const c1 = c0 * (1 + inc);

    const unitProfit0 = p - c0;
    const unitProfit1 = p - c1;

    const totalProfit0 = unitProfit0 * q0;

    const requiredUnits =
      unitProfit1 > 0 ? totalProfit0 / unitProfit1 : Infinity;

    const additionalUnits = requiredUnits - q0;
    const volumeIncreasePct =
      q0 > 0 ? (additionalUnits / q0) * 100 : 0;

    let note =
      "This shows how much volume must increase to keep total profit unchanged when unit costs rise and price stays fixed.";
    if (q0 <= 0) note = "Enter baseline units sold to compute the required volume increase.";
    else if (p <= 0) note = "Enter a valid selling price.";
    else if (unitProfit0 <= 0)
      note = "Baseline unit profit is zero or negative. Volume-based break-even may not be meaningful.";
    else if (unitProfit1 <= 0)
      note =
        "After cost inflation, unit profit is zero or negative. No realistic volume increase can offset the cost increase.";

    return {
      c1,
      unitProfit0,
      unitProfit1,
      totalProfit0,
      requiredUnits,
      additionalUnits,
      volumeIncreasePct,
      note,
    };
  }, [price, unitCost, baselineUnits, costIncreasePct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the <strong>sales volume increase</strong> required to offset higher unit costs
        when prices cannot be increased.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Baseline</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Selling price ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Unit cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Baseline units sold</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={baselineUnits}
              onChange={(e) => setBaselineUnits(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="text-xs opacity-70">
          Baseline unit profit: <strong>${money2(r.unitProfit0)}</strong> ·
          Total profit: <strong>${money0(r.totalProfit0)}</strong>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost inflation</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Unit cost increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New unit cost ($ / unit)</label>
            <input
              className="input"
              type="text"
              value={`$${money2(r.c1)}`}
              readOnly
            />
          </div>
        </div>

        <div className="text-xs opacity-70">
          New unit profit: <strong>${money2(r.unitProfit1)}</strong>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Result</div>

        {!Number.isFinite(r.requiredUnits) || r.requiredUnits < 0 ? (
          <p className="text-sm opacity-80">
            Required volume is not feasible with the given inputs.
          </p>
        ) : (
          <>
            <p className="text-sm">
              Required units sold: <strong>{money0(r.requiredUnits)}</strong>
              <br />
              Additional units needed:{" "}
              <strong>{money0(Math.max(0, r.additionalUnits))}</strong>
              <br />
              Required volume increase:{" "}
              <strong>{pct2(Math.max(0, r.volumeIncreasePct))}</strong>
            </p>
          </>
        )}

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Baseline profit = (price − unit cost) × baseline units.</li>
          <li>New unit profit = price − increased unit cost.</li>
          <li>Required units = baseline profit ÷ new unit profit.</li>
          <li>Volume increase = (required − baseline) ÷ baseline.</li>
        </ul>
      </div>
    </div>
  );
}
