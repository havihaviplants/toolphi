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

export default function AfterTaxDividendIncomeCalculator() {
  const [investmentStr, setInvestmentStr] = useState<string>("50000");
  const [yieldStr, setYieldStr] = useState<string>("4");
  const [taxRateStr, setTaxRateStr] = useState<string>("15");

  const computed = useMemo(() => {
    const investment = clamp(toNum(investmentStr), 0);
    const dividendYieldPct = clamp(toNum(yieldStr), 0, 100);
    const taxRatePct = clamp(toNum(taxRateStr), 0, 100);

    const yieldDec = dividendYieldPct / 100;
    const taxDec = taxRatePct / 100;

    const grossAnnual = investment * yieldDec;
    const taxAnnual = grossAnnual * taxDec;
    const afterTaxAnnual = grossAnnual - taxAnnual;

    const grossMonthly = grossAnnual / 12;
    const taxMonthly = taxAnnual / 12;
    const afterTaxMonthly = afterTaxAnnual / 12;

    const afterTaxYieldPct = dividendYieldPct * (1 - taxDec);

    return {
      investment,
      dividendYieldPct,
      taxRatePct,
      afterTaxYieldPct,
      grossAnnual,
      taxAnnual,
      afterTaxAnnual,
      grossMonthly,
      taxMonthly,
      afterTaxMonthly,
    };
  }, [investmentStr, yieldStr, taxRateStr]);

  return (
    <div className="tool-container">
      <h1>After Tax Dividend Income Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Estimate your <strong>take-home dividend income</strong> after taxes. Enter your investment amount,
        dividend yield, and dividend tax rate to calculate <strong>monthly</strong> and <strong>annual</strong>{" "}
        after-tax dividend income.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 10 }}>
        <div style={blockStyle}>
          <label>
            Investment Amount
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={investmentStr}
              onChange={(e) => setInvestmentStr(e.target.value)}
              min={0}
              placeholder="e.g., 50000"
            />
          </label>
          <div className="muted">
            The amount invested in dividend-paying stocks/ETFs (simplified estimate).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Dividend Yield (annual %)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={yieldStr}
              onChange={(e) => setYieldStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 4"
            />
          </label>
          <div className="muted">
            Use the annual yield shown by your broker/ETF provider (not guaranteed).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Dividend Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={taxRateStr}
              onChange={(e) => setTaxRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 15"
            />
          </label>
          <div className="muted">
            Use an estimated withholding or effective rate. Actual treatment can vary.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            After-Tax Dividend Yield (approx):{" "}
            <strong>{fmtPct(computed.afterTaxYieldPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Annual dividend income:
          </p>
          <p>
            Gross Annual Dividends: <strong>${fmtMoney(computed.grossAnnual)}</strong>
          </p>
          <p>
            Estimated Annual Dividend Tax: <strong>${fmtMoney(computed.taxAnnual)}</strong>
          </p>
          <p>
            Take-Home Annual Dividends:{" "}
            <strong>${fmtMoney(computed.afterTaxAnnual)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Monthly dividend income (annual ÷ 12):
          </p>
          <p>
            Gross Monthly Dividends: <strong>${fmtMoney(computed.grossMonthly)}</strong>
          </p>
          <p>
            Estimated Monthly Dividend Tax: <strong>${fmtMoney(computed.taxMonthly)}</strong>
          </p>
          <p>
            Take-Home Monthly Dividends:{" "}
            <strong>${fmtMoney(computed.afterTaxMonthly)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Inputs used: investment ${fmtMoney(computed.investment)}, yield{" "}
            <strong>{fmtPct(computed.dividendYieldPct)}</strong>, tax rate{" "}
            <strong>{fmtPct(computed.taxRatePct)}</strong>. This is a simplified planning estimate.
          </p>
        </div>
      </div>

      {/* How-to */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your investment amount.</li>
          <li>Enter your annual dividend yield (%).</li>
          <li>Enter your dividend tax rate (%).</li>
          <li>Review monthly and annual take-home dividend income.</li>
        </ol>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>Is dividend yield guaranteed?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. Dividend yield can change as dividends change and as prices move. Use this as an estimate.
        </p>

        <h3 style={{ marginBottom: 6 }}>Why show monthly dividends?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Many people plan expenses using monthly cash flow. This tool converts annual estimates into a
          simple monthly figure (annual ÷ 12).
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this include foreign withholding tax?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Not automatically. If foreign withholding applies, incorporate it into the tax rate you enter,
          or adjust your effective rate accordingly.
        </p>
      </div>
    </div>
  );
}
