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

export default function Roth401kCalculator() {
  const [annualContributionStr, setAnnualContributionStr] = useState("10000");
  const [yearsStr, setYearsStr] = useState("20");
  const [returnRateStr, setReturnRateStr] = useState("6");

  const [taxNowStr, setTaxNowStr] = useState("30");
  const [taxRetirementStr, setTaxRetirementStr] = useState("20");

  const out = useMemo(() => {
    const c = clamp(num(annualContributionStr), 0);
    const years = clamp(num(yearsStr), 0, 120);
    const r = clamp(num(returnRateStr), 0, 100) / 100;

    const taxNow = clamp(num(taxNowStr), 0, 100) / 100;
    const taxRet = clamp(num(taxRetirementStr), 0, 100) / 100;

    // Future value of annual contributions (end-of-year contributions)
    // FV = c * (( (1+r)^n - 1 ) / r)
    const fv = r === 0 ? c * years : c * ((Math.pow(1 + r, years) - 1) / r);

    // Roth: contributions are after-tax now, withdrawals tax-free later
    // Interpret: If user enters "annual contribution" as money that goes INTO account,
    // then Roth FV is just fv (tax already paid outside).
    // Traditional: tax paid later at retirement tax rate
    const rothAfterTaxValue = fv;
    const traditionalAfterTaxValue = fv * (1 - taxRet);

    // "Cost today" perspective (optional)
    // Traditional reduces taxes now; Roth does not.
    const rothTaxPaidNow = c * taxNow * years;
    const traditionalTaxSavedNow = c * taxNow * years;

    // Which is higher?
    const diff = rothAfterTaxValue - traditionalAfterTaxValue;

    return {
      fv,
      rothAfterTaxValue,
      traditionalAfterTaxValue,
      diff,
      rothTaxPaidNow,
      traditionalTaxSavedNow,
      taxNowPct: taxNow * 100,
      taxRetPct: taxRet * 100,
      rPct: r * 100,
    };
  }, [annualContributionStr, yearsStr, returnRateStr, taxNowStr, taxRetirementStr]);

  return (
    <div className="tool-container">
      <h1>Roth 401(k) Calculator</h1>

      <p className="muted" style={{ marginTop: 10 }}>
        Compare Roth 401(k) vs Traditional 401(k) using your tax rate now vs your
        expected tax rate in retirement. This tool estimates the after-tax value
        at retirement under simple assumptions.
      </p>

      {/* Inputs (간격 넉넉히) */}
      <div style={{ marginTop: 18 }}>
        <label>
          Annual Contribution (amount deposited into the 401(k))
          <input
            style={inputStyle}
            type="number"
            value={annualContributionStr}
            onChange={(e) => setAnnualContributionStr(e.target.value)}
            placeholder="e.g. 10000"
          />
        </label>
        <div className="muted">
          For Roth: this is after-tax money deposited. For Traditional: this is pre-tax deposit.
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

      <div style={{ marginTop: 22 }}>
        <label>
          Tax Rate Now (%)
          <input
            style={inputStyle}
            type="number"
            value={taxNowStr}
            onChange={(e) => setTaxNowStr(e.target.value)}
            placeholder="e.g. 30"
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label>
          Expected Tax Rate in Retirement (%)
          <input
            style={inputStyle}
            type="number"
            value={taxRetirementStr}
            onChange={(e) => setTaxRetirementStr(e.target.value)}
            placeholder="e.g. 20"
          />
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 24 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 12 }}>
          Account Value Before Retirement Taxes: <strong>${money(out.fv)}</strong>
        </p>

        <hr style={{ margin: "12px 0" }} />

        <p style={{ marginTop: 8 }}>
          Roth 401(k) After-Tax Value (tax-free withdrawals):{" "}
          <strong>${money(out.rothAfterTaxValue)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Traditional 401(k) After-Tax Value (taxed at retirement):{" "}
          <strong>${money(out.traditionalAfterTaxValue)}</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          Difference (Roth − Traditional):{" "}
          <strong>
            {out.diff >= 0 ? "$" + money(out.diff) : "-$" + money(Math.abs(out.diff))}
          </strong>
        </p>

        <p className="muted" style={{ marginTop: 10 }}>
          Assumptions: return {out.rPct.toFixed(1)}%, tax now {out.taxNowPct.toFixed(1)}%,
          tax in retirement {out.taxRetPct.toFixed(1)}%.
        </p>
      </div>

      {/* SEO */}
      <div style={{ marginTop: 26 }}>
        <h2>Roth 401(k) vs Traditional 401(k)</h2>
        <p className="muted">
          Roth 401(k) contributions are made with after-tax dollars, but qualified
          withdrawals are generally tax-free. Traditional 401(k) contributions are
          typically pre-tax, but withdrawals are taxed in retirement. A key factor
          is whether your tax rate will be higher or lower later.
        </p>

        <h2 style={{ marginTop: 18 }}>FAQ</h2>

        <h3>Does this include employer match?</h3>
        <p className="muted">
          No. Employer match rules can vary and are often treated as pre-tax in many plans.
          This calculator focuses on employee contributions and tax timing.
        </p>

        <h3>Is this a full tax model?</h3>
        <p className="muted">
          No. It’s a simplified comparison using two tax rates. Real outcomes may vary based on brackets,
          deductions, and withdrawal strategy.
        </p>
      </div>
    </div>
  );
}
