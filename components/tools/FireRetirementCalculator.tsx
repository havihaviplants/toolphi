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

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.18)",
  marginTop: 8,
};

export default function FireRetirementCalculator() {
  const [incomeStr, setIncomeStr] = useState("80000");
  const [expensesStr, setExpensesStr] = useState("50000");
  const [currentSavingsStr, setCurrentSavingsStr] = useState("200000");

  const [returnRateStr, setReturnRateStr] = useState("6");
  const [withdrawalRateStr, setWithdrawalRateStr] = useState("4");
  const [maxYearsStr, setMaxYearsStr] = useState("60");

  const out = useMemo(() => {
    const income = clamp(num(incomeStr), 0);
    const expenses = clamp(num(expensesStr), 0);
    const currentSavings = clamp(num(currentSavingsStr), 0);

    const annualSavings = clamp(income - expenses, 0);
    const savingsRate = income > 0 ? annualSavings / income : 0;

    const r = clamp(num(returnRateStr), 0, 100) / 100;
    const w = clamp(num(withdrawalRateStr), 0.0001, 100) / 100;

    const fireNumber = expenses / w;

    const maxYears = clamp(num(maxYearsStr), 1, 200);

    let balance = currentSavings;
    let yearsToFire: number | null = null;

    for (let y = 0; y <= maxYears; y++) {
      if (balance >= fireNumber) {
        yearsToFire = y;
        break;
      }
      balance = balance * (1 + r) + annualSavings;
    }

    const status =
      yearsToFire === null
        ? `Not reached within ${maxYears} years (estimate).`
        : `Estimated time to FIRE: ${yearsToFire} years.`;

    return {
      income,
      expenses,
      annualSavings,
      savingsRate,
      fireNumber,
      yearsToFire,
      status,
      assumptions: {
        returnRatePct: r * 100,
        withdrawalRatePct: w * 100,
      },
    };
  }, [
    incomeStr,
    expensesStr,
    currentSavingsStr,
    returnRateStr,
    withdrawalRateStr,
    maxYearsStr,
  ]);

  return (
    <div className="tool-container">
      <h1>FIRE Retirement Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate your <strong>FIRE number</strong> (financial independence
        target) and how many years it may take to reach it based on your income,
        expenses, savings rate, and investment return assumptions.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Annual Income
          <input
            style={inputStyle}
            type="number"
            value={incomeStr}
            onChange={(e) => setIncomeStr(e.target.value)}
            placeholder="e.g. 80000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Annual Expenses
          <input
            style={inputStyle}
            type="number"
            value={expensesStr}
            onChange={(e) => setExpensesStr(e.target.value)}
            placeholder="e.g. 50000"
          />
        </label>
        <div className="muted">
          Your FIRE number is mostly driven by your annual expenses.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Current Savings (optional)
          <input
            style={inputStyle}
            type="number"
            value={currentSavingsStr}
            onChange={(e) => setCurrentSavingsStr(e.target.value)}
            placeholder="e.g. 200000"
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
          Lower withdrawal rate → higher FIRE number.
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
          Annual Savings: <strong>${money(out.annualSavings)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Savings Rate:{" "}
          <strong>{pct(out.savingsRate * 100)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          FIRE Number (estimate): <strong>${money(out.fireNumber)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          <strong>{out.status}</strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          Assumptions: return {out.assumptions.returnRatePct.toFixed(1)}%,
          withdrawal rate {out.assumptions.withdrawalRatePct.toFixed(1)}%.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>What is a FIRE number?</h2>
        <p className="muted">
          A FIRE number is an estimated portfolio size that can fund your
          expenses using a withdrawal rate. A common shortcut is dividing annual
          expenses by a withdrawal rate.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include taxes and inflation?</h3>
        <p className="muted">
          No. This is a simplified estimate. Taxes, inflation, healthcare costs,
          and market volatility can change outcomes. Consider more conservative
          assumptions for planning.
        </p>
      </div>
    </div>
  );
}
