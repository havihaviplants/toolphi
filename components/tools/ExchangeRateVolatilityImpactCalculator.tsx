"use client";

import { useState, useMemo } from "react";

export default function ExchangeRateVolatilityImpactCalculator() {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const [volatility, setVolatility] = useState("");
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
  };

  const labelStyle = { fontWeight: 600, marginBottom: 6 };
  const groupStyle = { marginTop: 14 };
  const helpStyle = { fontSize: 13, color: "#57606a", marginTop: 6 };

  const parsed = useMemo(() => {
    const r = parseFloat(rate);
    const a = parseFloat(amount);
    const v = parseFloat(volatility);

    return {
      r: Number.isFinite(r) && r > 0 ? r : null,
      a: Number.isFinite(a) && a > 0 ? a : null,
      v: Number.isFinite(v) && v >= 0 ? v : null,
    };
  }, [rate, amount, volatility]);

  const showError =
    computed && (parsed.r === null || parsed.a === null || parsed.v === null);

  const result = useMemo(() => {
    if (!computed || !parsed.r || !parsed.a || parsed.v === null) return null;

    const baseValue = parsed.r * parsed.a;
    const upRate = parsed.r * (1 + parsed.v / 100);
    const downRate = parsed.r * (1 - parsed.v / 100);

    const bestCase = upRate * parsed.a;
    const worstCase = downRate * parsed.a;

    return {
      baseValue,
      bestCase,
      worstCase,
      upside: bestCase - baseValue,
      downside: baseValue - worstCase,
    };
  }, [computed, parsed]);

  return (
    <div className="tool-container">
      <h1>Exchange Rate Volatility Impact Calculator</h1>
      <p>
        See how exchange rate fluctuations affect your transaction value under
        best and worst case scenarios.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Current Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && !parsed.r ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="e.g. 1470"
        />
        <div style={helpStyle}>Quote currency per 1 base currency.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount (Base Currency)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && !parsed.a ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10000"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Expected Volatility (%)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.v === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={volatility}
          onChange={(e) => setVolatility(e.target.value)}
          placeholder="e.g. 3"
        />
      </div>

      <button
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 10,
          background: "#111827",
          color: "#fff",
          fontWeight: 700,
          width: "100%",
          maxWidth: 360,
        }}
        onClick={() => setComputed(true)}
      >
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorder }}>
          Please enter valid values.
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
          <p><strong>Base Value:</strong> {result.baseValue.toFixed(2)}</p>
          <p><strong>Best Case (+):</strong> {result.bestCase.toFixed(2)}</p>
          <p><strong>Worst Case (-):</strong> {result.worstCase.toFixed(2)}</p>
          <hr />
          <p><strong>Upside:</strong> {result.upside.toFixed(2)}</p>
          <p><strong>Downside:</strong> {result.downside.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
