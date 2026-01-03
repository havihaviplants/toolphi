"use client";

import { useMemo, useState } from "react";

function clamp(v: number) {
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

function clampPct(v: number) {
  const n = clamp(v);
  return Math.min(100, n);
}

export default function ClimateChangeCostImpactEstimator() {
  const [exposedAnnualCosts, setExposedAnnualCosts] = useState<number>(12000000);
  const [probabilityPct, setProbabilityPct] = useState<number>(20);
  const [severityPct, setSeverityPct] = useState<number>(15);

  const result = useMemo(() => {
    const costs = clamp(exposedAnnualCosts);
    const p = clampPct(probabilityPct) / 100;
    const s = clampPct(severityPct) / 100;

    const scenarioCostImpact = costs * s; // if impact occurs
    const expectedAnnualCostImpact = costs * p * s;

    return {
      costs,
      probabilityPct: clampPct(probabilityPct),
      severityPct: clampPct(severityPct),
      scenarioCostImpact,
      expectedAnnualCostImpact,
    };
  }, [exposedAnnualCosts, probabilityPct, severityPct]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the expected annual cost impact from climate change using a simple exposure model:
        exposed cost base × probability × severity.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Exposed Costs ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={exposedAnnualCosts}
            onChange={(e) => setExposedAnnualCosts(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Portion of annual operating costs likely to be affected (energy, logistics, inputs, repairs, downtime).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Probability of Cost Impact (per year, %)</label>
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
            Estimated likelihood that climate conditions materially increase costs within a year.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Cost Increase Severity (if impact occurs, %)</label>
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
            Percent increase applied to exposed costs if the impact event occurs.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Model — Expected annual cost impact = Exposed costs × Probability × Severity.
        </p>

        <p className="font-semibold">
          Scenario Cost Impact (if occurs): $
          {result.scenarioCostImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="font-semibold text-lg">
          Expected Annual Cost Impact: $
          {result.expectedAnnualCostImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="text-sm opacity-80">
          Inputs — Exposed costs: ${result.costs.toLocaleString()}, Probability: {result.probabilityPct.toFixed(2)}%,
          Severity: {result.severityPct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
