"use client";

import { useMemo, useState } from "react";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.18)",
  marginTop: 8,
};

export default function RetirementSavingsCalculator() {
  const [currentStr, setCurrentStr] = useState("50000");
  const [annualStr, setAnnualStr] = useState("10000");
  const [rateStr, setRateStr] = useState("6");
  const [yearsStr, setYearsStr] = useState("25");

  const out = useMemo(() => {
    const current = num(currentStr);
    const annual = num(annualStr);
    const rate = num(rateStr) / 100;
    const years = num(yearsStr);

    let balance = current;

    for (let i = 0; i < years; i++) {
      balance = balance * (1 + rate) + annual;
    }

    return {
      total: balance,
    };
  }, [currentStr, annualStr, rateStr, yearsStr]);

  return (
    <div className="tool-container">
      <h1>Retirement Savings Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate how much you could accumulate for retirement based on your
        current savings, yearly contributions, and expected investment return.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Current Retirement Savings
          <input
            style={inputStyle}
            type="number"
            value={currentStr}
            onChange={(e) => setCurrentStr(e.target.value)}
            placeholder="e.g. 50000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Annual Contribution
          <input
            style={inputStyle}
            type="number"
            value={annualStr}
            onChange={(e) => setAnnualStr(e.target.value)}
            placeholder="e.g. 10000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Expected Annual Return (%)
          <input
            style={inputStyle}
            type="number"
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
            placeholder="e.g. 6"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Years Until Retirement
          <input
            style={inputStyle}
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            placeholder="e.g. 25"
          />
        </label>
      </div>

      {/* Result */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Estimated Retirement Savings</h2>
        <p style={{ marginTop: 12 }}>
          <strong>${money(out.total)}</strong>
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How retirement savings grow</h2>
        <p className="muted">
          Retirement savings grow through consistent contributions and compound
          returns over time. Starting early and contributing regularly can
          significantly increase your retirement balance.
        </p>

        <h2 style={{ marginTop: 18 }}>Frequently asked questions</h2>

        <h3>Is this calculator inflation-adjusted?</h3>
        <p className="muted">
          No. This calculator shows nominal growth. You can adjust the return
          rate downward to approximate inflation-adjusted results.
        </p>
      </div>
    </div>
  );
}
