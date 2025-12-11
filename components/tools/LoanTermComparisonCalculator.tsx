"use client";

import { useState } from "react";

type Result = {
  monthly1: number;
  monthly2: number;
  total1: number;
  total2: number;
  interest1: number;
  interest2: number;
};

export default function LoanTermComparisonCalculator() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [term1, setTerm1] = useState("");
  const [term2, setTerm2] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const payment = (P: number, r: number, n: number) => {
    if (r === 0) return P / n;
    const f = Math.pow(1 + r, n);
    return (P * r * f) / (f - 1);
  };

  const calculateCase = (P: number, annualRate: number, years: number) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    const m = payment(P, r, n);
    const total = m * n;
    return { monthly: m, total };
  };

  const handleCalculate = () => {
    const P = parseNumber(principal);
    const rate = parseNumber(annualRate);
    const y1 = parseNumber(term1);
    const y2 = parseNumber(term2);

    if (P <= 0 || rate < 0 || y1 <= 0 || y2 <= 0) {
      setResult(null);
      return;
    }

    const c1 = calculateCase(P, rate, y1);
    const c2 = calculateCase(P, rate, y2);

    setResult({
      monthly1: c1.monthly,
      monthly2: c2.monthly,
      total1: c1.total,
      total2: c2.total,
      interest1: c1.total - P,
      interest2: c2.total - P
    });
  };

  const handleReset = () => {
    setPrincipal("");
    setAnnualRate("");
    setTerm1("");
    setTerm2("");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Compare two different loan terms to see the difference in monthly
        payment and total interest.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16
        }}
      >
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 25000"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Annual interest rate (%)
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 6"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Loan term 1 (years)
          <input
            type="text"
            value={term1}
            onChange={(e) => setTerm1(e.target.value)}
            placeholder="e.g. 5"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Loan term 2 (years)
          <input
            type="text"
            value={term2}
            onChange={(e) => setTerm2(e.target.value)}
            placeholder="e.g. 7"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleCalculate}
          style={{
            padding: "8px 14px",
            background: "#0366d6",
            color: "#fff",
            border: "none",
            borderRadius: 4
          }}
        >
          Compare
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: 4
          }}
        >
          Reset
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f5f8ff",
            borderRadius: 6,
            border: "1px solid #d0ddff",
            fontSize: 14
          }}
        >
          <p>
            <strong>Loan Term 1 – Monthly:</strong>{" "}
            {formatNumber(result.monthly1)}
          </p>
          <p>
            <strong>Loan Term 2 – Monthly:</strong>{" "}
            {formatNumber(result.monthly2)}
          </p>

          <p>
            <strong>Total Interest (Term 1):</strong>{" "}
            {formatNumber(result.interest1)}
          </p>
          <p>
            <strong>Total Interest (Term 2):</strong>{" "}
            {formatNumber(result.interest2)}
          </p>
        </div>
      )}
    </div>
  );
}
