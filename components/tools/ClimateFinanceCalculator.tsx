"use client";

import { useMemo, useState } from "react";

function clampNumber(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function ClimateFinanceCalculator() {
  const [projectCost, setProjectCost] = useState<number>(10000000);
  const [years, setYears] = useState<number>(10);
  const [annualImpact, setAnnualImpact] = useState<number>(800000);

  const result = useMemo(() => {
    const cost = Math.max(0, clampNumber(projectCost));
    const y = Math.max(0, clampNumber(years));
    const impact = Math.max(0, clampNumber(annualImpact));

    const annualized = y > 0 ? cost / y : 0;
    const paybackYears = impact > 0 ? cost / impact : null;

    return {
      cost,
      years: y,
      impact,
      annualized,
      paybackYears,
    };
  }, [projectCost, years, annualImpact]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate total climate finance needed, annualized finance, and a simple payback estimate based on expected
        annual financial impact (savings or profit).
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Total Project Cost ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={projectCost}
            onChange={(e) => setProjectCost(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Total capital required for the climate project (mitigation/adaptation/transition).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Project Timeframe (years)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Used to compute an annualized finance figure (cost per year).
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Expected Annual Financial Impact ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualImpact}
            onChange={(e) => setAnnualImpact(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Annual savings or profit attributable to the project (used for a simple payback estimate).
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This is a simple planning tool. Real climate finance structures may include blended finance, grants,
          concessional loans, and policy constraints.
        </p>

        <p className="font-semibold">Total Climate Finance Needed: ${result.cost.toLocaleString()}</p>
        <p className="font-semibold">
          Annualized Finance: ${result.annualized.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {result.years > 0 ? " / year" : ""}
        </p>

        {result.paybackYears === null ? (
          <p className="text-sm opacity-80">
            Payback estimate is unavailable because annual financial impact is $0.
          </p>
        ) : (
          <p className="font-semibold">Estimated Payback: {result.paybackYears.toFixed(2)} years</p>
        )}

        <p className="text-sm opacity-80">
          Inputs — Cost: ${result.cost.toLocaleString()}, Timeframe: {result.years || 0} years, Annual impact: $
          {result.impact.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
