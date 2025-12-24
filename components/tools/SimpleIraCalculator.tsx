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

export default function SimpleIraCalculator() {
  const [salaryStr, setSalaryStr] = useState("70000");
  const [employeePctStr, setEmployeePctStr] = useState("8");

  const [yearsStr, setYearsStr] = useState("25");
  const [returnRateStr, setReturnRateStr] = useState("6");

  const out = useMemo(() => {
    const salary = clamp(num(salaryStr), 0);
    const pct = clamp(num(employeePctStr), 0, 100) / 100;

    const years = clamp(num(yearsStr), 0, 120);
    const r = clamp(num(returnRateStr), 0, 100) / 100;

    const annualContribution = salary * pct;

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
  }, [salaryStr, employeePctStr, yearsStr, returnRateStr]);

  return (
    <div className="tool-container">
      <h1>SIMPLE IRA Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate SIMPLE IRA employee contributions based on salary and
        contribution percent, then project how your balance could grow over time
        with compound returns. This is a simplified planning model.
      </p>

      {/* Inputs (간격 넉넉하게) */}
      <div style={{ marginTop: 18 }}>
        <label>
          Annual Salary / Compensation
          <input
            style={inputStyle}
            type="number"
            value={salaryStr}
            onChange={(e) => setSalaryStr(e.target.value)}
            placeholder="e.g. 70000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Employee Contribution Percent (%)
          <input
            style={inputStyle}
            type="number"
            value={employeePctStr}
            onChange={(e) => setEmployeePctStr(e.target.value)}
            placeholder="e.g. 8"
          />
        </label>
        <div className="muted">
          This estimates employee contributions (salary × percent).
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
            placeholder="e.g. 25"
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
          Estimated Investment Growth: <strong>${money(out.growth)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Projected SIMPLE IRA Balance: <strong>${money(out.fv)}</strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          Assumption: constant annual contribution and {out.rPct.toFixed(1)}% return.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How SIMPLE IRA contribution estimates work</h2>
        <p className="muted">
          This calculator multiplies salary by an employee contribution percent
          to estimate annual contributions. It then applies compound growth to
          estimate a future balance. Real SIMPLE IRA rules and limits can vary
          by year.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include employer contributions?</h3>
        <p className="muted">
          No. SIMPLE IRA plans may include employer match or nonelective
          contributions. This tool focuses on employee contribution estimates.
        </p>

        <h3>Does this enforce official SIMPLE IRA limits?</h3>
        <p className="muted">
          No. Limits can change by year. Treat this as a planning estimate and
          adjust inputs as needed.
        </p>
      </div>
    </div>
  );
}
