"use client";

import { useMemo, useState } from "react";

function clamp(v: number) {
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

export default function TcfdReportingCostEstimator() {
  const [revenue, setRevenue] = useState<number>(500000000);
  const [complexity, setComplexity] = useState<number>(1); // 1=low,2=mid,3=high
  const [consultingCost, setConsultingCost] = useState<number>(180000);

  const result = useMemo(() => {
    const rev = clamp(revenue);
    const consult = clamp(consultingCost);

    // Internal cost heuristic based on revenue & complexity
    const baseInternalRate = 0.00015; // 0.015%
    const complexityMultiplier = complexity === 1 ? 0.7 : complexity === 2 ? 1 : 1.4;

    const internalCost = rev * baseInternalRate * complexityMultiplier;
    const totalCost = internalCost + consult;

    return {
      internalCost,
      consult,
      totalCost,
      complexityLabel:
        complexity === 1 ? "Low" : complexity === 2 ? "Moderate" : "High"
    };
  }, [revenue, complexity, consultingCost]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the cost of preparing a TCFD report, including internal resource
        costs and optional external consulting fees.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Company Revenue ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Used to approximate internal reporting and governance costs.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Reporting Complexity</label>
          <select
            className="input"
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
          >
            <option value={1}>Low (basic disclosure)</option>
            <option value={2}>Moderate (standard TCFD scope)</option>
            <option value={3}>High (group-level, scenario analysis)</option>
          </select>
          <p className="mt-1 text-xs opacity-70">
            Higher complexity increases internal coordination and analysis costs.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">External Consulting Cost ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={consultingCost}
            onChange={(e) => setConsultingCost(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Optional cost for consultants, auditors, or ESG advisory firms.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          Estimated Internal Reporting Cost: ${result.internalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="font-semibold">
          External Consulting Cost: ${result.consult.toLocaleString()}
        </p>
        <p className="font-semibold text-lg">
          Total Estimated TCFD Reporting Cost: ${result.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="text-sm opacity-80">
          Assumptions — Complexity: {result.complexityLabel}. Actual costs may vary by jurisdiction and reporting maturity.
        </p>
      </div>
    </div>
  );
}
