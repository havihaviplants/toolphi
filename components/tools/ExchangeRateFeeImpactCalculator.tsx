"use client";

import { useMemo, useState } from "react";

export default function ExchangeRateFeeImpactCalculator() {
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
    computed && (parsed.m === null || parsed.o === null || parsed.a === null || parsed.m <= 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (parsed.m === null || parsed.o === null || parsed.a === null || parsed.m <= 0) return null;

    const realValue = parsed.a * parsed.m;
    const receivedValue = parsed.a * parsed.o;

    const loss = realValue - receivedValue;
    const lossPercent = realValue === 0 ? 0 : (loss / realValue) * 100;

    return {
      realValue,
      receivedValue,
      loss,
      lossPercent,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Exchange Rate Fee Impact Calculator</h1>
      <p>
        Banks and payment services can hide fees inside exchange rates. This tool estimates
        how much you lose due to exchange rate markups compared to the mid-market rate.
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
              showError && parsed.o === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={offeredRate}
          onChange={(e) => setOfferedRate(e.target.value)}
          placeholder="e.g. 1.05"
        />
        <div style={helpStyle}>The rate shown by your bank/service.</div>
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
          Please enter valid inputs (mid-market rate must be greater than 0).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Value at Mid-Market Rate:</strong>{" "}
            {result.realValue.toFixed(2)}
          </p>
          <p>
            <strong>Value at Offered Rate:</strong>{" "}
            {result.receivedValue.toFixed(2)}
          </p>
          <p>
            <strong>Hidden Exchange Rate Loss:</strong>{" "}
            {result.loss.toFixed(2)}
          </p>
          <p>
            <strong>Loss Percentage:</strong>{" "}
            {result.lossPercent.toFixed(2)}%
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          Even if a provider charges no explicit fee, it may offer a worse exchange rate
          than the mid-market rate. The difference translates into hidden cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is an exchange rate markup the same as a fee?</strong>
          <br />
          Not exactly. A markup is hidden in the rate, while a fee is charged separately.
          Both increase your total cost.
        </p>
        <p>
          <strong>How can I reduce exchange rate losses?</strong>
          <br />
          Compare providers using the same mid-market reference, and prefer transparent
          fees over hidden rate markups.
        </p>
      </section>
    </div>
  );
}
