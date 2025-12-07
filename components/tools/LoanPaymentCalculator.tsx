// components/tools/LoanPaymentCalculator.tsx
"use client";

import { useState } from "react";

export default function LoanPaymentCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const P = parseNumber(principal); // loan principal
    const r = parseNumber(annualRate) / 100 / 12; // monthly interest rate
    const n = parseNumber(years) * 12; // months

    if (P <= 0 || r <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    // 월 상환액 공식: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthly =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const total = monthly * n;
    const interest = total - P;

    setResult({
      monthlyPayment: monthly,
      totalPayment: total,
      totalInterest: interest,
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
        Enter your loan amount, interest rate, and term to estimate your
        monthly payment.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 50000"
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
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 5"
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
          Loan term (years)
          <input
            type="text"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 10"
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
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        style={{
          padding: "8px 14px",
          borderRadius: 4,
          border: "none",
          background: "#0366d6",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Calculate payment
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Estimated monthly payment:</strong>{" "}
            {formatNumber(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total payment over term:</strong>{" "}
            {formatNumber(result.totalPayment)}
          </p>
          <p>
            <strong>Total interest paid:</strong>{" "}
            {formatNumber(result.totalInterest)}
          </p>
        </div>
      )}
    </div>
  );
}
