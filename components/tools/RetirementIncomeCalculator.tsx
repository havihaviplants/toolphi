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

export default function RetirementIncomeCalculator() {
  const [portfolioStr, setPortfolioStr] = useState("1000000");
  const [withdrawalRateStr, setWithdrawalRateStr] = useState("4");
  const [otherAnnualIncomeStr, setOtherAnnualIncomeStr] = useState("0");

  const out = useMemo(() => {
    const portfolio = clamp(num(portfolioStr), 0);
    const withdrawalRate = clamp(num(withdrawalRateStr), 0, 100) / 100;
    const otherAnnualIncome = clamp(num(otherAnnualIncomeStr), 0);

    const annualFromPortfolio = portfolio * withdrawalRate;
    const totalAnnualIncome = annualFromPortfolio + otherAnnualIncome;
    const monthlyIncome = totalAnnualIncome / 12;

    return {
      annualFromPortfolio,
      totalAnnualIncome,
      monthlyIncome,
    };
  }, [portfolioStr, withdrawalRateStr, otherAnnualIncomeStr]);

  return (
    <div className="tool-container">
      <h1>Retirement Income Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Estimate your retirement income from your investment portfolio using a
        withdrawal rate (for example, the 4% rule). This provides a simple
        planning baseline before taxes and real-world variability.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <label>
          Retirement Savings / Portfolio Value
          <input
            style={inputStyle}
            type="number"
            value={portfolioStr}
            onChange={(e) => setPortfolioStr(e.target.value)}
            placeholder="e.g. 1000000"
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
          Typical planning ranges are often around 3%–5% depending on risk, time
          horizon, and market conditions.
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Other Annual Income (optional)
          <input
            style={inputStyle}
            type="number"
            value={otherAnnualIncomeStr}
            onChange={(e) => setOtherAnnualIncomeStr(e.target.value)}
            placeholder="e.g. 12000"
          />
        </label>
        <div className="muted">
          Examples: pension, social security, rental net income (annual).
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Estimated Retirement Income</h2>

        <p style={{ marginTop: 12 }}>
          From Portfolio (annual):{" "}
          <strong>${money(out.annualFromPortfolio)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Total Income (annual):{" "}
          <strong>${money(out.totalAnnualIncome)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Total Income (monthly):{" "}
          <strong>${money(out.monthlyIncome)}</strong>
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How to estimate retirement income</h2>
        <p className="muted">
          A simple way to estimate retirement income is to multiply your
          retirement savings by a withdrawal rate. This approximation is often
          used for early planning, but real outcomes depend on investment
          returns, inflation, taxes, and spending flexibility.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Is this guaranteed income?</h3>
        <p className="muted">
          No. This is a planning estimate. Market returns vary and withdrawals
          may need adjustment over time.
        </p>

        <h3>Does it include taxes?</h3>
        <p className="muted">
          No. This calculator estimates gross income. After-tax retirement
          income depends on account types and local tax rules.
        </p>
      </div>
    </div>
  );
}
