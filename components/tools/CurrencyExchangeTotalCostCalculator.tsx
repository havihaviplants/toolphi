"use client";

import { useMemo, useState } from "react";

export default function CurrencyExchangeTotalCostCalculator() {
  const [marketRate, setMarketRate] = useState("");
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
    const m = parseFloat(marketRate);
    const o = parseFloat(offeredRate);
    const a = parseFloat(amount);
    const f = flatFee.trim() === "" ? 0 : parseFloat(flatFee);
    const p = percentFee.trim() === "" ? 0 : parseFloat(percentFee);

    return {
      m: Number.isFinite(m) ? m : null,
      o: Number.isFinite(o) ? o : null,
      a: Number.isFinite(a) ? a : null,
      f: Number.isFinite(f) ? f : null,
      p: Number.isFinite(p) ? p : null,
    };
  }, [marketRate, offeredRate, amount, flatFee, percentFee]);

  const showError =
    computed &&
    (parsed.m === null ||
      parsed.o === null ||
      parsed.a === null ||
      parsed.f === null ||
      parsed.p === null ||
      parsed.m <= 0 ||
      parsed.o <= 0 ||
      parsed.a <= 0 ||
      parsed.f < 0 ||
      parsed.p < 0);

  const result = useMemo(() => {
    if (!computed) return null;
    if (
      parsed.m === null ||
      parsed.o === null ||
      parsed.a === null ||
      parsed.f === null ||
      parsed.p === null ||
      parsed.m <= 0 ||
      parsed.o <= 0 ||
      parsed.a <= 0 ||
      parsed.f < 0 ||
      parsed.p < 0
    )
      return null;

    // Explicit fees (base currency)
    const percentFeeAmount = parsed.a * (parsed.p / 100);
    const totalFeesBase = parsed.f + percentFeeAmount;

    // Net amount converted after explicit fees
    const netAmount = parsed.a - totalFeesBase;

    // Value received at offered rate (quote currency)
    const receivedValue = netAmount * parsed.o;

    // What you *should* receive at mid-market if no markup and no fees
    const idealValue = parsed.a * parsed.m;

    // Total cost in quote currency:
    // totalCost = (idealValue - receivedValue)
    // This includes BOTH: (1) rate difference loss + (2) fees impact
    const totalCost = idealValue - receivedValue;

    // Breakout: markup loss if no explicit fees (quote currency)
    const markupLossOnly = parsed.a * (parsed.m - parsed.o);

    // Fee impact expressed in quote currency (approx at offered rate)
    const feeImpactQuote = totalFeesBase * parsed.o;

    // Effective rate vs original amount
    const effectiveRate = receivedValue / parsed.a;

    return {
      percentFeeAmount,
      totalFeesBase,
      netAmount,
      idealValue,
      receivedValue,
      totalCost,
      markupLossOnly,
      feeImpactQuote,
      effectiveRate,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>Currency Exchange Total Cost Calculator</h1>
      <p>
        Want the true cost of exchanging currency? This tool combines exchange rate
        markup losses and explicit fees to estimate your total cost and effective rate.
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
        <div style={helpStyle}>The true market rate (baseline).</div>
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
        <div style={helpStyle}>The rate your provider offers.</div>
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
        <div style={helpStyle}>A fixed fee charged in base currency.</div>
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
        <div style={helpStyle}>A fee charged as a percent of the amount.</div>
      </div>

      <button style={buttonStyle} onClick={calc}>
        Calculate
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorderColor, fontWeight: 600 }}>
          Please enter valid inputs (rates & amount must be greater than 0, fees cannot be negative).
        </p>
      )}

      {result && (
        <div style={resultBoxStyle}>
          <p>
            <strong>Ideal Value (Mid-Market, No Fees):</strong>{" "}
            {result.idealValue.toFixed(2)}
          </p>
          <p>
            <strong>Received Value (Offered, After Fees):</strong>{" "}
            {result.receivedValue.toFixed(2)}
          </p>
          <p>
            <strong>Total Cost (Ideal − Received):</strong>{" "}
            {result.totalCost.toFixed(2)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: `1px solid ${baseBorderColor}` }} />

          <p>
            <strong>Markup Loss Only (No Fees):</strong>{" "}
            {result.markupLossOnly.toFixed(2)}
          </p>
          <p>
            <strong>Fee Impact (Approx, in Quote Currency):</strong>{" "}
            {result.feeImpactQuote.toFixed(2)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: `1px solid ${baseBorderColor}` }} />

          <p>
            <strong>Total Fees (Base Currency):</strong>{" "}
            {result.totalFeesBase.toFixed(2)}
          </p>
          <p>
            <strong>Effective Exchange Rate (All-In):</strong>{" "}
            {result.effectiveRate.toFixed(6)}
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          We compute the ideal value at the mid-market rate (no fees), then subtract what you actually
          receive after explicit fees at the offered rate. The gap is your all-in total cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Why is fee impact shown as “approx” in quote currency?</strong>
          <br />
          Fees are paid in base currency, so we convert using the offered rate to estimate their impact.
        </p>
        <p>
          <strong>What number should I compare across providers?</strong>
          <br />
          Compare the “Effective Exchange Rate (All-In)” — it includes both markups and fees.
        </p>
      </section>
    </div>
  );
}
