"use client";

import { useMemo, useState } from "react";

export default function ExchangeRateMarkupCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [offeredRate, setOfferedRate] = useState("");
  const [amount, setAmount] = useState("");
  const [computed, setComputed] = useState(false);

  const baseBorderColor = "#d0d7de";
  const errorBorderColor = "#d1242f";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${baseBorderColor}`,
    background: "#ffffff",
    fontSize: 16,
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
  };

  const groupStyle: React.CSSProperties = {
    marginTop: 14,
    marginBottom: 14,
  };

  const helpStyle: React.CSSProperties = {
    marginTop: 8,
    fontSize: 13,
    color: "#57606a",
    lineHeight: 1.4,
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    maxWidth: 360,
  };

  const resultBoxStyle: React.CSSProperties = {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${baseBorderColor}`,
    background: "#f6f8fa",
  };

  const parsed = useMemo(() => {
    const m = parseFloat(marketRate);
    const o = parseFloat(offeredRate);
    const a = parseFloat(amount);

    return {
      m: Number.isFinite(m) ? m : null,
      o: Number.isFinite(o) ? o : null,
      a: Number.isFinite(a) ? a : null,
    };
  }, [marketRate, offeredRate, amount]);

  const showError =
    computed &&
    (parsed.m === null ||
      parsed.o === null ||
      parsed.a === null ||
      parsed.m <= 0 ||
      parsed.o <= 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.m === null ||
      parsed.o === null ||
      parsed.a === null ||
      parsed.m <= 0 ||
      parsed.o <= 0
    )
      return null;

    // Markup compared to mid-market:
    // markup% = (mid - offered) / mid * 100
    const markupPercent = ((parsed.m - parsed.o) / parsed.m) * 100;

    // Hidden loss in quote currency for the given amount (amount * (mid - offered))
    const hiddenLoss = parsed.a * (parsed.m - parsed.o);

    // Effective received value
    const valueAtMarket = parsed.a * parsed.m;
    const valueAtOffered = parsed.a * parsed.o;

    return {
      markupPercent,
      hiddenLoss,
      valueAtMarket,
      valueAtOffered,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Exchange Rate Markup Calculator</h1>
      <p>
        Exchange rate markups are often hidden inside the rate you’re offered. This tool
        calculates the markup (%) compared to the mid-market rate and estimates the
        hidden cost for your exchange amount.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Mid-Market Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.m === null || parsed.m <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={marketRate}
          onChange={(e) => setMarketRate(e.target.value)}
          placeholder="e.g. 1.10"
        />
        <div style={helpStyle}>The “true” market rate (no markup).</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Offered Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.o === null || parsed.o <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={offeredRate}
          onChange={(e) => setOfferedRate(e.target.value)}
          placeholder="e.g. 1.05"
        />
        <div style={helpStyle}>The rate shown by your provider.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount to Exchange</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.a === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
        <div style={helpStyle}>Enter the amount in your base currency.</div>
      </div>

      <button style={buttonStyle} onClick={calc}>
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 600 }}>
          Please enter valid inputs (rates must be greater than 0).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Markup (% vs Mid-Market):</strong>{" "}
            {result.markupPercent.toFixed(2)}%
          </p>
          <p>
            <strong>Estimated Hidden Loss:</strong>{" "}
            {result.hiddenLoss.toFixed(2)}
          </p>
          <p>
            <strong>Value at Mid-Market Rate:</strong>{" "}
            {result.valueAtMarket.toFixed(2)}
          </p>
          <p>
            <strong>Value at Offered Rate:</strong>{" "}
            {result.valueAtOffered.toFixed(2)}
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          Markup (%) = (Mid-Market Rate − Offered Rate) ÷ Mid-Market Rate × 100.
          The hidden loss is your amount multiplied by the rate difference.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Can markup be negative?</strong>
          <br />
          Yes, if the offered rate is better than mid-market (rare). In that case, the “markup”
          is effectively a benefit.
        </p>
        <p>
          <strong>Is this different from spread?</strong>
          <br />
          They’re closely related. “Spread” often describes the gap; “markup” frames it as a cost to you.
        </p>
      </section>
    </div>
  );
}
