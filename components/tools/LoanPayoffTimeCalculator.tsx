"use client";

import { useState } from "react";

type Result = {
  months: number;
  years: number;
  totalInterest: number;
};

export default function LoanPayoffTimeCalculator() {
  const [balance, setBalance] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const handleCalculate = () => {
    const P = parseNumber(balance);
    const rAnnual = parseNumber(annualRate);
    const payment = parseNumber(monthlyPayment);

    setError(null);
    setResult(null);

    if (P <= 0 || rAnnual < 0 || payment <= 0) {
      setError("Please enter a positive balance, interest rate, and monthly payment.");
      return;
    }

    const rMonthly = rAnnual / 100 / 12;

    // 이자 0%인 경우: 단순 나누기
    if (rMonthly === 0) {
      const months = Math.ceil(P / payment);
      const years = months / 12;
      const totalInterest = 0;
      setResult({ months, years, totalInterest });
      return;
    }

    // 최소 필요 상환금: 이자만 내는 수준
    const minPayment = P * rMonthly;
    if (payment <= minPayment) {
      setError(
        "Monthly payment is too low to ever pay off this loan. Increase the payment amount."
      );
      return;
    }

    // 반복 시뮬레이션으로 남은 기간 계산
    let bal = P;
    let months = 0;
    let totalInterest = 0;

    while (bal > 0 && months < 3600) {
      const interest = bal * rMonthly;
      totalInterest += interest;
      bal = bal + interest - payment;
      if (bal < 0) bal = 0;
      months++;
    }

    if (months >= 3600) {
      setError(
        "It would take an extremely long time to pay off this loan with the current payment. Increase your monthly payment."
      );
      return;
    }

    const years = months / 12;

    setResult({
      months,
      years,
      totalInterest,
    });
  };

  const handleReset = () => {
    setBalance("");
    setAnnualRate("");
    setMonthlyPayment("");
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate how long it will take to pay off a loan based on your remaining
        balance, interest rate, and monthly payment.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Remaining loan balance
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 12000"
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
          Annual interest rate (APR)
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 7"
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
          Monthly payment
          <input
            type="text"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            placeholder="e.g. 300"
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
          Calculate payoff time
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

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 10,
            borderRadius: 6,
            background: "#fff4f4",
            border: "1px solid #f3c2c2",
            fontSize: 13,
            color: "#a40000",
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
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Payoff time:</strong> {result.months} months (
            {result.years.toFixed(2)} years)
          </p>
          <p>
            <strong>Total interest from now until payoff:</strong>{" "}
            {formatNumber(result.totalInterest)}
          </p>
        </div>
      )}
    </div>
  );
}
