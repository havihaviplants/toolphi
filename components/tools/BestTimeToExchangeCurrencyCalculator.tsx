"use client";

import { useMemo, useState } from "react";

export default function BestTimeToExchangeCurrencyCalculator() {
  const [amountBase, setAmountBase] = useState("");
  const [rateToday, setRateToday] = useState("");
  const [rateFuture, setRateFuture] = useState("");
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
    const a = parseFloat(amountBase);
    const t = parseFloat(rateToday);
    const f = parseFloat(rateFuture);

    return {
      a: Number.isFinite(a) && a > 0 ? a : null,
      t: Number.isFinite(t) && t > 0 ? t : null,
      f: Number.isFinite(f) && f > 0 ? f : null,
    };
  }, [amountBase, rateToday, rateFuture]);

  const showError = computed && (parsed.a === null || parsed.t === null || parsed.f === null);

  const result = useMemo(() => {
    if (!computed) return null;
    if (parsed.a === null || parsed.t === null || parsed.f === null) return null;

    const quoteToday = parsed.a * parsed.t;
    const quoteFuture = parsed.a * parsed.f;
    const diff = quoteFuture - quoteToday;

    // Positive diff means future yields more quote currency per same base amount
    // (i.e., better to wait if you want more quote currency).
    const perUnitDiff = parsed.f - parsed.t;

    return {
      quoteToday,
      quoteFuture,
      diff,
      perUnitDiff,
    };
  }, [computed, parsed]);

  const diffLabel = useMemo(() => {
    if (!result) return null;
    if (result.diff > 0) return "Waiting (future scenario) yields MORE quote currency";
    if (result.diff < 0) return "Waiting (future scenario) yields LESS quote currency";
    return "No difference between scenarios";
  }, [result]);

  return (
    <div className="tool-container">
      <h1>Best Time to Exchange Currency Calculator</h1>
      <p>
        Compare <strong>today’s rate</strong> versus a <strong>future rate scenario</strong> to see how
        much you might gain or lose by waiting.
      </p>

      <div style={groupStyle}>
        <label style={labelStyle}>Amount (Base Currency)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.a === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={amountBase}
          onChange={(e) => setAmountBase(e.target.value)}
          placeholder="e.g. 10000"
        />
        <div style={helpStyle}>
          Example: if converting USD→KRW, this is the USD amount you plan to exchange.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Exchange Rate (Today)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.t === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={rateToday}
          onChange={(e) => setRateToday(e.target.value)}
          placeholder="e.g. 1470"
        />
        <div style={helpStyle}>
          Quote per 1 base. Example: 1 USD = 1470 KRW → enter 1470.
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Exchange Rate (Future Scenario)</label>
        <input
          style={{
            ...inputStyle,
            borderColor: showError && parsed.f === null ? errorBorder : baseBorder,
          }}
          type="number"
          step="any"
          value={rateFuture}
          onChange={(e) => setRateFuture(e.target.value)}
          placeholder="e.g. 1500"
        />
        <div style={helpStyle}>
          This is a scenario rate you want to compare against today (e.g., a target or forecast range).
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
          maxWidth: 440,
        }}
        onClick={() => setComputed(true)}
      >
        Compare Scenarios
      </button>

      {showError && (
        <p style={{ marginTop: 12, color: errorBorder, fontWeight: 700 }}>
          Please enter valid numbers for amount and both rates.
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
          <p style={{ margin: 0, fontSize: 16 }}>
            <strong>Today’s Quote Amount:</strong> {result.quoteToday.toFixed(2)}
          </p>
          <p style={{ marginTop: 8, fontSize: 16 }}>
            <strong>Future Scenario Quote Amount:</strong> {result.quoteFuture.toFixed(2)}
          </p>

          <hr style={{ margin: "14px 0" }} />

          <p style={{ margin: 0, fontSize: 16 }}>
            <strong>Difference (Future − Today):</strong> {result.diff.toFixed(2)}
          </p>
          <p style={{ marginTop: 8, fontWeight: 800 }}>{diffLabel}</p>

          <p style={{ marginTop: 10, fontSize: 13, color: "#57606a" }}>
            <strong>Per 1 unit impact:</strong> (future rate − today rate) = {result.perUnitDiff.toFixed(6)}.
          </p>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <h2>How it works</h2>
        <p>
          The calculator multiplies your amount by each rate to get two outcomes (today vs future scenario),
          then shows the difference. This is a <strong>what-if timing</strong> comparison, not a prediction.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Does this tool predict the future exchange rate?</strong>
          <br />
          No. You provide a scenario rate (e.g., a target or range) and the tool shows the impact.
        </p>
        <p>
          <strong>What if I’m converting the other direction?</strong>
          <br />
          This tool assumes “quote per 1 base.” If you have the inverse rate, invert it first (1 / rate) or
          use your preferred convention consistently.
        </p>
      </div>
    </div>
  );
}
