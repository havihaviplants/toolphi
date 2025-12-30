"use client";

import { useMemo, useState } from "react";

export default function AfterFeeExchangeRateCalculator() {
  const [offeredRate, setOfferedRate] = useState("");
  const [amount, setAmount] = useState("");
  const [flatFee, setFlatFee] = useState("");
  const [percentFee, setPercentFee] = useState("");
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
    const r = parseFloat(offeredRate);
    const a = parseFloat(amount);
    const f = flatFee.trim() === "" ? 0 : parseFloat(flatFee);
    const p = percentFee.trim() === "" ? 0 : parseFloat(percentFee);

    return {
      r: Number.isFinite(r) ? r : null,
      a: Number.isFinite(a) ? a : null,
      f: Number.isFinite(f) ? f : null,
      p: Number.isFinite(p) ? p : null,
    };
  }, [offeredRate, amount, flatFee, percentFee]);

  const showError =
    computed &&
    (parsed.r === null ||
      parsed.a === null ||
      parsed.f === null ||
      parsed.p === null ||
      parsed.r <= 0 ||
      parsed.a <= 0 ||
      parsed.f < 0 ||
      parsed.p < 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.r === null ||
      parsed.a === null ||
      parsed.f === null ||
      parsed.p === null ||
      parsed.r <= 0 ||
      parsed.a <= 0 ||
      parsed.f < 0 ||
      parsed.p < 0
    )
      return null;

    // Total fees in base currency:
    // percentFee is applied to amount (base currency)
    const percentFeeAmount = parsed.a * (parsed.p / 100);
    const totalFees = parsed.f + percentFeeAmount;

    // Net amount exchanged after fees (base currency)
    const netAmount = parsed.a - totalFees;

    // Received value in quote currency using offered rate
    const receivedValue = netAmount * parsed.r;

    // Effective exchange rate after fees:
    // effectiveRate = receivedValue / original amount
    const effectiveRate = receivedValue / parsed.a;

    return {
      percentFeeAmount,
      totalFees,
      netAmount,
      receivedValue,
      effectiveRate,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>After-Fee Exchange Rate Calculator</h1>
      <p>
        Some providers charge explicit fees in addition to offering an exchange rate.
        This calculator estimates your effective exchange rate after accounting for
        flat and percentage-based fees.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Offered Exchange Rate</label>
        <input
          style={{
            ...inputStyle,
            borderColor:
              showError && (parsed.r === null || parsed.r <= 0)
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
            borderColor:
              showError && (parsed.a === null || parsed.a <= 0)
                ? errorBorderColor
                : baseBorderColor,
          }}
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
        <div style={helpStyle}>Enter the amount in your base currency.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Flat Fee (Optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.f === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={flatFee}
          onChange={(e) => setFlatFee(e.target.value)}
          placeholder="e.g. 5"
        />
        <div style={helpStyle}>A fixed fee charged in your base currency.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Percentage Fee (Optional)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.p === null ? errorBorderColor : baseBorderColor,
          }}
          type="number"
          step="any"
          value={percentFee}
          onChange={(e) => setPercentFee(e.target.value)}
          placeholder="e.g. 1"
        />
        <div style={helpStyle}>A fee charged as a percent of the amount (e.g., 1%).</div>
      </div>

      <button style={buttonStyle} onClick={calc}>
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 600 }}>
          Please enter valid inputs (rate & amount must be greater than 0, fees cannot be negative).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Percentage Fee Amount:</strong>{" "}
            {result.percentFeeAmount.toFixed(2)}
          </p>
          <p>
            <strong>Total Fees:</strong>{" "}
            {result.totalFees.toFixed(2)}
          </p>
          <p>
            <strong>Net Amount Exchanged:</strong>{" "}
            {result.netAmount.toFixed(2)}
          </p>
          <p>
            <strong>Received Value:</strong>{" "}
            {result.receivedValue.toFixed(2)}
          </p>
          <p>
            <strong>Effective Exchange Rate (After Fees):</strong>{" "}
            {result.effectiveRate.toFixed(6)}
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          We subtract flat and percentage fees from your exchange amount, then apply the offered rate.
          The effective exchange rate is calculated as: received value ÷ original amount.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Do fees always reduce the effective exchange rate?</strong>
          <br />
          Yes. Fees reduce the amount that actually gets converted at the offered rate.
        </p>
        <p>
          <strong>What if I only have a flat fee?</strong>
          <br />
          Leave percentage fee blank (or 0). The calculator works with either fee type.
        </p>
      </section>
    </div>
  );
}
