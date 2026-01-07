"use client";

import { useState } from "react";

export default function AgriculturalLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [loanYears, setLoanYears] = useState("");

  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const calculate = () => {
    const principal = parseNumber(loanAmount);
    const monthlyRate = parseNumber(annualRate) / 100 / 12;
    const months = parseNumber(loanYears) * 12;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      setResult(null);
      return;
    }

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    setResult({ monthlyPayment, totalPayment, totalInterest });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        Use this calculator to estimate agricultural loan payments based on
        principal, interest rate, and repayment term. Results include principal
        and interest only.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Loan amount
          <div style={{ fontSize: 12, color: "#777" }}>
            Total amount borrowed for agricultural purposes
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 150000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Enter the yearly interest rate
          </div>
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 5.5"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Length of the loan in years
          </div>
          <input
            type="text"
            value={loanYears}
            onChange={(e) => setLoanYears(e.target.value)}
            placeholder="e.g. 15"
            style={inputStyle}
          />
        </label>
      </div>

      <button
        onClick={calculate}
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
            marginTop: 18,
            padding: 14,
            borderRadius: 8,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
          }}
        >
          <p>
            <strong>Monthly payment:</strong> {format(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total payment:</strong> {format(result.totalPayment)}
          </p>
          <p>
            <strong>Total interest:</strong> {format(result.totalInterest)}
          </p>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};
