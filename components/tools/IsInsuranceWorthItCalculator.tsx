// components/tools/IsInsuranceWorthItCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  annualPremium: string;
  deductible: string;

  lossProbabilityPercent: string; // 0..100
  expectedLossAmount: string;

  coverageLimit: string; // optional
  uncoveredPercent: string; // optional: portion not covered (coinsurance exclusions etc.)
};

type Result = {
  expectedWithInsurance: number;
  expectedWithoutInsurance: number;

  expectedDeductibleCost: number;
  expectedUncoveredCost: number;

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

export default function IsInsuranceWorthItCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    annualPremium: "",
    deductible: "",
    lossProbabilityPercent: "",
    expectedLossAmount: "",
    coverageLimit: "",
    uncoveredPercent: "0",
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

    const annualPremium = parseNumber(inputs.annualPremium);
    const deductible = parseNumber(inputs.deductible);
    const lossProbabilityPercent = parseNumber(inputs.lossProbabilityPercent);
    const expectedLossAmount = parseNumber(inputs.expectedLossAmount);

    const coverageLimit = inputs.coverageLimit.trim().length === 0 ? Infinity : parseNumber(inputs.coverageLimit);
    const uncoveredPercent = inputs.uncoveredPercent.trim().length === 0 ? 0 : parseNumber(inputs.uncoveredPercent);

    if (!Number.isFinite(annualPremium) || annualPremium < 0) {
      setError("Annual premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(deductible) || deductible < 0) {
      setError("Deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(lossProbabilityPercent) || lossProbabilityPercent < 0 || lossProbabilityPercent > 100) {
      setError("Loss probability must be between 0 and 100.");
      return;
    }
    if (!Number.isFinite(expectedLossAmount) || expectedLossAmount < 0) {
      setError("Expected loss amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(coverageLimit) || coverageLimit < 0) {
      setError("Coverage limit must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(uncoveredPercent) || uncoveredPercent < 0 || uncoveredPercent > 100) {
      setError("Uncovered % must be between 0 and 100.");
      return;
    }

    const p = lossProbabilityPercent / 100;

    // Without insurance: expected loss (assume you pay full loss)
    const expectedWithoutInsurance = p * expectedLossAmount;

    // With insurance: premium + expected out-of-pocket on event:
    // Out-of-pocket = deductible + uncovered portion + above-limit portion
    // Covered amount limited by coverageLimit
    const cappedCovered = Math.min(expectedLossAmount, coverageLimit);
    const aboveLimit = Math.max(0, expectedLossAmount - coverageLimit);

    const uncoveredCostOnEvent = (uncoveredPercent / 100) * cappedCovered + aboveLimit;

    // Deductible applies only when event occurs (simplified)
    const expectedDeductibleCost = p * deductible;
    const expectedUncoveredCost = p * uncoveredCostOnEvent;

    const expectedWithInsurance = annualPremium + expectedDeductibleCost + expectedUncoveredCost;

    let winner = "Expected value suggests insurance is worth it.";
    if (expectedWithoutInsurance < expectedWithInsurance) winner = "Expected value suggests insurance is not worth it.";
    if (Math.abs(expectedWithoutInsurance - expectedWithInsurance) < 1e-9) winner = "Expected value suggests both options cost the same.";

    const notes: string[] = [];
    notes.push("This is expected-value math. Insurance can still be valuable for risk protection even if EV looks negative.");
    notes.push("Real policies include exclusions, waiting periods, claim frequency effects, and underwriting changes.");
    if (coverageLimit !== Infinity) notes.push("Coverage limit affects how much loss remains on you above the limit.");
    if (uncoveredPercent > 0) notes.push("Uncovered % models coinsurance/exclusions as a simple portion of covered loss.");

    setResult({
      expectedWithInsurance,
      expectedWithoutInsurance,
      expectedDeductibleCost,
      expectedUncoveredCost,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Annual premium</label>
            <input
              name="annualPremium"
              value={inputs.annualPremium}
              onChange={handleChange}
              placeholder="e.g. 1200"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Deductible</label>
            <input
              name="deductible"
              value={inputs.deductible}
              onChange={handleChange}
              placeholder="e.g. 500"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Risk assumptions</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Loss probability (%)</label>
              <input
                name="lossProbabilityPercent"
                value={inputs.lossProbabilityPercent}
                onChange={handleChange}
                placeholder="e.g. 10"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Expected loss amount</label>
              <input
                name="expectedLossAmount"
                value={inputs.expectedLossAmount}
                onChange={handleChange}
                placeholder="e.g. 10000"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Optional policy limits</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Coverage limit (optional)</label>
              <input
                name="coverageLimit"
                value={inputs.coverageLimit}
                onChange={handleChange}
                placeholder="leave blank for no limit"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Uncovered portion (%) (optional)</label>
              <input
                name="uncoveredPercent"
                value={inputs.uncoveredPercent}
                onChange={handleChange}
                placeholder="e.g. 0"
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
            Calculate
          </button>
        </div>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div style={{ fontWeight: 900 }}>{result.winner}</div>

          <div style={{ marginTop: 6 }}>
            <strong>Expected annual cost with insurance:</strong> {fmt(result.expectedWithInsurance)}
          </div>
          <div>
            <strong>Expected annual cost without insurance:</strong> {fmt(result.expectedWithoutInsurance)}
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: "#444", display: "grid", gap: 4 }}>
            <div>
              • Expected deductible cost: <strong>{fmt(result.expectedDeductibleCost)}</strong>
            </div>
            <div>
              • Expected uncovered cost: <strong>{fmt(result.expectedUncoveredCost)}</strong>
            </div>
          </div>

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
