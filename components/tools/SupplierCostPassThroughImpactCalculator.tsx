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

export default function SupplierCostPassThroughImpactCalculator() {
  const [pricePerUnit, setPricePerUnit] = useState<number>(50);
  const [costPerUnit, setCostPerUnit] = useState<number>(30);

  const [supplierCostIncreasePct, setSupplierCostIncreasePct] = useState<number>(10);
  const [passThroughPct, setPassThroughPct] = useState<number>(60);

  const [unitsSold, setUnitsSold] = useState<number>(10000);

  const r = useMemo(() => {
    const p0 = clampMin(pricePerUnit, 0);
    const c0 = clampMin(costPerUnit, 0);

    const inc = n(supplierCostIncreasePct) / 100;
    const pass = clamp(passThroughPct, 0, 200) / 100; // allow >100% (over-pass-through)

    const units = clampMin(unitsSold, 0);

    const newCost = c0 * (1 + inc);
    const costIncreaseAmt = newCost - c0;

    const passThroughAmt = costIncreaseAmt * pass;
    const newPrice = p0 + passThroughAmt;

    const marginBefore = p0 - c0;
    const marginAfter = newPrice - newCost;

    const marginChange = marginAfter - marginBefore;

    const totalProfitBefore = marginBefore * units;
    const totalProfitAfter = marginAfter * units;
    const totalProfitChange = totalProfitAfter - totalProfitBefore;

    const marginPctBefore = p0 > 0 ? (marginBefore / p0) * 100 : 0;
    const marginPctAfter = newPrice > 0 ? (marginAfter / newPrice) * 100 : 0;

    let note = "Pass-through rate controls how much of the supplier increase is recovered via price.";
    if (units <= 0) note = "Enter units sold to estimate total profit impact.";
    else if (marginAfter < 0) note = "After the shock, you lose money per unit. Consider higher pass-through or cost reductions.";
    else if (marginAfter < marginBefore) note = "Margin compresses. You’re absorbing part of the shock.";
    else if (marginAfter > marginBefore) note = "Margin expands. This is over-pass-through (raising price more than the cost shock).";

    return {
      newCost,
      newPrice,
      costIncreaseAmt,
      passThroughAmt,
      marginBefore,
      marginAfter,
      marginChange,
      marginPctBefore,
      marginPctAfter,
      totalProfitChange,
      note,
    };
  }, [pricePerUnit, costPerUnit, supplierCostIncreasePct, passThroughPct, unitsSold]);

  const signedMoney2 = (v: number) => (v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`);
  const signedMoney0 = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Model how supplier cost increases impact your unit margin when you pass through
        part of the shock to customers via price changes.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Baseline unit economics</div>

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
            <p className="text-xs opacity-70 mt-1">Your current price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Unit cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current cost per unit before the supplier change.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Supplier shock & pass-through</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Supplier cost increase (%)</label>
            <input
              className="input"
              type="number"
              step="0.5"
              value={supplierCostIncreasePct}
              onChange={(e) => setSupplierCostIncreasePct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">How much your supplier raises costs.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Pass-through rate (%)</label>
            <input
              className="input"
              type="number"
              step="1"
              value={passThroughPct}
              onChange={(e) => setPassThroughPct(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              0% = you absorb all. 100% = you recover the full cost increase. &gt;100% = over-pass-through.
            </p>
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
        </div>

        <p className="text-xs opacity-70">
          Cost increase per unit: <strong>${money2(r.costIncreaseAmt)}</strong> · Pass-through per unit:{" "}
          <strong>${money2(r.passThroughAmt)}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Before</p>
            <p className="text-sm">
              Price: <strong>${money2(pricePerUnit)}</strong>
              <br />
              Cost: <strong>${money2(costPerUnit)}</strong>
              <br />
              Margin: <strong>${money2(r.marginBefore)}</strong> ({pct2(r.marginPctBefore)})
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">After</p>
            <p className="text-sm">
              New price: <strong>${money2(r.newPrice)}</strong>
              <br />
              New cost: <strong>${money2(r.newCost)}</strong>
              <br />
              Margin: <strong>${money2(r.marginAfter)}</strong> ({pct2(r.marginPctAfter)})
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Impact</p>
          <p className="text-sm">
            Margin change per unit: <strong>{signedMoney2(r.marginChange)}</strong>
            <br />
            Total profit change: <strong>{signedMoney0(r.totalProfitChange)}</strong>
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New cost = old cost × (1 + supplier increase%).</li>
          <li>Cost increase/unit = new cost − old cost.</li>
          <li>Pass-through amount = cost increase × pass-through rate.</li>
          <li>New price = old price + pass-through amount.</li>
          <li>New margin = new price − new cost.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Can pass-through exceed 100%?</span>
            <br />
            Yes. Some businesses raise prices more than the cost shock (over-pass-through), but demand may drop.
          </p>
          <p>
            <span className="font-medium">Does this model demand changes?</span>
            <br />
            No. It assumes units sold stay constant. Combine with elasticity tools if you want volume effects.
          </p>
        </div>
      </div>
    </div>
  );
}
