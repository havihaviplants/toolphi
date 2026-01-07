// components/tools/FarmLoanPaymentCalculator.tsx
"use client";

import { useState } from "react";

export default function FarmLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
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
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const handleCalculate = () => {
    const P = parseNumber(loanAmount);
    const r = parseNumber(annualRate) / 100 / 12;
    const n = parseNumber(years) * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    // Fixed-rate amortization monthly payment
    // M = P * r * (1+r)^n / ((1+r)^n - 1)
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
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        Enter your farm loan details to estimate monthly payment and total
        interest. This is a principal + interest estimate (fees and insurance
        not included).
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Loan amount
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
            Total amount you borrow (principal)
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 250000"
            style={{
              width: "100%",
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
            Example: 6 means 6% APR
          </div>
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 6"
            style={{
              width: "100%",
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
            Total repayment period
          </div>
          <input
            type="text"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 20"
            style={{
              width: "100%",
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 6,
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
          padding: "9px 14px",
          borderRadius: 6,
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
            borderRadius: 8,
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
