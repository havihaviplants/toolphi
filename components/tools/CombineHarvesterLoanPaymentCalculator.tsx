"use client";

import { useState } from "react";

export default function CombineHarvesterLoanPaymentCalculator() {
  const [amountFinanced, setAmountFinanced] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");

  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const calculate = () => {
    const P = parseNumber(amountFinanced);
    const r = parseNumber(apr) / 100 / 12;
    const n = parseNumber(termYears) * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    const monthlyPayment =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    setResult({ monthlyPayment, totalPayment, totalInterest });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        Estimate combine harvester loan payments (principal + interest only).
        Enter the amount financed after any down payment, trade-in, or rebates.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Amount financed
          <div style={{ fontSize: 12, color: "#777" }}>
            Loan amount after down payment / trade-in
          </div>
          <input
            type="text"
            value={amountFinanced}
            onChange={(e) => setAmountFinanced(e.target.value)}
            placeholder="e.g. 250000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Example: 6.5 means 6.5% APR
          </div>
          <input
            type="text"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6.5"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Many equipment loans use 3–10 year terms
          </div>
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 7"
            style={inputStyle}
          />
        </label>
      </div>

      <button
        onClick={calculate}
        style={{
          padding: "9px 14px",
          borderRadius: 6,
          border: "none",
          background: "#0366d6",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Calculate payment
      </button>

      {result && (
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 8,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
          }}
        >
          <p>
            <strong>Monthly payment:</strong> {format(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total payment:</strong> {format(result.totalPayment)}
          </p>
          <p>
            <strong>Total interest:</strong> {format(result.totalInterest)}
          </p>

          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
            Tip: Try a shorter term to see how much interest you can save, and a
            longer term to see what payment fits your cash flow.
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};
