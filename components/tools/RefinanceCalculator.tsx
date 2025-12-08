"use client";

import { useState } from "react";

type Result = {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  totalInterestCurrent: number;
  totalInterestNew: number;
  totalInterestSaved: number;
  breakevenMonths: number | null;
};

export default function RefinanceCalculator() {
  const [remainingBalance, setRemainingBalance] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [currentYearsLeft, setCurrentYearsLeft] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newYears, setNewYears] = useState("");
  const [closingCosts, setClosingCosts] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const calcMonthlyPayment = (
    principal: number,
    annualRate: number,
    years: number
  ) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r <= 0) {
      return principal / n;
    }
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  };

  const handleCalculate = () => {
    const balance = parseFloat(remainingBalance);
    const currR = parseFloat(currentRate);
    const currYears = parseFloat(currentYearsLeft);
    const newR = parseFloat(newRate);
    const newTermYears = parseFloat(newYears);
    const costs = parseFloat(closingCosts || "0");

    if (
      !isFinite(balance) ||
      balance <= 0 ||
      !isFinite(currR) ||
      currR <= 0 ||
      !isFinite(currYears) ||
      currYears <= 0 ||
      !isFinite(newR) ||
      newR <= 0 ||
      !isFinite(newTermYears) ||
      newTermYears <= 0
    ) {
      setResult(null);
      return;
    }

    const currentPayment = calcMonthlyPayment(balance, currR, currYears);
    const newPayment = calcMonthlyPayment(balance, newR, newTermYears);
    const monthlySavings = currentPayment - newPayment;

    const totalInterestCurrent =
      currentPayment * currYears * 12 - balance;
    const totalInterestNew = newPayment * newTermYears * 12 - balance + costs;
    const totalInterestSaved =
      totalInterestCurrent - totalInterestNew;

    let breakevenMonths: number | null = null;
    if (monthlySavings > 0 && costs > 0) {
      breakevenMonths = costs / monthlySavings;
    }

    setResult({
      currentPayment,
      newPayment,
      monthlySavings,
      totalInterestCurrent,
      totalInterestNew,
      totalInterestSaved,
      breakevenMonths,
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatNumber = (value: number, digits = 1) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: digits,
    });

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Compare your current mortgage with a new refinance offer. See
        your new payment, monthly savings, total interest saved, and how
        long it takes to break even on closing costs.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          <span>Remaining loan balance</span>
          <input
            type="number"
            value={remainingBalance}
            onChange={(e) => setRemainingBalance(e.target.value)}
            placeholder="280000"
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
          <span>Current interest rate (%)</span>
          <input
            type="number"
            value={currentRate}
            onChange={(e) => setCurrentRate(e.target.value)}
            placeholder="6.5"
            step="0.01"
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
          <span>Years remaining on current loan</span>
          <input
            type="number"
            value={currentYearsLeft}
            onChange={(e) => setCurrentYearsLeft(e.target.value)}
            placeholder="25"
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
          <span>New refinance rate (%)</span>
          <input
            type="number"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            placeholder="5.5"
            step="0.01"
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
          <span>New term (years)</span>
          <input
            type="number"
            value={newYears}
            onChange={(e) => setNewYears(e.target.value)}
            placeholder="25"
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
          <span>Closing costs (optional)</span>
          <input
            type="number"
            value={closingCosts}
            onChange={(e) => setClosingCosts(e.target.value)}
            placeholder="4000"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <span style={{ fontSize: 12, color: "#777" }}>
            Appraisal, lender fees, title fees, and other refinance costs.
          </span>
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
        Calculate refinance
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
            lineHeight: 1.5,
          }}
        >
          <p>
            <strong>Current monthly payment: </strong>
            {formatCurrency(result.currentPayment)}
          </p>
          <p>
            <strong>New monthly payment: </strong>
            {formatCurrency(result.newPayment)}
          </p>
          <p>
            <strong>Monthly savings: </strong>
            {formatCurrency(result.monthlySavings)}
          </p>
          <p>
            <strong>Total interest (keep current loan): </strong>
            {formatCurrency(result.totalInterestCurrent)}
          </p>
          <p>
            <strong>Total interest (refinance, incl. costs): </strong>
            {formatCurrency(result.totalInterestNew)}
          </p>
          <p>
            <strong>Total interest saved: </strong>
            {formatCurrency(result.totalInterestSaved)}
          </p>
          {result.breakevenMonths !== null && result.breakevenMonths > 0 && (
            <p>
              <strong>Breakeven point: </strong>
              {formatNumber(result.breakevenMonths)} months (
              {formatNumber(result.breakevenMonths / 12, 1)} years)
            </p>
          )}
          {result.breakevenMonths === null && (
            <p>
              <strong>Breakeven point: </strong>
              Not applicable (no monthly savings or no closing costs).
            </p>
          )}
          <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
            This is an estimate only. Lender fees, taxes, and your actual
            credit profile may change the real numbers. Use this as a
            starting point for comparing refinance offers.
          </p>
        </div>
      )}
    </div>
  );
}
