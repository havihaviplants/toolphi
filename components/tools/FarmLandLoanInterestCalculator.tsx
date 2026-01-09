"use client";

import { useMemo, useState } from "react";

export default function FarmLandLoanInterestCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format0 = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const compute = (P: number, ratePct: number, years: number) => {
    const r = ratePct / 100 / 12;
    const n = years * 12;
    if (P <= 0 || r <= 0 || n <= 0) return null;

    const monthly =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;
    const interestShare = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;

    return { monthly, totalPaid, totalInterest, interestShare, n };
  };

  const result = useMemo(() => {
    const P = toNumber(loanAmount);
    const rate = toNumber(apr);
    const years = toNumber(termYears);
    return compute(P, rate, years);
  }, [loanAmount, apr, termYears]);

  const quickCompare = useMemo(() => {
    const P = toNumber(loanAmount);
    const base = toNumber(apr);
    const years = toNumber(termYears);
    if (P <= 0 || base <= 0 || years <= 0) return [];

    const candidates = [base - 1, base - 0.5, base, base + 0.5, base + 1].filter(
      (x) => x > 0
    );

    return candidates
      .map((r) => {
        const res = compute(P, r, years);
        if (!res) return null;
        return {
          apr: r,
          totalInterest: res.totalInterest,
          monthly: res.monthly,
        };
      })
      .filter(Boolean) as Array<{ apr: number; totalInterest: number; monthly: number }>;
  }, [loanAmount, apr, termYears]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm land loan interest calculator focuses on{" "}
        <strong>total interest cost</strong>—how much the loan will cost over
        time. It also shows monthly payment and the share of payments that go to
        interest.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Farm land loan amount
          <div style={helper}>Principal (amount financed)</div>
          <input
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 350000"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 6.75 means 6.75% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6.75"
            style={input}
          />
        </label>

        <label>
          Loan term (years)
          <div style={helper}>Common: 15–30 years</div>
          <input
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 25"
            style={input}
          />
        </label>
      </div>

      <div style={summary}>
        <p>
          <strong>Total interest paid:</strong>{" "}
          {result ? format0(result.totalInterest) : "—"}
        </p>
        <p>
          <strong>Total paid (principal + interest):</strong>{" "}
          {result ? format0(result.totalPaid) : "—"}
        </p>
        <p>
          <strong>Estimated monthly payment:</strong>{" "}
          {result ? format0(result.monthly) : "—"}
        </p>
        <p>
          <strong>Interest share of total payments:</strong>{" "}
          {result ? `${result.interestShare.toFixed(1)}%` : "—"}
        </p>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Tip: Land loans are long-term—small APR changes can create large
          differences in total interest.
        </p>
      </div>

      {quickCompare.length > 0 && (
        <>
          <h3 style={{ marginTop: 26 }}>Interest cost by APR (quick compare)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same principal and term, APR adjusted by ±0.5% and ±1.0%.
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
                {quickCompare.map((row) => (
                  <tr key={row.apr}>
                    <td>{row.apr.toFixed(2)}%</td>
                    <td>{format0(row.monthly)}</td>
                    <td>{format0(row.totalInterest)}</td>
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
        <li>Total interest = total paid − principal</li>
        <li>Interest share shows how much of payments go to interest</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is this accurate for variable-rate land loans?</strong>
        <br />
        This assumes a fixed APR. Variable-rate loans require scenario modeling
        or stress testing.
      </p>

      <p>
        <strong>Does this include taxes, insurance, or fees?</strong>
        <br />
        No. This estimates principal + interest only. Use separate tools to
        estimate taxes, insurance, or closing costs if needed.
      </p>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};

const helper: React.CSSProperties = {
  fontSize: 12,
  color: "#777",
};

const summary: React.CSSProperties = {
  marginTop: 20,
  padding: 14,
  borderRadius: 8,
  background: "#f6f9ff",
  border: "1px solid #d6e0ff",
  fontSize: 14,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
