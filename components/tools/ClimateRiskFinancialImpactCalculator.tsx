"use client";

import { useMemo, useState } from "react";

function clamp(v: number) {
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

function clampPct(v: number) {
  const n = clamp(v);
  return Math.min(100, n);
}

export default function ClimateRiskFinancialImpactCalculator() {
  const [exposedRevenue, setExposedRevenue] = useState<number>(50000000);
  const [probabilityPct, setProbabilityPct] = useState<number>(12);
  const [severityPct, setSeverityPct] = useState<number>(18);

  const result = useMemo(() => {
    const revenue = clamp(exposedRevenue);
    const p = clampPct(probabilityPct) / 100;
    const s = clampPct(severityPct) / 100;

    const scenarioLoss = revenue * s; // if disruption occurs
    const expectedAnnualLoss = revenue * p * s;

    return {
      revenue,
      probabilityPct: clampPct(probabilityPct),
      severityPct: clampPct(severityPct),
      scenarioLoss,
      expectedAnnualLoss,
    };
  }, [exposedRevenue, probabilityPct, severityPct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the expected annual financial loss from climate risk using a simple exposure model:
        exposed revenue × probability of disruption × loss severity.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Exposed Revenue ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={exposedRevenue}
            onChange={(e) => setExposedRevenue(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Portion of revenue that is meaningfully exposed (sites, suppliers, logistics, demand).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Probability of Disruption (per year, %)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={probabilityPct}
            onChange={(e) => setProbabilityPct(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Estimated chance of a climate-related disruption occurring within a year.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Loss Severity (if disruption occurs, %)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={severityPct}
            onChange={(e) => setSeverityPct(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Percentage of exposed revenue lost if the disruption event happens.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Model — Expected annual loss = Exposed revenue × Probability × Severity.
        </p>

        <p className="font-semibold">
          Scenario Loss (if event occurs): $
          {result.scenarioLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="font-semibold text-lg">
          Expected Annual Loss: $
          {result.expectedAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="text-sm opacity-80">
          Inputs — Revenue: ${result.revenue.toLocaleString()}, Probability: {result.probabilityPct.toFixed(2)}%,
          Severity: {result.severityPct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
