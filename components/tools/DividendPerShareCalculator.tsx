"use client";

import { useMemo, useState } from "react";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0.0000001, max = Infinity) {
  return Math.min(Math.max(n, min), max);
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

export default function DividendPerShareCalculator() {
  const [totalDividendsStr, setTotalDividendsStr] = useState("10000000");
  const [sharesOutstandingStr, setSharesOutstandingStr] = useState("5000000");

  const out = useMemo(() => {
    const totalDividends = clamp(num(totalDividendsStr));
    const shares = clamp(num(sharesOutstandingStr));

    const dps = totalDividends / shares;

    return {
      dps,
      formula: `Dividend Per Share = ${money(
        totalDividends
      )} ÷ ${money(shares)} = ${money(dps)}`,
    };
  }, [totalDividendsStr, sharesOutstandingStr]);

  return (
    <div className="tool-container">
      <h1>Dividend Per Share (DPS) Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Dividend per share (DPS) shows how much dividend is allocated to each
        share. It is a core metric for analyzing dividend stocks and ETFs.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 14 }}>
        <label>
          Total Dividends Paid
          <input
            style={inputStyle}
            type="number"
            inputMode="decimal"
            value={totalDividendsStr}
            onChange={(e) => setTotalDividendsStr(e.target.value)}
            min={0}
            placeholder="e.g., 10000000"
          />
        </label>
        <div className="muted">
          Total dividends paid by the company over the period.
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label>
          Shares Outstanding
          <input
            style={inputStyle}
            type="number"
            inputMode="decimal"
            value={sharesOutstandingStr}
            onChange={(e) => setSharesOutstandingStr(e.target.value)}
            min={0}
            placeholder="e.g., 5000000"
          />
        </label>
        <div className="muted">
          Number of shares currently outstanding.
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 18 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 10 }}>
          Dividend Per Share (DPS):{" "}
          <strong>${money(out.dps)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p className="muted" style={{ marginTop: 0 }}>
          {out.formula}
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 22 }}>
        <h2>What is dividend per share?</h2>
        <p className="muted">
          Dividend per share represents the portion of a company’s dividend
          allocated to each outstanding share. Higher DPS generally indicates
          stronger income generation.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>
          Is dividend per share the same as dividend yield?
        </h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. DPS is a dollar amount per share, while dividend yield is a
          percentage based on share price.
        </p>
      </div>
    </div>
  );
}
