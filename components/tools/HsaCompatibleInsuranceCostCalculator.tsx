// components/tools/HsaCompatibleInsuranceCostCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  monthlyPremium: string;
  annualDeductible: string;
  outOfPocketMax: string;
  coinsurancePercent: string;
  expectedAnnualMedicalExpenses: string;

  hsaContribution: string;
  marginalTaxRatePercent: string; // federal+state marginal, simplified
};

type Result = {
  annualPremium: number;

  deductiblePaid: number;
  amountSubjectToCoinsurance: number;
  coinsurancePaid: number;
  estimatedOutOfPocketPaid: number;

  hsaTaxSavings: number;
  netAnnualCost: number;

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

export default function HsaCompatibleInsuranceCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlyPremium: "",
    annualDeductible: "",
    outOfPocketMax: "",
    coinsurancePercent: "",
    expectedAnnualMedicalExpenses: "",
    hsaContribution: "",
    marginalTaxRatePercent: "",
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
    const coinsurancePercent = parseNumber(inputs.coinsurancePercent);
    const expectedAnnualMedicalExpenses = parseNumber(inputs.expectedAnnualMedicalExpenses);

    const hsaContribution = parseNumber(inputs.hsaContribution);
    const marginalTaxRatePercent = parseNumber(inputs.marginalTaxRatePercent);

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
    if (!Number.isFinite(coinsurancePercent) || coinsurancePercent < 0 || coinsurancePercent > 100) {
      setError("Coinsurance rate must be between 0 and 100 (e.g. 20 for 20%).");
      return;
    }
    if (!Number.isFinite(expectedAnnualMedicalExpenses) || expectedAnnualMedicalExpenses < 0) {
      setError("Expected annual medical expenses must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(hsaContribution) || hsaContribution < 0) {
      setError("HSA contribution must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(marginalTaxRatePercent) || marginalTaxRatePercent < 0 || marginalTaxRatePercent > 60) {
      setError("Marginal tax rate must be between 0 and 60 (e.g. 24 for 24%).");
      return;
    }

    const annualPremium = monthlyPremium * 12;

    // Simplified OOP model: deductible + coinsurance, capped by OOP max.
    const deductiblePaid = Math.min(expectedAnnualMedicalExpenses, annualDeductible);
    const remainingAfterDeductible = Math.max(0, expectedAnnualMedicalExpenses - annualDeductible);

    const coinsuranceRate = coinsurancePercent / 100;
    const coinsurancePaid = remainingAfterDeductible * coinsuranceRate;

    const rawOutOfPocket = deductiblePaid + coinsurancePaid;
    const estimatedOutOfPocketPaid =
      outOfPocketMax === 0 ? rawOutOfPocket : Math.min(rawOutOfPocket, outOfPocketMax);

    // HSA tax savings (simplified): contribution * marginal rate
    // In reality, FICA/Payroll specifics vary; we keep it simple.
    const hsaTaxSavings = hsaContribution * (marginalTaxRatePercent / 100);

    const netAnnualCost = annualPremium + estimatedOutOfPocketPaid - hsaTaxSavings;

    const notes: string[] = [];
    notes.push("This is a simplified estimate (deductible + coinsurance capped by out-of-pocket max).");
    notes.push("Tax savings are estimated using your marginal tax rate; actual savings can vary by payroll/FICA rules.");
    if (hsaContribution === 0) notes.push("If you contribute $0 to an HSA, net cost equals premium + out-of-pocket.");

    setResult({
      annualPremium,
      deductiblePaid,
      amountSubjectToCoinsurance: remainingAfterDeductible,
      coinsurancePaid,
      estimatedOutOfPocketPaid,
      hsaTaxSavings,
      netAnnualCost,
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
            <label style={{ fontSize: 13 }}>Monthly premium</label>
            <input
              name="monthlyPremium"
              value={inputs.monthlyPremium}
              onChange={handleChange}
              placeholder="e.g. 280"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Annual deductible</label>
            <input
              name="annualDeductible"
              value={inputs.annualDeductible}
              onChange={handleChange}
              placeholder="e.g. 2000"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Out-of-pocket maximum</label>
            <input
              name="outOfPocketMax"
              value={inputs.outOfPocketMax}
              onChange={handleChange}
              placeholder="e.g. 6500"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
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
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Expected annual medical expenses</label>
            <input
              name="expectedAnnualMedicalExpenses"
              value={inputs.expectedAnnualMedicalExpenses}
              onChange={handleChange}
              placeholder="e.g. 4000"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ borderTop: "1px solid #eee", marginTop: 8, paddingTop: 10, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>HSA (Tax Savings)</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Planned HSA contribution (annual)</label>
              <input
                name="hsaContribution"
                value={inputs.hsaContribution}
                onChange={handleChange}
                placeholder="e.g. 3000"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Marginal tax rate (%)</label>
              <input
                name="marginalTaxRatePercent"
                value={inputs.marginalTaxRatePercent}
                onChange={handleChange}
                placeholder="e.g. 24"
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
          <div>
            <strong>Annual premium:</strong> {fmt(result.annualPremium)}
          </div>
          <div>
            <strong>Deductible paid (estimated):</strong> {fmt(result.deductiblePaid)}
          </div>
          <div>
            <strong>Amount subject to coinsurance:</strong> {fmt(result.amountSubjectToCoinsurance)}
          </div>
          <div>
            <strong>Coinsurance paid (estimated):</strong> {fmt(result.coinsurancePaid)}
          </div>
          <div>
            <strong>Estimated out-of-pocket paid (capped):</strong> {fmt(result.estimatedOutOfPocketPaid)}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Estimated HSA tax savings:</strong> {fmt(result.hsaTaxSavings)}
          </div>

          <div style={{ marginTop: 6, fontWeight: 800 }}>
            Net annual cost (premium + out-of-pocket − tax savings): {fmt(result.netAnnualCost)}
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
