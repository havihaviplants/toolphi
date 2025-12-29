// components/tools/FixedVsArmRateDifferenceCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  paymentFixed: number;
  paymentArmInitial: number;
  paymentArmAdjusted: number;
  initialSavingsArm: number;
  adjustedDifferenceVsFixed: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function FixedVsArmRateDifferenceCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [fixedRate, setFixedRate] = useState("");
  const [armInitialRate, setArmInitialRate] = useState("");
  const [armAdjustedRate, setArmAdjustedRate] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const formatMoney2 = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const P = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const rFixed = parseFloat(fixedRate);
    const rArmInit = parseFloat(armInitialRate);
    const rArmAdj = parseFloat(armAdjustedRate);

    if (
      !isFinite(P) ||
      P <= 0 ||
      !isFinite(years) ||
      years <= 0 ||
      !isFinite(rFixed) ||
      rFixed < 0 ||
      !isFinite(rArmInit) ||
      rArmInit < 0 ||
      !isFinite(rArmAdj) ||
      rArmAdj < 0
    ) {
      setResult(null);
      return;
    }

    const paymentFixed = calcMonthlyPayment(P, rFixed, years);
    const paymentArmInitial = calcMonthlyPayment(P, rArmInit, years);
    const paymentArmAdjusted = calcMonthlyPayment(P, rArmAdj, years);

    if (
      !isFinite(paymentFixed) ||
      !isFinite(paymentArmInitial) ||
      !isFinite(paymentArmAdjusted)
    ) {
      setResult(null);
      return;
    }

    setResult({
      paymentFixed,
      paymentArmInitial,
      paymentArmAdjusted,
      initialSavingsArm: paymentFixed - paymentArmInitial,
      adjustedDifferenceVsFixed: paymentArmAdjusted - paymentFixed,
    });
  };

  const labelDiff = (v: number) => (v > 0 ? "Higher than fixed" : v < 0 ? "Lower than fixed" : "Same as fixed");

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        Fixed-rate and adjustable-rate mortgages differ mainly in how their interest rates behave
        over time. This calculator compares their monthly payments under different rate scenarios.
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
          Fixed mortgage rate (%)
          <input
            type="number"
            value={fixedRate}
            onChange={(e) => setFixedRate(e.target.value)}
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
          ARM initial rate (%)
          <input
            type="number"
            value={armInitialRate}
            onChange={(e) => setArmInitialRate(e.target.value)}
            placeholder="5.75"
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
          Expected ARM adjusted rate (%)
          <input
            type="number"
            value={armAdjustedRate}
            onChange={(e) => setArmAdjustedRate(e.target.value)}
            placeholder="7.50"
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
            Enter the rate you expect after the ARM adjusts.
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
            <strong>Monthly payment (fixed):</strong> {formatMoney2(result.paymentFixed)}
          </p>
          <p>
            <strong>Monthly payment (ARM, initial):</strong> {formatMoney2(result.paymentArmInitial)}
          </p>
          <p>
            <strong>Monthly payment (ARM, after adjustment):</strong>{" "}
            {formatMoney2(result.paymentArmAdjusted)}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Initial ARM savings vs fixed:</strong>{" "}
            {formatMoney2(result.initialSavingsArm)}
          </p>
          <p>
            <strong>ARM payment after adjustment vs fixed:</strong>{" "}
            {formatMoney2(result.adjustedDifferenceVsFixed)} (
            {labelDiff(result.adjustedDifferenceVsFixed)})
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Tip: ARM loans can save money upfront but may cost more later if rates rise.
          </p>
        </div>
      )}
    </div>
  );
}
