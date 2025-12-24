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
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.18)",
  marginTop: 8,
};

export default function SepIraCalculator() {
  const [compensationStr, setCompensationStr] = useState("120000");
  const [contributionPctStr, setContributionPctStr] = useState("15");

  const [yearsStr, setYearsStr] = useState("20");
  const [returnRateStr, setReturnRateStr] = useState("6");

  const out = useMemo(() => {
    const comp = clamp(num(compensationStr), 0);
    const pct = clamp(num(contributionPctStr), 0, 100) / 100;

    const years = clamp(num(yearsStr), 0, 120);
    const r = clamp(num(returnRateStr), 0, 100) / 100;

    const annualContribution = comp * pct;

    // FV of annual contributions (end-of-year)
    const fv =
      r === 0
        ? annualContribution * years
        : annualContribution * ((Math.pow(1 + r, years) - 1) / r);

    const totalContributed = annualContribution * years;
    const growth = fv - totalContributed;

    return {
      annualContribution,
      fv,
      totalContributed,
      growth,
      rPct: r * 100,
    };
  }, [compensationStr, contributionPctStr, yearsStr, returnRateStr]);

  return (
    <div className="tool-container">
      <h1>SEP IRA Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate SEP IRA contributions based on compensation and a contribution
        rate, then project how your balance could grow over time with compound
        returns. This is a simplified planning model.
      </p>

      {/* Inputs (간격 넉넉하게) */}
      <div style={{ marginTop: 18 }}>
        <label>
          Annual Compensation / Net Self-Employment Income
          <input
            style={inputStyle}
            type="number"
            value={compensationStr}
            onChange={(e) => setCompensationStr(e.target.value)}
            placeholder="e.g. 120000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Contribution Rate (%)
          <input
            style={inputStyle}
            type="number"
            value={contributionPctStr}
            onChange={(e) => setContributionPctStr(e.target.value)}
            placeholder="e.g. 15"
          />
        </label>
        <div className="muted">
          Enter the percent of compensation you plan to contribute.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Years to Invest
          <input
            style={inputStyle}
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            placeholder="e.g. 20"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Expected Annual Return (%)
          <input
            style={inputStyle}
            type="number"
            value={returnRateStr}
            onChange={(e) => setReturnRateStr(e.target.value)}
            placeholder="e.g. 6"
          />
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Estimated Annual Contribution:{" "}
          <strong>${money(out.annualContribution)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Total Contributed Over {yearsStr} Years:{" "}
          <strong>${money(out.totalContributed)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Estimated Investment Growth:{" "}
          <strong>${money(out.growth)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Projected SEP IRA Balance: <strong>${money(out.fv)}</strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          Assumption: constant annual contribution and {out.rPct.toFixed(1)}% return.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How a SEP IRA contribution estimate works</h2>
        <p className="muted">
          A simplified SEP IRA model multiplies compensation by a contribution
          rate to estimate annual contributions, then applies compound growth to
          estimate a future balance. Real rules and limits can vary by year.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this enforce official SEP IRA limits?</h3>
        <p className="muted">
          No. Limits can change by year and depend on compensation definitions.
          Use this tool as a planning estimate.
        </p>

        <h3>Is SEP IRA only for self-employed?</h3>
        <p className="muted">
          SEP IRAs are commonly used by self-employed people and small business
          owners, but eligibility depends on plan setup.
        </p>
      </div>
    </div>
  );
}
