"use client";

import { useMemo, useState } from "react";

export default function ExchangeRateSpreadCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [offeredRate, setOfferedRate] = useState("");
  const [amount, setAmount] = useState(""); // optional
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
    const a = amount.trim() === "" ? null : parseFloat(amount);

    return {
      m: Number.isFinite(m) ? m : null,
      o: Number.isFinite(o) ? o : null,
      a: a !== null && Number.isFinite(a) ? a : null,
    };
  }, [marketRate, offeredRate, amount]);

  const calc = () => {
    setComputed(true);
  };

  const showError =
    computed && (parsed.m === null || parsed.o === null || parsed.m <= 0);

  const spread = useMemo(() => {
    if (!computed) return null;
    if (parsed.m === null || parsed.o === null || parsed.m <= 0) return null;

    // Spread as a percentage of mid-market rate:
    // spread% = (mid - offered) / mid * 100
    const diff = parsed.m - parsed.o;
    const spreadPct = (diff / parsed.m) * 100;

    // Optional cost impact if amount provided (amount in base currency)
    // realValue = amount * mid, receivedValue = amount * offered
    let hiddenLoss: number | null = null;
    if (parsed.a !== null) {
      hiddenLoss = parsed.a * parsed.m - parsed.a * parsed.o;
    }

    return { diff, spreadPct, hiddenLoss };
  }, [computed, parsed]);

  return (
    <div className="tool-container">
      <h1>Exchange Rate Spread Calculator</h1>
      <p>
        The exchange rate spread is the difference between the mid-market rate
        and the rate you’re offered. A larger spread usually means a bigger
        hidden cost.
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
        <label style={labelStyle}>Amount to Exchange (Optional)</label>
        <input
          style={inputStyle}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
        <div style={helpStyle}>
          If provided, we’ll estimate the hidden loss amount.
        </div>
      </div>

      <button style={buttonStyle} onClick={calc}>
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 600 }}>
          Please enter valid exchange rates (mid-market rate must be greater than 0).
        </p>
      )}

      {spread && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Rate Difference (Mid − Offered):</strong>{" "}
            {spread.diff.toFixed(6)}
          </p>
          <p>
            <strong>Spread (% of Mid-Market):</strong>{" "}
            {spread.spreadPct.toFixed(2)}%
          </p>
          {spread.hiddenLoss !== null && (
            <p>
              <strong>Estimated Hidden Loss:</strong>{" "}
              {spread.hiddenLoss.toFixed(2)}
            </p>
          )}
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          Spread (%) = (Mid-Market Rate − Offered Rate) ÷ Mid-Market Rate × 100.
          Even without an explicit fee, a worse offered rate can create a hidden cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is spread the same as a markup?</strong>
          <br />
          They’re closely related. A markup often appears as a worse offered rate,
          which increases the spread versus the mid-market rate.
        </p>
        <p>
          <strong>Why does the spread matter?</strong>
          <br />
          A larger spread means you receive less value than you should at the true market rate.
        </p>
      </section>
    </div>
  );
}
