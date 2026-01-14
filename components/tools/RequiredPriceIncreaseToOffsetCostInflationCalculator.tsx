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

export default function RequiredPriceIncreaseToOffsetCostInflationCalculator() {
  const [price, setPrice] = useState<number>(100);
  const [unitCost, setUnitCost] = useState<number>(60);
  const [baselineUnits, setBaselineUnits] = useState<number>(10000);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(10);

  const r = useMemo(() => {
    const p0 = clampMin(price, 0);
    const c0 = clampMin(unitCost, 0);
    const q0 = clampMin(baselineUnits, 0);
    const inc = n(costIncreasePct) / 100;

    const c1 = c0 * (1 + inc);

    const unitProfit0 = p0 - c0;
    const totalProfit0 = unitProfit0 * q0;

    // If volume stays constant, we need the same unit profit as before:
    // (p1 - c1) * q0 = totalProfit0 => p1 - c1 = totalProfit0 / q0
    const requiredUnitProfit = q0 > 0 ? totalProfit0 / q0 : 0;
    const p1 = c1 + requiredUnitProfit;

    const requiredIncreasePct = p0 > 0 ? ((p1 - p0) / p0) * 100 : 0;

    const totalProfit1 = (p1 - c1) * q0;

    let note =
      "This holds total profit ($) constant assuming sales volume stays the same.";
    if (q0 <= 0) note = "Enter baseline units sold to compute the required price increase.";
    else if (p0 <= 0) note = "Enter a valid current price greater than zero.";
    else if (unitProfit0 <= 0)
      note =
        "Baseline unit profit is zero or negative. Required price increase may be large or not meaningful.";
    else if (p1 < 0)
      note = "Inputs produce an invalid required price. Check price/cost values.";

    return {
      c1,
      unitProfit0,
      totalProfit0,
      requiredUnitProfit,
      p1,
      requiredIncreasePct,
      totalProfit1,
      note,
    };
  }, [price, unitCost, baselineUnits, costIncreasePct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Calculate the <strong>required price increase</strong> to offset higher unit costs and keep
        the <strong>same total profit</strong>, assuming volume stays constant.
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
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Current unit cost ($ / unit)</label>
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
            <p className="text-xs opacity-70 mt-1">
              This tool assumes units sold stay the same after the price change.
            </p>
          </div>
        </div>

        <div className="text-xs opacity-70">
          Baseline unit profit: <strong>${money2(r.unitProfit0)}</strong> · Baseline total profit:{" "}
          <strong>${money0(r.totalProfit0)}</strong>
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
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Result</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Required new price</p>
            <p className="text-sm">
              New price: <strong>${money2(r.p1)}</strong>
              <br />
              Required increase: <strong>{pct2(r.requiredIncreasePct)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Profit check</p>
            <p className="text-sm">
              Target profit: <strong>${money0(r.totalProfit0)}</strong>
              <br />
              Profit after: <strong>${money0(r.totalProfit1)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              The tool solves for the price that keeps total profit unchanged.
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Baseline total profit = (price − cost) × baseline units.</li>
          <li>New cost = cost × (1 + cost increase %).</li>
          <li>Required unit profit = baseline total profit ÷ baseline units.</li>
          <li>Required new price = new cost + required unit profit.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this the same as “maintain margin”?</span>
            <br />
            No. This maintains <strong>total profit ($)</strong> assuming volume stays constant. Maintaining margin % is a different goal.
          </p>
          <p>
            <span className="font-medium">What if volume changes after price increase?</span>
            <br />
            Use the volume break-even tool (#1) or model both effects together.
          </p>
        </div>
      </div>
    </div>
  );
}
