"use client";

import { useState } from "react";

interface Result {
  futureValue: number;
  interestEarned: number;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState("12"); // 기본: Monthly
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (v: string) => {
    const n = parseFloat(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    const n = parseNumber(frequency);

    if (p <= 0 || t <= 0 || r < 0 || n <= 0) {
      setResult(null);
      return;
    }

    const annualRate = r / 100;
    const fv = p * Math.pow(1 + annualRate / n, n * t);
    const interestEarned = fv - p;

    setResult({
      futureValue: fv,
      interestEarned,
    });
  };

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Calculate compound interest on an investment or savings based on
        principal, annual rate, time, and compounding frequency.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Principal amount
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Annual interest rate (%)
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Time (years)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Compounding frequency
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
              background: "#fff",
            }}
          >
            <option value="1">Annually (1× per year)</option>
            <option value="2">Semiannually (2× per year)</option>
            <option value="4">Quarterly (4× per year)</option>
            <option value="12">Monthly (12× per year)</option>
            <option value="365">Daily (365× per year)</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        style={{
          padding: "8px 16px",
          borderRadius: 4,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Calculate
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e5e5e5",
            background: "#fafafa",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Future value:</strong> $
            {formatCurrency(result.futureValue)}
          </p>
          <p>
            <strong>Total interest earned:</strong> $
            {formatCurrency(result.interestEarned)}
          </p>
        </div>
      )}
    </div>
  );
}
