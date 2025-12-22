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

export default function BeforeVsAfterTaxInvestmentReturnCalculator() {
  const [investmentStr, setInvestmentStr] = useState<string>("100000");
  const [beforeTaxReturnStr, setBeforeTaxReturnStr] = useState<string>("8");
  const [taxRateStr, setTaxRateStr] = useState<string>("25");

  const computed = useMemo(() => {
    const investment = clamp(toNum(investmentStr), 0);
    const beforeTaxPct = clamp(toNum(beforeTaxReturnStr), 0, 100);
    const taxRatePct = clamp(toNum(taxRateStr), 0, 100);

    const beforeTaxDec = beforeTaxPct / 100;
    const taxDec = taxRatePct / 100;

    const beforeTaxProfit = investment * beforeTaxDec;
    const taxPaid = beforeTaxProfit * taxDec;
    const afterTaxProfit = beforeTaxProfit - taxPaid;

    const afterTaxReturnDec = investment > 0 ? afterTaxProfit / investment : 0;
    const afterTaxReturnPct = afterTaxReturnDec * 100;

    const returnDifferencePct = beforeTaxPct - afterTaxReturnPct;

    return {
      investment,
      beforeTaxPct,
      taxRatePct,
      beforeTaxProfit,
      taxPaid,
      afterTaxProfit,
      afterTaxReturnPct,
      returnDifferencePct,
    };
  }, [investmentStr, beforeTaxReturnStr, taxRateStr]);

  return (
    <div className="tool-container">
      <h1>Before vs After Tax Investment Return Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Compare <strong>before-tax</strong> vs <strong>after-tax</strong> investment results to understand
        how taxes reduce your return. This calculator estimates profit, taxes paid, after-tax return, and the
        difference between pre-tax and after-tax outcomes.
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
              placeholder="e.g., 100000"
            />
          </label>
          <div className="muted">
            The starting amount you invest (or your portfolio value).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Expected Before-Tax Return (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={beforeTaxReturnStr}
              onChange={(e) => setBeforeTaxReturnStr(e.target.value)}
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
            Use an estimated blended tax rate (dividends + realized gains + local rules).
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p className="muted" style={{ marginBottom: 6 }}>
            Before-tax:
          </p>
          <p>
            Before-Tax Profit: <strong>${fmtMoney(computed.beforeTaxProfit)}</strong>
          </p>
          <p>
            Before-Tax Return: <strong>{fmtPct(computed.beforeTaxPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            After-tax:
          </p>
          <p>
            Estimated Tax Paid: <strong>${fmtMoney(computed.taxPaid)}</strong>
          </p>
          <p>
            After-Tax Profit: <strong>${fmtMoney(computed.afterTaxProfit)}</strong>
          </p>
          <p>
            After-Tax Return: <strong>{fmtPct(computed.afterTaxReturnPct)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Return Reduction (before-tax − after-tax):{" "}
            <strong>{fmtPct(computed.returnDifferencePct)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            This is a simplified estimate for planning. Real-world taxes depend on holding periods,
            account type, and local rules.
          </p>
        </div>
      </div>

      {/* How-to */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your investment amount.</li>
          <li>Enter your expected before-tax return (%).</li>
          <li>Enter an effective tax rate on investment returns (%).</li>
          <li>Compare before-tax profit vs after-tax profit and return.</li>
        </ol>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is “after-tax return”?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          After-tax return is the return you keep after taxes. A simple way to think about it is:
          after-tax profit = before-tax profit − taxes.
        </p>

        <h3 style={{ marginBottom: 6 }}>What tax rate should I use?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Use an estimated effective tax rate that matches your situation. If you have both dividends and
          capital gains, a blended/effective rate can be a practical approximation.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this include multi-year compounding?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No—this version shows a one-year estimate. Multi-year compounding can be added as a separate tool
          (and is often a different SERP intent).
        </p>
      </div>
    </div>
  );
}
