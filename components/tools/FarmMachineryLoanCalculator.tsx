"use client";

import { useMemo, useState } from "react";

export default function FarmMachineryLoanCalculator() {
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");

  const [apr, setApr] = useState("");
  const [termMode, setTermMode] = useState<"years" | "months">("years");
  const [termValue, setTermValue] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

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

    return { monthly, totalPaid, totalInterest };
  };

  const result = useMemo(() => {
    const total = toNumber(price);
    const dp = toNumber(downPayment);
    const rate = toNumber(apr);
    const term = toNumber(termValue);

    if (total <= 0 || rate <= 0 || term <= 0) return null;

    const dpClamped = clamp(dp, 0, total);
    const financed = total - dpClamped;

    const months = termMode === "years" ? term * 12 : term;

    const res = compute(financed, rate, months);
    if (!res) return null;

    return {
      totalPrice: total,
      downPayment: dpClamped,
      financedAmount: financed,
      monthly: res.monthly,
      totalPaid: res.totalPaid,
      totalInterest: res.totalInterest,
    };
  }, [price, downPayment, apr, termMode, termValue]);

  const quickCompare = useMemo(() => {
    const total = toNumber(price);
    const dp = toNumber(downPayment);
    const base = toNumber(apr);
    const term = toNumber(termValue);

    if (total <= 0 || term <= 0 || base <= 0) return [];

    const dpClamped = clamp(dp, 0, total);
    const financed = total - dpClamped;

    const months = termMode === "years" ? term * 12 : term;

    const rates = [base - 1, base - 0.5, base, base + 0.5, base + 1].filter(
      (x) => x > 0
    );

    return rates
      .map((r) => {
        const res = compute(financed, r, months);
        if (!res) return null;
        return { apr: r, monthly: res.monthly, interest: res.totalInterest };
      })
      .filter(Boolean) as Array<{ apr: number; monthly: number; interest: number }>;
  }, [price, downPayment, apr, termMode, termValue]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This farm machinery loan calculator estimates{" "}
        <strong>monthly payments</strong> and <strong>total interest</strong>{" "}
        for financing farm machines. Use the optional down payment field to
        calculate the amount you actually finance.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Machinery price
          <div style={helper}>Total purchase price of the machine</div>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 180000"
            style={input}
          />
        </label>

        <label>
          Down payment (optional)
          <div style={helper}>Enter 0 if no down payment</div>
          <input
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="e.g. 30000"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 8 means 8% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 8"
            style={input}
          />
        </label>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 600 }}>Loan term</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "years"}
                onChange={() => setTermMode("years")}
              />
              <span style={{ marginLeft: 6 }}>Years</span>
            </label>
            <label style={radioLabel}>
              <input
                type="radio"
                checked={termMode === "months"}
                onChange={() => setTermMode("months")}
              />
              <span style={{ marginLeft: 6 }}>Months</span>
            </label>
          </div>

          <input
            value={termValue}
            onChange={(e) => setTermValue(e.target.value)}
            placeholder={termMode === "years" ? "e.g. 6" : "e.g. 72"}
            style={input}
          />
          <div style={helper}>
            Many machinery loans are 36–84 months, but terms vary by lender.
          </div>
        </div>
      </div>

      <div style={summary}>
        <p>
          <strong>Financed amount:</strong>{" "}
          {result ? format0(result.financedAmount) : "—"}
        </p>
        <p>
          <strong>Estimated monthly payment:</strong>{" "}
          {result ? format0(result.monthly) : "—"}
        </p>
        <p>
          <strong>Total interest paid:</strong>{" "}
          {result ? format0(result.totalInterest) : "—"}
        </p>
        <p>
          <strong>Total loan cost:</strong>{" "}
          {result ? format0(result.totalPaid) : "—"}
        </p>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Tip: If you are comparing offers, keep the financed amount and term
          constant to isolate the effect of APR.
        </p>
      </div>

      {quickCompare.length > 0 && (
        <>
          <h3 style={{ marginTop: 26 }}>APR sensitivity (quick compare)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same financed amount and term, APR adjusted by ±0.5% and ±1.0%.
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
                    <td>{format0(row.interest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Financed amount = price − down payment</li>
        <li>Monthly rate = APR ÷ 12</li>
        <li>Monthly payment uses amortization math (fixed rate)</li>
        <li>Total interest = total paid − principal</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Does this include dealer fees or sales tax?</strong>
        <br />
        No. If you want to include those, add them to the price before
        calculating.
      </p>
      <p>
        <strong>What if the loan has a balloon payment?</strong>
        <br />
        Balloon loans require different math because a large balance remains at
        the end.
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
