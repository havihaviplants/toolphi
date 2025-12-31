"use client";

import { useMemo, useState } from "react";

export default function ExchangeRateConversionCalculator() {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
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
    const r = parseFloat(rate);
    const a = parseFloat(amount);

    return {
      r: Number.isFinite(r) && r > 0 ? r : null,
      a: Number.isFinite(a) && a > 0 ? a : null,
    };
  }, [rate, amount]);

  const showError = computed && (parsed.r === null || parsed.a === null);

  const result = useMemo(() => {
    if (!computed || parsed.r === null || parsed.a === null) return null;
    return parsed.r * parsed.a;
  }, [computed, parsed]);

  return (
    <div className="tool-container">
      <h1>Exchange Rate Conversion Calculator</h1>
      <p>
        Convert an amount from a base currency to a quote currency using a given
        exchange rate.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.r === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="e.g. 1470"
        />
        <div style={helpStyle}>
          Enter <strong>quote currency per 1 base currency</strong>. Example: if{" "}
          <strong>1 USD = 1470 KRW</strong>, enter <strong>1470</strong>.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount (Base Currency)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.a === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10000"
        />
        <div style={helpStyle}>
          Amount in the <strong>base currency</strong> (e.g., USD in USD→KRW).
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
          maxWidth: 360,
        }}
        onClick={() => setComputed(true)}
      >
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorder, fontWeight: 700 }}>
          Please enter valid numbers for rate and amount.
        </p>
      )}

      {result !== null && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 12,
            background: "#f6f8fa",
            border: `1px solid ${baseBorder}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 16 }}>
            <strong>Converted Amount:</strong> {result.toFixed(2)}
          </p>

          <div style={{ marginTop: 10, fontSize: 13, color: "#57606a" }}>
            <div>
              <strong>Formula:</strong> amount × exchange rate
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          This calculator multiplies your base-currency amount by the exchange
          rate to estimate the converted value in the quote currency.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>What exchange rate format should I use?</strong>
          <br />
          Use “quote per 1 base.” Example: 1 USD = 1470 KRW → enter 1470.
        </p>
        <p>
          <strong>Why do some currency pairs look like 1.05?</strong>
          <br />
          Some pairs are naturally close to 1 (e.g., 1 EUR ≈ 1.05 USD). That is
          still a valid exchange rate.
        </p>
      </div>
    </div>
  );
}
