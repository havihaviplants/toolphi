"use client";

import { useState } from "react";

interface Result {
  months: number;
  years: number;
  totalContributed: number;
  interestEarned: number;
}

export default function SavingsGoalCalculator() {
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
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
    setError(null);
    setResult(null);

    const current = parseNumber(currentSavings);
    const monthly = parseNumber(monthlyContribution);
    const rate = parseNumber(annualRate);
    const target = parseNumber(targetAmount);

    if (target <= 0) {
      setError("Please enter a positive savings goal amount.");
      return;
    }

    if (current >= target) {
      setResult({
        months: 0,
        years: 0,
        totalContributed: 0,
        interestEarned: 0,
      });
      return;
    }

    if (monthly <= 0 && rate <= 0) {
      setError(
        "With zero monthly contribution and zero growth, you cannot reach your goal."
      );
      return;
    }

    const monthlyRate = rate > 0 ? rate / 100 / 12 : 0;
    let balance = current;
    let months = 0;
    let contributed = 0;

    const maxMonths = 6000; // 500년 상한

    if (monthlyRate === 0) {
      // 단순 선형: 목표까지 얼마 남았는지
      if (monthly <= 0) {
        setError(
          "Monthly contribution must be greater than zero to reach your goal."
        );
        return;
      }
      const needed = target - current;
      months = Math.ceil(needed / monthly);
      contributed = monthly * months;
      const interestEarned = balance + contributed - current - contributed; // 0
      setResult({
        months,
        years: months / 12,
        totalContributed: contributed,
        interestEarned,
      });
      return;
    }

    while (balance < target && months < maxMonths) {
      months += 1;
      // 이자 먼저
      balance = balance * (1 + monthlyRate);
      // 그다음 불입
      balance += monthly;
      contributed += monthly;
    }

    if (months >= maxMonths && balance < target) {
      setError(
        "It takes too long to reach this goal with the current inputs. Try increasing your monthly contribution or rate."
      );
      return;
    }

    const interestEarned = balance - current - contributed;

    setResult({
      months,
      years: months / 12,
      totalContributed: contributed,
      interestEarned,
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
        See how long it will take to reach a savings goal based on your current
        balance, monthly contributions, and expected annual growth rate.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Current savings
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
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
          Monthly contribution
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
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
          Annual interest/growth rate (%)
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
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
          Savings goal amount
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
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
        Calculate time to goal
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
            <strong>Time to reach goal:</strong> {result.months} months (
            {result.years.toFixed(1)} years)
          </p>
          <p>
            <strong>Total contributed:</strong> $
            {formatCurrency(result.totalContributed)}
          </p>
          <p>
            <strong>Interest earned:</strong> $
            {formatCurrency(result.interestEarned)}
          </p>
        </div>
      )}
    </div>
  );
}
