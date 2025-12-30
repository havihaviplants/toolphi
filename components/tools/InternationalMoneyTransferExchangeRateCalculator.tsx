"use client";

import { useMemo, useState } from "react";

export default function InternationalMoneyTransferExchangeRateCalculator() {
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

    // Fees in base currency
    const percentFeeAmount = parsed.a * (parsed.p / 100);
    const totalFeesBase = parsed.f + percentFeeAmount;

    // Net amount that actually gets converted/sent
    const netAmount = parsed.a - totalFeesBase;

    // Received amount in destination currency using offered rate
    const receivedValue = netAmount * parsed.o;

    // Ideal received at mid-market with no fees
    const idealValue = parsed.a * parsed.m;

    // All-in effective rate vs original amount
    const effectiveRate = receivedValue / parsed.a;

    // Total all-in cost in destination currency
    const totalCost = idealValue - receivedValue;

    // Markup only (assuming no explicit fees)
    const markupLossOnly = parsed.a * (parsed.m - parsed.o);

    return {
      percentFeeAmount,
      totalFeesBase,
      netAmount,
      receivedValue,
      idealValue,
      effectiveRate,
      totalCost,
      markupLossOnly,
    };
  }, [computed, parsed]);

  const calc = () => setComputed(true);

  return (
    <div className="tool-container">
      <h1>International Money Transfer Exchange Rate Calculator</h1>
      <p>
        International transfers often combine exchange rate markups with transfer fees.
        This tool estimates your all-in effective exchange rate and total cost versus
        the mid-market benchmark.
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
        <div style={helpStyle}>True market rate benchmark (no markup).</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Transfer Service Offered Rate</label>
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
        <div style={helpStyle}>The rate shown by the remittance provider.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount Sent (Base Currency)</label>
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
        <div style={helpStyle}>Enter the amount you plan to send.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Transfer Fee (Flat, Optional)</label>
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
        <div style={helpStyle}>Flat fee charged in base currency.</div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Transfer Fee (Percent, Optional)</label>
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
        <div style={helpStyle}>Percent fee applied to the amount sent.</div>
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
            <strong>Ideal Received (Mid-Market, No Fees):</strong>{" "}
            {result.idealValue.toFixed(2)}
          </p>
          <p>
            <strong>Received (Offered, After Fees):</strong>{" "}
            {result.receivedValue.toFixed(2)}
          </p>
          <p>
            <strong>Total Cost (Ideal − Received):</strong>{" "}
            {result.totalCost.toFixed(2)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: `1px solid #d0d7de` }} />

          <p>
            <strong>Total Fees (Base Currency):</strong>{" "}
            {result.totalFeesBase.toFixed(2)}
          </p>
          <p>
            <strong>Effective Exchange Rate (All-In):</strong>{" "}
            {result.effectiveRate.toFixed(6)}
          </p>
          <p>
            <strong>Markup Loss Only (No Fees):</strong>{" "}
            {result.markupLossOnly.toFixed(2)}
          </p>
        </div>
      )}

      <section className="tool-footer" style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          We subtract explicit fees from your sent amount, apply the offered rate,
          then compare the result to an ideal benchmark using the mid-market rate.
          The gap is your all-in cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>What number should I compare across transfer services?</strong>
          <br />
          Compare the “Effective Exchange Rate (All-In)” — it includes fees and rate markup.
        </p>
        <p>
          <strong>Does this include recipient bank fees?</strong>
          <br />
          Not automatically. If you know extra recipient fees, add them as additional flat fees.
        </p>
      </section>
    </div>
  );
}
