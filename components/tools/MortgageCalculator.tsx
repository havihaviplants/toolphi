"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(annualRate);
    const termYears = parseFloat(years);

    if (!principal || !rate || !termYears) {
      setResult(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;

    // 고정금리 모기지 월 상환액 공식
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
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
        Enter your loan details to estimate your monthly mortgage payment and
        total interest over the life of the loan.
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
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="300000"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
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
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="4.5"
            step="0.01"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Term (years)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="30"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
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
        Calculate
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fafafa",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Monthly payment:</strong>{" "}
            ${result.monthlyPayment.toFixed(2)}
          </p>
          <p>
            <strong>Total payment:</strong> ${result.totalPayment.toFixed(2)}
          </p>
          <p>
            <strong>Total interest:</strong> $
            {result.totalInterest.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
