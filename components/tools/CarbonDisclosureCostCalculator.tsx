"use client";

import { useMemo, useState } from "react";

function clamp(v: number) {
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

export default function CarbonDisclosureCostCalculator() {
  const [entities, setEntities] = useState<number>(5);
  const [sites, setSites] = useState<number>(20);
  const [scopeLevel, setScopeLevel] = useState<number>(3); // 2 = Scope 1+2, 3 = Scope 1+2+3
  const [externalFees, setExternalFees] = useState<number>(75000);

  const result = useMemo(() => {
    const e = clamp(entities);
    const s = clamp(sites);
    const ext = clamp(externalFees);

    // Heuristic internal effort model (simple + explainable)
    // - Base program cost
    // - Cost per entity (governance, consolidation)
    // - Cost per site (data collection, validation)
    // - Scope 3 multiplier (supply chain data is harder)
    const base = 25000;
    const perEntity = 8000 * e;
    const perSite = 1500 * s;
    const scopeMultiplier = scopeLevel === 2 ? 1 : 1.6;

    const internalCost = (base + perEntity + perSite) * scopeMultiplier;
    const totalCost = internalCost + ext;

    return {
      entities: e,
      sites: s,
      scopeLabel: scopeLevel === 2 ? "Scope 1 + 2" : "Scope 1 + 2 + 3",
      internalCost,
      externalFees: ext,
      totalCost,
    };
  }, [entities, sites, scopeLevel, externalFees]);

  return (
    <div className="space-y-6">
      <p className="text-sm opacity-80">
        Estimate the cost of carbon disclosure reporting (carbon accounting, emissions inventory, and disclosure prep)
        using a simple internal-effort model plus optional external fees.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Reporting Entities</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={entities}
            onChange={(e) => setEntities(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Subsidiaries, business units, or legal entities included in the disclosure.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Facilities / Sites Included</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={sites}
            onChange={(e) => setSites(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Physical sites included for data collection and emissions tracking.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Reporting Scope</label>
          <select
            className="input"
            value={scopeLevel}
            onChange={(e) => setScopeLevel(Number(e.target.value))}
          >
            <option value={2}>Scope 1 + 2 (direct + purchased energy)</option>
            <option value={3}>Scope 1 + 2 + 3 (adds value chain / supply chain)</option>
          </select>
          <p className="mt-1 text-xs opacity-70">
            Including Scope 3 generally increases effort due to supplier and value-chain data.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">External Vendor / Consulting Fees ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={externalFees}
            onChange={(e) => setExternalFees(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Optional spend on carbon accounting tools, ESG consultants, or assurance providers.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Assumptions — Scope: {result.scopeLabel}. This is an estimate to help with budgeting and planning.
        </p>

        <p className="font-semibold">
          Estimated Internal Cost: $
          {result.internalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="font-semibold">
          External Fees: ${result.externalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="font-semibold text-lg">
          Total Estimated Disclosure Cost: $
          {result.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        <p className="text-sm opacity-80">
          Inputs — Entities: {result.entities.toLocaleString()}, Sites: {result.sites.toLocaleString()}, Scope:{" "}
          {result.scopeLabel}
        </p>
      </div>
    </div>
  );
}
