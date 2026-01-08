"use client";

import { useMemo, useState } from "react";

type Outcome = {
  apr: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export default function FarmLoanInterestRateComparisonCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("");

  const [aprA, setAprA] = useState("");
  const [aprB, setAprB] = useState("");

  const [resultA, setResultA] = useState<Outcome | null>(null);
  const [resultB, setResultB] = useState<Outcome | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const compute = (P: number, aprPct: number, years: number): Outcome | null => {
    const r = aprPct / 100 / 12;
    const n = years * 12;

    if (P <= 0 || r <= 0 || n <= 0) return null;

    const monthlyPayment =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    return { apr: aprPct, monthlyPayment, totalPayment, totalInterest };
  };

  const compare = () => {
    const P = parseNumber(loanAmount);
    const years = parseNumber(termYears);
    const a = parseNumber(aprA);
    const b = parseNumber(aprB);

    const A = compute(P, a, years);
    const B = compute(P, b, years);

    setResultA(A);
    setResultB(B);
  };

  const diff = useMemo(() => {
    if (!resultA || !resultB) return null;
    return {
      monthly: resultB.monthlyPayment - resultA.monthlyPayment,
      totalInterest: resultB.totalInterest - resultA.totalInterest,
      totalPayment: resultB.totalPayment - resultA.totalPayment,
    };
  }, [resultA, resultB]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        Compare two APR options for the same farm loan amount and term. This is
        a practical way to estimate how much a small interest rate difference
        costs over time (principal + interest only).
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Loan amount
          <div style={{ fontSize: 12, color: "#777" }}>
            Total farm loan principal
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 200000"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Repayment period in years
          </div>
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 20"
            style={inputStyle}
          />
        </label>

        <div style={{ display: "grid", gap: 14 }}>
          <label>
            Rate A (APR %)
            <div style={{ fontSize: 12, color: "#777" }}>
              Example: 5.5 means 5.5% APR
            </div>
            <input
              type="text"
              value={aprA}
              onChange={(e) => setAprA(e.target.value)}
              placeholder="e.g. 5.5"
              style={inputStyle}
            />
          </label>

          <label>
            Rate B (APR %)
            <div style={{ fontSize: 12, color: "#777" }}>
              Example: 6.5 means 6.5% APR
            </div>
            <input
              type="text"
              value={aprB}
              onChange={(e) => setAprB(e.target.value)}
              placeholder="e.g. 6.5"
              style={inputStyle}
            />
          </label>
        </div>
      </div>

      <button onClick={compare} style={buttonStyle}>
        Compare rates
      </button>

      {(resultA && resultB) && (
        <>
          <div style={summaryBox}>
            <h3 style={{ marginTop: 0 }}>Results</h3>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Rate A</th>
                    <th>Rate B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>APR</strong></td>
                    <td>{resultA.apr.toFixed(2)}%</td>
                    <td>{resultB.apr.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Monthly payment</strong></td>
                    <td>{format(resultA.monthlyPayment)}</td>
                    <td>{format(resultB.monthlyPayment)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total interest</strong></td>
                    <td>{format(resultA.totalInterest)}</td>
                    <td>{format(resultB.totalInterest)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total payment</strong></td>
                    <td>{format(resultA.totalPayment)}</td>
                    <td>{format(resultB.totalPayment)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {diff && (
              <div style={{ marginTop: 12, fontSize: 14 }}>
                <p>
                  <strong>Difference (B − A):</strong>
                </p>
                <ul style={{ marginTop: 6 }}>
                  <li>
                    Monthly payment: {diff.monthly >= 0 ? "+" : ""}
                    {format(diff.monthly)}
                  </li>
                  <li>
                    Total interest: {diff.totalInterest >= 0 ? "+" : ""}
                    {format(diff.totalInterest)}
                  </li>
                  <li>
                    Total payment: {diff.totalPayment >= 0 ? "+" : ""}
                    {format(diff.totalPayment)}
                  </li>
                </ul>

                <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
                  Tip: If you&apos;re comparing offers, try entering the exact
                  APR quoted by each lender. Even a small difference can add up
                  on long-term farm or land loans.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>You keep loan amount and term the same</li>
        <li>We calculate monthly payment using a standard amortization formula</li>
        <li>Total interest = total paid − principal</li>
        <li>The difference shows the cost impact of the higher APR</li>
      </ul>

      <h3>Assumptions & notes</h3>
      <ul>
        <li>Fixed APR (variable-rate loans will differ)</li>
        <li>Principal + interest only (fees/taxes/insurance not included)</li>
        <li>Results are estimates and may vary by lender rounding</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Does this work for USDA or FSA farm loans?</strong>
        <br />
        Yes. The math is the same. The difference is eligibility, fees, and
        program-specific terms.
      </p>

      <p>
        <strong>What matters more: lower APR or shorter term?</strong>
        <br />
        Both reduce total interest. Shorter terms usually save more interest but
        increase monthly payment.
      </p>

      <p>
        <strong>Why might two lenders quote the same APR but different payments?</strong>
        <br />
        Fees, compounding conventions, escrow, and rounding rules can cause
        differences. This tool compares principal + interest only.
      </p>
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

const buttonStyle: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: 6,
  border: "none",
  background: "#0366d6",
  color: "#fff",
  fontSize: 14,
  cursor: "pointer",
};

const summaryBox: React.CSSProperties = {
  marginTop: 18,
  padding: 14,
  borderRadius: 8,
  background: "#f5f8ff",
  border: "1px solid #d0ddff",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
