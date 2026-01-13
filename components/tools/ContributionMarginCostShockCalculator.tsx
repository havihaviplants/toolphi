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
function num0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function ceil0(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return Math.ceil(x);
}

export default function ContributionMarginCostShockCalculator() {
  const [pricePerUnit, setPricePerUnit] = useState<number>(40);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(26);

  const [increaseMode, setIncreaseMode] = useState<"percent" | "amount">("percent");
  const [variableCostIncreasePct, setVariableCostIncreasePct] = useState<number>(8);
  const [variableCostIncreaseAmount, setVariableCostIncreaseAmount] = useState<number>(2.08);

  const [unitsSold, setUnitsSold] = useState<number>(20000);
  const [fixedCosts, setFixedCosts] = useState<number>(180000);

  const r = useMemo(() => {
    const p = clampMin(pricePerUnit, 0);
    const v0 = clampMin(variableCostPerUnit, 0);
    const q = clampMin(unitsSold, 0);
    const f = clampMin(fixedCosts, 0);

    const incPct = n(variableCostIncreasePct) / 100;
    const incAmt = clampMin(variableCostIncreaseAmount, 0);

    const v1 = increaseMode === "percent" ? v0 * (1 + incPct) : v0 + incAmt;

    const cm0 = p - v0;
    const cm1 = p - v1;

    const cmRatio0 = p > 0 ? cm0 / p : 0;
    const cmRatio1 = p > 0 ? cm1 / p : 0;

    const totalCM0 = cm0 * q;
    const totalCM1 = cm1 * q;

    const opProfit0 = totalCM0 - f;
    const opProfit1 = totalCM1 - f;

    const breakEvenUnits0 = cm0 > 0 ? f / cm0 : 0;
    const breakEvenUnits1 = cm1 > 0 ? f / cm1 : 0;

    const opProfitChange = opProfit1 - opProfit0;

    let note =
      "Contribution margin shows how much each unit contributes to covering fixed costs and generating profit.";
    if (q <= 0) note = "Enter units sold to see operating profit impact.";
    else if (cm0 <= 0) note = "Baseline contribution margin is zero or negative. Pricing or cost structure may be unsustainable.";
    else if (cm1 <= 0) note = "After the shock, contribution margin becomes zero or negative. Break-even volume is not meaningful without a price increase or cost reduction.";
    else if (opProfit1 < opProfit0) note = "Operating profit declines because variable costs increased.";
    else if (opProfit1 > opProfit0) note = "Operating profit increases (cost decreased or inputs changed).";

    return {
      v1,
      cm0,
      cm1,
      cmRatio0,
      cmRatio1,
      totalCM0,
      totalCM1,
      opProfit0,
      opProfit1,
      opProfitChange,
      breakEvenUnits0,
      breakEvenUnits1,
      note,
    };
  }, [
    pricePerUnit,
    variableCostPerUnit,
    increaseMode,
    variableCostIncreasePct,
    variableCostIncreaseAmount,
    unitsSold,
    fixedCosts,
  ]);

  const signedMoney0 = (v: number) => (v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`);
  const signedMoney2 = (v: number) => (v >= 0 ? `+$${money2(v)}` : `-$${money2(Math.abs(v))}`);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Measure how a <strong>variable cost increase</strong> affects your <strong>contribution margin</strong>,
        <strong> break-even units</strong>, and <strong>operating profit</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Unit economics</div>

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
            <p className="text-xs opacity-70 mt-1">Revenue per unit.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Variable cost ($ / unit)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Cost that scales with each unit produced/sold.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Variable cost shock</div>

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
              <label className="block text-sm font-medium">Variable cost increase (%)</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={variableCostIncreasePct}
                onChange={(e) => setVariableCostIncreasePct(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Example: 8 means +8%.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Variable cost increase ($ / unit)</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={variableCostIncreaseAmount}
                onChange={(e) => setVariableCostIncreaseAmount(Number(e.target.value))}
              />
              <p className="text-xs opacity-70 mt-1">Absolute increase per unit.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">New variable cost ($ / unit)</label>
            <input className="input" type="text" value={`$${money2(r.v1)}`} readOnly />
            <p className="text-xs opacity-70 mt-1">Calculated from the shock inputs.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Volume & fixed costs</div>

        <div className="grid gap-4 sm:grid-cols-2">
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
            <p className="text-xs opacity-70 mt-1">Units for the same period as fixed costs.</p>
          </div>

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
            <p className="text-xs opacity-70 mt-1">Rent, salaries, overhead for the same period.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Contribution margin</p>
            <p className="text-sm">
              CM/unit before: <strong>${money2(r.cm0)}</strong> ({pct2(r.cmRatio0 * 100)})
              <br />
              CM/unit after: <strong>${money2(r.cm1)}</strong> ({pct2(r.cmRatio1 * 100)})
              <br />
              Change: <strong>{signedMoney2(r.cm1 - r.cm0)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Break-even volume</p>
            <p className="text-sm">
              Break-even units (before): <strong>{num0(ceil0(r.breakEvenUnits0))}</strong>
              <br />
              Break-even units (after): <strong>{num0(ceil0(r.breakEvenUnits1))}</strong>
              <br />
              Increase needed: <strong>{num0(Math.max(0, ceil0(r.breakEvenUnits1 - r.breakEvenUnits0)))}</strong>
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Operating profit</p>
          <p className="text-sm">
            Operating profit before: <strong>${money0(r.opProfit0)}</strong>
            <br />
            Operating profit after: <strong>${money0(r.opProfit1)}</strong>
            <br />
            Change: <strong>{signedMoney0(r.opProfitChange)}</strong>
          </p>
        </div>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Contribution margin per unit = price − variable cost.</li>
          <li>Total contribution margin = CM/unit × units sold.</li>
          <li>Operating profit = total CM − fixed costs.</li>
          <li>Break-even units = fixed costs ÷ CM/unit.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Is this the same as gross margin?</span>
            <br />
            Not exactly. Gross margin often includes some semi-fixed costs. Contribution margin focuses on variable costs to link directly to break-even.
          </p>
          <p>
            <span className="font-medium">What if sales volume changes when prices change?</span>
            <br />
            This tool assumes price is unchanged and volume is fixed. Use pricing + elasticity tools to model demand effects.
          </p>
        </div>
      </div>
    </div>
  );
}
