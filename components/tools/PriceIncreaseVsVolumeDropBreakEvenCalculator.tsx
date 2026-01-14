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

export default function PriceIncreaseVsVolumeDropBreakEvenCalculator() {
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [unitVariableCost, setUnitVariableCost] = useState<number>(60);
  const [baselineUnits, setBaselineUnits] = useState<number>(10000);

  const [priceIncreasePct, setPriceIncreasePct] = useState<number>(10);

  const r = useMemo(() => {
    const p0 = clampMin(currentPrice, 0);
    const c = clampMin(unitVariableCost, 0);
    const q0 = clampMin(baselineUnits, 0);
    const inc = n(priceIncreasePct) / 100;

    const p1 = p0 * (1 + inc);

    const unitProfit0 = p0 - c;
    const unitProfit1 = p1 - c;

    // Hold total contribution profit constant (same as total gross profit if you treat variable cost as COGS).
    const totalProfit0 = unitProfit0 * q0;

    // Break-even units after price change:
    // unitProfit1 * q1 = totalProfit0 => q1 = totalProfit0 / unitProfit1
    const q1 = unitProfit1 !== 0 ? totalProfit0 / unitProfit1 : Infinity;

    const volumeDropUnits = q0 - q1;
    const volumeDropPct = q0 > 0 ? (volumeDropUnits / q0) * 100 : 0;

    const revenue0 = p0 * q0;
    const revenue1 = p1 * q1;

    const totalProfit1 = unitProfit1 * q1;

    let note =
      "This is a profit break-even calculation: it tells you how much volume can fall while keeping total profit constant.";
    if (q0 <= 0) note = "Enter baseline units sold to compute the break-even volume.";
    else if (p0 <= 0) note = "Enter a current price greater than zero.";
    else if (unitProfit0 <= 0) note = "Baseline unit profit is zero/negative. Break-even volume may not be meaningful.";
    else if (unitProfit1 <= 0)
      note = "After the price change, unit profit is zero/negative. You cannot break even by volume alone.";
    else if (!Number.isFinite(q1))
      note = "Break-even units are not finite due to zero/invalid unit profit after price change.";
    else if (q1 > q0)
      note = "With this price change, you would need higher volume to maintain profit (often due to price decrease or higher cost).";

    return {
      p1,
      unitProfit0,
      unitProfit1,
      totalProfit0,
      q1,
      volumeDropUnits,
      volumeDropPct,
      revenue0,
      revenue1,
      totalProfit1,
      note,
    };
  }, [currentPrice, unitVariableCost, baselineUnits, priceIncreasePct]);

  const signedUnits = (v: number) =>
    v >= 0 ? `+${money0(v)}` : `-${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the <strong>maximum volume drop</strong> you can tolerate after a price increase
        while keeping <strong>total profit</strong> the same.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Baseline</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Current price ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current selling price.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Unit variable cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={unitVariableCost}
              onChange={(e) => setUnitVariableCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Variable cost per unit (COGS / variable inputs). Fixed costs are not included here.
            </p>
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
            <p className="text-xs opacity-70 mt-1">Units sold in your baseline period.</p>
          </div>
        </div>

        <div className="text-xs opacity-70">
          Baseline unit profit: <strong>${money2(r.unitProfit0)}</strong> · Baseline total profit:{" "}
          <strong>${money0(r.totalProfit0)}</strong>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Price change</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Price increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={priceIncreasePct}
              onChange={(e) => setPriceIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: 10 means +10% price.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">New price ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.p1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated from the baseline price.</p>
          </div>
        </div>

        <div className="text-xs opacity-70">
          New unit profit: <strong>${money2(r.unitProfit1)}</strong>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        {!Number.isFinite(r.q1) || r.q1 < 0 ? (
          <p className="text-sm opacity-80">
            Break-even units are not feasible with the given inputs.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Break-even volume</p>
                <p className="text-sm">
                  Break-even units after price change: <strong>{money0(r.q1)}</strong>
                  <br />
                  Volume change (units): <strong>{signedUnits(r.q1 - baselineUnits)}</strong>
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Max volume drop allowed</p>
                <p className="text-sm">
                  Max drop (units): <strong>{money0(Math.max(0, r.volumeDropUnits))}</strong>
                  <br />
                  Max drop (%): <strong>{pct2(Math.max(0, r.volumeDropPct))}</strong>
                </p>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-1">
              <p className="text-sm opacity-70">Revenue (for context)</p>
              <p className="text-sm">
                Baseline revenue: <strong>${money0(r.revenue0)}</strong>
                <br />
                Revenue at break-even units: <strong>${money0(r.revenue1)}</strong>
              </p>
              <p className="text-xs opacity-70 mt-1">
                This tool holds profit constant, not revenue.
              </p>
            </div>
          </>
        )}

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Baseline total profit = (price − variable cost) × baseline units.</li>
          <li>New unit profit = (new price − variable cost).</li>
          <li>Break-even units = baseline total profit ÷ new unit profit.</li>
          <li>Max volume drop = baseline units − break-even units.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does this model fixed costs?</span>
            <br />
            Not directly. You can approximate by adding fixed costs into “profit required” (future extension).
          </p>
          <p>
            <span className="font-medium">What if variable cost also changes?</span>
            <br />
            Update the unit variable cost input to the post-change value.
          </p>
        </div>
      </div>
    </div>
  );
}
