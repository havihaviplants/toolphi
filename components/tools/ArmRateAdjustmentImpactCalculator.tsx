// components/tools/ArmRateAdjustmentImpactCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  paymentCurrent: number;
  paymentNewUncapped: number;
  paymentNewCapped: number | null;

  monthlyChangeUncapped: number;
  monthlyChangeCapped: number | null;

  effectiveNewRateCapped: number | null;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function ArmRateAdjustmentImpactCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [currentRate, setCurrentRate] = useState("");
  const [expectedNewRate, setExpectedNewRate] = useState("");

  const [perAdjustmentCap, setPerAdjustmentCap] = useState(""); // percent points
  const [lifetimeCap, setLifetimeCap] = useState(""); // percent points above initial/current (we'll treat as above current for simplicity)

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
    const rCur = parseFloat(currentRate);
    const rNew = parseFloat(expectedNewRate);

    const capAdj = perAdjustmentCap.trim() === "" ? null : parseFloat(perAdjustmentCap);
    const capLife = lifetimeCap.trim() === "" ? null : parseFloat(lifetimeCap);

    if (
      !isFinite(P) ||
      P <= 0 ||
      !isFinite(years) ||
      years <= 0 ||
      !isFinite(rCur) ||
      rCur < 0 ||
      !isFinite(rNew) ||
      rNew < 0
    ) {
      setResult(null);
      return;
    }
    if (capAdj !== null && (!isFinite(capAdj) || capAdj < 0)) {
      setResult(null);
      return;
    }
    if (capLife !== null && (!isFinite(capLife) || capLife < 0)) {
      setResult(null);
      return;
    }

    const paymentCurrent = calcMonthlyPayment(P, rCur, years);
    const paymentNewUncapped = calcMonthlyPayment(P, rNew, years);

    if (!isFinite(paymentCurrent) || !isFinite(paymentNewUncapped)) {
      setResult(null);
      return;
    }

    // Apply caps (simple + transparent):
    // - Per-adjustment cap limits rate increase from current rate by capAdj
    // - Lifetime cap limits rate increase from current rate by capLife (approximation; many ARMs cap vs initial rate)
    let cappedRate: number | null = null;

    if (capAdj !== null || capLife !== null) {
      let maxRate = Infinity;

      if (capAdj !== null) maxRate = Math.min(maxRate, rCur + capAdj);
      if (capLife !== null) maxRate = Math.min(maxRate, rCur + capLife);

      cappedRate = Math.min(rNew, maxRate);
    }

    let paymentNewCapped: number | null = null;
    let monthlyChangeCapped: number | null = null;

    if (cappedRate !== null) {
      paymentNewCapped = calcMonthlyPayment(P, cappedRate, years);
      if (isFinite(paymentNewCapped)) {
        monthlyChangeCapped = paymentNewCapped - paymentCurrent;
      } else {
        paymentNewCapped = null;
        monthlyChangeCapped = null;
        cappedRate = null;
      }
    }

    const monthlyChangeUncapped = paymentNewUncapped - paymentCurrent;

    setResult({
      paymentCurrent,
      paymentNewUncapped,
      paymentNewCapped,
      monthlyChangeUncapped,
      monthlyChangeCapped,
      effectiveNewRateCapped: cappedRate,
    });
  };

  const changeLabel = (v: number) => (v > 0 ? "Increase" : v < 0 ? "Decrease" : "No change");

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        ARM payments can change when your rate adjusts. Enter your current rate and an expected new
        rate to estimate the monthly payment impact. Optional caps help model capped reset scenarios.
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
          Current ARM rate (%)
          <input
            type="number"
            value={currentRate}
            onChange={(e) => setCurrentRate(e.target.value)}
            placeholder="5.50"
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
          Expected new rate after adjustment (%)
          <input
            type="number"
            value={expectedNewRate}
            onChange={(e) => setExpectedNewRate(e.target.value)}
            placeholder="7.25"
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
            If you don’t know the index/margin math, enter the rate you expect your lender to offer.
          </span>
        </label>

        <label style={{ fontSize: 14 }}>
          Per-adjustment cap (percentage points, optional)
          <input
            type="number"
            value={perAdjustmentCap}
            onChange={(e) => setPerAdjustmentCap(e.target.value)}
            placeholder="2.00"
            step="0.01"
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
            Example: 2.00 means your rate can’t rise more than +2.00% at a single adjustment.
          </span>
        </label>

        <label style={{ fontSize: 14 }}>
          Lifetime cap (percentage points above current, optional)
          <input
            type="number"
            value={lifetimeCap}
            onChange={(e) => setLifetimeCap(e.target.value)}
            placeholder="5.00"
            step="0.01"
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
            Many ARMs cap vs the initial rate. This simplified model caps vs your current rate.
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
            <strong>Monthly payment (new rate, uncapped):</strong>{" "}
            {formatMoney2(result.paymentNewUncapped)}
          </p>

          <p>
            <strong>Monthly change (uncapped):</strong> {formatMoney2(result.monthlyChangeUncapped)} (
            {changeLabel(result.monthlyChangeUncapped)})
          </p>

          {result.paymentNewCapped !== null && result.monthlyChangeCapped !== null && result.effectiveNewRateCapped !== null ? (
            <>
              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />
              <p>
                <strong>Effective new rate (capped):</strong> {result.effectiveNewRateCapped.toFixed(2)}%
              </p>
              <p>
                <strong>Monthly payment (capped):</strong> {formatMoney2(result.paymentNewCapped)}
              </p>
              <p>
                <strong>Monthly change (capped):</strong> {formatMoney2(result.monthlyChangeCapped)} (
                {changeLabel(result.monthlyChangeCapped)})
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
              No caps applied (leave caps blank to model the raw expected new rate).
            </p>
          )}

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Tip: If you also pay an ARM margin or have multiple adjustment periods, use this tool as a
            quick “next reset” estimate.
          </p>
        </div>
      )}
    </div>
  );
}
