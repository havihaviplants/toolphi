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

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.18)",
  marginTop: 8,
};

export default function EarlyRetirementCalculator() {
  const [currentStr, setCurrentStr] = useState("200000");
  const [annualSavingsStr, setAnnualSavingsStr] = useState("30000");
  const [returnRateStr, setReturnRateStr] = useState("6");
  const [targetSpendAnnualStr, setTargetSpendAnnualStr] = useState("50000");
  const [withdrawalRateStr, setWithdrawalRateStr] = useState("4");
  const [maxYearsStr, setMaxYearsStr] = useState("60");

  const out = useMemo(() => {
    const current = clamp(num(currentStr), 0);
    const annualSavings = clamp(num(annualSavingsStr), 0);
    const r = clamp(num(returnRateStr), 0, 100) / 100;

    const targetSpendAnnual = clamp(num(targetSpendAnnualStr), 0);
    const w = clamp(num(withdrawalRateStr), 0.0001, 100) / 100;

    const targetNestEgg = targetSpendAnnual / w;

    const maxYears = clamp(num(maxYearsStr), 1, 200);

    let balance = current;
    let yearsToTarget: number | null = null;

    for (let y = 0; y <= maxYears; y++) {
      if (balance >= targetNestEgg) {
        yearsToTarget = y;
        break;
      }
      // grow then add savings (simple annual model)
      balance = balance * (1 + r) + annualSavings;
    }

    const status =
      yearsToTarget === null
        ? `Not reached within ${maxYears} years (estimate).`
        : `Estimated time to reach target: ${yearsToTarget} years.`;

    return {
      targetNestEgg,
      yearsToTarget,
      status,
      assumptions: {
        annualSavings,
        returnRatePct: r * 100,
        withdrawalRatePct: w * 100,
      },
    };
  }, [
    currentStr,
    annualSavingsStr,
    returnRateStr,
    targetSpendAnnualStr,
    withdrawalRateStr,
    maxYearsStr,
  ]);

  return (
    <div className="tool-container">
      <h1>Early Retirement Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate how many years it may take to reach your retirement target
        based on savings, investment returns, and a withdrawal rate. This is a
        simplified planning model (real results vary).
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Current Savings
          <input
            style={inputStyle}
            type="number"
            value={currentStr}
            onChange={(e) => setCurrentStr(e.target.value)}
            placeholder="e.g. 200000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Annual Savings (how much you add each year)
          <input
            style={inputStyle}
            type="number"
            value={annualSavingsStr}
            onChange={(e) => setAnnualSavingsStr(e.target.value)}
            placeholder="e.g. 30000"
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
        <div className="muted">
          Consider using a conservative long-term estimate.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Target Annual Retirement Spending
          <input
            style={inputStyle}
            type="number"
            value={targetSpendAnnualStr}
            onChange={(e) => setTargetSpendAnnualStr(e.target.value)}
            placeholder="e.g. 50000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Withdrawal Rate (%)
          <input
            style={inputStyle}
            type="number"
            value={withdrawalRateStr}
            onChange={(e) => setWithdrawalRateStr(e.target.value)}
            placeholder="e.g. 4"
          />
        </label>
        <div className="muted">
          Lower withdrawal rate → higher target nest egg.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Max Years to Simulate
          <input
            style={inputStyle}
            type="number"
            value={maxYearsStr}
            onChange={(e) => setMaxYearsStr(e.target.value)}
            placeholder="e.g. 60"
          />
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Target Nest Egg (estimate):{" "}
          <strong>${money(out.targetNestEgg)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          {out.yearsToTarget === null ? (
            <strong>{out.status}</strong>
          ) : (
            <strong>{out.status}</strong>
          )}
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p className="muted" style={{ marginTop: 0 }}>
          Assumptions: Annual savings ${money(out.assumptions.annualSavings)},{" "}
          return {round1(out.assumptions.returnRatePct)}%, withdrawal rate{" "}
          {round1(out.assumptions.withdrawalRatePct)}%.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How early retirement estimates work</h2>
        <p className="muted">
          A common approach is to estimate a target portfolio (nest egg) by
          dividing annual retirement spending by a withdrawal rate. Then you
          project portfolio growth by applying an annual return and adding
          annual savings until the target is reached.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include inflation and taxes?</h3>
        <p className="muted">
          No. This tool is a simplified model. Inflation, taxes, and real market
          volatility can change outcomes. For more conservative planning, lower
          the return rate or increase spending assumptions.
        </p>
      </div>
    </div>
  );
}
