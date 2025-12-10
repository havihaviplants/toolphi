"use client";

import { useState } from "react";

interface Result {
  currentLtv: number;
  maxLoanAmount: number;
  availableHeloc: number;
  interestOnlyPayment: number;
}

export default function HelocCalculator() {
  const [homeValue, setHomeValue] = useState("");
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [maxLtvPercent, setMaxLtvPercent] = useState("80");
  const [helocRate, setHelocRate] = useState("");
  const [plannedDraw, setPlannedDraw] = useState("");

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

    const value = parseNumber(homeValue);
    const balance = parseNumber(mortgageBalance);
    const maxLtv = parseNumber(maxLtvPercent);
    const rate = parseNumber(helocRate);
    const draw = parseNumber(plannedDraw);

    if (value <= 0) {
      setError("Please enter a positive home value.");
      return;
    }

    if (balance < 0) {
      setError("Mortgage balance cannot be negative.");
      return;
    }

    if (balance > value) {
      setError(
        "Your current mortgage balance is greater than your home value. Please check your inputs."
      );
      return;
    }

    if (maxLtv <= 0 || maxLtv > 100) {
      setError("Max LTV must be between 1 and 100 percent.");
      return;
    }

    const currentLtv = (balance / value) * 100;
    const maxLoanAmount = (maxLtv / 100) * value;
    const availableHeloc = Math.max(0, maxLoanAmount - balance);

    let interestOnlyPayment = 0;
    if (rate > 0 && draw > 0) {
      const monthlyRate = rate / 100 / 12;
      interestOnlyPayment = draw * monthlyRate;
    }

    setResult({
      currentLtv,
      maxLoanAmount,
      availableHeloc,
      interestOnlyPayment,
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
        Estimate how much home equity you can borrow with a HELOC based on your
        home value, current mortgage, and maximum LTV. Optionally see the
        interest-only payment on a planned draw amount.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Home value
          <input
            type="number"
            value={homeValue}
            onChange={(e) => setHomeValue(e.target.value)}
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
          Current mortgage balance
          <input
            type="number"
            value={mortgageBalance}
            onChange={(e) => setMortgageBalance(e.target.value)}
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
          Max combined LTV allowed (%)
          <input
            type="number"
            value={maxLtvPercent}
            onChange={(e) => setMaxLtvPercent(e.target.value)}
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
          HELOC interest rate (APR %) <span style={{ color: "#999" }}>(optional)</span>
          <input
            type="number"
            value={helocRate}
            onChange={(e) => setHelocRate(e.target.value)}
            placeholder="e.g. 8.5"
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
          Planned HELOC draw amount{" "}
          <span style={{ color: "#999" }}>(optional)</span>
          <input
            type="number"
            value={plannedDraw}
            onChange={(e) => setPlannedDraw(e.target.value)}
            placeholder="Amount you plan to borrow"
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
        Calculate HELOC amount
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
            <strong>Current LTV:</strong>{" "}
            {result.currentLtv.toFixed(1)}%
          </p>
          <p>
            <strong>Maximum combined loan amount</strong> (based on max LTV): $
            {formatCurrency(result.maxLoanAmount)}
          </p>
          <p>
            <strong>Estimated HELOC available:</strong> $
            {formatCurrency(result.availableHeloc)}
          </p>

          {result.interestOnlyPayment > 0 && (
            <p style={{ marginTop: 8 }}>
              <strong>Interest-only monthly payment</strong> on planned draw: $
              {formatCurrency(result.interestOnlyPayment)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
