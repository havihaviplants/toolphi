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
function ceilSafe(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  return Math.ceil(v);
}

export default function MaterialCostBreakEvenShiftCalculator() {
  // Unit economics
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState<number>(30);
  const [materialCostPerUnit, setMaterialCostPerUnit] = useState<number>(9);
  const [otherUnitCosts, setOtherUnitCosts] = useState<number>(12);

  // Fixed costs
  const [fixedCosts, setFixedCosts] = useState<number>(240000);

  // Material change
  const [changeMode, setChangeMode] = useState<"percent" | "amount">("percent");
  const [materialChangePct, setMaterialChangePct] = useState<number>(15);
  const [materialChangeAmount, setMaterialChangeAmount] = useState<number>(1.25);

  const r = useMemo(() => {
    const price = clampMin(sellingPricePerUnit, 0);
    const mat = clampMin(materialCostPerUnit, 0);
    const other = clampMin(otherUnitCosts, 0);
    const fixed = clampMin(fixedCosts, 0);

    const pct = n(materialChangePct);
    const amt = n(materialChangeAmount);

    const newMat =
      changeMode === "percent" ? mat * (1 + pct / 100) : Math.max(0, mat + amt);

    const currentUnitCost = mat + other;
    const newUnitCost = newMat + other;

    const currentContribution = price - currentUnitCost;
    const newContribution = price - newUnitCost;

    const currentBreakEvenUnits =
      currentContribution > 0 ? fixed / currentContribution : Infinity;
    const newBreakEvenUnits =
      newContribution > 0 ? fixed / newContribution : Infinity;

    const currentBreakEvenRevenue =
      Number.isFinite(currentBreakEvenUnits) ? currentBreakEvenUnits * price : Infinity;
    const newBreakEvenRevenue =
      Number.isFinite(newBreakEvenUnits) ? newBreakEvenUnits * price : Infinity;

    const deltaUnits =
      Number.isFinite(currentBreakEvenUnits) && Number.isFinite(newBreakEvenUnits)
        ? newBreakEvenUnits - currentBreakEvenUnits
        : Infinity;

    const deltaRevenue =
      Number.isFinite(currentBreakEvenRevenue) && Number.isFinite(newBreakEvenRevenue)
        ? newBreakEvenRevenue - currentBreakEvenRevenue
        : Infinity;

    // Target price to keep original break-even units after material increase
    // Want: fixed / (P - newUnitCost) = currentBE => P = newUnitCost + fixed/currentBE
    const targetPriceToKeepBE =
      Number.isFinite(currentBreakEvenUnits) && currentBreakEvenUnits > 0
        ? newUnitCost + fixed / currentBreakEvenUnits
        : price;

    const requiredPriceIncrease =
      Math.max(0, targetPriceToKeepBE - price);
    const requiredPriceIncreasePct =
      price > 0 ? (requiredPriceIncrease / price) * 100 : 0;

    const note =
      price <= 0
        ? "Enter a selling price per unit to compute break-even."
        : fixed <= 0
        ? "Fixed costs are 0, so break-even is effectively immediate."
        : currentContribution <= 0
        ? "Your current contribution margin is not positive. Break-even is not reachable with these inputs."
        : newContribution <= 0
        ? "After the material cost change, contribution margin becomes non-positive. Break-even becomes unreachable unless price increases or costs drop."
        : "Tip: Break-even shifts are very sensitive when contribution margin is small—double-check unit cost inputs.";

    return {
      price,
      mat,
      other,
      fixed,
      newMat,
      currentUnitCost,
      newUnitCost,
      currentContribution,
      newContribution,
      currentBreakEvenUnits,
      newBreakEvenUnits,
      currentBreakEvenRevenue,
      newBreakEvenRevenue,
      deltaUnits,
      deltaRevenue,
      targetPriceToKeepBE,
      requiredPriceIncrease,
      requiredPriceIncreasePct,
      note,
    };
  }, [
    sellingPricePerUnit,
    materialCostPerUnit,
    otherUnitCosts,
    fixedCosts,
    changeMode,
    materialChangePct,
    materialChangeAmount,
  ]);

  const fmtUnits = (v: number) =>
    Number.isFinite(v) ? ceilSafe(v).toLocaleString("en-US") : "Not reachable";

  const fmtMoney0 = (v: number) =>
    Number.isFinite(v) ? `$${money0(v)}` : "Not reachable";

  const fmtDeltaUnits = (v: number) =>
    Number.isFinite(v) ? `${ceilSafe(v).toLocaleString("en-US")} units` : "N/A";

  const fmtDeltaMoney = (v: number) =>
    Number.isFinite(v) ? `$${money0(v)}` : "N/A";

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how a <strong>material cost change</strong> shifts your{" "}
        <strong>break-even volume</strong> and <strong>break-even revenue</strong>, based on
        fixed costs and unit economics.
      </p>

      {/* Inputs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Unit economics</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Selling price per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={sellingPricePerUnit}
              onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Average realized selling price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Material cost per unit ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={materialCostPerUnit}
              onChange={(e) => setMaterialCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Raw materials or input cost per unit.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Other unit costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={otherUnitCosts}
              onChange={(e) => setOtherUnitCosts(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Labor, overhead, logistics, and other variable costs per unit.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Fixed costs</div>

        <div>
          <label className="block text-sm font-medium">Fixed costs ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1000"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Enter fixed costs over the same period you care about (monthly or annual). Results use the same period.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Material cost change</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${changeMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setChangeMode("percent")}
          >
            Percent
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${changeMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setChangeMode("amount")}
          >
            Amount
          </button>
        </div>

        {changeMode === "percent" ? (
          <div>
            <label className="block text-sm font-medium">Material cost change (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={materialChangePct}
              onChange={(e) => setMaterialChangePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Use negative values for cost declines.</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Material cost change ($ per unit)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={materialChangeAmount}
              onChange={(e) => setMaterialChangeAmount(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Example: +1.25 means materials cost $1.25 more per unit.</p>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Break-even shift results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Contribution margin</p>
            <p className="text-sm">
              Current: <strong>${money2(r.currentContribution)}</strong>
              <br />
              New: <strong>${money2(r.newContribution)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Material cost per unit</p>
            <p className="text-sm">
              Current: <strong>${money2(r.mat)}</strong>
              <br />
              New: <strong>${money2(r.newMat)}</strong>
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Break-even units</p>
            <p className="text-sm">
              Current: <strong>{fmtUnits(r.currentBreakEvenUnits)}</strong>
              <br />
              New: <strong>{fmtUnits(r.newBreakEvenUnits)}</strong>
              <br />
              Change: <strong>{fmtDeltaUnits(r.deltaUnits)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Break-even revenue</p>
            <p className="text-sm">
              Current: <strong>{fmtMoney0(r.currentBreakEvenRevenue)}</strong>
              <br />
              New: <strong>{fmtMoney0(r.newBreakEvenRevenue)}</strong>
              <br />
              Change: <strong>{fmtDeltaMoney(r.deltaRevenue)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Price needed to keep original break-even (simple)</p>
          <p className="text-sm">
            Target price per unit: <strong>${money2(r.targetPriceToKeepBE)}</strong>
            <br />
            Required price increase: <strong>${money2(r.requiredPriceIncrease)}</strong> (
            <strong>{pct2(r.requiredPriceIncreasePct)}</strong>)
          </p>
          <p className="text-xs opacity-70 mt-1">
            This holds break-even units constant (not margin). Useful for “how much price increase prevents BE volume blow-up.”
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Contribution margin = selling price − (material cost + other unit costs).</li>
          <li>Break-even units = fixed costs ÷ contribution margin.</li>
          <li>Break-even revenue = break-even units × selling price.</li>
          <li>“Target price” keeps the original break-even units after material costs change.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why can break-even become “Not reachable”?</span>
            <br />
            If contribution margin is zero or negative, each unit doesn’t contribute to fixed costs, so break-even can’t be reached.
          </p>
          <p>
            <span className="font-medium">Should fixed costs be monthly or annual?</span>
            <br />
            Either is fine—just keep the unit volume and fixed cost period consistent for interpretation.
          </p>
        </div>
      </div>
    </div>
  );
}
