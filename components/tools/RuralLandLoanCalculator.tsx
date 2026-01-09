"use client";

import { useMemo, useState } from "react";

export default function RuralLandLoanCalculator() {
  const [amount, setAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const compute = (P: number, ratePct: number, years: number) => {
    const r = ratePct / 100 / 12;
    const n = years * 12;
    if (P <= 0 || r <= 0 || n <= 0) return null;

    const monthly =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;

    return { monthly, totalPaid, totalInterest };
  };

  const result = useMemo(() => {
    const P = toNumber(amount);
    const rate = toNumber(apr);
    const years = toNumber(termYears);
    return compute(P, rate, years);
  }, [amount, apr, termYears]);

  const whatIf = useMemo(() => {
    const P = toNumber(amount);
    const base = toNumber(apr);
    const years = toNumber(termYears);

    if (P <= 0 || base <= 0 || years <= 0) return [];

    const rates = [base - 0.5, base, base + 0.5].filter((x) => x > 0);

    return rates
      .map((r) => {
        const res = compute(P, r, years);
        if (!res) return null;
        return {
          apr: r,
          monthly: res.monthly,
          interest: res.totalInterest,
        };
      })
      .filter(Boolean) as Array<{ apr: number; monthly: number; interest: number }>;
  }, [amount, apr, termYears]);

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This rural land loan calculator estimates the monthly payment and total
        interest for financing rural or country property. Rural land loans can
        differ from standard mortgages due to zoning, utilities, access roads,
        and land use restrictions.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Rural land loan amount
          <div style={helper}>Amount financed (principal)</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 200000"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={helper}>Example: 7 means 7% APR</div>
          <input
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 7"
            style={input}
          />
        </label>

        <label>
          Loan term (years)
          <div style={helper}>Common: 10–30 years</div>
          <input
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 20"
            style={input}
          />
        </label>
      </div>

      <div style={summary}>
        <p>
          <strong>Estimated monthly payment:</strong>{" "}
          {result ? format(result.monthly) : "—"}
        </p>
        <p>
          <strong>Total interest paid:</strong>{" "}
          {result ? format(result.totalInterest) : "—"}
        </p>
        <p>
          <strong>Total loan cost:</strong>{" "}
          {result ? format(result.totalPaid) : "—"}
        </p>

        <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
          Tip: Use the same loan amount and term when comparing rural land loan
          offers. A small APR difference can change long-term interest cost
          significantly.
        </p>
      </div>

      {whatIf.length > 0 && (
        <>
          <h3 style={{ marginTop: 26 }}>APR sensitivity (what-if)</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Same principal and term, APR changed by ±0.5%.
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
                {whatIf.map((row) => (
                  <tr key={row.apr}>
                    <td>{row.apr.toFixed(2)}%</td>
                    <td>{format(row.monthly)}</td>
                    <td>{format(row.interest)}</td>
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
        <li>Monthly payment uses standard amortization math</li>
        <li>Total interest = total paid − principal</li>
      </ul>

      <h3>Common rural land loan considerations</h3>
      <ul>
        <li>Utilities access (electricity, water, septic)</li>
        <li>Road access and easements</li>
        <li>Zoning and land use restrictions</li>
        <li>Down payment requirements may be higher</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is a rural land loan the same as a home mortgage?</strong>
        <br />
        Not always. Many lenders treat unimproved land differently than homes,
        which can affect rates and terms.
      </p>

      <p>
        <strong>Does this include taxes and insurance?</strong>
        <br />
        No. Those costs vary by location and are not included in this estimate.
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
