// components/tools/CarLoanCalculator.tsx
"use client";

import { useState } from "react";

interface Result {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
}

export default function CarLoanCalculator() {
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState(""); // 연 이자율 %
  const [termYears, setTermYears] = useState(""); // 년 단위
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = parseFloat(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const carPrice = parseNumber(price);
    const dp = parseNumber(downPayment);
    const rate = parseNumber(interestRate);
    const years = parseNumber(termYears);

    if (carPrice <= 0 || years <= 0) {
      setResult(null);
      return;
    }

    const loanAmount = Math.max(carPrice - dp, 0);
    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    const n = years * 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / n;
    } else {
      // 표준 원리금 균등 상환 공식
      const pow = Math.pow(1 + monthlyRate, n);
      monthlyPayment = (loanAmount * monthlyRate * pow) / (pow - 1);
    }

    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - loanAmount;

    setResult({
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPaid,
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
        Enter your car price, down payment, interest rate, and loan term to
        estimate your monthly car loan payment.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Car price
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
          Down payment
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
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
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
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
          Term (years)
          <input
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
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
        Calculate car payment
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
            <strong>Loan amount:</strong> ${formatCurrency(result.loanAmount)}
          </p>
          <p>
            <strong>Estimated monthly payment:</strong>{" "}
            ${formatCurrency(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total interest paid:</strong>{" "}
            ${formatCurrency(result.totalInterest)}
          </p>
          <p>
            <strong>Total paid over the loan:</strong>{" "}
            ${formatCurrency(result.totalPaid)}
          </p>
        </div>
      )}
    </div>
  );
}
