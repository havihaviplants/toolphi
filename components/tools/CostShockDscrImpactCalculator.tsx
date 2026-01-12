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
function num2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct2(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return `${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function CostShockDscrImpactCalculator() {
  const [annualRevenue, setAnnualRevenue] = useState<number>(4000000);
  const [operatingCosts, setOperatingCosts] = useState<number>(3200000);
  const [annualDebtService, setAnnualDebtService] = useState<number>(500000);
  const [costIncreasePct, setCostIncreasePct] = useState<number>(10);

  const r = useMemo(() => {
    const rev = clampMin(annualRevenue, 0);
    const cost = clampMin(operatingCosts, 0);
    const debt = clampMin(annualDebtService, 0);
    const inc = n(costIncreasePct) / 100;

    const baselineEbitda = rev - cost;
    const baselineDscr = debt > 0 ? baselineEbitda / debt : 0;

    const newOperatingCost = cost * (1 + inc);
    const newEbitda = rev - newOperatingCost;
    const newDscr = debt > 0 ? newEbitda / debt : 0;

    let riskLabel = "Low";
    if (newDscr < 1.0) riskLabel = "Severe (Covenant Breach Likely)";
    else if (newDscr < 1.2) riskLabel = "High";
    else if (newDscr < 1.4) riskLabel = "Moderate";

    const ebitdaChange = newEbitda - baselineEbitda;
    const dscrChange = newDscr - baselineDscr;

    return {
      baselineEbitda,
      baselineDscr,
      newOperatingCost,
      newEbitda,
      newDscr,
      riskLabel,
      ebitdaChange,
      dscrChange,
    };
  }, [annualRevenue, operatingCosts, annualDebtService, costIncreasePct]);

  const signedMoney0 = (v: number) =>
    v >= 0 ? `+$${money0(v)}` : `-$${money0(Math.abs(v))}`;

  const signedNum2 = (v: number) =>
    v >= 0 ? `+${num2(v)}` : `-${num2(Math.abs(v))}`;

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Stress-test how an <strong>operating cost shock</strong> impacts EBITDA,
        DSCR, and <strong>loan covenant risk</strong>.
      </p>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Baseline financials</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Annual revenue ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Operating costs ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="10000"
              value={operatingCosts}
              onChange={(e) => setOperatingCosts(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Annual debt service ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="5000"
              value={annualDebtService}
              onChange={(e) => setAnnualDebtService(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">
              Principal + interest due annually.
            </p>
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
              Expected increase in operating costs.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Results</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">Baseline</p>
            <p className="text-sm">
              EBITDA: <strong>${money0(r.baselineEbitda)}</strong>
              <br />
              DSCR: <strong>{num2(r.baselineDscr)}</strong>
            </p>
          </div>

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-sm opacity-70">After cost shock</p>
            <p className="text-sm">
              Operating cost: <strong>${money0(r.newOperatingCost)}</strong>
              <br />
              EBITDA: <strong>${money0(r.newEbitda)}</strong> (
              <strong>{signedMoney0(r.ebitdaChange)}</strong>)
              <br />
              DSCR: <strong>{num2(r.newDscr)}</strong> (
              <strong>{signedNum2(r.dscrChange)}</strong>)
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-1">
          <p className="text-sm opacity-70">Risk assessment</p>
          <p className="text-sm">
            Risk level: <strong>{r.riskLabel}</strong>
          </p>
          <p className="text-xs opacity-70 mt-1">
            DSCR &lt; 1.0 usually implies cash flow is insufficient to cover debt service.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>EBITDA = revenue − operating costs.</li>
          <li>DSCR = EBITDA ÷ annual debt service.</li>
          <li>Cost shock increases operating costs and reduces EBITDA.</li>
          <li>Lower DSCR increases covenant breach and refinancing risk.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What DSCR do lenders usually require?</span>
            <br />
            Many commercial loans require 1.20–1.30 minimum, but it varies by lender and industry.
          </p>
          <p>
            <span className="font-medium">Does this include revenue changes?</span>
            <br />
            No—this tool isolates cost shocks. Pair it with revenue stress tests for full downside analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
