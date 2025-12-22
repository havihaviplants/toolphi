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

export default function TaxableVsTaxAdvantagedInvestmentCalculator() {
  const [investmentStr, setInvestmentStr] = useState<string>("50000");
  const [preTaxReturnStr, setPreTaxReturnStr] = useState<string>("8");
  const [taxableTaxRateStr, setTaxableTaxRateStr] = useState<string>("25");
  const [advTaxRateStr, setAdvTaxRateStr] = useState<string>("0");

  const computed = useMemo(() => {
    const investment = clamp(toNum(investmentStr), 0);
    const preTaxPct = clamp(toNum(preTaxReturnStr), 0, 100);
    const taxableRatePct = clamp(toNum(taxableTaxRateStr), 0, 100);
    const advRatePct = clamp(toNum(advTaxRateStr), 0, 100);

    const preTaxDec = preTaxPct / 100;

    const taxableAfterTaxDec = preTaxDec * (1 - taxableRatePct / 100);
    const advAfterTaxDec = preTaxDec * (1 - advRatePct / 100);

    const taxableAfterTaxPct = taxableAfterTaxDec * 100;
    const advAfterTaxPct = advAfterTaxDec * 100;

    const taxableProfit = investment * taxableAfterTaxDec;
    const advProfit = investment * advAfterTaxDec;

    const difference = advProfit - taxableProfit;

    const taxableEstimatedTaxPaid = investment * preTaxDec - taxableProfit;
    const advEstimatedTaxPaid = investment * preTaxDec - advProfit;

    return {
      investment,
      preTaxPct,
      taxableRatePct,
      advRatePct,
      taxableAfterTaxPct,
      advAfterTaxPct,
      taxableProfit,
      advProfit,
      difference,
      taxableEstimatedTaxPaid,
      advEstimatedTaxPaid,
    };
  }, [investmentStr, preTaxReturnStr, taxableTaxRateStr, advTaxRateStr]);

  return (
    <div className="tool-container">
      <h1>Taxable vs Tax-Advantaged Investment Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Compare investing in a <strong>taxable account</strong> vs a{" "}
        <strong>tax-advantaged account</strong> by estimating after-tax returns and
        annual after-tax profit. Use this to understand how taxes may reduce your
        take-home growth in a taxable brokerage account.
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
            Enter the amount you plan to invest (or your current portfolio value).
          </div>
        </div>

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
            This is your estimated annual return before taxes (simplified).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Taxable Account: Effective Annual Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={taxableTaxRateStr}
              onChange={(e) => setTaxableTaxRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 25"
            />
          </label>
          <div className="muted">
            Use a blended effective rate (dividends + realized gains + local rules).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Tax-Advantaged Account: Effective Annual Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={advTaxRateStr}
              onChange={(e) => setAdvTaxRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 0"
            />
          </label>
          <div className="muted">
            Often lower due to deferral or exemptions (depends on account type and rules).
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p className="muted" style={{ marginBottom: 6 }}>
            Taxable account (after-tax):
          </p>
          <p>
            After-Tax Return: <strong>{fmtPct(computed.taxableAfterTaxPct)}</strong>
          </p>
          <p>
            Annual After-Tax Profit: <strong>${fmtMoney(computed.taxableProfit)}</strong>
          </p>
          <p>
            Estimated Tax Paid (annual):{" "}
            <strong>${fmtMoney(computed.taxableEstimatedTaxPaid)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Tax-advantaged account (after-tax):
          </p>
          <p>
            After-Tax Return: <strong>{fmtPct(computed.advAfterTaxPct)}</strong>
          </p>
          <p>
            Annual After-Tax Profit: <strong>${fmtMoney(computed.advProfit)}</strong>
          </p>
          <p>
            Estimated Tax Paid (annual):{" "}
            <strong>${fmtMoney(computed.advEstimatedTaxPaid)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Difference (tax-advantaged − taxable):{" "}
            <strong>${fmtMoney(computed.difference)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            This calculator uses simplified effective annual tax rates. Real outcomes depend on
            contributions, withdrawals, rules, and timing of taxes.
          </p>
        </div>
      </div>

      {/* How-to */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your investment amount and expected pre-tax return.</li>
          <li>Enter an effective tax rate for a taxable account.</li>
          <li>Enter an effective tax rate for a tax-advantaged account.</li>
          <li>Compare after-tax returns and annual after-tax profit.</li>
        </ol>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What counts as “tax-advantaged”?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It refers to accounts where taxes are reduced, deferred, or exempt under certain rules
          (for example, retirement or savings accounts in many jurisdictions).
        </p>

        <h3 style={{ marginBottom: 6 }}>Is “effective annual tax rate” realistic?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It’s a simplified planning input. In reality, taxes can occur differently across dividends,
          realized gains, and withdrawals. Use this to compare scenarios, not to file taxes.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this model compounding over years?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Not here—this version shows a one-year estimate. If you want, we can add a multi-year
          compounding mode later as a separate long-tail tool.
        </p>
      </div>
    </div>
  );
}
