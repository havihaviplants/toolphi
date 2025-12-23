"use client";

import { useMemo, useState } from "react";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0, max = Infinity) {
  return Math.min(Math.max(n, min), max);
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pct(n: number) {
  return `${n.toFixed(2)}%`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

const block: React.CSSProperties = { marginTop: 14 };

export default function DividendReinvestmentDripCalculator() {
  const [initialStr, setInitialStr] = useState("10000");
  const [yieldStr, setYieldStr] = useState("4");
  const [growthStr, setGrowthStr] = useState("3");
  const [yearsStr, setYearsStr] = useState("10");

  const result = useMemo(() => {
    const initial = clamp(num(initialStr), 0);
    const yieldPct = clamp(num(yieldStr), 0, 100) / 100;
    const growthPct = clamp(num(growthStr), 0, 100) / 100;
    const years = clamp(num(yearsStr), 0, 100);

    let valueWithDrip = initial;
    let valueNoDrip = initial;

    for (let i = 0; i < years; i++) {
      // With DRIP
      const dividend = valueWithDrip * yieldPct;
      valueWithDrip = (valueWithDrip + dividend) * (1 + growthPct);

      // Without DRIP (price grows only)
      valueNoDrip = valueNoDrip * (1 + growthPct);
    }

    const annualDividendWithDrip = valueWithDrip * yieldPct;
    const annualDividendNoDrip = valueNoDrip * yieldPct;

    return {
      valueWithDrip,
      valueNoDrip,
      annualDividendWithDrip,
      annualDividendNoDrip,
    };
  }, [initialStr, yieldStr, growthStr, yearsStr]);

  return (
    <div className="tool-container">
      <h1>Dividend Reinvestment (DRIP) Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        This calculator shows how <strong>reinvesting dividends (DRIP)</strong> can
        accelerate long-term portfolio growth compared to taking dividends as cash.
      </p>

      {/* Inputs */}
      <div style={block}>
        <label>
          Initial Investment Amount
          <input
            style={inputStyle}
            type="number"
            value={initialStr}
            onChange={(e) => setInitialStr(e.target.value)}
            placeholder="e.g., 10000"
          />
        </label>
      </div>

      <div style={block}>
        <label>
          Dividend Yield (annual %)
          <input
            style={inputStyle}
            type="number"
            value={yieldStr}
            onChange={(e) => setYieldStr(e.target.value)}
            placeholder="e.g., 4"
          />
        </label>
      </div>

      <div style={block}>
        <label>
          Expected Annual Price Growth (%)
          <input
            style={inputStyle}
            type="number"
            value={growthStr}
            onChange={(e) => setGrowthStr(e.target.value)}
            placeholder="e.g., 3"
          />
        </label>
      </div>

      <div style={block}>
        <label>
          Reinvestment Period (years)
          <input
            style={inputStyle}
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            placeholder="e.g., 10"
          />
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 20 }}>
        <h2>Results</h2>

        <p>
          Final Value with DRIP:{" "}
          <strong>${money(result.valueWithDrip)}</strong>
        </p>

        <p>
          Final Value without DRIP:{" "}
          <strong>${money(result.valueNoDrip)}</strong>
        </p>

        <hr />

        <p>
          Annual Dividend with DRIP:{" "}
          <strong>${money(result.annualDividendWithDrip)}</strong>
        </p>

        <p>
          Annual Dividend without DRIP:{" "}
          <strong>${money(result.annualDividendNoDrip)}</strong>
        </p>
      </div>

      {/* SEO Section */}
      <div style={{ marginTop: 20 }}>
        <h2>Why dividend reinvestment matters</h2>
        <p className="muted">
          Reinvesting dividends allows you to purchase additional shares, which
          themselves generate dividends. Over long periods, this compounding effect
          can significantly increase both portfolio value and income.
        </p>
      </div>
    </div>
  );
}
