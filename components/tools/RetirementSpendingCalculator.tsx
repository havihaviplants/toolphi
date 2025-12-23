"use client";

import { useMemo, useState } from "react";

type SpendMode = "MONTHLY" | "ANNUAL";

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

export default function RetirementSpendingCalculator() {
  const [mode, setMode] = useState<SpendMode>("ANNUAL");

  const [spendMonthlyStr, setSpendMonthlyStr] = useState("5000");
  const [spendAnnualStr, setSpendAnnualStr] = useState("60000");

  const [otherAnnualIncomeStr, setOtherAnnualIncomeStr] = useState("20000");
  const [withdrawalRateStr, setWithdrawalRateStr] = useState("4");

  const [currentPortfolioStr, setCurrentPortfolioStr] = useState("800000");

  const out = useMemo(() => {
    const spendMonthly = clamp(num(spendMonthlyStr), 0);
    const spendAnnual = clamp(num(spendAnnualStr), 0);

    const plannedAnnualSpending =
      mode === "MONTHLY" ? spendMonthly * 12 : spendAnnual;

    const otherAnnualIncome = clamp(num(otherAnnualIncomeStr), 0);
    const withdrawalRate = clamp(num(withdrawalRateStr), 0.0001, 100) / 100;

    const neededFromPortfolioAnnual = clamp(
      plannedAnnualSpending - otherAnnualIncome,
      0
    );

    const requiredSavings = neededFromPortfolioAnnual / withdrawalRate;

    const currentPortfolio = clamp(num(currentPortfolioStr), 0);
    const gap = requiredSavings - currentPortfolio;

    const status =
      gap <= 0
        ? "On track (portfolio meets the estimate)."
        : "Gap remains (portfolio below the estimate).";

    return {
      plannedAnnualSpending,
      neededFromPortfolioAnnual,
      requiredSavings,
      currentPortfolio,
      gap,
      status,
    };
  }, [
    mode,
    spendMonthlyStr,
    spendAnnualStr,
    otherAnnualIncomeStr,
    withdrawalRateStr,
    currentPortfolioStr,
  ]);

  return (
    <div className="tool-container">
      <h1>Retirement Spending Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate how much retirement savings you may need based on your planned
        spending and a withdrawal rate (for example, 4%). This tool also
        compares required savings vs your current portfolio to show the gap.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Spending Input Mode
          <select
            style={inputStyle}
            value={mode}
            onChange={(e) => setMode(e.target.value as SpendMode)}
          >
            <option value="ANNUAL">Annual spending</option>
            <option value="MONTHLY">Monthly spending</option>
          </select>
        </label>
      </div>

      {mode === "MONTHLY" ? (
        <div style={{ marginTop: 18 }}>
          <label>
            Planned Monthly Retirement Spending
            <input
              style={inputStyle}
              type="number"
              value={spendMonthlyStr}
              onChange={(e) => setSpendMonthlyStr(e.target.value)}
              placeholder="e.g. 5000"
            />
          </label>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <label>
            Planned Annual Retirement Spending
            <input
              style={inputStyle}
              type="number"
              value={spendAnnualStr}
              onChange={(e) => setSpendAnnualStr(e.target.value)}
              placeholder="e.g. 60000"
            />
          </label>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <label>
          Other Annual Income (optional)
          <input
            style={inputStyle}
            type="number"
            value={otherAnnualIncomeStr}
            onChange={(e) => setOtherAnnualIncomeStr(e.target.value)}
            placeholder="e.g. 20000"
          />
        </label>
        <div className="muted">
          Examples: pension, social security, rental net income (annual).
        </div>
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
          A lower withdrawal rate increases the required savings estimate.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Current Portfolio (optional)
          <input
            style={inputStyle}
            type="number"
            value={currentPortfolioStr}
            onChange={(e) => setCurrentPortfolioStr(e.target.value)}
            placeholder="e.g. 800000"
          />
        </label>
        <div className="muted">
          Enter your current retirement savings to see the gap.
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Planned Spending (annual):{" "}
          <strong>${money(out.plannedAnnualSpending)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Needed from Portfolio (annual):{" "}
          <strong>${money(out.neededFromPortfolioAnnual)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Required Retirement Savings (estimate):{" "}
          <strong>${money(out.requiredSavings)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Current Portfolio: <strong>${money(out.currentPortfolio)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Gap (required − current):{" "}
          <strong>
            {out.gap <= 0 ? "-" : ""}${money(Math.abs(out.gap))}
          </strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          {out.status}
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How to estimate required retirement savings</h2>
        <p className="muted">
          A common planning method is to estimate the annual amount you need
          from your portfolio (spending minus other income) and divide it by a
          withdrawal rate. This gives a rough “required nest egg” estimate.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Is this inflation-adjusted?</h3>
        <p className="muted">
          No. This tool uses today’s dollars. You can reduce the return
          expectations or increase spending assumptions to approximate inflation.
        </p>

        <h3>Is the withdrawal rate guaranteed?</h3>
        <p className="muted">
          No. Withdrawal strategy depends on market returns, inflation, and
          flexibility. This calculator is for planning estimates.
        </p>
      </div>
    </div>
  );
}
