"use client";

import { useMemo, useState } from "react";

export default function RealExchangeRateLossCalculator() {
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

    const valueAtMarket = parsed.a * parsed.m;
    const valueAtOffered = parsed.a * parsed.o;

    const lossAmount = valueAtMarket - valueAtOffered;
    const lossPercent =
      valueAtMarket === 0 ? 0 : (lossAmount / valueAtMarket) * 100;

    return {
      valueAtMarket,
      valueAtOffered,
      lossAmount,
      lossPercent,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Real Exchange Rate Loss Calculator</h1>
      <p>
        Even small differences in exchange rates can cause real monetary losses.
        This calculator shows how much value you lose compared to the mid-market rate.
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
        <div style={helpStyle}>The true market exchange rate.</div>
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
        <div style={helpStyle}>The rate you actually receive.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount Exchanged</label>
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
            <strong>Value at Mid-Market Rate:</strong>{" "}
            {result.valueAtMarket.toFixed(2)}
          </p>
          <p>
            <strong>Value at Offered Rate:</strong>{" "}
            {result.valueAtOffered.toFixed(2)}
          </p>
          <p>
            <strong>Real Exchange Rate Loss:</strong>{" "}
            {result.lossAmount.toFixed(2)}
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
          We compare the value you would receive at the mid-market rate with the
          value you actually receive. The difference is your real exchange rate loss.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is this loss the same as a fee?</strong>
          <br />
          Not always. Even without an explicit fee, a worse rate creates a real loss.
        </p>
        <p>
          <strong>Why does this matter for large amounts?</strong>
          <br />
          Small rate differences scale linearly with amount, making losses significant
          for large transfers.
        </p>
      </section>
    </div>
  );
}
