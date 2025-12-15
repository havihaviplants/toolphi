// components/tools/CashbackValueCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  monthlySpending: string;
  cashbackRatePercent: string; // e.g. 2 for 2%
  annualFee: string; // optional
};

type Result = {
  monthlyCashback: number;
  yearlyCashback: number;
  yearlyNetAfterFee: number;
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

export default function CashbackValueCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlySpending: "",
    cashbackRatePercent: "",
    annualFee: "",
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

    const monthlySpending = parseNumber(inputs.monthlySpending);
    const cashbackRatePercent = parseNumber(inputs.cashbackRatePercent);

    const annualFee = inputs.annualFee.trim() ? parseNumber(inputs.annualFee) : 0;

    if (!Number.isFinite(monthlySpending) || monthlySpending < 0) {
      setError("Monthly spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(cashbackRatePercent) || cashbackRatePercent <= 0) {
      setError("Cashback rate must be greater than 0 (e.g. 2 for 2%).");
      return;
    }
    if (!Number.isFinite(annualFee) || annualFee < 0) {
      setError("Annual fee must be a valid number (0 or greater).");
      return;
    }

    const rate = cashbackRatePercent / 100;

    const monthlyCashback = monthlySpending * rate;
    const yearlyCashback = monthlyCashback * 12;
    const yearlyNetAfterFee = yearlyCashback - annualFee;

    setResult({
      monthlyCashback,
      yearlyCashback,
      yearlyNetAfterFee,
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
            <label style={{ fontSize: 13 }}>Monthly spending</label>
            <input
              name="monthlySpending"
              value={inputs.monthlySpending}
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
            <label style={{ fontSize: 13 }}>Cashback rate (%)</label>
            <input
              name="cashbackRatePercent"
              value={inputs.cashbackRatePercent}
              onChange={handleChange}
              placeholder="e.g. 2 (for 2%)"
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
            <label style={{ fontSize: 13 }}>Annual fee (optional)</label>
            <input
              name="annualFee"
              value={inputs.annualFee}
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
          minHeight: 140,
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
              <span style={{ fontSize: 13, color: "#555" }}>Monthly cashback</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.monthlyCashback)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Yearly cashback</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.yearlyCashback)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Net yearly value (after fee)</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.yearlyNetAfterFee)}</strong>
            </div>

            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
              {result.yearlyNetAfterFee >= 0
                ? "At this spending level, your cashback likely exceeds the annual fee."
                : "At this spending level, you may not earn enough cashback to cover the annual fee."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
