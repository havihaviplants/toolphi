"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function clampMin(v: number, min: number) {
  return Math.max(min, n(v));
}
function money0(v: number) {
  return clampMin(v, 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct2(v: number) {
  return `${(clampMin(v, 0) * 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export default function InputCostIncreaseBreakEvenCalculator() {
  const [annualRevenue, setAnnualRevenue] = useState(2000000);
  const [inputCosts, setInputCosts] = useState(1500000);
  const [currentProfit, setCurrentProfit] = useState(200000);

  const r = useMemo(() => {
    const rev = clampMin(annualRevenue, 0);
    const costs = clampMin(inputCosts, 0);
    const profit = clampMin(currentProfit, 0);

    const breakEvenIncreaseAmount = profit;
    const breakEvenIncreasePct =
      costs > 0 ? profit / costs : 0;

    const note =
      profit <= 0
        ? "Profit is already zero or negative."
        : "This is the maximum cost increase you can absorb without raising prices.";

    return {
      breakEvenIncreaseAmount,
      breakEvenIncreasePct,
      note,
    };
  }, [annualRevenue, inputCosts, currentProfit]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Find the <strong>maximum input cost increase</strong> your business can
        absorb before profit drops to zero.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Current financials</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              step="10000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Total input costs ($)</label>
            <input
              className="input"
              type="number"
              step="10000"
              value={inputCosts}
              onChange={(e) => setInputCosts(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Current profit ($)</label>
            <input
              className="input"
              type="number"
              step="5000"
              value={currentProfit}
              onChange={(e) => setCurrentProfit(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Break-even result</div>

        <p className="text-sm">
          Break-even input cost increase:
          <br />
          <strong>${money0(r.breakEvenIncreaseAmount)}</strong>
        </p>

        <p className="text-sm">
          Break-even increase as % of current input costs:
          <br />
          <strong>{pct2(r.breakEvenIncreasePct)}</strong>
        </p>

        <p className="text-sm opacity-80">{r.note}</p>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Profit acts as a buffer against cost increases.</li>
          <li>Once cost increases exceed current profit, profit becomes zero.</li>
          <li>This calculator isolates cost impact without price changes.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Does this include fixed vs variable costs?</span>
            <br />
            No—use total input costs as an aggregate for quick analysis.
          </p>
          <p>
            <span className="font-medium">What if I raise prices?</span>
            <br />
            This tool assumes no price increase. Combine it with pricing tools to test mitigation.
          </p>
        </div>
      </div>
    </div>
  );
}
