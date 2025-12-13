"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PersonalLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const principal = parseNumber(loanAmount);
    const rate = parseNumber(annualRate);
    const termYears = parseNumber(years);

    if (!principal || !rate || !termYears) {
      setResult(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - principal;

    setResult({ monthlyPayment, totalPayment, totalInterest });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        Personal Loan Payment Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Calculate your monthly payment and total cost for a personal loan.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 15000"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Annual interest rate (%)
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 11"
            step="0.01"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Loan term (years)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 3"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <button
          onClick={handleCalculate}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Calculate
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: 16,
            border: "1px solid #e5e5e5",
            borderRadius: 14,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 14 }}>
              <strong>Monthly payment:</strong>{" "}
              {formatCurrency(result.monthlyPayment)}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Total repaid:</strong>{" "}
              {formatCurrency(result.totalPayment)}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Total interest:</strong>{" "}
              {formatCurrency(result.totalInterest)}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Assumes a fixed-rate amortizing personal loan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
