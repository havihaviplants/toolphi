// components/tools/EffectiveRateAfterFeesCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  paymentStated: number;
  paymentEffective: number;
  effectiveRatePct: number;
  horizonMonths: number;
  feePerMonth: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Find rate such that payment(rate) ≈ payment(stated) + fees/month over horizon
function solveEffectiveRate(
  principal: number,
  years: number,
  targetPayment: number,
  lowPct = 0,
  highPct = 25
) {
  let lo = lowPct;
  let hi = highPct;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pmt = calcMonthlyPayment(principal, mid, years);
    if (!isFinite(pmt)) return NaN;

    if (pmt < targetPayment) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export default function EffectiveRateAfterFeesCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [statedRate, setStatedRate] = useState("");
  const [upfrontFees, setUpfrontFees] = useState("");
  const [horizonYears, setHorizonYears] = useState("5");
  const [result, setResult] = useState<Result | null>(null);

  const formatMoney2 = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const handleCalculate = () => {
    const P = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const r = parseFloat(statedRate);
    const fees = parseFloat(upfrontFees);
    const hYears = parseFloat(horizonYears);

    if (
      !isFinite(P) || P <= 0 ||
      !isFinite(years) || years <= 0 ||
      !isFinite(r) || r < 0 ||
      !isFinite(fees) || fees < 0 ||
      !isFinite(hYears) || hYears <= 0
    ) {
      setResult(null);
      return;
    }

    const paymentStated = calcMonthlyPayment(P, r, years);
    if (!isFinite(paymentStated)) {
      setResult(null);
      return;
    }

    const horizonMonths = Math.max(1, Math.floor(hYears * 12));
    const feePerMonth = fees / horizonMonths;

    const targetPayment = paymentStated + feePerMonth;

    const effectiveRatePct = solveEffectiveRate(P, years, targetPayment);
    const paymentEffective = calcMonthlyPayment(P, effectiveRatePct, years);

    if (!isFinite(effectiveRatePct) || !isFinite(paymentEffective)) {
      setResult(null);
      return;
    }

    setResult({
      paymentStated,
      paymentEffective,
      effectiveRatePct,
      horizonMonths,
      feePerMonth,
    });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        This calculator estimates an <strong>effective rate after fees</strong> by spreading your
        upfront fees over your time horizon and converting that cost into an equivalent rate increase.
        It’s a simple “apples-to-apples” comparison tool (not an official APR calculation).
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="300000"
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 14 }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Term (years)
          <input
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="30"
            step="0.1"
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 14 }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Stated interest rate (%)
          <input
            type="number"
            value={statedRate}
            onChange={(e) => setStatedRate(e.target.value)}
            placeholder="6.75"
            step="0.01"
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 14 }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Upfront fees (USD)
          <input
            type="number"
            value={upfrontFees}
            onChange={(e) => setUpfrontFees(e.target.value)}
            placeholder="4500"
            step="1"
            min="0"
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 14 }}
          />
          <span style={{ fontSize: 12, color: "#777" }}>
            Include origination fees, lender fees, and points (if you want to treat points as fees).
          </span>
        </label>

        <label style={{ fontSize: 14 }}>
          Time horizon (years you expect to keep the loan)
          <input
            type="number"
            value={horizonYears}
            onChange={(e) => setHorizonYears(e.target.value)}
            placeholder="5"
            step="0.1"
            min="0.1"
            style={{ width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 4, border: "1px solid #ddd", fontSize: 14 }}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        style={{ padding: "8px 14px", borderRadius: 4, border: "none", background: "#0366d6", color: "#fff", fontSize: 14, cursor: "pointer" }}
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
            <strong>Monthly payment (stated rate):</strong> {formatMoney2(result.paymentStated)}
          </p>
          <p>
            <strong>Fees spread over horizon:</strong> {formatMoney2(result.feePerMonth)} / month (
            {result.horizonMonths} months)
          </p>

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Estimated effective rate after fees:</strong> {result.effectiveRatePct.toFixed(3)}%
          </p>
          <p>
            <strong>Equivalent monthly payment at effective rate:</strong>{" "}
            {formatMoney2(result.paymentEffective)}
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Note: This is a simplified “rate-equivalent” method for comparing offers over a chosen
            horizon. It is not a regulatory APR disclosure.
          </p>
        </div>
      )}
    </div>
  );
}
