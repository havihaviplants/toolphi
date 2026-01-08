"use client";

import { useMemo, useState } from "react";

export default function FarmLoanInterestCostCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
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
    const P = parseNumber(loanAmount);
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

  // quick “what-if” mini table (adds thickness without being heavy)
  const whatIfRows = useMemo(() => {
    const P = parseNumber(loanAmount);
    const years = parseNumber(termYears);
    if (P <= 0 || years <= 0) return [];

    const baseApr = parseNumber(apr);
    const candidates = [baseApr - 1, baseApr, baseApr + 1].filter((x) => x > 0);

    return candidates.map((candidateApr) => {
      const r = candidateApr / 100 / 12;
      const n = years * 12;
      const monthlyPayment =
        (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - P;

      return { candidateApr, monthlyPayment, totalInterest };
    });
  }, [loanAmount, apr, termYears]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        This calculator estimates the <strong>total interest cost</strong> of a
        farm loan based on amount, APR, and term. It also shows a quick “what-if”
        comparison so you can see how small rate changes affect total interest.
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
            placeholder="e.g. 150000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Example: 6 means 6% APR
          </div>
          <input
            type="text"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6"
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
            placeholder="e.g. 15"
            style={inputStyle}
          />
        </label>
      </div>

      <button onClick={calculate} style={buttonStyle}>
        Calculate interest cost
      </button>

      {result && (
        <div style={summaryBox}>
          <p>
            <strong>Monthly payment:</strong> {format(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total payment:</strong> {format(result.totalPayment)}
          </p>
          <p>
            <strong>Total interest cost:</strong> {format(result.totalInterest)}
          </p>

          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
            Tip: Total interest is what you pay <em>in addition</em> to the
            amount borrowed. Longer terms often lower the payment but increase
            total interest.
          </div>
        </div>
      )}

      {whatIfRows.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Quick rate sensitivity (what-if)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same loan amount and term, different APR. This helps you estimate
            the cost of a small rate increase.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>APR</th>
                  <th>Monthly payment</th>
                  <th>Total interest</th>
                </tr>
              </thead>
              <tbody>
                {whatIfRows.map((r) => (
                  <tr key={r.candidateApr}>
                    <td>{r.candidateApr.toFixed(2)}%</td>
                    <td>{format(r.monthlyPayment)}</td>
                    <td>{format(r.totalInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Monthly interest rate = APR ÷ 12</li>
        <li>Total payments = term (years) × 12</li>
        <li>Monthly payment uses a standard amortization formula</li>
        <li>Total interest = (monthly payment × total payments) − principal</li>
      </ul>

      <h3>Assumptions & notes</h3>
      <ul>
        <li>Fixed APR (variable-rate loans will differ)</li>
        <li>Principal + interest only (fees and insurance not included)</li>
        <li>Does not include taxes or closing costs</li>
        <li>Your lender may use different compounding conventions</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Why does a longer term increase total interest?</strong>
        <br />
        Even if the monthly payment is lower, you pay interest for more months,
        so the total interest often increases.
      </p>

      <p>
        <strong>How much does a 1% APR change matter?</strong>
        <br />
        It can be large over long terms. Use the “what-if” table to compare total
        interest at nearby APR values.
      </p>

      <p>
        <strong>Does this include early payoff or extra payments?</strong>
        <br />
        No. Extra principal payments reduce the balance faster and usually lower
        total interest.
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
  fontSize: 14,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
