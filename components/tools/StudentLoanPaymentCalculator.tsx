// components/tools/StudentLoanPaymentCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export default function StudentLoanPaymentCalculator() {
  const [balance, setBalance] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const P = parseNumber(balance); // student loan balance
    const r = parseNumber(annualRate) / 100 / 12; // monthly interest rate
    const n = parseNumber(years) * 12; // months

    if (P <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    let monthlyPayment: number;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment =
        (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
    });
  };

  const handleReset = () => {
    setBalance("");
    setAnnualRate("");
    setYears("");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Use this calculator to estimate your monthly student loan payment, total
        amount repaid, and total interest cost for a fixed-rate student loan.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Student loan balance
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 35000"
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
          Annual interest rate (APR, %)
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 5.5"
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
          Repayment term (years)
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

      <div style={{ display: "flex", gap: 8 }}>
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

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

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
            <strong>Total amount repaid:</strong>{" "}
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
