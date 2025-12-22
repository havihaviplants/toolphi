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

export default function CapitalGainsTaxHoldingPeriodCalculator() {
  // Inputs (as strings for better UX + validation)
  const [gainStr, setGainStr] = useState<string>("10000");
  const [holdingDaysStr, setHoldingDaysStr] = useState<string>("365");
  const [shortRateStr, setShortRateStr] = useState<string>("30");
  const [longRateStr, setLongRateStr] = useState<string>("15");

  // Assumption (simple, readable, tweakable)
  const longTermThresholdDays = 365;

  const computed = useMemo(() => {
    const gain = clamp(toNum(gainStr), 0);
    const holdingDays = clamp(toNum(holdingDaysStr), 0);
    const shortRate = clamp(toNum(shortRateStr), 0, 100);
    const longRate = clamp(toNum(longRateStr), 0, 100);

    const qualifiesLongTerm = holdingDays >= longTermThresholdDays;

    const shortTax = (gain * shortRate) / 100;
    const longTax = (gain * longRate) / 100;

    const chosenTax = qualifiesLongTerm ? longTax : shortTax;
    const altTax = qualifiesLongTerm ? shortTax : longTax;

    const savings = altTax - chosenTax;

    const afterTaxProfit = gain - chosenTax;
    const altAfterTaxProfit = gain - altTax;

    return {
      gain,
      holdingDays,
      shortRate,
      longRate,
      qualifiesLongTerm,
      shortTax,
      longTax,
      chosenTax,
      altTax,
      savings,
      afterTaxProfit,
      altAfterTaxProfit,
    };
  }, [gainStr, holdingDaysStr, shortRateStr, longRateStr]);

  return (
    <div className="tool-container">
      <h1>Capital Gains Tax Holding Period Calculator</h1>

      <p className="muted" style={{ marginTop: 8 }}>
        Use this calculator to estimate how your <strong>holding period</strong>{" "}
        may change your capital gains tax. Enter your expected gain and compare{" "}
        <strong>short-term vs long-term</strong> tax outcomes.
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
            placeholder="e.g., 10000"
          />
          <div className="muted">
            Tip: Use the gain (sale price − cost basis − fees), not the full sale
            amount.
          </div>
        </label>

        <label>
          Holding Period (days)
          <input
            type="number"
            inputMode="numeric"
            value={holdingDaysStr}
            onChange={(e) => setHoldingDaysStr(e.target.value)}
            min={0}
            placeholder="e.g., 365"
          />
          <div className="muted">
            Default assumption: <strong>{longTermThresholdDays}+</strong> days is
            treated as long-term for comparison.
          </div>
        </label>

        <label>
          Short-Term Tax Rate (%)
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
            Often closer to ordinary income rates (varies by jurisdiction).
          </div>
        </label>

        <label>
          Long-Term Tax Rate (%)
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
            Often lower than short-term rates when long-term rules apply.
          </div>
        </label>
      </div>

      {/* Results */}
      <div className="result" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Results</h2>

        <p style={{ marginTop: 8 }}>
          Status based on holding period:{" "}
          <strong>{computed.qualifiesLongTerm ? "Long-Term" : "Short-Term"}</strong>
          {" "}
          ({computed.holdingDays} days)
        </p>

        <div style={{ marginTop: 8 }}>
          <p>
            Estimated Tax (your current holding period):{" "}
            <strong>${fmtMoney(computed.chosenTax)}</strong>
          </p>
          <p>
            After-Tax Profit (gain − tax):{" "}
            <strong>${fmtMoney(computed.afterTaxProfit)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p className="muted" style={{ marginBottom: 6 }}>
            Comparison (opposite holding period tax treatment):
          </p>
          <p>
            Alternative Tax: <strong>${fmtMoney(computed.altTax)}</strong>
          </p>
          <p>
            Alternative After-Tax Profit:{" "}
            <strong>${fmtMoney(computed.altAfterTaxProfit)}</strong>
          </p>

          <hr style={{ margin: "12px 0" }} />

          <p>
            Potential Difference:{" "}
            <strong>${fmtMoney(computed.savings)}</strong>
          </p>
        </div>

        <p className="muted" style={{ marginTop: 12 }}>
          Rates used: short-term <strong>{fmtPct(computed.shortRate)}</strong>, long-term{" "}
          <strong>{fmtPct(computed.longRate)}</strong>. This is an estimate for planning only.
        </p>
      </div>

      {/* How-to (SEO content block) */}
      <div style={{ marginTop: 20 }}>
        <h2>How to use</h2>
        <ol>
          <li>Enter your expected capital gain amount.</li>
          <li>Enter your holding period in days (how long you held the asset).</li>
          <li>Enter a short-term tax rate and a long-term tax rate.</li>
          <li>
            Review your estimated tax and after-tax profit, then compare the
            alternative scenario.
          </li>
        </ol>
      </div>

      {/* FAQ (SEO content block) */}
      <div style={{ marginTop: 20 }}>
        <h2>FAQ</h2>

        <h3 style={{ marginBottom: 6 }}>What is a holding period?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Holding period is how long you owned an asset before selling it. Many tax
          systems apply different rules or rates depending on whether the holding
          period qualifies as short-term or long-term.
        </p>

        <h3 style={{ marginBottom: 6 }}>Is 365 days always “long-term”?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Not always. This calculator uses <strong>{longTermThresholdDays}</strong> days
          as a simple comparison threshold. Confirm the exact rule for your country and
          situation.
        </p>

        <h3 style={{ marginBottom: 6 }}>What should I enter as capital gain?</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Use your gain (sale proceeds minus cost basis and relevant fees), not the full
          sale amount. If you’re unsure, estimate conservatively.
        </p>
      </div>
    </div>
  );
}
