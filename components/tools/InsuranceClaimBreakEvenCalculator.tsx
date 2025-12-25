// components/tools/InsuranceClaimBreakEvenCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  lossAmount: string; // repair/loss
  deductible: string;

  premiumIncreasePerYear: string; // expected increase after claim
  yearsPremiumIncreaseLasts: string; // how many years increase lasts

  // Optional adjustments
  claimPaymentCap: string; // optional limit for payout
  includeTimeValue: boolean;
  discountRatePercent: string; // optional, for PV of premium increases
};

type Result = {
  estimatedPayout: number;
  premiumIncreaseCostNominal: number;
  premiumIncreaseCostPV: number;
  netBenefitNominal: number;
  netBenefitPV: number;
  breakEvenPremiumIncreasePerYearNominal: number;
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

function pvAnnuity(payment: number, r: number, n: number): number {
  // PV of level payment at end of each year
  if (n <= 0) return 0;
  if (r <= 0) return payment * n;
  return payment * (1 - Math.pow(1 + r, -n)) / r;
}

export default function InsuranceClaimBreakEvenCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    lossAmount: "",
    deductible: "",
    premiumIncreasePerYear: "",
    yearsPremiumIncreaseLasts: "3",
    claimPaymentCap: "",
    includeTimeValue: false,
    discountRatePercent: "5",
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

    const lossAmount = parseNumber(inputs.lossAmount);
    const deductible = parseNumber(inputs.deductible);
    const premiumIncreasePerYear = parseNumber(inputs.premiumIncreasePerYear);
    const yearsPremiumIncreaseLasts = parseNumber(inputs.yearsPremiumIncreaseLasts);

    const claimPaymentCap = inputs.claimPaymentCap.trim().length === 0 ? Infinity : parseNumber(inputs.claimPaymentCap);
    const discountRatePercent = parseNumber(inputs.discountRatePercent);

    if (!Number.isFinite(lossAmount) || lossAmount < 0) {
      setError("Loss amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(deductible) || deductible < 0) {
      setError("Deductible must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(premiumIncreasePerYear) || premiumIncreasePerYear < 0) {
      setError("Premium increase per year must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(yearsPremiumIncreaseLasts) || yearsPremiumIncreaseLasts < 0 || yearsPremiumIncreaseLasts > 20) {
      setError("Years premium increase lasts must be between 0 and 20.");
      return;
    }
    if (!Number.isFinite(claimPaymentCap) || claimPaymentCap < 0) {
      setError("Claim payment cap must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(discountRatePercent) || discountRatePercent < 0 || discountRatePercent > 30) {
      setError("Discount rate must be between 0 and 30.");
      return;
    }

    // Payout estimate: max(loss - deductible, 0), capped
    const rawPayout = Math.max(0, lossAmount - deductible);
    const estimatedPayout = claimPaymentCap === Infinity ? rawPayout : Math.min(rawPayout, claimPaymentCap);

    const nYears = Math.round(yearsPremiumIncreaseLasts);
    const premiumIncreaseCostNominal = premiumIncreasePerYear * nYears;

    const r = (discountRatePercent / 100);
    const premiumIncreaseCostPV = inputs.includeTimeValue ? pvAnnuity(premiumIncreasePerYear, r, nYears) : premiumIncreaseCostNominal;

    const netBenefitNominal = estimatedPayout - premiumIncreaseCostNominal;
    const netBenefitPV = estimatedPayout - premiumIncreaseCostPV;

    // Break-even premium increase per year (nominal) such that payout == premiumIncreasePerYear * years
    const breakEvenPremiumIncreasePerYearNominal = nYears > 0 ? (estimatedPayout / nYears) : Infinity;

    const notes: string[] = [];
    notes.push("This is a simplified break-even estimate and does not model non-renewal risk or future underwriting changes.");
    notes.push("Some claims may affect rates longer (or shorter) than your estimate.");
    if (claimPaymentCap !== Infinity) notes.push("Payout is capped by the claim payment cap you entered.");
    if (inputs.includeTimeValue) notes.push("Premium increases are discounted to present value using your discount rate.");

    setResult({
      estimatedPayout,
      premiumIncreaseCostNominal,
      premiumIncreaseCostPV,
      netBenefitNominal,
      netBenefitPV,
      breakEvenPremiumIncreasePerYearNominal,
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
            <label style={{ fontSize: 13 }}>Loss / repair amount</label>
            <input
              name="lossAmount"
              value={inputs.lossAmount}
              onChange={handleChange}
              placeholder="e.g. 2500"
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
            <div style={{ fontSize: 13, fontWeight: 800 }}>Premium increase estimate</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Premium increase per year</label>
              <input
                name="premiumIncreasePerYear"
                value={inputs.premiumIncreasePerYear}
                onChange={handleChange}
                placeholder="e.g. 200"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Years the increase lasts</label>
              <input
                name="yearsPremiumIncreaseLasts"
                value={inputs.yearsPremiumIncreaseLasts}
                onChange={handleChange}
                placeholder="e.g. 3"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Optional adjustments</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Claim payment cap (optional)</label>
              <input
                name="claimPaymentCap"
                value={inputs.claimPaymentCap}
                onChange={handleChange}
                placeholder="leave blank for no cap"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                name="includeTimeValue"
                checked={inputs.includeTimeValue}
                onChange={handleChange}
              />
              Discount premium increases to present value
            </label>

            {inputs.includeTimeValue ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13 }}>Discount rate (%)</label>
                <input
                  name="discountRatePercent"
                  value={inputs.discountRatePercent}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  inputMode="decimal"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>
            ) : null}
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
            Calculate break-even
          </button>
        </div>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div>
            <strong>Estimated payout:</strong> {fmt(result.estimatedPayout)}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Premium increase cost (nominal):</strong> {fmt(result.premiumIncreaseCostNominal)}
          </div>

          <div>
            <strong>Premium increase cost ({inputs.includeTimeValue ? "present value" : "nominal"}):</strong>{" "}
            {fmt(result.premiumIncreaseCostPV)}
          </div>

          <div style={{ marginTop: 8, fontWeight: 900 }}>
            Net benefit ({inputs.includeTimeValue ? "PV" : "nominal"}):{" "}
            {fmt(inputs.includeTimeValue ? result.netBenefitPV : result.netBenefitNominal)}
          </div>

          {result.breakEvenPremiumIncreasePerYearNominal !== Infinity ? (
            <div style={{ marginTop: 8 }}>
              <strong>Break-even premium increase per year (nominal):</strong>{" "}
              {fmt(result.breakEvenPremiumIncreasePerYearNominal)}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <strong>Break-even:</strong> Need years &gt; 0 to compute break-even premium increase.
            </div>
          )}

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
