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

export default function EffectiveTaxRateOnInvestmentsCalculator() {
  const [divIncomeStr, setDivIncomeStr] = useState<string>("1000");
  const [divRateStr, setDivRateStr] = useState<string>("15");
  const [cgIncomeStr, setCgIncomeStr] = useState<string>("3000");
  const [cgRateStr, setCgRateStr] = useState<string>("20");

  const computed = useMemo(() => {
    const divIncome = clamp(toNum(divIncomeStr), 0);
    const divRate = clamp(toNum(divRateStr), 0, 100);
    const cgIncome = clamp(toNum(cgIncomeStr), 0);
    const cgRate = clamp(toNum(cgRateStr), 0, 100);

    const divTax = (divIncome * divRate) / 100;
    const cgTax = (cgIncome * cgRate) / 100;

    const totalIncome = divIncome + cgIncome;
    const totalTax = divTax + cgTax;

    const effectiveRateDec = totalIncome > 0 ? totalTax / totalIncome : 0;
    const effectiveRatePct = effectiveRateDec * 100;

    const afterTaxIncome = totalIncome - totalTax;

    return {
      divIncome,
      divRate,
      cgIncome,
      cgRate,
      divTax,
      cgTax,
      totalIncome,
      totalTax,
      effectiveRatePct,
      afterTaxIncome,
    };
  }, [divIncomeStr, divRateStr, cgIncomeStr, cgRateStr]);

  return (
    <div className="tool-container">
      <h1>Effective Tax Rate on Investments Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Estimate your <strong>effective (blended) tax rate</strong> on investment income by combining
        taxes on <strong>dividends</strong> and <strong>capital gains</strong>. This helps you understand
        your overall tax burden and after-tax investment income.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 10 }}>
        <div style={blockStyle}>
          <label>
            Dividend Income
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={divIncomeStr}
              onChange={(e) => setDivIncomeStr(e.target.value)}
              min={0}
              placeholder="e.g., 1000"
            />
          </label>
          <div className="muted">
            Enter the dividend income amount for the period you’re analyzing (annual, quarterly, etc.).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Dividend Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={divRateStr}
              onChange={(e) => setDivRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 15"
            />
          </label>
          <div className="muted">
            Use a withholding or effective rate. Qualified vs ordinary treatment can change this.
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Capital Gains Amount
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={cgIncomeStr}
              onChange={(e) => setCgIncomeStr(e.target.value)}
              min={0}
              placeholder="e.g., 3000"
            />
          </label>
          <div className="muted">
            Use realized gains for the same period (not unrealized price changes).
          </div>
        </div>

        <div style={blockStyle}>
          <label>
            Capital Gains Tax Rate (%)
            <input
              style={inputStyle}
              type="number"
              inputMode="decimal"
              value={cgRateStr}
              onChange={(e) => setCgRateStr(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g., 20"
            />
          </label>
          <div className="muted">
            Enter your estimated capital gains rate (short-term/long-term rules may apply).
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            Total Investment Income: <strong>${fmtMoney(computed.totalIncome)}</strong>
          </p>
          <p>
            Total Tax: <strong>${fmtMoney(computed.totalTax)}</strong>
          </p>
          <p>
            After-Tax Investment Income:{" "}
            <strong>${fmtMoney(computed.afterTaxIncome)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Effective Tax Rate (blended):{" "}
            <strong>{fmtPct(computed.effectiveRatePct)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Breakdown: dividend tax <strong>${fmtMoney(computed.divTax)}</strong>, capital gains tax{" "}
            <strong>${fmtMoney(computed.cgTax)}</strong>. This is an estimate for planning.
          </p>
        </div>
      </div>

      {/* How-to */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter dividend income and a dividend tax rate.</li>
          <li>Enter capital gains amount and a capital gains tax rate.</li>
          <li>Review total tax and your blended effective tax rate.</li>
          <li>Adjust rates to compare scenarios (qualified vs ordinary, short vs long term).</li>
        </ol>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is an effective tax rate on investments?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          It’s the total tax you pay divided by your total investment income for a period.
          If you have multiple income types (dividends and gains), it becomes a blended rate.
        </p>

        <h3 style={{ marginBottom: 6 }}>Should I include unrealized gains?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Typically no. Taxes are usually triggered on realized gains. Use realized amounts to estimate
          your effective rate more accurately.
        </p>

        <h3 style={{ marginBottom: 6 }}>Does this include account-level tax benefits?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Not automatically. If you’re using a tax-advantaged account, your effective tax rate may differ.
          Use rates that reflect your account type and situation.
        </p>
      </div>
    </div>
  );
}
