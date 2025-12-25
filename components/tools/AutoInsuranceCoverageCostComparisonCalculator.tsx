// components/tools/AutoInsuranceCoverageCostComparisonCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  // Plan A
  premiumA: string; // annual
  deductibleA: string;

  // Plan B
  premiumB: string; // annual
  deductibleB: string;

  // Risk assumptions
  annualClaimProbabilityPercent: string; // e.g. 10 = 10%
  expectedClaimAmount: string; // repair/covered loss amount, optional but used for context

  deductibleApplies: boolean; // whether deductible applies to the scenario
};

type Result = {
  claimProbability: number; // 0..1
  expectedDeductibleCostA: number;
  expectedDeductibleCostB: number;
  totalExpectedAnnualCostA: number;
  totalExpectedAnnualCostB: number;
  winner: string;
  notes: string[];
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function AutoInsuranceCoverageCostComparisonCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    premiumA: "",
    deductibleA: "",
    premiumB: "",
    deductibleB: "",
    annualClaimProbabilityPercent: "",
    expectedClaimAmount: "",
    deductibleApplies: true,
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setInputs((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const premiumA = parseNumber(inputs.premiumA);
    const deductibleA = parseNumber(inputs.deductibleA);
    const premiumB = parseNumber(inputs.premiumB);
    const deductibleB = parseNumber(inputs.deductibleB);

    const annualClaimProbabilityPercent = parseNumber(inputs.annualClaimProbabilityPercent);
    const expectedClaimAmount =
      inputs.expectedClaimAmount.trim().length === 0 ? 0 : parseNumber(inputs.expectedClaimAmount);

    if (!Number.isFinite(premiumA) || premiumA < 0) {
      setError("Plan A annual premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(deductibleA) || deductibleA < 0) {
      setError("Plan A deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(premiumB) || premiumB < 0) {
      setError("Plan B annual premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(deductibleB) || deductibleB < 0) {
      setError("Plan B deductible must be a valid number (0 or greater).");
      return;
    }
    if (
      !Number.isFinite(annualClaimProbabilityPercent) ||
      annualClaimProbabilityPercent < 0 ||
      annualClaimProbabilityPercent > 100
    ) {
      setError("Annual claim probability must be between 0 and 100 (e.g. 10 for 10%).");
      return;
    }
    if (!Number.isFinite(expectedClaimAmount) || expectedClaimAmount < 0) {
      setError("Expected claim amount must be a valid number (0 or greater).");
      return;
    }

    const claimProbability = annualClaimProbabilityPercent / 100;

    const expectedDeductibleCostA = inputs.deductibleApplies ? claimProbability * deductibleA : 0;
    const expectedDeductibleCostB = inputs.deductibleApplies ? claimProbability * deductibleB : 0;

    const totalExpectedAnnualCostA = premiumA + expectedDeductibleCostA;
    const totalExpectedAnnualCostB = premiumB + expectedDeductibleCostB;

    let winner = "Plan A is cheaper based on expected annual cost.";
    if (totalExpectedAnnualCostB < totalExpectedAnnualCostA) winner = "Plan B is cheaper based on expected annual cost.";
    if (Math.abs(totalExpectedAnnualCostA - totalExpectedAnnualCostB) < 1e-9)
      winner = "Both plans have the same expected annual cost.";

    const notes: string[] = [];
    notes.push("This estimate compares premiums plus expected deductible cost (probability × deductible).");
    notes.push("It does not model liability limits, claim frequency distribution, or premium surcharges after claims.");
    if (!inputs.deductibleApplies) notes.push("You marked deductible as not applicable for this comparison scenario.");
    if (expectedClaimAmount > 0) notes.push("Expected claim amount is included for context only; deductible is the modeled out-of-pocket component here.");

    setResult({
      claimProbability,
      expectedDeductibleCostA,
      expectedDeductibleCostB,
      totalExpectedAnnualCostA,
      totalExpectedAnnualCostB,
      winner,
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
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Plan A</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Annual premium (Plan A)</label>
              <input
                name="premiumA"
                value={inputs.premiumA}
                onChange={handleChange}
                placeholder="e.g. 1200"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Deductible (Plan A)</label>
              <input
                name="deductibleA"
                value={inputs.deductibleA}
                onChange={handleChange}
                placeholder="e.g. 500"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Plan B</div>
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Annual premium (Plan B)</label>
                <input
                  name="premiumB"
                  value={inputs.premiumB}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Deductible (Plan B)</label>
                <input
                  name="deductibleB"
                  value={inputs.deductibleB}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Risk assumptions</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Annual claim probability (%)</label>
              <input
                name="annualClaimProbabilityPercent"
                value={inputs.annualClaimProbabilityPercent}
                onChange={handleChange}
                placeholder="e.g. 10"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Expected claim amount (optional, for context)</label>
              <input
                name="expectedClaimAmount"
                value={inputs.expectedClaimAmount}
                onChange={handleChange}
                placeholder="e.g. 2000"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                name="deductibleApplies"
                checked={inputs.deductibleApplies}
                onChange={handleChange}
              />
              Deductible applies in this comparison
            </label>
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
            Compare
          </button>
        </div>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div>
            <strong>Expected deductible cost (Plan A):</strong> {fmt(result.expectedDeductibleCostA)}
          </div>
          <div>
            <strong>Expected deductible cost (Plan B):</strong> {fmt(result.expectedDeductibleCostB)}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Total expected annual cost (Plan A):</strong> {fmt(result.totalExpectedAnnualCostA)}
          </div>
          <div>
            <strong>Total expected annual cost (Plan B):</strong> {fmt(result.totalExpectedAnnualCostB)}
          </div>

          <div style={{ marginTop: 6, fontWeight: 800 }}>{result.winner}</div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, idx) => (
              <div key={idx}>• {n}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
