"use client";

import { useState } from "react";

export default function AgriculturalLandLoanCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const toNumber = (v: string) => {
    const n = Number(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const P = toNumber(amount);
  const r = toNumber(rate) / 100 / 12;
  const n = toNumber(years) * 12;

  const monthly =
    P > 0 && r > 0 && n > 0
      ? (P * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1)
      : 0;

  const totalPaid = monthly * n;
  const interest = totalPaid - P;

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        This agricultural land loan calculator estimates monthly payments and
        total interest for farmland purchases. Land loans often have longer
        terms and different rates than standard farm operating loans.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Loan amount
          <div style={helper}>Price of agricultural land financed</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 450000"
            style={input}
          />
        </label>

        <label>
          Annual interest rate (%)
          <div style={helper}>Land loan APR</div>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 6.25"
            style={input}
          />
        </label>

        <label>
          Loan term (years)
          <div style={helper}>Typically 20–30 years</div>
          <input
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 25"
            style={input}
          />
        </label>
      </div>

      <div style={summary}>
        <p>
          <strong>Estimated monthly payment:</strong>{" "}
          {monthly > 0 ? format(monthly) : "—"}
        </p>
        <p>
          <strong>Total interest paid:</strong>{" "}
          {interest > 0 ? format(interest) : "—"}
        </p>
        <p>
          <strong>Total loan cost:</strong>{" "}
          {totalPaid > 0 ? format(totalPaid) : "—"}
        </p>
      </div>

      <h3 style={{ marginTop: 28 }}>How agricultural land loans differ</h3>
      <ul>
        <li>Longer loan terms than equipment or operating loans</li>
        <li>Rates depend on land quality, location, and lender</li>
        <li>Often require higher down payments</li>
      </ul>

      <h3>When to use this calculator</h3>
      <ul>
        <li>Buying farmland or pasture</li>
        <li>Comparing land loan offers</li>
        <li>Evaluating long-term land investment costs</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is this the same as a farm operating loan?</strong>
        <br />
        No. Land loans are typically long-term and secured by real property.
      </p>

      <p>
        <strong>Does this include taxes or insurance?</strong>
        <br />
        No. Property taxes and insurance vary by location and are not included.
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
