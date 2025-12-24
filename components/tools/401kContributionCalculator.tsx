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

type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAYCHECKS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export default function K401ContributionCalculator() {
  const [salaryStr, setSalaryStr] = useState("80000");
  const [contributionPctStr, setContributionPctStr] = useState("10");
  const [payFreq, setPayFreq] = useState<PayFrequency>("biweekly");

  const [annualLimitTargetStr, setAnnualLimitTargetStr] = useState("23000");

  const out = useMemo(() => {
    const salary = clamp(num(salaryStr), 0);
    const pct = clamp(num(contributionPctStr), 0, 100) / 100;

    const annualContribution = salary * pct;

    const paychecks = PAYCHECKS_PER_YEAR[payFreq] || 26;
    const perPaycheck = paychecks > 0 ? annualContribution / paychecks : 0;

    const limitTarget = clamp(num(annualLimitTargetStr), 0);
    const remainingToTarget = Math.max(limitTarget - annualContribution, 0);

    // If user wants to hit the target, what % is needed?
    const pctNeeded =
      salary > 0 ? (limitTarget / salary) * 100 : 0;

    return {
      annualContribution,
      perPaycheck,
      paychecks,
      limitTarget,
      remainingToTarget,
      pctNeeded,
    };
  }, [salaryStr, contributionPctStr, payFreq, annualLimitTargetStr]);

  return (
    <div className="tool-container">
      <h1>401(k) Contribution Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Calculate your 401(k) contribution based on salary and contribution
        percent. Estimate per-paycheck contributions and compare your annual
        total to a target contribution limit.
      </p>

      {/* Inputs (간격 넉넉하게) */}
      <div style={{ marginTop: 18 }}>
        <label>
          Annual Salary
          <input
            style={inputStyle}
            type="number"
            value={salaryStr}
            onChange={(e) => setSalaryStr(e.target.value)}
            placeholder="e.g. 80000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Contribution Percent (%)
          <input
            style={inputStyle}
            type="number"
            value={contributionPctStr}
            onChange={(e) => setContributionPctStr(e.target.value)}
            placeholder="e.g. 10"
          />
        </label>
        <div className="muted">
          This estimates employee contributions (salary × percent).
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Pay Frequency
          <select
            style={inputStyle}
            value={payFreq}
            onChange={(e) => setPayFreq(e.target.value as PayFrequency)}
          >
            <option value="weekly">Weekly (52)</option>
            <option value="biweekly">Biweekly (26)</option>
            <option value="semimonthly">Semi-monthly (24)</option>
            <option value="monthly">Monthly (12)</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Annual Contribution Target / Limit (optional)
          <input
            style={inputStyle}
            type="number"
            value={annualLimitTargetStr}
            onChange={(e) => setAnnualLimitTargetStr(e.target.value)}
            placeholder="e.g. 23000"
          />
        </label>
        <div className="muted">
          Use this as a planning target. Official IRS limits can change by year.
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Estimated Annual 401(k) Contribution:{" "}
          <strong>${money(out.annualContribution)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Estimated Contribution Per Paycheck ({out.paychecks}/year):{" "}
          <strong>${money(out.perPaycheck)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Target / Limit (for planning):{" "}
          <strong>${money(out.limitTarget)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Remaining to Target (if any):{" "}
          <strong>${money(out.remainingToTarget)}</strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          To reach the target at this salary, contribution percent would be
          roughly <strong>{out.pctNeeded.toFixed(1)}%</strong>.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How 401(k) contribution percentages work</h2>
        <p className="muted">
          Many employers let you set a contribution percentage of your pay.
          This calculator converts that percent into annual and per-paycheck
          amounts so you can plan around a yearly contribution target.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include employer match?</h3>
        <p className="muted">
          No. This tool focuses on employee contributions. Use a 401(k) growth
          calculator to model employer match and long-term balance growth.
        </p>

        <h3>What about catch-up contributions?</h3>
        <p className="muted">
          Contribution limits can vary by year and age. Treat the “target/limit”
          field as a planning input.
        </p>
      </div>
    </div>
  );
}
