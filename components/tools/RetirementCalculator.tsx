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

export default function RetirementCalculator() {
  const [currentSavingsStr, setCurrentSavingsStr] = useState("150000");
  const [annualContributionStr, setAnnualContributionStr] = useState("20000");
  const [returnRateStr, setReturnRateStr] = useState("6");
  const [yearsStr, setYearsStr] = useState("20");

  const [desiredAnnualSpendingStr, setDesiredAnnualSpendingStr] =
    useState("60000");
  const [withdrawalRateStr, setWithdrawalRateStr] = useState("4");

  const out = useMemo(() => {
    const current = clamp(num(currentSavingsStr), 0);
    const contrib = clamp(num(annualContributionStr), 0);
    const r = clamp(num(returnRateStr), 0, 100) / 100;
    const years = clamp(num(yearsStr), 0, 120);

    const desiredSpend = clamp(num(desiredAnnualSpendingStr), 0);
    const w = clamp(num(withdrawalRateStr), 0.0001, 100) / 100;

    // Projected savings at retirement (simple annual model)
    let balance = current;
    for (let i = 0; i < years; i++) {
      balance = balance * (1 + r) + contrib;
    }
    const projectedSavings = balance;

    // Target nest egg (spending / withdrawal rate)
    const targetNestEgg = desiredSpend / w;

    const gap = targetNestEgg - projectedSavings;

    // Income projection from projected savings (same withdrawal rate)
    const projectedAnnualIncome = projectedSavings * w;
    const projectedMonthlyIncome = projectedAnnualIncome / 12;

    return {
      projectedSavings,
      targetNestEgg,
      gap,
      projectedAnnualIncome,
      projectedMonthlyIncome,
      assumptions: {
        rPct: r * 100,
        wPct: w * 100,
      },
    };
  }, [
    currentSavingsStr,
    annualContributionStr,
    returnRateStr,
    yearsStr,
    desiredAnnualSpendingStr,
    withdrawalRateStr,
  ]);

  return (
    <div className="tool-container">
      <h1>Retirement Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        A retirement planning hub: estimate your future savings, target nest egg
        (based on a withdrawal rate), and a rough income projection — then use
        the related calculators to refine details.
      </p>

      {/* Inputs (간격 넉넉하게) */}
      <div style={{ marginTop: 18 }}>
        <label>
          Current Savings
          <input
            style={inputStyle}
            type="number"
            value={currentSavingsStr}
            onChange={(e) => setCurrentSavingsStr(e.target.value)}
            placeholder="e.g. 150000"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Annual Contribution
          <input
            style={inputStyle}
            type="number"
            value={annualContributionStr}
            onChange={(e) => setAnnualContributionStr(e.target.value)}
            placeholder="e.g. 20000"
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
        <div className="muted">Use conservative assumptions for planning.</div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Years Until Retirement
          <input
            style={inputStyle}
            type="number"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            placeholder="e.g. 20"
          />
        </label>
      </div>

      <div style={{ marginTop: 22 }}>
        <label>
          Desired Annual Retirement Spending
          <input
            style={inputStyle}
            type="number"
            value={desiredAnnualSpendingStr}
            onChange={(e) => setDesiredAnnualSpendingStr(e.target.value)}
            placeholder="e.g. 60000"
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

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Summary Results</h2>

        <p style={{ marginTop: 12 }}>
          Projected Savings at Retirement:{" "}
          <strong>${money(out.projectedSavings)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Target Nest Egg (spending ÷ withdrawal rate):{" "}
          <strong>${money(out.targetNestEgg)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Gap (Target − Projected):{" "}
          <strong>
            {out.gap >= 0 ? "$" + money(out.gap) : "-$" + money(Math.abs(out.gap))}
          </strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Income from Projected Savings (annual):{" "}
          <strong>${money(out.projectedAnnualIncome)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Income from Projected Savings (monthly):{" "}
          <strong>${money(out.projectedMonthlyIncome)}</strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          Assumptions: return {out.assumptions.rPct.toFixed(1)}%, withdrawal{" "}
          {out.assumptions.wPct.toFixed(1)}%.
        </p>
      </div>

      {/* Related Tools (internal link chain) */}
      <div style={{ marginTop: 26 }}>
        <h2>Related retirement tools</h2>
        <p className="muted">
          Use these calculators to refine each part of your plan:
        </p>

        <ul style={{ paddingLeft: 18, marginTop: 10 }}>
          <li>
            Retirement Savings Calculator — project future savings (growth +
            contributions)
          </li>
          <li>
            Retirement Income Calculator — estimate monthly/annual income from a
            portfolio
          </li>
          <li>
            Retirement Spending Calculator — estimate required spending or
            budget
          </li>
          <li>
            Early Retirement Calculator — years to target using contributions
            and returns
          </li>
          <li>
            FIRE Retirement Calculator — savings-rate driven FIRE timeline
          </li>
          <li>
            401(k) Calculator — employer match + balance growth projection
          </li>
        </ul>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>How this retirement calculator works</h2>
        <p className="muted">
          This page combines two common retirement planning ideas: (1) projecting
          future savings using compound growth plus annual contributions, and (2)
          estimating a target portfolio (nest egg) by dividing desired spending
          by a withdrawal rate. It’s a simplified planning model.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Is this inflation-adjusted?</h3>
        <p className="muted">
          No. Results are shown in nominal dollars. For a conservative view,
          reduce the return rate to approximate inflation-adjusted growth.
        </p>

        <h3>Does this include taxes?</h3>
        <p className="muted">
          No. Taxes depend on account type and location. Use tax-specific tools
          when you add the tax layer.
        </p>
      </div>
    </div>
  );
}
