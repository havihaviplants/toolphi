// components/tools/StudentLoanRefinanceSavingsCalculator.tsx
"use client";

import { useState } from "react";

type Scenario = {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
};

type Result = {
  current: Scenario;
  refinance: Scenario;
  monthlySavings: number;
  totalSavings: number; // totalPaid difference
  interestSavings: number;
  breakEvenMonths: number | null;
};

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function payment(principal: number, aprPct: number, years: number) {
  const n = years * 12;
  const r = aprPct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function scenario(principal: number, aprPct: number, years: number): Scenario {
  const m = payment(principal, aprPct, years);
  const totalPaid = m * years * 12;
  const totalInterest = totalPaid - principal;
  return { monthlyPayment: m, totalPaid, totalInterest };
}

export default function StudentLoanRefinanceSavingsCalculator() {
  const [balance, setBalance] = useState<string>("");
  const [currentApr, setCurrentApr] = useState<string>("6.5");
  const [currentYears, setCurrentYears] = useState<string>("10");

  const [newApr, setNewApr] = useState<string>("5.0");
  const [newYears, setNewYears] = useState<string>("10");

  const [refinanceFees, setRefinanceFees] = useState<string>("0"); // upfront closing/origination fees
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const P = parseNumber(balance);
    const cApr = parseNumber(currentApr);
    const cYears = parseNumber(currentYears);

    const nApr = parseNumber(newApr);
    const nYears = parseNumber(newYears);

    const fees = parseNumber(refinanceFees);

    if (P <= 0 || cYears <= 0 || nYears <= 0) {
      setResult(null);
      return;
    }

    const current = scenario(P, cApr, cYears);
    // Model fees as added cost (paid upfront), so total cost for refinance includes fees.
    const refinanceBase = scenario(P, nApr, nYears);
    const refinance: Scenario = {
      monthlyPayment: refinanceBase.monthlyPayment,
      totalPaid: refinanceBase.totalPaid + fees,
      totalInterest: refinanceBase.totalInterest, // interest doesn't include fees (fees are separate)
    };

    const monthlySavings = current.monthlyPayment - refinance.monthlyPayment;
    const totalSavings = current.totalPaid - refinance.totalPaid;
    const interestSavings = current.totalInterest - refinance.totalInterest;

    let breakEvenMonths: number | null = null;
    if (fees > 0 && monthlySavings > 0) {
      breakEvenMonths = Math.ceil(fees / monthlySavings);
    }

    setResult({
      current,
      refinance,
      monthlySavings,
      totalSavings,
      interestSavings,
      breakEvenMonths,
    });
  };

  const handleReset = () => {
    setBalance("");
    setCurrentApr("6.5");
    setCurrentYears("10");
    setNewApr("5.0");
    setNewYears("10");
    setRefinanceFees("0");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Compare your current student loan against a refinance offer. See{" "}
        <strong>monthly savings</strong>, <strong>total savings</strong>,{" "}
        <strong>interest savings</strong>, and an optional{" "}
        <strong>break-even month</strong> if you pay refinance fees.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Remaining loan balance
          <input
            type="text"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 35000"
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Current loan
            </div>

            <label style={{ fontSize: 13 }}>
              Current APR (%)
              <input
                type="text"
                value={currentApr}
                onChange={(e) => setCurrentApr(e.target.value)}
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

            <label style={{ fontSize: 13, marginTop: 10, display: "block" }}>
              Remaining term (years)
              <input
                type="text"
                value={currentYears}
                onChange={(e) => setCurrentYears(e.target.value)}
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
          </div>

          <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Refinance offer
            </div>

            <label style={{ fontSize: 13 }}>
              New APR (%)
              <input
                type="text"
                value={newApr}
                onChange={(e) => setNewApr(e.target.value)}
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

            <label style={{ fontSize: 13, marginTop: 10, display: "block" }}>
              New term (years)
              <input
                type="text"
                value={newYears}
                onChange={(e) => setNewYears(e.target.value)}
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
          </div>
        </div>

        <label style={{ fontSize: 14 }}>
          Refinance fees (optional, upfront)
          <input
            type="text"
            value={refinanceFees}
            onChange={(e) => setRefinanceFees(e.target.value)}
            placeholder="e.g. 0"
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
      </div>

      <div style={{ display: "flex", gap: 8 }}>
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
          Compare refinance savings
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontSize: 14,
            cursor: "pointer",
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
            borderRadius: 6,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
            color: "#333",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Current</div>
              <p>
                Monthly payment: <strong>{formatNumber(result.current.monthlyPayment)}</strong>
              </p>
              <p>Total repaid: {formatNumber(result.current.totalPaid)}</p>
              <p>Total interest: {formatNumber(result.current.totalInterest)}</p>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Refinance</div>
              <p>
                Monthly payment: <strong>{formatNumber(result.refinance.monthlyPayment)}</strong>
              </p>
              <p>Total repaid (incl. fees): {formatNumber(result.refinance.totalPaid)}</p>
              <p>Total interest: {formatNumber(result.refinance.totalInterest)}</p>
            </div>
          </div>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #d0ddff" }} />

          <p>
            <strong>Monthly savings:</strong> {formatNumber(result.monthlySavings)}
          </p>
          <p>
            <strong>Total savings:</strong> {formatNumber(result.totalSavings)}
          </p>
          <p>
            <strong>Interest savings:</strong> {formatNumber(result.interestSavings)}
          </p>
          <p>
            <strong>Break-even month (fees):</strong>{" "}
            {result.breakEvenMonths ? `${result.breakEvenMonths} months` : "N/A"}
          </p>

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Tip: If you refinance a federal loan into a private loan, you may lose access to federal
            protections and income-driven repayment programs. Use this tool for cost comparison,
            then review plan trade-offs.
          </p>
        </div>
      )}
    </div>
  );
}
