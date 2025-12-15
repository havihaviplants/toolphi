// components/tools/PointsToCashValueCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  monthlySpending: string; // $
  pointsPerDollar: string; // e.g. 1.5
  centsPerPoint: string; // e.g. 1.2 (¢)
  annualFee: string; // optional $
  signupBonusPoints: string; // optional points
};

type Result = {
  monthlyPoints: number;
  yearlyPoints: number;
  monthlyValue: number; // $
  yearlyValue: number; // $
  yearlyNetAfterFee: number; // $
  signupBonusValue: number; // $
  totalFirstYearNet: number; // $ (yearly value + signup value - fee)
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatNumber(n: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}

export default function PointsToCashValueCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlySpending: "",
    pointsPerDollar: "",
    centsPerPoint: "",
    annualFee: "",
    signupBonusPoints: "",
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
    const pointsPerDollar = parseNumber(inputs.pointsPerDollar);
    const centsPerPoint = parseNumber(inputs.centsPerPoint);

    const annualFee = inputs.annualFee.trim() ? parseNumber(inputs.annualFee) : 0;
    const signupBonusPoints = inputs.signupBonusPoints.trim()
      ? parseNumber(inputs.signupBonusPoints)
      : 0;

    if (!Number.isFinite(monthlySpending) || monthlySpending < 0) {
      setError("Monthly spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(pointsPerDollar) || pointsPerDollar <= 0) {
      setError("Earn rate must be greater than 0 (e.g. 1.5 points per $1).");
      return;
    }
    if (!Number.isFinite(centsPerPoint) || centsPerPoint <= 0) {
      setError("Point value must be greater than 0 (e.g. 1.2 cents per point).");
      return;
    }
    if (!Number.isFinite(annualFee) || annualFee < 0) {
      setError("Annual fee must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(signupBonusPoints) || signupBonusPoints < 0) {
      setError("Signup bonus points must be a valid number (0 or greater).");
      return;
    }

    const monthlyPoints = monthlySpending * pointsPerDollar;
    const yearlyPoints = monthlyPoints * 12;

    // cents per point -> dollars per point
    const dollarsPerPoint = centsPerPoint / 100;

    const monthlyValue = monthlyPoints * dollarsPerPoint;
    const yearlyValue = monthlyValue * 12;

    const yearlyNetAfterFee = yearlyValue - annualFee;

    const signupBonusValue = signupBonusPoints * dollarsPerPoint;
    const totalFirstYearNet = yearlyValue + signupBonusValue - annualFee;

    setResult({
      monthlyPoints,
      yearlyPoints,
      monthlyValue,
      yearlyValue,
      yearlyNetAfterFee,
      signupBonusValue,
      totalFirstYearNet,
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
              placeholder="e.g. 2000"
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
            <label style={{ fontSize: 13 }}>Earn rate (points per $1)</label>
            <input
              name="pointsPerDollar"
              value={inputs.pointsPerDollar}
              onChange={handleChange}
              placeholder="e.g. 1.5"
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
            <label style={{ fontSize: 13 }}>Point value (cents per point)</label>
            <input
              name="centsPerPoint"
              value={inputs.centsPerPoint}
              onChange={handleChange}
              placeholder="e.g. 1.2"
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

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Signup bonus points (optional)</label>
            <input
              name="signupBonusPoints"
              value={inputs.signupBonusPoints}
              onChange={handleChange}
              placeholder="e.g. 60000"
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
              <span style={{ fontSize: 13, color: "#555" }}>Monthly points</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.monthlyPoints, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Yearly points</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.yearlyPoints, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Monthly value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.monthlyValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Yearly value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.yearlyValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Net yearly value (after fee)</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.yearlyNetAfterFee)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Signup bonus value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.signupBonusValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Total first-year net</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.totalFirstYearNet)}</strong>
            </div>

            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
              Tip: Point values vary by redemption. If you’re unsure, try 1.0–1.5 cents per point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
