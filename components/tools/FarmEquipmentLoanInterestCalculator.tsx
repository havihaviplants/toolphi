"use client";

import { useMemo, useState } from "react";

export default function FarmEquipmentLoanInterestCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termMode, setTermMode] = useState<"months" | "years">("months");
  const [termValue, setTermValue] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format0 = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const compute = (P: number, ratePct: number, months: number) => {
    const r = ratePct / 100 / 12;
    const n = months;
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
    const term = toNumber(termValue);

    if (P <= 0 || rate <= 0 || term <= 0) return null;

    const months = termMode === "years" ? term * 12 : term;

    return compute(P, rate, months);
  }, [loanAmount, apr, termMode, termValue]);

  const sensitivity = useMemo(() => {
    const P = toNumber(loanAmount);
    const base = toNumber(apr);
    const term = toNumber(termValue);

    if (P <= 0 || base <= 0 || term <= 0) return [];

    const months = termMode === "years" ? term * 12 : term;

    const rates = [base - 1, base - 0.5, base, base + 0.5, base + 1].filter(
      (x) => x > 0
    );

    return rates
      .map((r) => {
        const res = compute(P, r, months);
        if (!res) return null;
        return {
          apr: r,
          monthly: res.monthly,
          totalInterest: res.totalInterest,
          totalPaid: res.totalPaid,
        };
      })
      .filter(Boolean) as Array<{
      apr: number;
      monthly: number;
      totalInterest: number;
      totalPaid: number;
    }>;
  }, [loanAmount, apr, termMode, termValue]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm equipment loan interest calculator focuses on{" "}
        <strong>total interest cost</strong>—how much you pay in interest over
        the full loan term. It also shows monthly payment and how sensitive the
        loan cost is to APR changes.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Loan amount
          <div style={helper}>Amount financed (principal)</div>
          <input
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 90000"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 8.25 means 8.25% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 8.25"
            style={input}
          />
        </label>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 600 }}>Loan term</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "months"}
                onChange={() => setTermMode("months")}
              />
              <span style={{ marginLeft: 6 }}>Months</span>
            </label>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "years"}
                onChange={() => setTermMode("years")}
              />
              <span style={{ marginLeft: 6 }}>Years</span>
            </label>
          </div>

          <input
            value={termValue}
            onChange={(e) => setTermValue(e.target.value)}
            placeholder={termMode === "months" ? "e.g. 60" : "e.g. 5"}
            style={input}
          />
          <div style={helper}>
            Typical equipment financing is often 36–84 months.
          </div>
        </div>
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
          Tip: Even a 0.5% APR difference can change total interest materially
          on multi-year equipment loans.
        </p>
      </div>

      {sensitivity.length > 0 && (
        <>
          <h3 style={{ marginTop: 26 }}>APR sensitivity (quick compare)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same loan amount and term, APR adjusted by ±0.5% and ±1.0%.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>APR</th>
                  <th>Monthly payment</th>
                  <th>Total interest</th>
                  <th>Total paid</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => (
                  <tr key={row.apr}>
                    <td>{row.apr.toFixed(2)}%</td>
                    <td>{format0(row.monthly)}</td>
                    <td>{format0(row.totalInterest)}</td>
                    <td>{format0(row.totalPaid)}</td>
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
        <li>Monthly payment uses fixed-rate amortization math</li>
        <li>Total interest = total paid − principal</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Does this include fees or sales tax?</strong>
        <br />
        No. This is principal + interest only. If you want an all-in estimate,
        add expected fees/tax into the loan amount or use a financing calculator
        with fees.
      </p>
      <p>
        <strong>What about balloon payments?</strong>
        <br />
        Balloon loans require different math because a balance remains at the end.
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

const radioLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 13,
  color: "#333",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
