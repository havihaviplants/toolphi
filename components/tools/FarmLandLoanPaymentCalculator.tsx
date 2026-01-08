"use client";

import { useMemo, useState } from "react";

export default function FarmLandLoanPaymentCalculator() {
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

  const compute = (P: number, aprPct: number, years: number) => {
    const r = aprPct / 100 / 12;
    const n = years * 12;
    if (P <= 0 || r <= 0 || n <= 0) return null;

    const monthlyPayment =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    return { monthlyPayment, totalPayment, totalInterest };
  };

  const calculate = () => {
    const P = parseNumber(loanAmount);
    const rate = parseNumber(apr);
    const years = parseNumber(termYears);

    const computed = compute(P, rate, years);
    setResult(computed);
  };

  const whatIfRows = useMemo(() => {
    const P = parseNumber(loanAmount);
    const years = parseNumber(termYears);
    const base = parseNumber(apr);

    if (P <= 0 || years <= 0 || base <= 0) return [];

    const candidates = [base - 1, base, base + 1].filter((x) => x > 0);

    return candidates
      .map((candidateApr) => {
        const computed = compute(P, candidateApr, years);
        if (!computed) return null;
        return {
          apr: candidateApr,
          monthlyPayment: computed.monthlyPayment,
          totalInterest: computed.totalInterest,
        };
      })
      .filter(Boolean) as Array<{
      apr: number;
      monthlyPayment: number;
      totalInterest: number;
    }>;
  }, [loanAmount, apr, termYears]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        Use this farm land loan payment calculator to estimate{" "}
        <strong>monthly principal + interest</strong> payments for farmland or
        rural land financing. This is helpful when comparing land loan offers
        and planning long-term cash flow.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Farm land loan amount
          <div style={{ fontSize: 12, color: "#777" }}>
            Amount financed (principal)
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 400000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Example: 6.25 means 6.25% APR
          </div>
          <input
            type="text"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6.25"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Total repayment period
          </div>
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 25"
            style={inputStyle}
          />
        </label>
      </div>

      <button onClick={calculate} style={buttonStyle}>
        Calculate payment
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
            <strong>Total interest:</strong> {format(result.totalInterest)}
          </p>

          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
            Tip: Land loans often have different terms than standard mortgages.
            Use the same term across lenders for a fair comparison.
          </div>
        </div>
      )}

      {whatIfRows.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Rate sensitivity (what-if)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same loan amount and term held constant, APR varied by ±1%.
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
                {whatIfRows.map((row) => (
                  <tr key={row.apr}>
                    <td>{row.apr.toFixed(2)}%</td>
                    <td>{format(row.monthlyPayment)}</td>
                    <td>{format(row.totalInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Monthly rate = APR ÷ 12</li>
        <li>Total payments = years × 12</li>
        <li>Monthly payment is computed by a standard amortization formula</li>
        <li>Total interest = total paid − principal</li>
      </ul>

      <h3>Assumptions & notes</h3>
      <ul>
        <li>Fixed APR (variable rates will differ)</li>
        <li>Principal + interest only (taxes, insurance, fees excluded)</li>
        <li>Land appraisals and lender requirements are not modeled</li>
        <li>Lender rounding may cause small differences</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is a land loan the same as a mortgage?</strong>
        <br />
        Not always. Land loans can have different down payment requirements,
        terms, and rates compared with standard home mortgages.
      </p>

      <p>
        <strong>Why are land loan rates sometimes higher?</strong>
        <br />
        Lenders may view land as higher risk because it may not generate income
        immediately and can be harder to liquidate than a home.
      </p>

      <p>
        <strong>Does a longer term reduce total cost?</strong>
        <br />
        Usually it reduces monthly payment, but increases total interest.
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
