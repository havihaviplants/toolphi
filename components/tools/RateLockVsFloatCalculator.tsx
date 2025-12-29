// components/tools/RateLockVsFloatCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  paymentLock: number;
  paymentFloat: number;
  monthlySavingsIfFloat: number; // lock - float
  rateDeltaPct: number; // lock - float
  expectedMonthlyPayment: number;
  expectedMonthlySavingsVsLock: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function RateLockVsFloatCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("");
  const [lockRate, setLockRate] = useState("");
  const [expectedFloatRate, setExpectedFloatRate] = useState("");
  const [probabilityPct, setProbabilityPct] = useState("50");
  const [daysToClosing, setDaysToClosing] = useState("30");
  const [result, setResult] = useState<Result | null>(null);

  const formatMoney2 = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const rLock = parseFloat(lockRate);
    const rFloat = parseFloat(expectedFloatRate);
    const p = parseFloat(probabilityPct) / 100;
    const d = parseFloat(daysToClosing);

    if (
      !isFinite(principal) ||
      principal <= 0 ||
      !isFinite(years) ||
      years <= 0 ||
      !isFinite(rLock) ||
      rLock < 0 ||
      !isFinite(rFloat) ||
      rFloat < 0 ||
      !isFinite(p) ||
      p < 0 ||
      p > 1 ||
      !isFinite(d) ||
      d < 0
    ) {
      setResult(null);
      return;
    }

    const paymentLock = calcMonthlyPayment(principal, rLock, years);
    const paymentFloat = calcMonthlyPayment(principal, rFloat, years);

    if (!isFinite(paymentLock) || !isFinite(paymentFloat)) {
      setResult(null);
      return;
    }

    // Expected monthly payment model:
    // With probability p, you get the float rate; otherwise you end up at the lock rate anyway.
    // (This is intentionally simple and transparent for SEO/UX. Users can adjust p.)
    const expectedMonthlyPayment = p * paymentFloat + (1 - p) * paymentLock;

    const monthlySavingsIfFloat = paymentLock - paymentFloat; // positive if float is lower
    const expectedMonthlySavingsVsLock = paymentLock - expectedMonthlyPayment;

    setResult({
      paymentLock,
      paymentFloat,
      monthlySavingsIfFloat,
      rateDeltaPct: rLock - rFloat,
      expectedMonthlyPayment,
      expectedMonthlySavingsVsLock,
    });
  };

  const labelBetter = (expectedSavings: number) => {
    if (expectedSavings > 0) return "Floating has a positive expected value";
    if (expectedSavings < 0) return "Locking has a positive expected value";
    return "Roughly equal expected value";
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        This tool compares locking your mortgage rate today vs floating until closing. It shows the
        payment difference and a simple expected-value view based on your probability estimate.
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
          Lock rate today (%)
          <input
            type="number"
            value={lockRate}
            onChange={(e) => setLockRate(e.target.value)}
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
          Expected float rate at closing (%)
          <input
            type="number"
            value={expectedFloatRate}
            onChange={(e) => setExpectedFloatRate(e.target.value)}
            placeholder="6.75"
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
          <span style={{ fontSize: 12, color: "#777" }}>
            If you think rates might rise instead, enter a higher float rate.
          </span>
        </label>

        <label style={{ fontSize: 14 }}>
          Probability you get the expected float rate (%)
          <input
            type="number"
            value={probabilityPct}
            onChange={(e) => setProbabilityPct(e.target.value)}
            placeholder="50"
            step="1"
            min="0"
            max="100"
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
          Time to closing (days)
          <input
            type="number"
            value={daysToClosing}
            onChange={(e) => setDaysToClosing(e.target.value)}
            placeholder="30"
            step="1"
            min="0"
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
            This is informational (rate risk generally increases with longer time to close).
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
            <strong>Monthly payment (lock):</strong> {formatMoney2(result.paymentLock)}
          </p>
          <p>
            <strong>Monthly payment (float):</strong> {formatMoney2(result.paymentFloat)}
          </p>
          <p>
            <strong>Rate difference (lock − float):</strong> {result.rateDeltaPct.toFixed(2)}%
          </p>
          <p>
            <strong>Monthly savings if floating hits your expected rate:</strong>{" "}
            {formatMoney2(result.monthlySavingsIfFloat)}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Expected monthly payment (using your probability):</strong>{" "}
            {formatMoney2(result.expectedMonthlyPayment)}
          </p>
          <p>
            <strong>Expected monthly savings vs locking:</strong>{" "}
            {formatMoney2(result.expectedMonthlySavingsVsLock)}
          </p>
          <p style={{ fontSize: 12, color: "#666" }}>
            <strong>Summary:</strong> {labelBetter(result.expectedMonthlySavingsVsLock)}.
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Note: This is a simplified expected-value model. In reality, floating can result in
            many possible rates. Adjust the probability and expected rate to match your view.
          </p>
        </div>
      )}
    </div>
  );
}
