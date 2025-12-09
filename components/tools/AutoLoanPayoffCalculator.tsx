"use client";

import { useState } from "react";

interface Result {
  monthsToPayoff: number;
  yearsToPayoff: number;
  totalInterest: number;
}

export default function AutoLoanPayoffCalculator() {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
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
    const bal = parseNumber(balance);
    const r = parseNumber(rate);
    const basePayment = parseNumber(monthlyPayment);
    const extra = parseNumber(extraPayment);

    const payment = basePayment + extra;
    const monthlyRate = r / 100 / 12;

    setError(null);
    setResult(null);

    if (bal <= 0 || payment <= 0) {
      setError("Please enter a valid balance and payment.");
      return;
    }
    if (monthlyRate === 0) {
      const months = bal / payment;
      const totalInterest = 0;
      setResult({
        monthsToPayoff: months,
        yearsToPayoff: months / 12,
        totalInterest,
      });
      return;
    }

    // N = -ln(1 - r*P/PMT) / ln(1 + r)
    const minPayment = bal * monthlyRate;
    if (payment <= minPayment) {
      setError(
        "Your payment is too low to ever pay off the loan. Increase your monthly payment."
      );
      return;
    }

    const numerator = 1 - (monthlyRate * bal) / payment;
    if (numerator <= 0) {
      setError(
        "Your inputs result in an invalid payoff calculation. Try increasing the payment."
      );
      return;
    }

    const months =
      -Math.log(numerator) / Math.log(1 + monthlyRate);

    // Total paid = payment * months, interest = total - balance
    const totalPaid = payment * months;
    const totalInterest = totalPaid - bal;

    setResult({
      monthsToPayoff: months,
      yearsToPayoff: months / 12,
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
        See how long it will take to pay off your auto loan and how
        much interest you will pay, with or without extra monthly
        payments.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Current loan balance
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
          Current monthly payment
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

        <label style={{ fontSize: 14 }}>
          Extra monthly payment (optional)
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
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
        Calculate payoff time
      </button>

      {error && (
        <p
          style={{
            marginTop: 12,
            color: "#b00020",
            fontSize: 13,
          }}
        >
          {error}
        </p>
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
            <strong>Months to payoff:</strong>{" "}
            {result.monthsToPayoff.toFixed(1)} months
          </p>
          <p>
            <strong>Years to payoff:</strong>{" "}
            {result.yearsToPayoff.toFixed(2)} years
          </p>
          <p>
            <strong>Total interest paid:</strong> $
            {formatCurrency(result.totalInterest)}
          </p>
        </div>
      )}
    </div>
  );
}
