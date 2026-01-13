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
function pp2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  const sign = x >= 0 ? "+" : "";
  return `${sign}${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pp`;
}

export default function GrossMarginCompressionCalculator() {
  const [pricePerUnit, setPricePerUnit] = useState<number>(100);
  const [costPerUnit, setCostPerUnit] = useState<number>(65);
  const [units, setUnits] = useState<number>(1000);

  const [priceChangeMode, setPriceChangeMode] = useState<"percent" | "amount">("percent");
  const [priceChangePct, setPriceChangePct] = useState<number>(2);
  const [priceChangeAmount, setPriceChangeAmount] = useState<number>(2);

  const [costChangeMode, setCostChangeMode] = useState<"percent" | "amount">("percent");
  const [costChangePct, setCostChangePct] = useState<number>(8);
  const [costChangeAmount, setCostChangeAmount] = useState<number>(5.2);

  const r = useMemo(() => {
    const p0 = clampMin(pricePerUnit, 0);
    const c0 = clampMin(costPerUnit, 0);
    const q = clampMin(units, 0);

    const p1 =
      priceChangeMode === "percent"
        ? p0 * (1 + n(priceChangePct) / 100)
        : Math.max(0, p0 + n(priceChangeAmount));

    const c1 =
      costChangeMode === "percent"
        ? c0 * (1 + n(costChangePct) / 100)
        : Math.max(0, c0 + n(costChangeAmount));

    const revenue0 = p0 * q;
    const revenue1 = p1 * q;

    const cogs0 = c0 * q;
    const cogs1 = c1 * q;

    const gm0 = revenue0 - cogs0;
    const gm1 = revenue1 - cogs1;

    const gmPct0 = revenue0 > 0 ? (gm0 / revenue0) * 100 : 0;
    const gmPct1 = revenue1 > 0 ? (gm1 / revenue1) * 100 : 0;

    const compressionPP = gmPct1 - gmPct0;

    let note =
      "Gross margin compression is measured as the change in gross margin percentage (percentage points).";
    if (q <= 0) note = "Enter units sold to compute revenue, COGS, and gross margin.";
    else if (revenue1 <= 0) note = "Revenue is zero after inputs. Check price and units.";
    else if (gmPct1 < gmPct0) note = "Gross margin compresses because costs rose faster than prices (or prices fell).";
    else if (gmPct1 > gmPct0) note = "Gross margin expands because prices rose faster than costs (or costs fell).";

    return {
      p1,
      c1,
      revenue0,
      revenue1,
      cogs0,
      cogs1,
      gm0,
      gm1,
      gmPct0,
      gmPct1,
      compressionPP,
      note,
    };
  }, [
    pricePerUnit,
    costPerUnit,
    units,
    priceChangeMode,
    priceChangePct,
    priceChangeAmount,
    costChangeMode,
    costChangePct,
    costChangeAmount,
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Compare gross margin <strong>before vs after</strong> price and cost changes, and measure
        margin compression in <strong>percentage points (pp)</strong>.
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
            <p className="text-xs opacity-70 mt-1">Baseline price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Unit cost (COGS) ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Baseline cost per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Units sold</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Tip: If you only care about unit economics, set units = 1.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Price change</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${priceChangeMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setPriceChangeMode("percent")}
          >
            Change (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${priceChangeMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setPriceChangeMode("amount")}
          >
            Change ($)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {priceChangeMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">Price change (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Example: 2 means +2%.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Price change ($ / unit)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={priceChangeAmount}
                onChange={(e) => setPriceChangeAmount(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Absolute price change per unit.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">New price ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.p1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost change</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costChangeMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostChangeMode("percent")}
          >
            Change (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${costChangeMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setCostChangeMode("amount")}
          >
            Change ($)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {costChangeMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">Cost change (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={costChangePct}
                onChange={(e) => setCostChangePct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Example: 8 means +8%.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Cost change ($ / unit)</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={costChangeAmount}
                onChange={(e) => setCostChangeAmount(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Absolute cost change per unit.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">New cost ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Before</p>
            <p className="text-sm">
              Revenue: <strong>${money0(r.revenue0)}</strong>
              <br />
              COGS: <strong>${money0(r.cogs0)}</strong>
              <br />
              Gross margin: <strong>${money0(r.gm0)}</strong> ({pct2(r.gmPct0)})
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">After</p>
            <p className="text-sm">
              Revenue: <strong>${money0(r.revenue1)}</strong>
              <br />
              COGS: <strong>${money0(r.cogs1)}</strong>
              <br />
              Gross margin: <strong>${money0(r.gm1)}</strong> ({pct2(r.gmPct1)})
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Compression</p>
          <p className="text-sm">
            Margin compression: <strong>{pp2(r.compressionPP)}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            “pp” = percentage points (difference between two percentages).
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Revenue = price × units.</li>
          <li>COGS = unit cost × units.</li>
          <li>Gross margin $ = revenue − COGS.</li>
          <li>Gross margin % = gross margin ÷ revenue.</li>
          <li>Compression = margin% after − margin% before (pp).</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is gross margin the same as operating margin?</span>
            <br />
            No. Operating margin includes fixed operating expenses. Use the contribution margin tool for break-even and operating profit.
          </p>
          <p>
            <span className="font-medium">What if price decreases but costs increase?</span>
            <br />
            This tool handles it — compression will be more negative and gross margin may turn negative.
          </p>
        </div>
      </div>
    </div>
  );
}
