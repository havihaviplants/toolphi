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

export default function FixedPriceContractCostShockCalculator() {
  const [contractPricePerUnit, setContractPricePerUnit] = useState<number>(120);
  const [contractQuantity, setContractQuantity] = useState<number>(5000);

  const [baselineCostPerUnit, setBaselineCostPerUnit] = useState<number>(95);

  const [increaseMode, setIncreaseMode] = useState<"percent" | "amount">("percent");
  const [costIncreasePct, setCostIncreasePct] = useState<number>(8);
  const [costIncreaseAmount, setCostIncreaseAmount] = useState<number>(7.6);

  const r = useMemo(() => {
    const price = clampMin(contractPricePerUnit, 0);
    const qty = clampMin(contractQuantity, 0);
    const c0 = clampMin(baselineCostPerUnit, 0);

    const incPct = n(costIncreasePct) / 100;
    const incAmt = clampMin(costIncreaseAmount, 0);

    const c1 = increaseMode === "percent" ? c0 * (1 + incPct) : c0 + incAmt;

    const profitPerUnitBefore = price - c0;
    const profitPerUnitAfter = price - c1;

    const totalProfitBefore = profitPerUnitBefore * qty;
    const totalProfitAfter = profitPerUnitAfter * qty;
    const totalProfitChange = totalProfitAfter - totalProfitBefore;

    // Break-even shock: cost increase amount that makes profit/unit = 0
    const breakEvenCostIncreaseAmt = Math.max(0, price - c0); // if already negative, 0
    const breakEvenCostIncreasePct = c0 > 0 ? (breakEvenCostIncreaseAmt / c0) * 100 : 0;

    const isLossAfter = profitPerUnitAfter < 0;

    let note =
      "Fixed-price contracts are vulnerable to cost shocks because revenue per unit is locked.";
    if (qty <= 0) note = "Enter contract quantity to estimate total profit/loss.";
    else if (isLossAfter) note = "After the shock, you lose money per unit. Consider renegotiation, hedging, or scope change.";
    else if (profitPerUnitAfter < profitPerUnitBefore) note = "Margin compresses. You are absorbing the full cost shock.";
    else if (profitPerUnitAfter > profitPerUnitBefore) note = "Margin expands (cost decreased or inputs changed).";

    return {
      c1,
      profitPerUnitBefore,
      profitPerUnitAfter,
      totalProfitBefore,
      totalProfitAfter,
      totalProfitChange,
      breakEvenCostIncreaseAmt,
      breakEvenCostIncreasePct,
      note,
    };
  }, [
    contractPricePerUnit,
    contractQuantity,
    baselineCostPerUnit,
    increaseMode,
    costIncreasePct,
    costIncreaseAmount,
  ]);

  const signedMoney2 = (v: number) => (v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`);
  const signedMoney0 = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate profit or loss for a <strong>fixed-price contract</strong> when unit costs increase.
        This is a quick way to see <strong>margin compression</strong> and <strong>break-even cost shock</strong> limits.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Contract terms</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Fixed contract price ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={contractPricePerUnit}
              onChange={(e) => setContractPricePerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Revenue per unit is locked.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Contract quantity (units)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="100"
              value={contractQuantity}
              onChange={(e) => setContractQuantity(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Total units you must deliver.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Baseline unit cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={baselineCostPerUnit}
              onChange={(e) => setBaselineCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your expected cost before the shock.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost shock</div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${increaseMode === "percent" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setIncreaseMode("percent")}
          >
            Increase (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border text-sm ${increaseMode === "amount" ? "font-semibold" : "opacity-80"}`}
            onClick={() => setIncreaseMode("amount")}
          >
            Increase ($)
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {increaseMode === "percent" ? (
            <div>
              <label className="block text-sm font-medium">Cost increase (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={costIncreasePct}
                onChange={(e) => setCostIncreasePct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Example: 8 means +8%.</p>
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
            <label className="block text-sm font-medium">New unit cost ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated from the shock inputs.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Per-unit</p>
            <p className="text-sm">
              Profit/unit before: <strong>${money2(r.profitPerUnitBefore)}</strong>
              <br />
              Profit/unit after: <strong>${money2(r.profitPerUnitAfter)}</strong>
              <br />
              Change: <strong>{signedMoney2(r.profitPerUnitAfter - r.profitPerUnitBefore)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Total</p>
            <p className="text-sm">
              Total profit before: <strong>${money0(r.totalProfitBefore)}</strong>
              <br />
              Total profit after: <strong>${money0(r.totalProfitAfter)}</strong>
              <br />
              Total change: <strong>{signedMoney0(r.totalProfitChange)}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Break-even shock limit</p>
          <p className="text-sm">
            Max cost increase (per unit) to avoid losses:
            <br />
            <strong>${money2(r.breakEvenCostIncreaseAmt)}</strong> ({pct2(r.breakEvenCostIncreasePct)})
          </p>
          <p className="text-xs opacity-70 mt-1">
            If cost increases exceed this, profit per unit becomes negative under the fixed contract price.
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>New cost = baseline cost × (1 + % increase) or baseline cost + $ increase.</li>
          <li>Profit/unit = fixed price − unit cost.</li>
          <li>Total profit = profit/unit × contract quantity.</li>
          <li>Break-even cost shock limit occurs when profit/unit = 0.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this the same as “cost overrun”?</span>
            <br />
            It’s closely related. Overrun usually refers to actual costs exceeding plan; this tool models that effect under a fixed price.
          </p>
          <p>
            <span className="font-medium">What about change orders?</span>
            <br />
            This assumes no renegotiation. If you can renegotiate scope or price, use pass-through and contract escalation tools too.
          </p>
        </div>
      </div>
    </div>
  );
}
