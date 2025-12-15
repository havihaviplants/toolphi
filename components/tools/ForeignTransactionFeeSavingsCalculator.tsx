// components/tools/ForeignTransactionFeeSavingsCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  yearlyForeignSpending: string; // $
  feeRatePercent: string; // e.g. 3
  newCardAnnualFee: string; // optional $
};

type Result = {
  annualFeesPaid: number; // $
  netSavingsAfterNewFee: number; // $
  breakEvenForeignSpendForNewFee: number | null; // $
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ForeignTransactionFeeSavingsCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    yearlyForeignSpending: "",
    feeRatePercent: "",
    newCardAnnualFee: "",
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

    const yearlyForeignSpending = parseNumber(inputs.yearlyForeignSpending);
    const feeRatePercent = parseNumber(inputs.feeRatePercent);
    const newCardAnnualFee = inputs.newCardAnnualFee.trim()
      ? parseNumber(inputs.newCardAnnualFee)
      : 0;

    if (!Number.isFinite(yearlyForeignSpending) || yearlyForeignSpending < 0) {
      setError("Yearly foreign spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(feeRatePercent) || feeRatePercent < 0) {
      setError("Fee rate must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(newCardAnnualFee) || newCardAnnualFee < 0) {
      setError("New card annual fee must be a valid number (0 or greater).");
      return;
    }

    const feeRate = feeRatePercent / 100;

    const annualFeesPaid = yearlyForeignSpending * feeRate;
    const netSavingsAfterNewFee = annualFeesPaid - newCardAnnualFee;

    const breakEvenForeignSpendForNewFee =
      feeRate > 0 ? newCardAnnualFee / feeRate : null;

    setResult({
      annualFeesPaid,
      netSavingsAfterNewFee,
      breakEvenForeignSpendForNewFee:
        breakEvenForeignSpendForNewFee !== null &&
        Number.isFinite(breakEvenForeignSpendForNewFee)
          ? breakEvenForeignSpendForNewFee
          : null,
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
            <label style={{ fontSize: 13 }}>Yearly foreign spending</label>
            <input
              name="yearlyForeignSpending"
              value={inputs.yearlyForeignSpending}
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
            <label style={{ fontSize: 13 }}>Foreign transaction fee rate (%)</label>
            <input
              name="feeRatePercent"
              value={inputs.feeRatePercent}
              onChange={handleChange}
              placeholder="e.g. 3"
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
            <label style={{ fontSize: 13 }}>
              New card annual fee (optional, for net savings)
            </label>
            <input
              name="newCardAnnualFee"
              value={inputs.newCardAnnualFee}
              onChange={handleChange}
              placeholder="e.g. 95"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              backgroundColor: "#111",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Calculate
          </button>

          {error && (
            <p style={{ color: "#b00020", fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
      </form>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #e1e4e8",
          padding: 16,
          backgroundColor: "#f6f8fa",
          minHeight: 160,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px 0" }}>
          Results
        </h3>

        {!result ? (
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
            Enter values and click Calculate.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Estimated annual fees paid</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.annualFeesPaid)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Net savings (after new annual fee)</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.netSavingsAfterNewFee)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>
                Break-even foreign spend (to cover new annual fee)
              </span>
              <strong style={{ fontSize: 14 }}>
                {result.breakEvenForeignSpendForNewFee === null
                  ? "-"
                  : `$${formatMoney(result.breakEvenForeignSpendForNewFee)}`}
              </strong>
            </div>

            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
              {result.netSavingsAfterNewFee >= 0
                ? "At this spending level, a no-foreign-fee card could save you money."
                : "At this spending level, the new card’s annual fee may outweigh your fee savings."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
