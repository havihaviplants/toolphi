// components/tools/AutoInsuranceCollisionVsComprehensiveCostCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  // Collision
  collisionAnnualPremium: string;
  collisionDeductible: string;
  collisionClaimProbabilityPercent: string;

  // Comprehensive
  comprehensiveAnnualPremium: string;
  comprehensiveDeductible: string;
  comprehensiveClaimProbabilityPercent: string;

  // Optional context
  expectedLossAmount: string; // not modeled directly, shown as context
};

type Result = {
  collisionExpectedDeductibleCost: number;
  comprehensiveExpectedDeductibleCost: number;
  collisionTotalExpectedAnnualCost: number;
  comprehensiveTotalExpectedAnnualCost: number;
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

export default function AutoInsuranceCollisionVsComprehensiveCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    collisionAnnualPremium: "",
    collisionDeductible: "",
    collisionClaimProbabilityPercent: "",
    comprehensiveAnnualPremium: "",
    comprehensiveDeductible: "",
    comprehensiveClaimProbabilityPercent: "",
    expectedLossAmount: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const collisionAnnualPremium = parseNumber(inputs.collisionAnnualPremium);
    const collisionDeductible = parseNumber(inputs.collisionDeductible);
    const collisionClaimProbabilityPercent = parseNumber(inputs.collisionClaimProbabilityPercent);

    const comprehensiveAnnualPremium = parseNumber(inputs.comprehensiveAnnualPremium);
    const comprehensiveDeductible = parseNumber(inputs.comprehensiveDeductible);
    const comprehensiveClaimProbabilityPercent = parseNumber(inputs.comprehensiveClaimProbabilityPercent);

    const expectedLossAmount =
      inputs.expectedLossAmount.trim().length === 0 ? 0 : parseNumber(inputs.expectedLossAmount);

    if (!Number.isFinite(collisionAnnualPremium) || collisionAnnualPremium < 0) {
      setError("Collision annual premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(collisionDeductible) || collisionDeductible < 0) {
      setError("Collision deductible must be a valid number (0 or greater).");
      return;
    }
    if (
      !Number.isFinite(collisionClaimProbabilityPercent) ||
      collisionClaimProbabilityPercent < 0 ||
      collisionClaimProbabilityPercent > 100
    ) {
      setError("Collision claim probability must be between 0 and 100 (e.g. 8 for 8%).");
      return;
    }

    if (!Number.isFinite(comprehensiveAnnualPremium) || comprehensiveAnnualPremium < 0) {
      setError("Comprehensive annual premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(comprehensiveDeductible) || comprehensiveDeductible < 0) {
      setError("Comprehensive deductible must be a valid number (0 or greater).");
      return;
    }
    if (
      !Number.isFinite(comprehensiveClaimProbabilityPercent) ||
      comprehensiveClaimProbabilityPercent < 0 ||
      comprehensiveClaimProbabilityPercent > 100
    ) {
      setError("Comprehensive claim probability must be between 0 and 100 (e.g. 6 for 6%).");
      return;
    }

    if (!Number.isFinite(expectedLossAmount) || expectedLossAmount < 0) {
      setError("Expected loss amount must be a valid number (0 or greater).");
      return;
    }

    const collisionProb = collisionClaimProbabilityPercent / 100;
    const comprehensiveProb = comprehensiveClaimProbabilityPercent / 100;

    const collisionExpectedDeductibleCost = collisionProb * collisionDeductible;
    const comprehensiveExpectedDeductibleCost = comprehensiveProb * comprehensiveDeductible;

    const collisionTotalExpectedAnnualCost = collisionAnnualPremium + collisionExpectedDeductibleCost;
    const comprehensiveTotalExpectedAnnualCost =
      comprehensiveAnnualPremium + comprehensiveExpectedDeductibleCost;

    let winner = "Collision coverage is cheaper based on expected annual cost.";
    if (comprehensiveTotalExpectedAnnualCost < collisionTotalExpectedAnnualCost) {
      winner = "Comprehensive coverage is cheaper based on expected annual cost.";
    }
    if (Math.abs(collisionTotalExpectedAnnualCost - comprehensiveTotalExpectedAnnualCost) < 1e-9) {
      winner = "Both coverages have the same expected annual cost.";
    }

    const notes: string[] = [];
    notes.push("This estimate compares premium + (claim probability × deductible).");
    notes.push("It does not model claim severity distribution or premium increases after claims.");
    if (expectedLossAmount > 0) notes.push("Expected loss amount is shown for context only; deductible is the modeled out-of-pocket component.");

    setResult({
      collisionExpectedDeductibleCost,
      comprehensiveExpectedDeductibleCost,
      collisionTotalExpectedAnnualCost,
      comprehensiveTotalExpectedAnnualCost,
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
          <div style={{ fontSize: 13, fontWeight: 800 }}>Collision coverage</div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Collision annual premium</label>
              <input
                name="collisionAnnualPremium"
                value={inputs.collisionAnnualPremium}
                onChange={handleChange}
                placeholder="e.g. 400"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Collision deductible</label>
              <input
                name="collisionDeductible"
                value={inputs.collisionDeductible}
                onChange={handleChange}
                placeholder="e.g. 500"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Collision claim probability (%)</label>
              <input
                name="collisionClaimProbabilityPercent"
                value={inputs.collisionClaimProbabilityPercent}
                onChange={handleChange}
                placeholder="e.g. 8"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Comprehensive coverage</div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Comprehensive annual premium</label>
                <input
                  name="comprehensiveAnnualPremium"
                  value={inputs.comprehensiveAnnualPremium}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Comprehensive deductible</label>
                <input
                  name="comprehensiveDeductible"
                  value={inputs.comprehensiveDeductible}
                  onChange={handleChange}
                  placeholder="e.g. 250"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Comprehensive claim probability (%)</label>
                <input
                  name="comprehensiveClaimProbabilityPercent"
                  value={inputs.comprehensiveClaimProbabilityPercent}
                  onChange={handleChange}
                  placeholder="e.g. 6"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Optional context</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Expected loss amount (optional)</label>
              <input
                name="expectedLossAmount"
                value={inputs.expectedLossAmount}
                onChange={handleChange}
                placeholder="e.g. 2000"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
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
            Compare
          </button>
        </div>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div>
            <strong>Collision expected deductible cost:</strong> {fmt(result.collisionExpectedDeductibleCost)}
          </div>
          <div>
            <strong>Comprehensive expected deductible cost:</strong> {fmt(result.comprehensiveExpectedDeductibleCost)}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Collision total expected annual cost:</strong> {fmt(result.collisionTotalExpectedAnnualCost)}
          </div>
          <div>
            <strong>Comprehensive total expected annual cost:</strong> {fmt(result.comprehensiveTotalExpectedAnnualCost)}
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
