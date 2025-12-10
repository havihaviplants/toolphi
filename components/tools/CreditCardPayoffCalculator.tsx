"use client";

import { useState } from "react";

interface Result {
  months: number;
  years: number;
  totalPaid: number;
  interestPaid: number;
}

export default function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const B = parseNumber(balance);
    const apr = parseNumber(rate);
    const payment = parseNumber(monthlyPayment);

    setError(null);
    setResult(null);

    if (B <= 0 || payment <= 0 || apr < 0) {
      setError("Please enter a positive balance, rate, and monthly payment.");
      return;
    }

    const monthlyRate = apr / 100 / 12;

    // 이자율 0%인 경우: 단순히 원금을 나누기
    if (monthlyRate === 0) {
      const months = Math.ceil(B / payment);
      const totalPaid = payment * months;
      const interestPaid = totalPaid - B;

      setResult({
        months,
        years: months / 12,
        totalPaid,
        interestPaid,
      });
      return;
    }

    // 월 이자보다 적게 내면 상환 불가능
    const minPayment = B * monthlyRate;
    if (payment <= minPayment) {
      setError(
        "Monthly payment is too low. Increase it to be higher than the monthly interest."
      );
      return;
    }

    // n = - ln(1 - r * B / M) / ln(1 + r)
    const r = monthlyRate;
    const ratio = 1 - (r * B) / payment;

    if (ratio <= 0) {
      setError(
        "Monthly payment is too low for this balance and interest rate. Increase the payment amount."
      );
      return;
    }

    const n = -Math.log(ratio) / Math.log(1 + r);
    const months = Math.ceil(n);
    const totalPaid = payment * months;
    const interestPaid = totalPaid - B;

    setResult({
      months,
      years: months / 12,
      totalPaid,
      interestPaid,
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
        Estimate how long it will take to pay off a credit card based on your
        balance, interest rate, and monthly payment amount.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Current balance
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
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
          Annual interest rate (APR %)
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
          Monthly payment amount
          <input
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
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

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 4,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {result && !error && (
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
            <strong>Time to pay off:</strong> {result.months} months (
            {result.years.toFixed(1)} years)
          </p>
          <p>
            <strong>Total paid:</strong> ${formatCurrency(result.totalPaid)}
          </p>
          <p>
            <strong>Total interest paid:</strong> $
            {formatCurrency(result.interestPaid)}
          </p>
        </div>
      )}
    </div>
  );
}
