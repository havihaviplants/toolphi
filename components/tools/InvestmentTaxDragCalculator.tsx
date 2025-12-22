"use client";

import { useMemo, useState } from "react";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function fmtMoney(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `${x.toFixed(2)}%`;
}

const blockStyle: React.CSSProperties = { marginTop: 14 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 6,
};

export default function InvestmentTaxDragCalculator() {
  const [preTaxReturnStr, setPreTaxReturnStr] = useState<string>("8");
  const [taxRateStr, setTaxRateStr] = useState<string>("25");
  const [investmentStr, setInvestmentStr] = useState<string>("100000");

  const computed = useMemo(() => {
    const preTaxPct = clamp(toNum(preTaxReturnStr), 0, 100);
    const taxRatePct = clamp(toNum(taxRateStr), 0, 100);
    const investment = clamp(toNum(investmentStr), 0);

    const preTaxDec = preTaxPct / 100;
    const taxDec = taxRatePct / 100;

    const afterTaxDec = preTaxDec * (1 - taxDec);
    const afterTaxPct = afterTaxDec * 100;

    const taxDragPct = preTaxPct - afterTaxPct;
    const dollarDrag = investment * (taxDragPct / 100);

    const preTaxProfit = investment * preTaxDec;
    const afterTaxProfit = investment * afterTaxDec;
    const estimatedTaxPaid = preTaxProfit - afterTaxProfit;

    return {
      preTaxPct,
      taxRatePct,
      investment,
      afterTaxPct,
      taxDragPct,
      dollarDrag,
      preTaxProfit,
      afterTaxProfit,
      estimatedTaxPaid,
    };
  }, [preTaxReturnStr, taxRateStr, investmentStr]);

  return (
    <div className="tool-container">
      <h1>Investment Tax Drag Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Investment <strong>tax drag</strong> is the reduction in your investment return due to taxes.
        This calculator estimates your <strong>after-tax return</strong> and the percentage/dollar impact
        of taxes based on an effective tax rate.
      </p>

      {/* Inputs (spaced + high-visibility) */}
      <div style={{ marginTop: 10 }}>
        <div style={blockStyle}>
          <label>
            Expected Pre-Tax Annual Return (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={preTaxReturnStr}
              onChange={(e) => setPreTaxReturnStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 8"
            />
          </label>
          <div className="muted">
            Example: 8% means your investment grows by ~8% before taxes (estimate).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Effective Tax Rate on Returns (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={taxRateStr}
              onChange={(e) => setTaxRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 25"
            />
          </label>
          <div className="muted">
            Use an estimated blended/effective rate (dividends, capital gains, etc.).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Investment Amount (optional)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={investmentStr}
              onChange={(e) => setInvestmentStr(e.target.value)}
              min={0}
              placeholder="e.g., 100000"
            />
          </label>
          <div className="muted">
            Used to estimate the annual dollar impact (drag) and take-home profit.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            After-Tax Return: <strong>{fmtPct(computed.afterTaxPct)}</strong>
          </p>
          <p>
            Tax Drag (return reduction): <strong>{fmtPct(computed.taxDragPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Annual estimates (based on investment amount):
          </p>
          <p>
            Pre-Tax Profit: <strong>${fmtMoney(computed.preTaxProfit)}</strong>
          </p>
          <p>
            After-Tax Profit: <strong>${fmtMoney(computed.afterTaxProfit)}</strong>
          </p>
          <p>
            Estimated Tax Paid: <strong>${fmtMoney(computed.estimatedTaxPaid)}</strong>
          </p>
          <p>
            Dollar Drag (same as estimated tax impact on profit):{" "}
            <strong>${fmtMoney(computed.dollarDrag)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Inputs used: pre-tax return <strong>{fmtPct(computed.preTaxPct)}</strong>, effective tax rate{" "}
            <strong>{fmtPct(computed.taxRatePct)}</strong>. This is an estimate for planning.
          </p>
        </div>
      </div>

      {/* How-to (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your expected annual return before taxes.</li>
          <li>Enter an estimated effective tax rate on investment returns.</li>
          <li>Optionally enter an investment amount to see dollar impact.</li>
          <li>Review after-tax return and tax drag.</li>
        </ol>
      </div>

      {/* FAQ (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is tax drag?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Tax drag is the reduction in your investment return caused by taxes. Even if your portfolio earns the
          same pre-tax return, higher taxes can reduce your after-tax performance.
        </p>

        <h3 style={{ marginBottom: 6 }}>What tax rate should I use?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Use an estimated effective rate that reflects your situation (dividends, capital gains, account type,
          and local rules). You can adjust the rate to compare scenarios.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this include fees or inflation?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. This calculator isolates tax impact. Fees and inflation can further reduce real after-tax returns.
        </p>
      </div>
    </div>
  );
}
