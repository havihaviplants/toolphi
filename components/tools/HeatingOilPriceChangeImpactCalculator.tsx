"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function toNumberOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clampMin(n: number, min: number): number {
  return n < min ? min : n;
}

export default function HeatingOilPriceChangeImpactCalculator() {
  const [monthlyGallons, setMonthlyGallons] = useState<string>("90");
  const [currentPrice, setCurrentPrice] = useState<string>("3.75");

  const [mode, setMode] = useState<"newPrice" | "delta">("newPrice");
  const [newPrice, setNewPrice] = useState<string>("4.25");
  const [priceDelta, setPriceDelta] = useState<string>("0.50");

  const [includeTaxPct, setIncludeTaxPct] = useState(false);
  const [taxPct, setTaxPct] = useState<string>("0");

  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const spacing: CSSProperties = { marginTop: 14 };
  const helperStyle: CSSProperties = { marginTop: 6, fontSize: 12, opacity: 0.8 };

  const inputBase: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none"
  };

  const computed = useMemo(() => {
    const g = toNumberOrZero(monthlyGallons);
    const cur = toNumberOrZero(currentPrice);

    const delta = toNumberOrZero(priceDelta);
    const candidateNew = toNumberOrZero(newPrice);

    const t = toNumberOrZero(taxPct);

    const resolvedNewPrice = mode === "newPrice" ? candidateNew : cur + delta;

    const bad =
      g <= 0 ||
      cur < 0 ||
      resolvedNewPrice < 0 ||
      (includeTaxPct && (t < 0 || t > 30)) ||
      !Number.isFinite(g) ||
      !Number.isFinite(cur) ||
      !Number.isFinite(resolvedNewPrice) ||
      !Number.isFinite(t);

    const currentSubtotal = g * cur;
    const newSubtotal = g * resolvedNewPrice;

    const currentTax = includeTaxPct ? currentSubtotal * (t / 100) : 0;
    const newTax = includeTaxPct ? newSubtotal * (t / 100) : 0;

    const currentTotal = clampMin(currentSubtotal + currentTax, 0);
    const newTotal = clampMin(newSubtotal + newTax, 0);

    const diff = newTotal - currentTotal;
    const pctChange = currentTotal > 0 ? (diff / currentTotal) * 100 : 0;

    return {
      bad,
      g,
      cur,
      resolvedNewPrice,
      currentSubtotal,
      newSubtotal,
      currentTax,
      newTax,
      currentTotal,
      newTotal,
      diff,
      pctChange
    };
  }, [
    monthlyGallons,
    currentPrice,
    mode,
    newPrice,
    priceDelta,
    includeTaxPct,
    taxPct
  ]);

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setMonthlyGallons("90");
    setCurrentPrice("3.75");
    setMode("newPrice");
    setNewPrice("4.25");
    setPriceDelta("0.50");
    setIncludeTaxPct(false);
    setTaxPct("0");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Heating Oil Price Change Impact Calculator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        See how a change in price per gallon affects your monthly heating oil bill based on your expected usage.
      </p>

      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Monthly Usage (gallons)</label>
          <input
            type="number"
            inputMode="decimal"
            value={monthlyGallons}
            onChange={(e) => setMonthlyGallons(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 90"
          />
          <div style={helperStyle}>
            If you’re not sure, estimate from past deliveries: gallons delivered ÷ days covered × 30.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Current Price per Gallon ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 3.75"
          />
          <div style={helperStyle}>Use your current supplier price.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>New Price Input Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "newPrice" | "delta")}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="newPrice">Enter the new price</option>
            <option value="delta">Enter a price change (+/-)</option>
          </select>
          <div style={helperStyle}>
            Choose whether you know the new price or just the amount it changed.
          </div>
        </div>

        {mode === "newPrice" ? (
          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>New Price per Gallon ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 4.25"
            />
            <div style={helperStyle}>Enter the expected new price.</div>
          </div>
        ) : (
          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>Price Change ($/gal)</label>
            <input
              type="number"
              inputMode="decimal"
              value={priceDelta}
              onChange={(e) => setPriceDelta(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 0.50"
            />
            <div style={helperStyle}>
              Use a negative number for a decrease (e.g., -0.30).
            </div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <label style={{ display: "block", fontWeight: 700 }}>Optional Tax</label>
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={includeTaxPct}
                onChange={(e) => setIncludeTaxPct(e.target.checked)}
              />
              Include sales tax (percent)
            </label>

            {includeTaxPct && (
              <div>
                <label style={{ display: "block", fontWeight: 700 }}>Tax Rate (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={taxPct}
                  onChange={(e) => setTaxPct(e.target.value)}
                  style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                  placeholder="e.g., 6.25"
                />
                <div style={helperStyle}>Enter your local tax rate (0–30%).</div>
              </div>
            )}
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: gallons must be &gt; 0, prices can’t be negative,
            and tax must be between 0% and 30%.
          </p>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleCalculate}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              background: "transparent",
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {submitted && !invalid && (
        <div style={{ marginTop: 22, padding: 16, borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Results</h2>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>New price used</span>
              <strong>${computed.resolvedNewPrice.toFixed(2)}/gal</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Current monthly bill</span>
              <strong>${computed.currentTotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>New monthly bill</span>
              <strong>${computed.newTotal.toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Monthly change</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                {computed.diff >= 0 ? "+" : "-"}${Math.abs(computed.diff).toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Percent change</span>
              <strong>{computed.pctChange.toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          Current bill = monthly gallons × current price (+ optional tax).
          New bill = monthly gallons × new price (+ optional tax). The difference shows the impact of the price change.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Should I include delivery fees?</strong>
          <br />
          This tool focuses on price per gallon changes. If your supplier has fixed fees, use the monthly cost tool to add them.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>What if my usage changes when prices rise?</strong>
          <br />
          This calculator assumes usage stays the same. If you expect usage to change, re-run with a different monthly gallons estimate.
        </p>
      </div>
    </div>
  );
}
