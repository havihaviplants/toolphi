// components/tools/RefinanceRateSavingsCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  paymentCurrent: number;
  paymentNew: number;
  monthlySavings: number;
  horizonMonths: number;
  estimatedSavingsOverHorizon: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function RefinanceRateSavingsCalculator() {
  const [remainingBalance, setRemainingBalance] = useState("");
  const [remainingTermYears, setRemainingTermYears] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [newRate, setNewRate] = useState("");
  const [horizonYears, setHorizonYears] = useState("5");
  const [result, setResult] = useState<Result | null>(null);

  const formatMoney2 = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const formatCurrency0 = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const handleCalculate = () => {
    const P = parseFloat(remainingBalance);
    const years = parseFloat(remainingTermYears);
    const rCur = parseFloat(currentRate);
    const rNew = parseFloat(newRate);
    const hYears = parseFloat(horizonYears);

    if (
      !isFinite(P) ||
      P <= 0 ||
      !isFinite(years) ||
      years <= 0 ||
      !isFinite(rCur) ||
      rCur < 0 ||
      !isFinite(rNew) ||
      rNew < 0 ||
      !isFinite(hYears) ||
      hYears <= 0
    ) {
      setResult(null);
      return;
    }

    const paymentCurrent = calcMonthlyPayment(P, rCur, years);
    const paymentNew = calcMonthlyPayment(P, rNew, years);

    if (!isFinite(paymentCurrent) || !isFinite(paymentNew)) {
      setResult(null);
      return;
    }

    const monthlySavings = paymentCurrent - paymentNew; // positive if refinance is lower
    const horizonMonths = Math.max(1, Math.floor(hYears * 12));

    // Rate-only horizon savings (simple & transparent):
    // monthly savings * horizon months
    const estimatedSavingsOverHorizon = monthlySavings * horizonMonths;

    setResult({
      paymentCurrent,
      paymentNew,
      monthlySavings,
      horizonMonths,
      estimatedSavingsOverHorizon,
    });
  };

  const savingsLabel = (v: number) => {
    if (v > 0) return "Estimated savings";
    if (v < 0) return "Estimated extra cost";
    return "No change";
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        This is a <strong>rate-only</strong> refinance savings estimate. It compares monthly payments
        at your current rate vs a new refinance rate and estimates savings over your chosen time horizon
        (excluding closing costs and fees).
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Remaining loan balance
          <input
            type="number"
            value={remainingBalance}
            onChange={(e) => setRemainingBalance(e.target.value)}
            placeholder="280000"
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
          Remaining term (years)
          <input
            type="number"
            value={remainingTermYears}
            onChange={(e) => setRemainingTermYears(e.target.value)}
            placeholder="27"
            step="0.1"
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
          Current interest rate (%)
          <input
            type="number"
            value={currentRate}
            onChange={(e) => setCurrentRate(e.target.value)}
            placeholder="7.00"
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
          New refinance rate (%)
          <input
            type="number"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            placeholder="6.25"
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
          Time horizon (years you plan to keep the loan)
          <input
            type="number"
            value={horizonYears}
            onChange={(e) => setHorizonYears(e.target.value)}
            placeholder="5"
            step="0.1"
            min="0.1"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <span style={{ fontSize: 12, color: "#777" }}>
            If you plan to sell/refinance again soon, use a shorter horizon.
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
            lineHeight: 1.6,
            color: "#333",
          }}
        >
          <p>
            <strong>Monthly payment (current rate):</strong> {formatMoney2(result.paymentCurrent)}
          </p>
          <p>
            <strong>Monthly payment (new rate):</strong> {formatMoney2(result.paymentNew)}
          </p>
          <p>
            <strong>Monthly savings:</strong> {formatMoney2(result.monthlySavings)}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Horizon:</strong> {result.horizonMonths} months
          </p>
          <p>
            <strong>{savingsLabel(result.estimatedSavingsOverHorizon)} over horizon:</strong>{" "}
            {formatCurrency0(result.estimatedSavingsOverHorizon)}
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Note: This excludes refinance closing costs and fees. Use a refinance break-even calculator
            to include costs.
          </p>
        </div>
      )}
    </div>
  );
}
