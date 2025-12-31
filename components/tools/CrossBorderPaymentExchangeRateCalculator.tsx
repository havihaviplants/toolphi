"use client";

import { useMemo, useState } from "react";

export default function CrossBorderPaymentExchangeRateCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [markupPct, setMarkupPct] = useState("");
  const [amountBase, setAmountBase] = useState("");
  const [fixedFeeQuote, setFixedFeeQuote] = useState("");
  const [computed, setComputed] = useState(false);

  const baseBorder = "#d0d7de";
  const errorBorder = "#d1242f";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${baseBorder}`,
    background: "#fff",
    fontSize: 16,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: 6,
  };

  const groupStyle: React.CSSProperties = { marginTop: 14 };

  const helpStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#57606a",
    marginTop: 6,
    lineHeight: 1.35,
  };

  const parsed = useMemo(() => {
    const mr = parseFloat(marketRate);
    const mp = parseFloat(markupPct);
    const ab = parseFloat(amountBase);
    const ff = fixedFeeQuote.trim() === "" ? 0 : parseFloat(fixedFeeQuote);

    return {
      mr: Number.isFinite(mr) && mr > 0 ? mr : null,
      mp: Number.isFinite(mp) && mp >= 0 ? mp : null,
      ab: Number.isFinite(ab) && ab > 0 ? ab : null,
      ff: Number.isFinite(ff) && ff >= 0 ? ff : null,
    };
  }, [marketRate, markupPct, amountBase, fixedFeeQuote]);

  const showError =
    computed &&
    (parsed.mr === null || parsed.mp === null || parsed.ab === null || parsed.ff === null);

  const result = useMemo(() => {
    if (!computed) return null;
    if (parsed.mr === null || parsed.mp === null || parsed.ab === null || parsed.ff === null) return null;

    // Offered rate after markup:
    // If provider adds markup, user effectively gets a worse rate.
    // Example: market 1470, markup 1% -> offered = 1470 * (1 - 0.01)
    const offeredRate = parsed.mr * (1 - parsed.mp / 100);

    const marketQuote = parsed.ab * parsed.mr;
    const offeredQuote = parsed.ab * offeredRate;

    // If paying in base currency and receiving quote currency,
    // worse offeredRate reduces received quote amount -> "loss" vs market.
    const quoteLoss = marketQuote - offeredQuote;

    // Add optional fixed fee already in quote currency (e.g., KRW)
    const totalLoss = quoteLoss + parsed.ff;

    // Effective all-in offered rate accounting for fixed fee:
    // offeredQuoteWithFee = offeredQuote - fixedFee (in quote)
    const offeredAfterFeeQuote = Math.max(0, offeredQuote - parsed.ff);
    const effectiveRateAfterFee = offeredAfterFeeQuote / parsed.ab;

    return {
      offeredRate,
      marketQuote,
      offeredQuote,
      quoteLoss,
      fixedFeeQuote: parsed.ff,
      totalLoss,
      effectiveRateAfterFee,
      offeredAfterFeeQuote,
    };
  }, [computed, parsed]);

  return (
    <div className="tool-container">
      <h1>Cross-Border Payment Exchange Rate Calculator</h1>
      <p>
        Estimate the true cost of a cross-border payment when a provider applies a markup to the exchange
        rate and may charge a fixed fee.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Market (Mid) Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.mr === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={marketRate}
          onChange={(e) => setMarketRate(e.target.value)}
          placeholder="e.g. 1470"
        />
        <div style={helpStyle}>
          Quote currency per 1 base currency. Example: 1 USD = 1470 KRW → enter 1470.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Provider Markup (%)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.mp === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={markupPct}
          onChange={(e) => setMarkupPct(e.target.value)}
          placeholder="e.g. 1"
        />
        <div style={helpStyle}>
          Markup is modeled as a worse exchange rate for you (offered rate = market × (1 − markup%)).
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Payment Amount (Base Currency)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.ab === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={amountBase}
          onChange={(e) => setAmountBase(e.target.value)}
          placeholder="e.g. 10000"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Fixed Fee (Quote Currency, optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.ff === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={fixedFeeQuote}
          onChange={(e) => setFixedFeeQuote(e.target.value)}
          placeholder="e.g. 0"
        />
        <div style={helpStyle}>
          Enter a fixed fee in the quote currency (e.g., KRW). Leave blank for 0.
        </div>
      </div>

      <button
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 10,
          background: "#111827",
          color: "#fff",
          fontWeight: 800,
          width: "100%",
          maxWidth: 420,
        }}
        onClick={() => setComputed(true)}
      >
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorder, fontWeight: 700 }}>
          Please enter valid numbers for market rate, markup, and amount.
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 12,
            background: "#f6f8fa",
            border: `1px solid ${baseBorder}`,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Offered Rate:</strong> {result.offeredRate.toFixed(6)}
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Market Quote Amount:</strong> {result.marketQuote.toFixed(2)}
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Offered Quote Amount (before fee):</strong> {result.offeredQuote.toFixed(2)}
          </p>

          <hr style={{ margin: "14px 0" }} />

          <p style={{ margin: 0 }}>
            <strong>Loss vs Market (rate only):</strong> {result.quoteLoss.toFixed(2)}
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Fixed Fee:</strong> {result.fixedFeeQuote.toFixed(2)}
          </p>
          <p style={{ marginTop: 8, fontSize: 16 }}>
            <strong>Total All-in Cost (Loss):</strong> {result.totalLoss.toFixed(2)}
          </p>

          <hr style={{ margin: "14px 0" }} />

          <p style={{ margin: 0 }}>
            <strong>Effective Rate (after fee):</strong> {result.effectiveRateAfterFee.toFixed(6)}
          </p>
          <p style={{ marginTop: 8, color: "#57606a", fontSize: 13 }}>
            Effective rate accounts for the fixed fee by reducing the quote amount received.
          </p>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          This tool starts with a market (mid) rate, applies a provider markup to model a worse offered rate,
          then compares the quote-currency outcome against the market-rate outcome. An optional fixed fee in
          the quote currency is added to estimate all-in cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is this the same as a remittance calculator?</strong>
          <br />
          Not exactly. This focuses on cross-border payments with a provider markup and optional fixed fee,
          which is common in international card payments, invoicing, and business settlements.
        </p>
        <p>
          <strong>What if my provider quotes the offered rate directly?</strong>
          <br />
          Set markup to 0% and treat the offered rate as the market rate, or use your best estimate for the
          mid rate and markup difference.
        </p>
      </div>
    </div>
  );
}
