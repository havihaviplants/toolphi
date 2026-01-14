"use client";

import { useMemo, useState } from "react";

type Mode = "units" | "value";

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

export default function InventoryCostInflationCarryingCostCalculator() {
  const [mode, setMode] = useState<Mode>("units");

  // Units mode
  const [avgUnits, setAvgUnits] = useState<number>(50000);
  const [unitCost, setUnitCost] = useState<number>(8);

  // Value mode
  const [inventoryValue, setInventoryValue] = useState<number>(400000);

  // Common
  const [costIncreasePct, setCostIncreasePct] = useState<number>(12);
  const [carryingCostRatePct, setCarryingCostRatePct] = useState<number>(22);

  const r = useMemo(() => {
    const inc = n(costIncreasePct) / 100;
    const rate = n(carryingCostRatePct) / 100;

    const units = clampMin(avgUnits, 0);
    const c0 = clampMin(unitCost, 0);
    const baseValueInput = clampMin(inventoryValue, 0);

    const invValue0 =
      mode === "units" ? units * c0 : baseValueInput;

    const invValue1 = invValue0 * (1 + inc);

    const carry0 = invValue0 * rate;
    const carry1 = invValue1 * rate;

    const deltaInv = invValue1 - invValue0;
    const deltaCarry = carry1 - carry0;

    let note =
      "Inventory carrying cost is typically modeled as a percent of average inventory value. Cost inflation increases inventory value, which raises carrying costs.";
    if (rate < 0) note = "Carrying cost rate must be zero or positive.";
    if (mode === "units" && units <= 0)
      note = "Enter average inventory units to estimate inventory value.";
    if (mode === "units" && c0 <= 0)
      note = "Enter a unit cost greater than zero.";
    if (mode === "value" && baseValueInput <= 0)
      note = "Enter current inventory value to estimate carrying costs.";

    return {
      invValue0,
      invValue1,
      carry0,
      carry1,
      deltaInv,
      deltaCarry,
      rate,
      inc,
      note,
    };
  }, [mode, avgUnits, unitCost, inventoryValue, costIncreasePct, carryingCostRatePct]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how <strong>cost inflation</strong> increases <strong>annual inventory carrying costs</strong>{" "}
        (capital, storage, insurance, shrink) by raising the average inventory value.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Input mode</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm text-left ${
              mode === "units" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMode("units")}
          >
            <div className="font-medium">Use inventory units</div>
            <div className="text-xs opacity-80">
              Estimate inventory value from average units × unit cost.
            </div>
          </button>

          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm text-left ${
              mode === "value" ? "bg-black text-white" : ""
            }`}
            onClick={() => setMode("value")}
          >
            <div className="font-medium">Use inventory value</div>
            <div className="text-xs opacity-80">
              Enter current average inventory value directly.
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inventory inputs</div>

        {mode === "units" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Average inventory units</label>
              <input
                className="input"
                type="number"
                min={0}
                step="100"
                value={avgUnits}
                onChange={(e) => setAvgUnits(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Average units held in inventory.</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Unit cost (before) ($ / unit)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Landed/fully-loaded unit cost, if possible.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Average inventory value (before) ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="1000"
                value={inventoryValue}
                onChange={(e) => setInventoryValue(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Your current average inventory value.</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Cost inflation (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={costIncreasePct}
              onChange={(e) => setCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Assumes the average inventory cost rises by this percentage.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Annual carrying cost rate (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={carryingCostRatePct}
              onChange={(e) => setCarryingCostRatePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Typical carrying cost often ranges ~15–30% depending on business.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Inventory value</p>
            <p className="text-sm">
              Before: <strong>${money0(r.invValue0)}</strong>
              <br />
              After: <strong>${money0(r.invValue1)}</strong>
              <br />
              Change: <strong>{signedMoney0(r.deltaInv)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Annual carrying cost</p>
            <p className="text-sm">
              Before: <strong>${money0(r.carry0)}</strong>
              <br />
              After: <strong>${money0(r.carry1)}</strong>
              <br />
              Added carrying cost: <strong>{signedMoney0(r.deltaCarry)}</strong>
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Average inventory value increases with cost inflation.</li>
          <li>Annual carrying cost ≈ average inventory value × carrying cost rate.</li>
          <li>Added carrying cost = after − before.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What’s included in “carrying cost rate”?</span>
            <br />
            Common components: cost of capital/interest, warehousing, insurance, shrink/obsolescence, handling.
          </p>
          <p>
            <span className="font-medium">Is inflation applied to all inventory?</span>
            <br />
            This assumes your average inventory value rises proportionally. If only some inputs inflate, use a weighted inflation %.
          </p>
        </div>
      </div>
    </div>
  );
}
