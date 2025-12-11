"use client";

import { useState } from "react";

type Result = {
  monthly: number;
  biweekly: number;
  weekly: number;
  acceleratedBiweekly: number;
  acceleratedWeekly: number;
};

export default function MortgagePaymentFrequencyCalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const payment = (P: number, r: number, n: number) => {
    if (r === 0) return P / n;
    const f = Math.pow(1 + r, n);
    return (P * r * f) / (f - 1);
  };

  const handleCalculate = () => {
    const P = parseNumber(principal);
    const rate = parseNumber(annualRate) / 100;
    const termYears = parseNumber(years);

    if (P <= 0 || rate < 0 || termYears <= 0) {
      setResult(null);
      return;
    }

    const monthlyRate = rate / 12;
    const totalMonths = termYears * 12;

    const monthly = payment(P, monthlyRate, totalMonths);

    // Biweekly = 26 payments/year
    const biweeklyRate = rate / 26;
    const totalBiweeks = termYears * 26;
    const biweekly = payment(P, biweeklyRate, totalBiweeks);

    // Weekly = 52 payments/year
    const weeklyRate = rate / 52;
    const totalWeeks = termYears * 52;
    const weekly = payment(P, weeklyRate, totalWeeks);

    // Accelerated biweekly = monthly payment / 2
    const acceleratedBiweekly = monthly / 2;

    // Accelerated weekly = monthly payment / 4
    const acceleratedWeekly = monthly / 4;

    setResult({
      monthly,
      biweekly,
      weekly,
      acceleratedBiweekly,
      acceleratedWeekly,
    });
  };

  const handleReset = () => {
    setPrincipal("");
    setAnnualRate("");
    setYears("");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Compare mortgage payments across monthly, biweekly, weekly, and
        accelerated payment schedules.
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
          Mortgage amount
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 400000"
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
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 5"
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
          Amortization period (years)
          <input
            type="text"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 25"
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
          onClick={handleCalculate}
          style={{
            padding: "8px 14px",
            background: "#0366d6",
            color: "#fff",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Calculate
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            background: "#fff",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
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
          }}
        >
          <p>
            <strong>Monthly payment:</strong> {formatNumber(result.monthly)}
          </p>
          <p>
            <strong>Biweekly payment:</strong> {formatNumber(result.biweekly)}
          </p>
          <p>
            <strong>Weekly payment:</strong> {formatNumber(result.weekly)}
          </p>
          <p>
            <strong>Accelerated biweekly:</strong>{" "}
            {formatNumber(result.acceleratedBiweekly)}
          </p>
          <p>
            <strong>Accelerated weekly:</strong>{" "}
            {formatNumber(result.acceleratedWeekly)}
          </p>
        </div>
      )}
    </div>
  );
}
