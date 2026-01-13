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
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function PriceIncreaseNeededToMaintainMarginCalculator() {
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [currentCost, setCurrentCost] = useState<number>(65);

  const [increaseMode, setIncreaseMode] = useState<"percent" | "amount">("percent");
  const [costIncreasePct, setCostIncreasePct] = useState<number>(8);
  const [costIncreaseAmount, setCostIncreaseAmount] = useState<number>(5.2);

  const [useCustomTarget, setUseCustomTarget] = useState<boolean>(false);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(35);

  const r = useMemo(() => {
    const p0 = clampMin(currentPrice, 0);
    const c0 = clampMin(currentCost, 0);

    const incPct = n(costIncreasePct) / 100;
    const incAmt = clampMin(costIncreaseAmount, 0);

    const c1 = increaseMode === "percent" ? c0 * (1 + incPct) : c0 + incAmt;

    const currentMarginPct = p0 > 0 ? ((p0 - c0) / p0) * 100 : 0;

    const targetPct = useCustomTarget ? clamp(targetMarginPct, -100, 99.9) : currentMarginPct;
    const target = targetPct / 100;

    // Required price to achieve target gross margin:
    // margin% = (price - cost)/price = 1 - cost/price  => price = cost / (1 - margin%)
    const denom = 1 - target;
    const requiredPrice = denom !== 0 ? c1 / denom : Infinity;

    const increaseAmountReq = requiredPrice - p0;
    const increasePctReq = p0 > 0 ? (increaseAmountReq / p0) * 100 : 0;

    const profitBefore = p0 - c0;
    const profitAfterIfNoPriceChange = p0 - c1;
    const profitAtRequiredPrice = requiredPrice - c1;

    let note =
      "This assumes: required price is calculated to hit the target gross margin on the new cost.";
    if (p0 <= 0) note = "Enter a current price greater than zero to compute a meaningful required increase.";
    else if (!Number.isFinite(requiredPrice) || requiredPrice < 0) note = "Target margin is not feasible with the given inputs.";
    else if (requiredPrice < p0) note = "Required price is lower than current price (cost decreased or target margin is lower).";
    else if (profitAfterIfNoPriceChange < 0) note = "Without a price increase, you lose money per unit after the cost shock.";

    return {
      c1,
      currentMarginPct,
      targetPct,
      requiredPrice,
      increaseAmountReq,
      increasePctReq,
      profitBefore,
      profitAfterIfNoPriceChange,
      profitAtRequiredPrice,
      note,
    };
  }, [
    currentPrice,
    currentCost,
    increaseMode,
    costIncreasePct,
    costIncreaseAmount,
    useCustomTarget,
    targetMarginPct,
  ]);

  const signedMoney2 = (v: number) => (v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Find the <strong>required price increase</strong> to maintain a target gross margin after unit costs increase.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Current unit economics</div>

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
            <p className="text-xs opacity-70 mt-1">Your current selling price per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Current cost (COGS) ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={currentCost}
              onChange={(e) => setCurrentCost(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Your current unit cost before the increase.</p>
          </div>
        </div>

        <p className="text-xs opacity-70">
          Current gross margin: <strong>{pct2(r.currentMarginPct)}</strong>
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Cost increase</div>

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
            <label className="block text-sm font-medium">New cost ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.c1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated after the increase.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Target gross margin</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useCustomTarget}
              onChange={(e) => setUseCustomTarget(e.target.checked)}
            />
            Set custom target
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Target gross margin (%)</label>
            <input
              className="input"
              type="number"
              step="0.25"
              value={useCustomTarget ? targetMarginPct : r.currentMarginPct}
              onChange={(e) => setTargetMarginPct(Number(e.target.value))}
              disabled={!useCustomTarget}
            />
            <p className="text-xs opacity-70 mt-1">
              If disabled, this defaults to your current margin ({pct2(r.currentMarginPct)}).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        {!Number.isFinite(r.requiredPrice) || r.requiredPrice < 0 ? (
          <p className="text-sm opacity-80">
            Target margin is not feasible with the given inputs. Try lowering the target margin.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Required pricing</p>
                <p className="text-sm">
                  Required new price: <strong>${money2(r.requiredPrice)}</strong>
                  <br />
                  Price change: <strong>{signedMoney2(r.increaseAmountReq)}</strong>
                  <br />
                  Price change (%): <strong>{pct2(r.increasePctReq)}</strong>
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-sm opacity-70">Profit per unit</p>
                <p className="text-sm">
                  Before: <strong>${money2(r.profitBefore)}</strong>
                  <br />
                  After (no price change): <strong>${money2(r.profitAfterIfNoPriceChange)}</strong>
                  <br />
                  At required price: <strong>${money2(r.profitAtRequiredPrice)}</strong>
                </p>
              </div>
            </div>
          </>
        )}

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Target gross margin% = (price − cost) / price.</li>
          <li>Rearrange to solve for price: <strong>price = cost / (1 − margin%)</strong>.</li>
          <li>Required increase = required price − current price.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why can the required price jump a lot?</span>
            <br />
            Because margin% is defined over price. Maintaining high margins under rising costs can require outsized price moves.
          </p>
          <p>
            <span className="font-medium">Does this include demand drop from higher prices?</span>
            <br />
            No. It’s a unit-economics requirement. Combine with elasticity tools to model volume changes.
          </p>
        </div>
      </div>
    </div>
  );
}
