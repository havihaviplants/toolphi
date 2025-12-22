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

export default function AfterTaxDividendYieldCalculator() {
  const [yieldStr, setYieldStr] = useState<string>("4");
  const [taxRateStr, setTaxRateStr] = useState<string>("15");
  const [investmentStr, setInvestmentStr] = useState<string>("50000");

  const computed = useMemo(() => {
    const dividendYieldPct = clamp(toNum(yieldStr), 0, 100);
    const taxRatePct = clamp(toNum(taxRateStr), 0, 100);
    const investment = clamp(toNum(investmentStr), 0);

    const yieldDec = dividendYieldPct / 100;
    const taxDec = taxRatePct / 100;

    const afterTaxYieldDec = yieldDec * (1 - taxDec);
    const afterTaxYieldPct = afterTaxYieldDec * 100;

    const grossDividendIncome = investment * yieldDec;
    const dividendTax = grossDividendIncome * taxDec;
    const takeHomeDividendIncome = grossDividendIncome - dividendTax;

    return {
      dividendYieldPct,
      taxRatePct,
      investment,
      afterTaxYieldPct,
      grossDividendIncome,
      dividendTax,
      takeHomeDividendIncome,
    };
  }, [yieldStr, taxRateStr, investmentStr]);

  return (
    <div className="tool-container">
      <h1>After Tax Dividend Yield Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Use this calculator to estimate your <strong>after-tax dividend yield</strong>{" "}
        and <strong>take-home dividend income</strong>. Enter your dividend yield and an
        estimated dividend tax rate (withholding or effective tax rate).
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 16 }}>
        <label>
          Dividend Yield (annual %)
          <input
            type="number"
            inputMode="decimal"
            value={yieldStr}
            onChange={(e) => setYieldStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 4"
          />
          <div className="muted">
            Tip: Use the annual dividend yield shown by your broker or ETF provider.
          </div>
        </label>

        <label>
          Dividend Tax Rate (%)
          <input
            type="number"
            inputMode="decimal"
            value={taxRateStr}
            onChange={(e) => setTaxRateStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 15"
          />
          <div className="muted">
            Enter an estimated withholding/effective tax rate. Your actual rate may vary.
          </div>
        </label>

        <label>
          Investment Amount (optional)
          <input
            type="number"
            inputMode="decimal"
            value={investmentStr}
            onChange={(e) => setInvestmentStr(e.target.value)}
            min={0}
            placeholder="e.g., 50000"
          />
          <div className="muted">
            This helps estimate yearly gross and take-home dividend income.
          </div>
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            After-Tax Dividend Yield:{" "}
            <strong>{fmtPct(computed.afterTaxYieldPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Estimated yearly dividend income (based on investment amount):
          </p>
          <p>
            Gross Dividend Income: <strong>${fmtMoney(computed.grossDividendIncome)}</strong>
          </p>
          <p>
            Estimated Dividend Tax: <strong>${fmtMoney(computed.dividendTax)}</strong>
          </p>
          <p>
            Take-Home Dividend Income:{" "}
            <strong>${fmtMoney(computed.takeHomeDividendIncome)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Inputs used: yield <strong>{fmtPct(computed.dividendYieldPct)}</strong>, tax rate{" "}
            <strong>{fmtPct(computed.taxRatePct)}</strong>. This tool provides an estimate for planning.
          </p>
        </div>
      </div>

      {/* How-to (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your annual dividend yield (%).</li>
          <li>Enter your dividend tax rate (withholding or effective tax %).</li>
          <li>Optionally enter an investment amount to estimate yearly income.</li>
          <li>Review after-tax yield and take-home dividend income.</li>
        </ol>
      </div>

      {/* FAQ (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is “after-tax dividend yield”?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It’s the dividend yield after accounting for taxes on dividends. A simplified estimate is:
          after-tax yield = dividend yield × (1 − tax rate).
        </p>

        <h3 style={{ marginBottom: 6 }}>Is dividend tax rate always the same?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. It can differ by country, account type, income level, and whether dividends are qualified.
          Use an estimated effective/withholding rate for planning.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this include price changes?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. This focuses on dividend income only. Total return also includes price appreciation and fees.
        </p>
      </div>
    </div>
  );
}
