// components/tools/HealthInsuranceOutOfPocketCostCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  monthlyPremium: string;
  annualDeductible: string;
  outOfPocketMax: string;
  expectedAnnualMedicalExpenses: string;
  coinsurancePercent: string; // e.g. 20 for 20%
};

type Result = {
  annualPremium: number;
  estimatedOutOfPocketPaid: number;
  totalAnnualCost: number;
  amountSubjectToCoinsurance: number;
  coinsurancePaid: number;
  deductiblePaid: number;
  estimatedInsuranceReduction: number; // (expected expenses - out-of-pocket paid), not counting premiums
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

export default function HealthInsuranceOutOfPocketCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlyPremium: "",
    annualDeductible: "",
    outOfPocketMax: "",
    expectedAnnualMedicalExpenses: "",
    coinsurancePercent: "",
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

    const monthlyPremium = parseNumber(inputs.monthlyPremium);
    const annualDeductible = parseNumber(inputs.annualDeductible);
    const outOfPocketMax = parseNumber(inputs.outOfPocketMax);
    const expectedAnnualMedicalExpenses = parseNumber(
      inputs.expectedAnnualMedicalExpenses
    );
    const coinsurancePercent = parseNumber(inputs.coinsurancePercent);

    if (!Number.isFinite(monthlyPremium) || monthlyPremium < 0) {
      setError("Monthly premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(annualDeductible) || annualDeductible < 0) {
      setError("Annual deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(outOfPocketMax) || outOfPocketMax < 0) {
      setError("Out-of-pocket maximum must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(expectedAnnualMedicalExpenses) || expectedAnnualMedicalExpenses < 0) {
      setError("Expected annual medical expenses must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(coinsurancePercent) || coinsurancePercent < 0 || coinsurancePercent > 100) {
      setError("Coinsurance rate must be between 0 and 100 (e.g. 20 for 20%).");
      return;
    }

    const annualPremium = monthlyPremium * 12;

    // Simplified model:
    // - Pay expenses up to deductible fully
    // - Then pay coinsurance on the remaining amount
    // - Cap total out-of-pocket medical spend by out-of-pocket max
    const deductiblePaid = Math.min(expectedAnnualMedicalExpenses, annualDeductible);
    const remainingAfterDeductible = Math.max(0, expectedAnnualMedicalExpenses - annualDeductible);

    const coinsuranceRate = coinsurancePercent / 100;
    const coinsurancePaid = remainingAfterDeductible * coinsuranceRate;

    const rawOutOfPocket = deductiblePaid + coinsurancePaid;
    const estimatedOutOfPocketPaid =
      outOfPocketMax === 0 ? rawOutOfPocket : Math.min(rawOutOfPocket, outOfPocketMax);

    const totalAnnualCost = annualPremium + estimatedOutOfPocketPaid;

    const estimatedInsuranceReduction = Math.max(
      0,
      expectedAnnualMedicalExpenses - estimatedOutOfPocketPaid
    );

    setResult({
      annualPremium,
      estimatedOutOfPocketPaid,
      totalAnnualCost,
      amountSubjectToCoinsurance: remainingAfterDeductible,
      coinsurancePaid,
      deductiblePaid,
      estimatedInsuranceReduction,
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
            <label style={{ fontSize: 13 }}>Monthly premium</label>
            <input
              name="monthlyPremium"
              value={inputs.monthlyPremium}
              onChange={handleChange}
              placeholder="e.g. 300"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Annual deductible</label>
            <input
              name="annualDeductible"
              value={inputs.annualDeductible}
              onChange={handleChange}
              placeholder="e.g. 1500"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Out-of-pocket maximum</label>
            <input
              name="outOfPocketMax"
              value={inputs.outOfPocketMax}
              onChange={handleChange}
              placeholder="e.g. 6000"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Expected annual medical expenses</label>
            <input
              name="expectedAnnualMedicalExpenses"
              value={inputs.expectedAnnualMedicalExpenses}
              onChange={handleChange}
              placeholder="e.g. 8000"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Coinsurance rate (%)</label>
            <input
              name="coinsurancePercent"
              value={inputs.coinsurancePercent}
              onChange={handleChange}
              placeholder="e.g. 20"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
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
        <div
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 12,
            display: "grid",
            gap: 8,
            fontSize: 14,
          }}
        >
          <div>
            <strong>Annual premium:</strong> {fmt(result.annualPremium)}
          </div>
          <div>
            <strong>Deductible paid (estimated):</strong> {fmt(result.deductiblePaid)}
          </div>
          <div>
            <strong>Amount subject to coinsurance:</strong>{" "}
            {fmt(result.amountSubjectToCoinsurance)}
          </div>
          <div>
            <strong>Coinsurance paid (estimated):</strong> {fmt(result.coinsurancePaid)}
          </div>
          <div>
            <strong>Estimated out-of-pocket paid (capped):</strong>{" "}
            {fmt(result.estimatedOutOfPocketPaid)}
          </div>
          <div>
            <strong>Total annual cost (premium + out-of-pocket):</strong>{" "}
            {fmt(result.totalAnnualCost)}
          </div>

          <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
            This is a simplified estimate (deductible + coinsurance, capped by out-of-pocket max).
            Actual costs can vary by copays, network rules, and covered services.
          </div>

          <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
            <strong>Estimated insurance reduction (medical only):</strong>{" "}
            {fmt(result.estimatedInsuranceReduction)}{" "}
            <span style={{ color: "#666" }}>
              (expected medical expenses − out-of-pocket paid)
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
