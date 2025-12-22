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

export default function LongTermVsShortTermCapitalGainsTaxCalculator() {
  const [gainStr, setGainStr] = useState<string>("20000");
  const [shortRateStr, setShortRateStr] = useState<string>("30");
  const [longRateStr, setLongRateStr] = useState<string>("15");

  const computed = useMemo(() => {
    const gain = clamp(toNum(gainStr), 0);
    const shortRate = clamp(toNum(shortRateStr), 0, 100);
    const longRate = clamp(toNum(longRateStr), 0, 100);

    const shortTax = (gain * shortRate) / 100;
    const longTax = (gain * longRate) / 100;

    const shortAfterTaxProfit = gain - shortTax;
    const longAfterTaxProfit = gain - longTax;

    const taxSavings = shortTax - longTax;
    const profitDifference = longAfterTaxProfit - shortAfterTaxProfit;

    return {
      gain,
      shortRate,
      longRate,
      shortTax,
      longTax,
      shortAfterTaxProfit,
      longAfterTaxProfit,
      taxSavings,
      profitDifference,
    };
  }, [gainStr, shortRateStr, longRateStr]);

  return (
    <div className="tool-container">
      <h1>Long Term vs Short Term Capital Gains Tax Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Compare <strong>short-term</strong> and <strong>long-term</strong> capital gains
        tax to estimate how different tax rates can change your after-tax profit.
        Enter your gain and your estimated rates to see the difference.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 16 }}>
        <label>
          Capital Gain Amount
          <input
            type="number"
            inputMode="decimal"
            value={gainStr}
            onChange={(e) => setGainStr(e.target.value)}
            min={0}
            placeholder="e.g., 20000"
          />
          <div className="muted">
            Tip: Use your profit (sale proceeds − cost basis − fees), not the full sale amount.
          </div>
        </label>

        <label>
          Short-Term Capital Gains Tax Rate (%)
          <input
            type="number"
            inputMode="decimal"
            value={shortRateStr}
            onChange={(e) => setShortRateStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 30"
          />
          <div className="muted">
            Short-term rates are often similar to ordinary income tax rates (varies by jurisdiction).
          </div>
        </label>

        <label>
          Long-Term Capital Gains Tax Rate (%)
          <input
            type="number"
            inputMode="decimal"
            value={longRateStr}
            onChange={(e) => setLongRateStr(e.target.value)}
            min={0}
            max={100}
            placeholder="e.g., 15"
          />
          <div className="muted">
            Long-term rates may be lower when long-term rules apply (varies by jurisdiction).
          </div>
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <div style={{ marginTop: 10 }}>
          <p>
            Short-Term Tax: <strong>${fmtMoney(computed.shortTax)}</strong>
          </p>
          <p>
            Short-Term After-Tax Profit:{" "}
            <strong>${fmtMoney(computed.shortAfterTaxProfit)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Long-Term Tax: <strong>${fmtMoney(computed.longTax)}</strong>
          </p>
          <p>
            Long-Term After-Tax Profit:{" "}
            <strong>${fmtMoney(computed.longAfterTaxProfit)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Estimated Tax Savings (Long-Term vs Short-Term):{" "}
            <strong>${fmtMoney(computed.taxSavings)}</strong>
          </p>
          <p>
            After-Tax Profit Difference:{" "}
            <strong>${fmtMoney(computed.profitDifference)}</strong>
          </p>

          <p className="muted" style={{ marginTop: 12 }}>
            Rates used: short-term <strong>{fmtPct(computed.shortRate)}</strong>, long-term{" "}
            <strong>{fmtPct(computed.longRate)}</strong>. This tool provides an estimate for planning
            purposes—confirm your applicable rules and rates.
          </p>
        </div>
      </div>

      {/* How-to (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your total capital gain amount.</li>
          <li>Enter an estimated short-term capital gains tax rate.</li>
          <li>Enter an estimated long-term capital gains tax rate.</li>
          <li>Compare taxes and after-tax profit for each scenario.</li>
        </ol>
      </div>

      {/* FAQ (SEO block) */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What’s the difference between short-term and long-term?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Many tax systems apply different rates depending on how long you held an asset. This
          calculator compares outcomes under two different tax rates.
        </p>

        <h3 style={{ marginBottom: 6 }}>Do I need my exact tax rate?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No—an estimate is fine for planning. You can adjust the rates to match your situation
          and compare scenarios.
        </p>

        <h3 style={{ marginBottom: 6 }}>Is this tool country-specific?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          No. It uses the rates you enter. Rules and eligibility vary by country, so treat results
          as an estimate and confirm locally.
        </p>
      </div>
    </div>
  );
}
