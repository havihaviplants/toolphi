"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type UsageType = "driving" | "travel" | "general";

type Inputs = {
  currentMonthlyPremium: string;

  usageType: UsageType;
  monthlyUsage: string; // miles/trips/units

  baselineUsage: string; // baseline usage for same units
  sensitivityPercent: string; // how strongly premium responds to usage ratio
};

type Result = {
  usageRatio: number;
  riskMultiplier: number;
  estimatedMonthlyPremium: number;
  estimatedAnnualPremium: number;
  deltaMonthly: number;
  notes: string[];
};

function parseNumber(v: string): number {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export default function InsuranceCostByUsageCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    currentMonthlyPremium: "140",
    usageType: "driving",
    monthlyUsage: "1500",
    baselineUsage: "1000",
    sensitivityPercent: "30",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labels = useMemo(() => {
    if (inputs.usageType === "driving") {
      return {
        usageLabel: "Monthly mileage",
        usagePlaceholder: "e.g. 1500",
        unit: "miles",
        baselineLabel: "Baseline mileage",
      };
    }
    if (inputs.usageType === "travel") {
      return {
        usageLabel: "Trips per month",
        usagePlaceholder: "e.g. 2",
        unit: "trips",
        baselineLabel: "Baseline trips",
      };
    }
    return {
      usageLabel: "Usage units per month",
      usagePlaceholder: "e.g. 100",
      unit: "units",
      baselineLabel: "Baseline usage",
    };
  }, [inputs.usageType]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const currentMonthlyPremium = parseNumber(inputs.currentMonthlyPremium);
    const monthlyUsage = parseNumber(inputs.monthlyUsage);
    const baselineUsage = parseNumber(inputs.baselineUsage);
    const sensitivityPercent = parseNumber(inputs.sensitivityPercent);

    if (!Number.isFinite(currentMonthlyPremium) || currentMonthlyPremium < 0) {
      setError("Current monthly premium must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(monthlyUsage) || monthlyUsage < 0) {
      setError("Monthly usage must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(baselineUsage) || baselineUsage <= 0) {
      setError("Baseline usage must be greater than 0.");
      return;
    }
    if (!Number.isFinite(sensitivityPercent) || sensitivityPercent < 0 || sensitivityPercent > 200) {
      setError("Sensitivity must be between 0 and 200 (%).");
      return;
    }

    const usageRatio = monthlyUsage / baselineUsage;

    // Risk multiplier model:
    // multiplier = 1 + sensitivity * (ratio - 1)
    // clamp to avoid absurd results
    const sensitivity = sensitivityPercent / 100;
    const rawMultiplier = 1 + sensitivity * (usageRatio - 1);
    const riskMultiplier = clamp(rawMultiplier, 0.5, 3.0);

    const estimatedMonthlyPremium = currentMonthlyPremium * riskMultiplier;
    const estimatedAnnualPremium = estimatedMonthlyPremium * 12;
    const deltaMonthly = estimatedMonthlyPremium - currentMonthlyPremium;

    const notes: string[] = [];
    notes.push("This tool uses a simplified usage-based risk multiplier. Real pricing depends on insurer and underwriting.");
    notes.push("Mileage/trips/usage may affect premiums non-linearly and can vary by region and policy type.");
    if (riskMultiplier !== rawMultiplier) notes.push("Multiplier was clamped to keep results within a reasonable range.");

    setResult({
      usageRatio,
      riskMultiplier,
      estimatedMonthlyPremium,
      estimatedAnnualPremium,
      deltaMonthly,
      notes,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 16,
        backgroundColor: "#fff",
        display: "grid",
        gap: 16,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Insurance Cost by Usage Calculator</h1>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>
          Estimate how premiums may change based on usage (mileage, trips, or general usage) using a simple risk model.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Current monthly premium</label>
          <input
            name="currentMonthlyPremium"
            value={inputs.currentMonthlyPremium}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 140"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Usage type</label>
          <select
            name="usageType"
            value={inputs.usageType}
            onChange={handleChange}
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          >
            <option value="driving">Driving (mileage)</option>
            <option value="travel">Travel (trips)</option>
            <option value="general">General usage</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>
            {labels.usageLabel} ({labels.unit})
          </label>
          <input
            name="monthlyUsage"
            value={inputs.monthlyUsage}
            onChange={handleChange}
            inputMode="decimal"
            placeholder={labels.usagePlaceholder}
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>
            {labels.baselineLabel} ({labels.unit})
          </label>
          <input
            name="baselineUsage"
            value={inputs.baselineUsage}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 1000"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Sensitivity (%)</label>
          <input
            name="sensitivityPercent"
            value={inputs.sensitivityPercent}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 30"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
            Higher sensitivity means premium changes more aggressively as usage deviates from baseline.
          </div>
        </div>

        {error ? (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              color: "#c53030",
              padding: 10,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Calculate
        </button>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>Results</div>

          <div style={{ fontSize: 14 }}>
            <strong>Usage ratio:</strong> {fmt(result.usageRatio)}x
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Risk multiplier:</strong> {fmt(result.riskMultiplier)}x
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Estimated monthly premium:</strong> {fmt(result.estimatedMonthlyPremium)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Estimated annual premium:</strong> {fmt(result.estimatedAnnualPremium)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Change vs current (monthly):</strong> {fmt(result.deltaMonthly)}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>

          <section style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              This calculator estimates premium changes using a linear sensitivity model based on the ratio between
              your usage and a baseline. Premiums can be non-linear in real underwriting.
            </p>
          </section>

          <section style={{ marginTop: 4, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>FAQ</h2>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Is this the same as pay-per-mile insurance?</strong>
              <div>No. This is a simplified estimator, not a specific insurer pricing model.</div>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>What baseline should I use?</strong>
              <div>Use your typical monthly usage as a “normal” reference point for comparison.</div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
