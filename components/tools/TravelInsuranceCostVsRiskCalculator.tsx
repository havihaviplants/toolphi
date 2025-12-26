"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  insurancePremium: string;
  eventProbabilityPercent: string;
  expectedLossAmount: string;

  deductible: string; // optional (default 0)
  coverageLimit: string; // optional blank = no limit
  uncoveredPercent: string; // optional portion not covered
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

export default function TravelInsuranceCostVsRiskCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    insurancePremium: "80",
    eventProbabilityPercent: "5",
    expectedLossAmount: "2000",
    deductible: "100",
    coverageLimit: "2000",
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

    const insurancePremium = parseNumber(inputs.insurancePremium);
    const eventProbabilityPercent = parseNumber(inputs.eventProbabilityPercent);
    const expectedLossAmount = parseNumber(inputs.expectedLossAmount);

    const deductible = inputs.deductible.trim() === "" ? 0 : parseNumber(inputs.deductible);
    const coverageLimit = inputs.coverageLimit.trim() === "" ? Infinity : parseNumber(inputs.coverageLimit);
    const uncoveredPercent = inputs.uncoveredPercent.trim() === "" ? 0 : parseNumber(inputs.uncoveredPercent);

    if (!Number.isFinite(insurancePremium) || insurancePremium < 0) {
      setError("Insurance premium must be a valid number (0 or greater).");
      return;
    }
    if (
      !Number.isFinite(eventProbabilityPercent) ||
      eventProbabilityPercent < 0 ||
      eventProbabilityPercent > 100
    ) {
      setError("Event probability must be between 0 and 100.");
      return;
    }
    if (!Number.isFinite(expectedLossAmount) || expectedLossAmount < 0) {
      setError("Expected loss amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(deductible) || deductible < 0) {
      setError("Deductible must be a valid number (0 or greater).");
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

    const p = eventProbabilityPercent / 100;

    // Without insurance: expected loss
    const expectedWithoutInsurance = p * expectedLossAmount;

    // With insurance: premium + expected out-of-pocket when event occurs:
    // out-of-pocket = deductible + uncovered portion + above-limit portion
    const cappedCovered = Math.min(expectedLossAmount, coverageLimit);
    const aboveLimit = Math.max(0, expectedLossAmount - coverageLimit);
    const uncoveredCostOnEvent = (uncoveredPercent / 100) * cappedCovered + aboveLimit;

    const expectedDeductibleCost = p * deductible;
    const expectedUncoveredCost = p * uncoveredCostOnEvent;

    const expectedWithInsurance = insurancePremium + expectedDeductibleCost + expectedUncoveredCost;

    let winner = "Expected value suggests travel insurance is worth it.";
    if (expectedWithoutInsurance < expectedWithInsurance) winner = "Expected value suggests travel insurance is not worth it.";
    if (Math.abs(expectedWithoutInsurance - expectedWithInsurance) < 1e-9) winner = "Expected value suggests both options cost the same.";

    const notes: string[] = [];
    notes.push("This is expected-value math. Travel insurance may still be valuable for peace of mind and catastrophe protection.");
    notes.push("Policies differ: exclusions, medical networks, claim processes, and coverage definitions vary widely.");
    if (coverageLimit !== Infinity) notes.push("Coverage limit models the maximum amount insurance pays per event.");
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
      <div style={{ display: "grid", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Travel Insurance Cost vs Risk Calculator</h1>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>
          Compare the cost of travel insurance to your expected travel risk cost using probability and expected loss.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Travel insurance premium (for the trip)</label>
          <input
            name="insurancePremium"
            value={inputs.insurancePremium}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 80"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Probability of a covered event (%)</label>
          <input
            name="eventProbabilityPercent"
            value={inputs.eventProbabilityPercent}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 5"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Expected loss amount (if event happens)</label>
          <input
            name="expectedLossAmount"
            value={inputs.expectedLossAmount}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 2000"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Optional policy details</div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13 }}>Deductible (optional)</label>
            <input
              name="deductible"
              value={inputs.deductible}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 100"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13 }}>Coverage limit (optional)</label>
            <input
              name="coverageLimit"
              value={inputs.coverageLimit}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="leave blank for no limit"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13 }}>Uncovered portion (%) (optional)</label>
            <input
              name="uncoveredPercent"
              value={inputs.uncoveredPercent}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 0"
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
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>{result.winner}</div>

          <div style={{ fontSize: 14 }}>
            <strong>Expected cost with insurance:</strong> {fmt(result.expectedWithInsurance)}
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>Expected cost without insurance:</strong> {fmt(result.expectedWithoutInsurance)}
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "#444", display: "grid", gap: 4 }}>
            <div>
              • Expected deductible cost: <strong>{fmt(result.expectedDeductibleCost)}</strong>
            </div>
            <div>
              • Expected uncovered cost: <strong>{fmt(result.expectedUncoveredCost)}</strong>
            </div>
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>

          <section style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              We compare the expected value of paying for insurance (premium + expected out-of-pocket) against the
              expected value of not having insurance (probability × expected loss).
            </p>
          </section>

          <section style={{ marginTop: 4, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>FAQ</h2>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Does this guarantee the “best” choice?</strong>
              <div>No. It’s a mathematical expectation estimate, not a full risk-preference model.</div>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>What probability should I use?</strong>
              <div>Use a conservative estimate (e.g., 1–10%) depending on trip type, season, and destinations.</div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
