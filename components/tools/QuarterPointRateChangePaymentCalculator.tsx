// components/tools/QuarterPointRateChangePaymentCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  newRate: number;
  paymentCurrent: number;
  paymentNew: number;
  monthlyChange: number; // new - current
  totalInterestCurrent: number;
  totalInterestNew: number;
  totalInterestChange: number; // new - current
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function QuarterPointRateChangePaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [currentRate, setCurrentRate] = useState("");
  const [direction, setDirection] = useState<"down" | "up">("down");
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
    const P = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const rCur = parseFloat(currentRate);

    if (!isFinite(P) || P <= 0 || !isFinite(years) || years <= 0 || !isFinite(rCur) || rCur < 0) {
      setResult(null);
      return;
    }

    const delta = direction === "up" ? 0.25 : -0.25;
    const rNew = rCur + delta;

    if (rNew < 0) {
      setResult(null);
      return;
    }

    const paymentCurrent = calcMonthlyPayment(P, rCur, years);
    const paymentNew = calcMonthlyPayment(P, rNew, years);

    if (!isFinite(paymentCurrent) || !isFinite(paymentNew)) {
      setResult(null);
      return;
    }

    const n = years * 12;
    const totalInterestCurrent = paymentCurrent * n - P;
    const totalInterestNew = paymentNew * n - P;

    setResult({
      newRate: rNew,
      paymentCurrent,
      paymentNew,
      monthlyChange: paymentNew - paymentCurrent,
      totalInterestCurrent,
      totalInterestNew,
      totalInterestChange: totalInterestNew - totalInterestCurrent,
    });
  };

  const changeLabel = (v: number) => (v > 0 ? "Increase" : v < 0 ? "Decrease" : "No change");

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        A 0.25% (one “quarter point”) rate change can meaningfully affect mortgage payments. This calculator
        shows how your monthly payment and total interest change when your rate moves by 0.25%.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="300000"
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
          Term (years)
          <input
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="30"
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
          Rate change direction
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "up" | "down")}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
              background: "#fff",
            }}
          >
            <option value="down">Down by 0.25%</option>
            <option value="up">Up by 0.25%</option>
          </select>
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
            <strong>New rate:</strong> {result.newRate.toFixed(2)}%
          </p>
          <p>
            <strong>Monthly payment (current):</strong> {formatMoney2(result.paymentCurrent)}
          </p>
          <p>
            <strong>Monthly payment (new):</strong> {formatMoney2(result.paymentNew)}
          </p>
          <p>
            <strong>Monthly payment change:</strong> {formatMoney2(result.monthlyChange)} (
            {changeLabel(result.monthlyChange)})
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Total interest (current):</strong> {formatCurrency0(result.totalInterestCurrent)}
          </p>
          <p>
            <strong>Total interest (new):</strong> {formatCurrency0(result.totalInterestNew)}
          </p>
          <p>
            <strong>Total interest change:</strong> {formatCurrency0(result.totalInterestChange)} (
            {changeLabel(result.totalInterestChange)})
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Tip: If you only expect to keep the mortgage for a few years, focus on the monthly payment change.
          </p>
        </div>
      )}
    </div>
  );
}
