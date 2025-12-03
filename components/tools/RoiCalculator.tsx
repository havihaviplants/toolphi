// components/tools/RoiCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  initialInvestment: string;
  finalValue: string;
};

type Result = {
  totalProfit: number;
  roi: number; // 0.25 = 25%
};

function parseNumber(value: string): number {
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function formatCurrency(value: number): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return "-";
  return (value * 100).toFixed(1);
}

export default function RoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    initialInvestment: "",
    finalValue: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const initialInvestment = parseNumber(inputs.initialInvestment);
    const finalValue = parseNumber(inputs.finalValue);

    if (initialInvestment <= 0) {
      setError("Initial investment must be greater than 0.");
      setResult(null);
      return;
    }

    const totalProfit = finalValue - initialInvestment;
    const roi = totalProfit / initialInvestment;

    setResult({
      totalProfit,
      roi,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>ROI Calculator</h2>
      <p style={{ fontSize: 14, color: "#586069", marginBottom: 16 }}>
        Calculate return on investment (ROI) by comparing your initial investment with the final
        value of the asset or project.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Initial investment</label>
            <input
              name="initialInvestment"
              value={inputs.initialInvestment}
              onChange={handleChange}
              placeholder="e.g. 10000"
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
            <label style={{ fontSize: 13 }}>Final value</label>
            <input
              name="finalValue"
              value={inputs.finalValue}
              onChange={handleChange}
              placeholder="e.g. 13000"
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
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#0366d6",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Calculate ROI
          </button>

          {error && (
            <p style={{ color: "#d73a49", fontSize: 13, marginTop: 4 }}>
              {error}
            </p>
          )}
        </div>

        <div
          style={{
            borderRadius: 8,
            border: "1px solid #e1e4e8",
            padding: 16,
            backgroundColor: "#f6f8fa",
            minHeight: 140,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Results</h3>
          {!result && (
            <p style={{ fontSize: 13, color: "#586069" }}>
              Enter the initial investment and final value, then click{" "}
              <strong>"Calculate ROI"</strong> to see your return.
            </p>
          )}

          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <div>
                <strong>Total profit: </strong>
                {formatCurrency(result.totalProfit)}
              </div>
              <div>
                <strong>ROI: </strong>
                {formatPercent(result.roi)}%
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
