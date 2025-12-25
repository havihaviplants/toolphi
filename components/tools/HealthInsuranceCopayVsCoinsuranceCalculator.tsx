// components/tools/HealthInsuranceCopayVsCoinsuranceCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  servicePrice: string; // allowed amount
  copayAmount: string; // flat copay
  coinsurancePercent: string; // e.g. 20
  remainingDeductible: string; // how much deductible left
  serviceSubjectToDeductible: boolean; // checkbox
};

type Result = {
  deductibleApplied: number;
  remainingAfterDeductible: number;
  copayTotal: number;
  coinsuranceTotal: number;
  coinsuranceOnRemaining: number;
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

export default function HealthInsuranceCopayVsCoinsuranceCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    servicePrice: "",
    copayAmount: "",
    coinsurancePercent: "",
    remainingDeductible: "",
    serviceSubjectToDeductible: true,
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

    const servicePrice = parseNumber(inputs.servicePrice);
    const copayAmount = parseNumber(inputs.copayAmount);
    const coinsurancePercent = parseNumber(inputs.coinsurancePercent);
    const remainingDeductibleRaw = inputs.remainingDeductible.trim().length === 0 ? 0 : parseNumber(inputs.remainingDeductible);

    if (!Number.isFinite(servicePrice) || servicePrice < 0) {
      setError("Service price must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(copayAmount) || copayAmount < 0) {
      setError("Copay amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(coinsurancePercent) || coinsurancePercent < 0 || coinsurancePercent > 100) {
      setError("Coinsurance rate must be between 0 and 100 (e.g. 20 for 20%).");
      return;
    }
    if (!Number.isFinite(remainingDeductibleRaw) || remainingDeductibleRaw < 0) {
      setError("Remaining deductible must be a valid number (0 or greater).");
      return;
    }

    const notes: string[] = [];

    const deductibleApplied = inputs.serviceSubjectToDeductible
      ? Math.min(servicePrice, remainingDeductibleRaw)
      : 0;

    const remainingAfterDeductible = Math.max(0, servicePrice - deductibleApplied);

    if (!inputs.serviceSubjectToDeductible) {
      notes.push("This estimate assumes the service is not subject to deductible.");
    } else if (remainingDeductibleRaw === 0) {
      notes.push("No remaining deductible is applied in this scenario.");
    } else if (deductibleApplied >= servicePrice) {
      notes.push("The service cost is fully covered by remaining deductible (before copay/coinsurance).");
    }

    // Copay scenario (simplified):
    // Patient pays deductible first (if applicable), then a flat copay for the service.
    // Some plans do copay without deductible for certain services; user controls via checkbox.
    const copayTotal = deductibleApplied + (remainingAfterDeductible > 0 ? copayAmount : 0);

    // Coinsurance scenario:
    // Patient pays deductible first, then coinsurance percentage on remaining.
    const coinsuranceRate = coinsurancePercent / 100;
    const coinsuranceOnRemaining = remainingAfterDeductible * coinsuranceRate;
    const coinsuranceTotal = deductibleApplied + coinsuranceOnRemaining;

    notes.push("This is a simplified estimate. Real costs may depend on network rules and plan details.");

    setResult({
      deductibleApplied,
      remainingAfterDeductible,
      copayTotal,
      coinsuranceTotal,
      coinsuranceOnRemaining,
      notes,
    });
  };

  const winner =
    result && Number.isFinite(result.copayTotal) && Number.isFinite(result.coinsuranceTotal)
      ? result.copayTotal < result.coinsuranceTotal
        ? "Copay is cheaper for this service."
        : result.copayTotal > result.coinsuranceTotal
        ? "Coinsurance is cheaper for this service."
        : "Copay and coinsurance cost the same for this service."
      : null;

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
            <label style={{ fontSize: 13 }}>Service price (allowed amount)</label>
            <input
              name="servicePrice"
              value={inputs.servicePrice}
              onChange={handleChange}
              placeholder="e.g. 800"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Copay amount</label>
            <input
              name="copayAmount"
              value={inputs.copayAmount}
              onChange={handleChange}
              placeholder="e.g. 40"
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
            <label style={{ fontSize: 13 }}>Remaining deductible (optional)</label>
            <input
              name="remainingDeductible"
              value={inputs.remainingDeductible}
              onChange={handleChange}
              placeholder="e.g. 200"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <input
              type="checkbox"
              name="serviceSubjectToDeductible"
              checked={inputs.serviceSubjectToDeductible}
              onChange={handleChange}
            />
            Service is subject to deductible
          </label>

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
            <strong>Deductible applied:</strong> {fmt(result.deductibleApplied)}
          </div>
          <div>
            <strong>Remaining after deductible:</strong> {fmt(result.remainingAfterDeductible)}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Copay total (estimated):</strong> {fmt(result.copayTotal)}
          </div>
          <div>
            <strong>Coinsurance total (estimated):</strong> {fmt(result.coinsuranceTotal)}{" "}
            <span style={{ color: "#666" }}>
              (coinsurance on remaining: {fmt(result.coinsuranceOnRemaining)})
            </span>
          </div>

          {winner ? (
            <div style={{ marginTop: 6, fontWeight: 700 }}>{winner}</div>
          ) : null}

          <div style={{ marginTop: 6, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, idx) => (
              <div key={idx}>• {n}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
