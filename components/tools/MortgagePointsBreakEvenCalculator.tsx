// components/tools/MortgagePointsBreakEvenCalculator.tsx
"use client";

import { useState } from "react";

type Result = {
  pointsCost: number;
  paymentNoPoints: number;
  paymentWithPoints: number;
  monthlySavings: number;
  breakevenMonths: number | null;
  breakevenYears: number | null;
  totalInterestNoPoints: number;
  totalInterestWithPoints: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;

  if (!isFinite(principal) || principal <= 0 || !isFinite(years) || years <= 0) return NaN;
  if (!isFinite(r) || r < 0) return NaN;

  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function MortgagePointsBreakEvenCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("");
  const [rateNoPoints, setRateNoPoints] = useState("");
  const [rateWithPoints, setRateWithPoints] = useState("");
  const [points, setPoints] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatMoney2 = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const rNo = parseFloat(rateNoPoints);
    const rWith = parseFloat(rateWithPoints);
    const pts = parseFloat(points);

    if (
      !isFinite(principal) ||
      principal <= 0 ||
      !isFinite(years) ||
      years <= 0 ||
      !isFinite(rNo) ||
      rNo <= 0 ||
      !isFinite(rWith) ||
      rWith <= 0 ||
      !isFinite(pts) ||
      pts < 0
    ) {
      setResult(null);
      return;
    }

    // Points cost: 1 point = 1% of loan amount
    const pointsCost = principal * (pts / 100);

    const paymentNoPoints = calcMonthlyPayment(principal, rNo, years);
    const paymentWithPoints = calcMonthlyPayment(principal, rWith, years);

    if (!isFinite(paymentNoPoints) || !isFinite(paymentWithPoints)) {
      setResult(null);
      return;
    }

    const n = years * 12;
    const totalInterestNoPoints = paymentNoPoints * n - principal;
    const totalInterestWithPoints = paymentWithPoints * n - principal + pointsCost;

    const monthlySavings = paymentNoPoints - paymentWithPoints;

    let breakevenMonths: number | null = null;
    let breakevenYears: number | null = null;

    // Break-even only makes sense when points actually reduce payment
    if (monthlySavings > 0 && pointsCost > 0) {
      breakevenMonths = pointsCost / monthlySavings;
      breakevenYears = breakevenMonths / 12;
    }

    setResult({
      pointsCost,
      paymentNoPoints,
      paymentWithPoints,
      monthlySavings,
      breakevenMonths,
      breakevenYears,
      totalInterestNoPoints,
      totalInterestWithPoints,
    });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        Discount points let you pay an upfront fee to get a lower interest rate.
        This calculator estimates monthly savings and how long it takes to break even.
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
          Rate without points (%)
          <input
            type="number"
            value={rateNoPoints}
            onChange={(e) => setRateNoPoints(e.target.value)}
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
          Rate with points (%)
          <input
            type="number"
            value={rateWithPoints}
            onChange={(e) => setRateWithPoints(e.target.value)}
            placeholder="6.50"
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
          Points paid (1 point = 1% of loan amount)
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="1.5"
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
            Example: 1.5 points on a $300,000 loan = $4,500 upfront.
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
            <strong>Upfront points cost:</strong> {formatCurrency(result.pointsCost)}
          </p>

          <p>
            <strong>Monthly payment (no points):</strong>{" "}
            {formatMoney2(result.paymentNoPoints)}
          </p>

          <p>
            <strong>Monthly payment (with points):</strong>{" "}
            {formatMoney2(result.paymentWithPoints)}
          </p>

          <p>
            <strong>Estimated monthly savings:</strong>{" "}
            {formatMoney2(result.monthlySavings)}
          </p>

          {result.breakevenMonths !== null ? (
            <p>
              <strong>Break-even time:</strong>{" "}
              {result.breakevenMonths.toFixed(1)} months{" "}
              {result.breakevenYears !== null ? `(~${result.breakevenYears.toFixed(2)} years)` : ""}
            </p>
          ) : (
            <p>
              <strong>Break-even time:</strong>{" "}
              Not applicable (no monthly savings or points cost is $0).
            </p>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

          <p>
            <strong>Total interest (no points):</strong>{" "}
            {formatCurrency(result.totalInterestNoPoints)}
          </p>
          <p>
            <strong>Total interest (with points + upfront cost):</strong>{" "}
            {formatCurrency(result.totalInterestWithPoints)}
          </p>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Tip: If you expect to sell/refinance before the break-even month, paying points may not
            make sense.
          </p>
        </div>
      )}
    </div>
  );
}
