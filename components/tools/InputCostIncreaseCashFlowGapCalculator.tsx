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

export default function InputCostIncreaseCashFlowGapCalculator() {
  const [annualUnitsSold, setAnnualUnitsSold] = useState<number>(600000);
  const [unitCost, setUnitCost] = useState<number>(8);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(12);

  // CCC components
  const [inventoryDays, setInventoryDays] = useState<number>(60); // DIO
  const [receivableDays, setReceivableDays] = useState<number>(30); // DSO
  const [payableDays, setPayableDays] = useState<number>(30); // DPO

  const r = useMemo(() => {
    const units = clampMin(annualUnitsSold, 0);
    const c0 = clampMin(unitCost, 0);
    const inc = n(costIncreasePct) / 100;
    const c1 = c0 * (1 + inc);

    const dio = clampMin(inventoryDays, 0);
    const dso = clampMin(receivableDays, 0);
    const dpo = clampMin(payableDays, 0);

    const ccc = dio + dso - dpo;

    const annualPurchases0 = units * c0;
    const annualPurchases1 = units * c1;

    const dailyPurchases0 = annualPurchases0 / 365;
    const dailyPurchases1 = annualPurchases1 / 365;

    // Simplified cash tied up estimate:
    // cash gap ≈ daily purchases × CCC
    // (This approximates the cash needed to fund the cycle, focusing on cost base.)
    const cashGap0 = dailyPurchases0 * ccc;
    const cashGap1 = dailyPurchases1 * ccc;

    const deltaCashGap = cashGap1 - cashGap0;

    // Additional diagnostics
    const dailyPurchasesDelta = dailyPurchases1 - dailyPurchases0;

    let note =
      "This is a simplified planning model using CCC (DIO + DSO − DPO). It estimates how higher input costs increase the cash you must fund across the cycle.";
    if (units <= 0) note = "Enter annual units sold to estimate purchase flows.";
    else if (c0 <= 0) note = "Enter a unit cost greater than zero.";
    else if (ccc < 0)
      note =
        "Your CCC is negative (you get paid before you pay suppliers). Cost increases may still raise purchases, but cash gap may behave differently.";
    else if (ccc === 0)
      note =
        "Your CCC is ~0 days. Cost increases mainly raise purchases but do not widen the timing gap in this model.";

    return {
      c1,
      ccc,
      annualPurchases0,
      annualPurchases1,
      dailyPurchases0,
      dailyPurchases1,
      cashGap0,
      cashGap1,
      deltaCashGap,
      dailyPurchasesDelta,
      note,
    };
  }, [
    annualUnitsSold,
    unitCost,
    costIncreasePct,
    inventoryDays,
    receivableDays,
    payableDays,
  ]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate how input cost inflation increases your <strong>cash flow gap</strong> using the{" "}
        <strong>cash conversion cycle (CCC)</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Inputs</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual units sold</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1000"
              value={annualUnitsSold}
              onChange={(e) => setAnnualUnitsSold(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Used to estimate annual purchases.</p>
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
            <p className="text-xs opacity-70 mt-1">
              New unit cost will be calculated.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Unit cost (after) ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cash conversion cycle (CCC)</div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Inventory days (DIO)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={inventoryDays}
              onChange={(e) => setInventoryDays(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Days inventory is held.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Receivable days (DSO)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={receivableDays}
              onChange={(e) => setReceivableDays(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Days to collect cash.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Payable days (DPO)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="1"
              value={payableDays}
              onChange={(e) => setPayableDays(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Days to pay suppliers.</p>
          </div>
        </div>

        <div className="text-sm opacity-80">
          CCC = DIO + DSO − DPO = <strong>{money0(r.ccc)}</strong> days
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Annual purchases</p>
            <p className="text-sm">
              Before: <strong>${money0(r.annualPurchases0)}</strong>
              <br />
              After: <strong>${money0(r.annualPurchases1)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Daily purchases</p>
            <p className="text-sm">
              Before: <strong>${money0(r.dailyPurchases0)}</strong> / day
              <br />
              After: <strong>${money0(r.dailyPurchases1)}</strong> / day
              <br />
              Change: <strong>{signedMoney0(r.dailyPurchasesDelta)}</strong> / day
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1 sm:col-span-2">
            <p className="text-sm opacity-70">Estimated cash flow gap (planning)</p>
            <p className="text-sm">
              Before: <strong>${money0(r.cashGap0)}</strong>
              <br />
              After: <strong>${money0(r.cashGap1)}</strong>
              <br />
              Added cash needed: <strong>{signedMoney0(r.deltaCashGap)}</strong>
            </p>
            <p className="text-xs opacity-70 mt-1">
              Approximation: cash gap ≈ daily purchases × CCC.
            </p>
          </div>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>CCC = DIO + DSO − DPO.</li>
          <li>Annual purchases = annual units sold × unit cost.</li>
          <li>Daily purchases = annual purchases ÷ 365.</li>
          <li>Cash gap ≈ daily purchases × CCC (planning estimate).</li>
          <li>Higher input costs increase daily purchases → larger cash gap.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this exact accounting?</span>
            <br />
            No—this is a simplified planning model to estimate added cash needs. Actual cash flow depends on payment schedules and inventory accounting.
          </p>
          <p>
            <span className="font-medium">What if CCC is negative?</span>
            <br />
            You may collect cash before paying suppliers. The model still shows purchase-cost increases, but your cash gap can be structurally different.
          </p>
        </div>
      </div>
    </div>
  );
}
