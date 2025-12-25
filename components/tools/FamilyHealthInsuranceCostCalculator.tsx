// components/tools/FamilyHealthInsuranceCostCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Inputs = {
  monthlyPremium: string;
  familyDeductible: string;
  familyOutOfPocketMax: string;
  coinsurancePercent: string;
  member1: string;
  member2: string;
  member3: string;
  member4: string;
  member5: string;
  member6: string;
};

type Result = {
  annualPremium: number;
  totalExpectedMedicalExpenses: number;
  deductiblePaid: number;
  amountSubjectToCoinsurance: number;
  coinsurancePaid: number;
  estimatedOutOfPocketPaid: number;
  totalAnnualCost: number;
  estimatedInsuranceReduction: number;
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

export default function FamilyHealthInsuranceCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlyPremium: "",
    familyDeductible: "",
    familyOutOfPocketMax: "",
    coinsurancePercent: "",
    member1: "",
    member2: "",
    member3: "",
    member4: "",
    member5: "",
    member6: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const members = useMemo(
    () => [
      inputs.member1,
      inputs.member2,
      inputs.member3,
      inputs.member4,
      inputs.member5,
      inputs.member6,
    ],
    [inputs]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const monthlyPremium = parseNumber(inputs.monthlyPremium);
    const familyDeductible = parseNumber(inputs.familyDeductible);
    const familyOutOfPocketMax = parseNumber(inputs.familyOutOfPocketMax);
    const coinsurancePercent = parseNumber(inputs.coinsurancePercent);

    if (!Number.isFinite(monthlyPremium) || monthlyPremium < 0) {
      setError("Monthly premium must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(familyDeductible) || familyDeductible < 0) {
      setError("Family deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(familyOutOfPocketMax) || familyOutOfPocketMax < 0) {
      setError("Family out-of-pocket maximum must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(coinsurancePercent) || coinsurancePercent < 0 || coinsurancePercent > 100) {
      setError("Coinsurance rate must be between 0 and 100 (e.g. 20 for 20%).");
      return;
    }

    const memberNums = members
      .filter((v) => v.trim().length > 0)
      .map(parseNumber);

    if (memberNums.length === 0) {
      setError("Add at least one family member's expected annual medical expenses.");
      return;
    }
    if (memberNums.some((n) => !Number.isFinite(n) || n < 0)) {
      setError("Each family member expense must be a valid number (0 or greater).");
      return;
    }

    const totalExpectedMedicalExpenses = memberNums.reduce((a, b) => a + b, 0);
    const annualPremium = monthlyPremium * 12;

    // Simplified family plan model (aggregate spend):
    // - Pay medical expenses up to family deductible
    // - Then pay coinsurance on remaining amount
    // - Cap by family out-of-pocket max
    const deductiblePaid = Math.min(totalExpectedMedicalExpenses, familyDeductible);
    const remainingAfterDeductible = Math.max(0, totalExpectedMedicalExpenses - familyDeductible);

    const coinsuranceRate = coinsurancePercent / 100;
    const coinsurancePaid = remainingAfterDeductible * coinsuranceRate;

    const rawOutOfPocket = deductiblePaid + coinsurancePaid;
    const estimatedOutOfPocketPaid =
      familyOutOfPocketMax === 0 ? rawOutOfPocket : Math.min(rawOutOfPocket, familyOutOfPocketMax);

    const totalAnnualCost = annualPremium + estimatedOutOfPocketPaid;

    const estimatedInsuranceReduction = Math.max(
      0,
      totalExpectedMedicalExpenses - estimatedOutOfPocketPaid
    );

    setResult({
      annualPremium,
      totalExpectedMedicalExpenses,
      deductiblePaid,
      amountSubjectToCoinsurance: remainingAfterDeductible,
      coinsurancePaid,
      estimatedOutOfPocketPaid,
      totalAnnualCost,
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
            <label style={{ fontSize: 13 }}>Monthly premium (family plan)</label>
            <input
              name="monthlyPremium"
              value={inputs.monthlyPremium}
              onChange={handleChange}
              placeholder="e.g. 450"
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
            <label style={{ fontSize: 13 }}>Family deductible (annual)</label>
            <input
              name="familyDeductible"
              value={inputs.familyDeductible}
              onChange={handleChange}
              placeholder="e.g. 3000"
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
            <label style={{ fontSize: 13 }}>Family out-of-pocket maximum (annual)</label>
            <input
              name="familyOutOfPocketMax"
              value={inputs.familyOutOfPocketMax}
              onChange={handleChange}
              placeholder="e.g. 12000"
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

          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Expected annual medical expenses</div>

            <input
              name="member1"
              value={inputs.member1}
              onChange={handleChange}
              placeholder="Member 1 (e.g. 5000)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <input
              name="member2"
              value={inputs.member2}
              onChange={handleChange}
              placeholder="Member 2 (optional)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <input
              name="member3"
              value={inputs.member3}
              onChange={handleChange}
              placeholder="Member 3 (optional)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <input
              name="member4"
              value={inputs.member4}
              onChange={handleChange}
              placeholder="Member 4 (optional)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <input
              name="member5"
              value={inputs.member5}
              onChange={handleChange}
              placeholder="Member 5 (optional)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <input
              name="member6"
              value={inputs.member6}
              onChange={handleChange}
              placeholder="Member 6 (optional)"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
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
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div>
            <strong>Total expected medical expenses:</strong> {fmt(result.totalExpectedMedicalExpenses)}
          </div>
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
          <div>
            <strong>Total annual cost (premium + out-of-pocket):</strong> {fmt(result.totalAnnualCost)}
          </div>

          <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
            This is a simplified estimate (deductible + coinsurance, capped by family out-of-pocket max).
            Actual costs can vary by copays, network rules, and covered services.
          </div>

          <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
            <strong>Estimated insurance reduction (medical only):</strong> {fmt(result.estimatedInsuranceReduction)}{" "}
            <span style={{ color: "#666" }}>(expected medical expenses − out-of-pocket paid)</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
