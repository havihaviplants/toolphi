"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function toNumberOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function OilChangeCostEstimator() {
  const [oilType, setOilType] = useState<"conventional" | "syntheticBlend" | "synthetic">(
    "synthetic"
  );

  // Inputs (keep as string for nicer UX: empty input stays empty until calculate)
  const [oilQuarts, setOilQuarts] = useState<string>("5");
  const [pricePerQuart, setPricePerQuart] = useState<string>("9");
  const [laborCost, setLaborCost] = useState<string>("40");
  const [shopFees, setShopFees] = useState<string>("5");

  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Simple presets (optional)
  const presetPricePerQuart = useMemo(() => {
    if (oilType === "conventional") return 6;
    if (oilType === "syntheticBlend") return 7.5;
    return 9;
  }, [oilType]);

  const spacing: CSSProperties = { marginTop: 14 };
  const helperStyle: CSSProperties = { marginTop: 6, fontSize: 12, opacity: 0.8 };

  const inputBase: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none"
  };

  const inputInvalid: CSSProperties = invalid
    ? { border: "2px solid #e11d48" }
    : {};

  const parsed = useMemo(() => {
    const q = toNumberOrZero(oilQuarts);
    const p = toNumberOrZero(pricePerQuart);
    const l = toNumberOrZero(laborCost);
    const f = toNumberOrZero(shopFees);

    // validation rules
    const bad =
      q <= 0 ||
      p < 0 ||
      l < 0 ||
      f < 0 ||
      !Number.isFinite(q) ||
      !Number.isFinite(p) ||
      !Number.isFinite(l) ||
      !Number.isFinite(f);

    const oilCost = q * p;
    const total = oilCost + l + f;

    return { q, p, l, f, bad, oilCost, total };
  }, [oilQuarts, pricePerQuart, laborCost, shopFees]);

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(parsed.bad);
  }

  function handleReset() {
    setOilType("synthetic");
    setOilQuarts("5");
    setPricePerQuart("9");
    setLaborCost("40");
    setShopFees("5");
    setSubmitted(false);
    setInvalid(false);
  }

  function applyPresetPrice() {
    setPricePerQuart(String(presetPricePerQuart));
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Oil Change Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate your oil change total using oil type, quantity, price per quart, labor,
        and optional shop fees.
      </p>

      {/* Inputs */}
      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Oil Type</label>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <select
              value={oilType}
              onChange={(e) => setOilType(e.target.value as any)}
              style={{ ...inputBase, maxWidth: 320 }}
            >
              <option value="conventional">Conventional</option>
              <option value="syntheticBlend">Synthetic Blend</option>
              <option value="synthetic">Full Synthetic</option>
            </select>

            <button
              type="button"
              onClick={applyPresetPrice}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "transparent",
                cursor: "pointer"
              }}
              title="Set a typical price per quart for the selected oil type"
            >
              Use typical price
            </button>
          </div>
          <div style={helperStyle}>
            Tip: “Use typical price” fills a reasonable starting price per quart.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Oil Quantity (quarts)</label>
          <input
            type="number"
            inputMode="decimal"
            value={oilQuarts}
            onChange={(e) => setOilQuarts(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 320 }}
            placeholder="e.g., 5"
          />
          <div style={helperStyle}>Most passenger cars use ~4–6 quarts.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Price per Quart ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={pricePerQuart}
            onChange={(e) => setPricePerQuart(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 320 }}
            placeholder="e.g., 9"
          />
          <div style={helperStyle}>Enter what you pay for oil (or a typical shop-equivalent price).</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Labor Cost ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 320 }}
            placeholder="e.g., 40"
          />
          <div style={helperStyle}>If you DIY, set labor to $0.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Additional Shop Fees ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={shopFees}
            onChange={(e) => setShopFees(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 320 }}
            placeholder="e.g., 5"
          />
          <div style={helperStyle}>Optional fees (disposal, supplies, filters if you want to include here).</div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: quantity must be &gt; 0, and costs can’t be negative.
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

      {/* Results */}
      {submitted && !invalid && (
        <div
          style={{
            marginTop: 22,
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e5e7eb"
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Results</h2>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Oil cost</span>
              <strong>${parsed.oilCost.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Labor</span>
              <strong>${parsed.l.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Shop fees</span>
              <strong>${parsed.f.toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Total estimated cost</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                ${parsed.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom content */}
      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          Total cost = (oil quantity × price per quart) + labor + optional shop fees.
          Use the “typical price” button to quickly fill a reasonable starting price based on oil type.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Why is full synthetic more expensive?</strong>
          <br />
          It typically costs more per quart, but may offer better protection and longer intervals.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Should I include the oil filter cost?</strong>
          <br />
          You can include it in “shop fees” if you want a more complete estimate.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Can this estimate vary by location?</strong>
          <br />
          Yes—labor rates and fees vary widely by region and shop type.
        </p>
      </div>
    </div>
  );
}
