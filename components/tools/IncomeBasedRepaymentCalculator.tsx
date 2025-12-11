"use client";

import { useState } from "react";

type Result = {
  standardMonthly: number;
  incomeBasedMonthly: number;
  incomeShare: number; // % of monthly income
};

export default function IncomeBasedRepaymentCalculator() {
  const [balance, setBalance] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [incomePercent, setIncomePercent] = useState("10");
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
    const P = parseNumber(balance); // loan balance
    const rate = parseNumber(annualRate) / 100;
    const termYears = parseNumber(years);
    const income = parseNumber(annualIncome);
    const pct = parseNumber(incomePercent);

    if (P <= 0 || termYears <= 0 || income <= 0 || pct <= 0) {
      setResult(null);
      return;
    }

    const r = rate / 12; // monthly interest rate
    const n = termYears * 12; // months

    let standardMonthly: number;
    if (r === 0) {
      standardMonthly = P / n;
    } else {
      standardMonthly =
        (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const monthlyIncome = income / 12;
    const incomeBasedMonthly = (monthlyIncome * pct) / 100;
    const incomeShare =
      monthlyIncome > 0 ? (incomeBasedMonthly / monthlyIncome) * 100 : 0;

    setResult({
      standardMonthly,
      incomeBasedMonthly,
      incomeShare,
    });
  };

  const handleReset = () => {
    setBalance("");
    setAnnualRate("");
    setYears("");
    setAnnualIncome("");
    setIncomePercent("10");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Compare a standard fixed student loan payment with an income-based
        repayment amount based on your annual income and payment percentage.
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
            placeholder="e.g. 45000"
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
            placeholder="e.g. 6"
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
          Standard repayment term (years)
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

        <label style={{ fontSize: 14 }}>
          Annual income
          <input
            type="text"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            placeholder="e.g. 55000"
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
          Percentage of income for loan payments (%)
          <input
            type="text"
            value={incomePercent}
            onChange={(e) => setIncomePercent(e.target.value)}
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
          Calculate
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
            <strong>Standard monthly payment:</strong>{" "}
            {formatNumber(result.standardMonthly)}
          </p>
          <p>
            <strong>Income-based monthly payment:</strong>{" "}
            {formatNumber(result.incomeBasedMonthly)}
          </p>
          <p>
            <strong>Share of monthly income used for payments:</strong>{" "}
            {result.incomeShare.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
