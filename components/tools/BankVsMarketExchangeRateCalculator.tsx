"use client";

import { useMemo, useState } from "react";

export default function BankVsMarketExchangeRateCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [bankRate, setBankRate] = useState("");
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
    const b = parseFloat(bankRate);
    const a = parseFloat(amount);

    return {
      m: Number.isFinite(m) ? m : null,
      b: Number.isFinite(b) ? b : null,
      a: Number.isFinite(a) ? a : null,
    };
  }, [marketRate, bankRate, amount]);

  const showError =
    computed &&
    (parsed.m === null ||
      parsed.b === null ||
      parsed.a === null ||
      parsed.m <= 0 ||
      parsed.b <= 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.m === null ||
      parsed.b === null ||
      parsed.a === null ||
      parsed.m <= 0 ||
      parsed.b <= 0
    )
      return null;

    // Values in "quote" currency (amount * rate)
    const valueAtMarket = parsed.a * parsed.m;
    const valueAtBank = parsed.a * parsed.b;

    const hiddenLoss = valueAtMarket - valueAtBank;

    // Effective markup compared to mid-market:
    // markup% = (mid - bank) / mid * 100
    const markupPercent = ((parsed.m - parsed.b) / parsed.m) * 100;

    return {
      valueAtMarket,
      valueAtBank,
      hiddenLoss,
      markupPercent,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Bank vs Market Exchange Rate Calculator</h1>
      <p>
        Banks often offer a worse exchange rate than the mid-market rate. This tool
        compares the bank rate to the true market rate and estimates the hidden cost.
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
        <label style={labelStyle}>Bank Offered Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.b === null || parsed.b <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={bankRate}
          onChange={(e) => setBankRate(e.target.value)}
          placeholder="e.g. 1.05"
        />
        <div style={helpStyle}>The rate your bank is offering.</div>
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
            <strong>Value at Mid-Market Rate:</strong>{" "}
            {result.valueAtMarket.toFixed(2)}
          </p>
          <p>
            <strong>Value at Bank Rate:</strong>{" "}
            {result.valueAtBank.toFixed(2)}
          </p>
          <p>
            <strong>Hidden Loss Using Bank Rate:</strong>{" "}
            {result.hiddenLoss.toFixed(2)}
          </p>
          <p>
            <strong>Bank Markup (% vs Mid-Market):</strong>{" "}
            {result.markupPercent.toFixed(2)}%
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          We compare the bank’s offered rate to the mid-market rate. The difference
          is the implied markup, which reduces the value you receive when exchanging money.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Why do banks offer worse exchange rates?</strong>
          <br />
          Banks can embed profit into the rate itself, instead of charging a visible fee.
        </p>
        <p>
          <strong>What’s a good way to compare providers?</strong>
          <br />
          Use the same mid-market reference rate and compare both the rate and any explicit fees.
        </p>
      </section>
    </div>
  );
}
