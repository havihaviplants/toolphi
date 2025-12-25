// components/tools/InsuranceVsSelfPayCostCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Inputs = {
  selfPayPrice: string; // cash price
  insuranceAllowedAmount: string; // allowed amount (negotiated rate)

  remainingDeductible: string; // optional
  costShareMode: "coinsurance" | "copay";
  coinsurancePercent: string; // if coinsurance
  copayAmount: string; // if copay

  remainingOutOfPocketMax: string; // optional cap
  serviceSubjectToDeductible: boolean;
};

type Result = {
  insurancePatientPays: number;
  selfPayPays: number;
  deductibleApplied: number;
  costShareApplied: number;
  cappedByOopMax: number; // the cap value applied (or 0)
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

export default function InsuranceVsSelfPayCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    selfPayPrice: "",
    insuranceAllowedAmount: "",
    remainingDeductible: "",
    costShareMode: "coinsurance",
    coinsurancePercent: "20",
    copayAmount: "40",
    remainingOutOfPocketMax: "",
    serviceSubjectToDeductible: true,
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCoinsurance = inputs.costShareMode === "coinsurance";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputs((prev) => ({ ...prev, [name]: checked }));
  };

  const costShareLabel = useMemo(() => {
    return isCoinsurance ? "Coinsurance rate (%)" : "Copay amount";
  }, [isCoinsurance]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const selfPayPrice = parseNumber(inputs.selfPayPrice);
    const insuranceAllowedAmount = parseNumber(inputs.insuranceAllowedAmount);

    const remainingDeductible = inputs.remainingDeductible.trim().length === 0 ? 0 : parseNumber(inputs.remainingDeductible);
    const remainingOutOfPocketMax =
      inputs.remainingOutOfPocketMax.trim().length === 0 ? Infinity : parseNumber(inputs.remainingOutOfPocketMax);

    const coinsurancePercent = parseNumber(inputs.coinsurancePercent);
    const copayAmount = parseNumber(inputs.copayAmount);

    if (!Number.isFinite(selfPayPrice) || selfPayPrice < 0) {
      setError("Self-pay price must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(insuranceAllowedAmount) || insuranceAllowedAmount < 0) {
      setError("Insurance allowed amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(remainingDeductible) || remainingDeductible < 0) {
      setError("Remaining deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(remainingOutOfPocketMax) || remainingOutOfPocketMax < 0) {
      setError("Remaining out-of-pocket max must be a valid number (0 or greater).");
      return;
    }

    if (isCoinsurance) {
      if (!Number.isFinite(coinsurancePercent) || coinsurancePercent < 0 || coinsurancePercent > 100) {
        setError("Coinsurance rate must be between 0 and 100.");
        return;
      }
    } else {
      if (!Number.isFinite(copayAmount) || copayAmount < 0) {
        setError("Copay amount must be a valid number (0 or greater).");
        return;
      }
    }

    const notes: string[] = [];
    notes.push("This is a simplified estimate. Real billing depends on plan rules and provider contracts.");

    // Insurance path:
    // 1) Deductible applied (if service subject to deductible)
    const deductibleApplied = inputs.serviceSubjectToDeductible
      ? Math.min(insuranceAllowedAmount, remainingDeductible)
      : 0;

    const remainingAfterDeductible = Math.max(0, insuranceAllowedAmount - deductibleApplied);

    // 2) Cost-sharing after deductible
    let costShareApplied = 0;
    if (remainingAfterDeductible > 0) {
      if (isCoinsurance) {
        costShareApplied = remainingAfterDeductible * (coinsurancePercent / 100);
      } else {
        costShareApplied = copayAmount;
      }
    }

    // 3) Raw patient cost
    const rawInsuranceCost = deductibleApplied + costShareApplied;

    // 4) Cap by remaining out-of-pocket max (if provided)
    const insurancePatientPays =
      remainingOutOfPocketMax === Infinity ? rawInsuranceCost : Math.min(rawInsuranceCost, remainingOutOfPocketMax);

    const cappedByOopMax =
      remainingOutOfPocketMax === Infinity ? 0 : Math.max(0, rawInsuranceCost - insurancePatientPays);

    if (!inputs.serviceSubjectToDeductible) {
      notes.push("You marked the service as not subject to deductible.");
    }
    if (remainingOutOfPocketMax !== Infinity) {
      notes.push("Insurance cost is capped by your remaining out-of-pocket maximum (if applicable).");
    }
    if (cappedByOopMax > 0) {
      notes.push("Your remaining out-of-pocket max reduced the insurance cost in this estimate.");
    }

    // Self-pay path
    const selfPayPays = selfPayPrice;

    // Winner
    let winner = "Using insurance is cheaper in this estimate.";
    if (selfPayPays < insurancePatientPays) winner = "Self-pay is cheaper in this estimate.";
    if (Math.abs(selfPayPays - insurancePatientPays) < 1e-9) winner = "Insurance and self-pay cost the same in this estimate.";

    setResult({
      insurancePatientPays,
      selfPayPays,
      deductibleApplied,
      costShareApplied,
      cappedByOopMax,
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
            <label style={{ fontSize: 13 }}>Self-pay (cash) price</label>
            <input
              name="selfPayPrice"
              value={inputs.selfPayPrice}
              onChange={handleChange}
              placeholder="e.g. 300"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Insurance allowed amount</label>
            <input
              name="insuranceAllowedAmount"
              value={inputs.insuranceAllowedAmount}
              onChange={handleChange}
              placeholder="e.g. 600"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Insurance plan details (simplified)</div>

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
                onChange={handleCheckbox}
              />
              Service is subject to deductible
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13 }}>Cost-sharing mode</label>
              <select
                name="costShareMode"
                value={inputs.costShareMode}
                onChange={handleChange}
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              >
                <option value="coinsurance">Coinsurance (%)</option>
                <option value="copay">Copay (flat)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>{costShareLabel}</label>
              {isCoinsurance ? (
                <input
                  name="coinsurancePercent"
                  value={inputs.coinsurancePercent}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              ) : (
                <input
                  name="copayAmount"
                  value={inputs.copayAmount}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Remaining out-of-pocket max (optional)</label>
              <input
                name="remainingOutOfPocketMax"
                value={inputs.remainingOutOfPocketMax}
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
          <div style={{ fontWeight: 900 }}>{result.winner}</div>

          <div style={{ marginTop: 6 }}>
            <strong>Insurance estimated cost:</strong> {fmt(result.insurancePatientPays)}
          </div>
          <div>
            <strong>Self-pay cost:</strong> {fmt(result.selfPayPays)}
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: "#444", display: "grid", gap: 4 }}>
            <div>
              • Deductible applied: <strong>{fmt(result.deductibleApplied)}</strong>
            </div>
            <div>
              • Cost-sharing applied: <strong>{fmt(result.costShareApplied)}</strong>
            </div>
            {result.cappedByOopMax > 0 ? (
              <div>
                • Reduced by out-of-pocket max: <strong>{fmt(result.cappedByOopMax)}</strong>
              </div>
            ) : null}
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
