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

type OilType = "conventional" | "syntheticBlend" | "synthetic";

export default function JiffyLubeOilChangeCostEstimator() {
  const [oilType, setOilType] = useState<OilType>("synthetic");

  const [includePremiumFilter, setIncludePremiumFilter] = useState(true);
  const [includeTireRotation, setIncludeTireRotation] = useState(false);
  const [includeCabinAirFilter, setIncludeCabinAirFilter] = useState(false);
  const [includeWiperBlades, setIncludeWiperBlades] = useState(false);

  const [localAdjustPct, setLocalAdjustPct] = useState<string>("8"); // percent
  const [couponDiscount, setCouponDiscount] = useState<string>("15"); // dollars

  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // NOTE: These are generic estimates for planning only (not official prices).
  const baseOilService: Record<OilType, number> = {
    conventional: 49,
    syntheticBlend: 69,
    synthetic: 79
  };

  const addOnPrices = {
    premiumFilter: 10,
    tireRotation: 25,
    cabinAirFilter: 35,
    wiperBlades: 30
  };

  const spacing: CSSProperties = { marginTop: 14 };
  const helperStyle: CSSProperties = { marginTop: 6, fontSize: 12, opacity: 0.8 };

  const inputBase: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none"
  };

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  const computed = useMemo(() => {
    const base = baseOilService[oilType];

    const addons =
      (includePremiumFilter ? addOnPrices.premiumFilter : 0) +
      (includeTireRotation ? addOnPrices.tireRotation : 0) +
      (includeCabinAirFilter ? addOnPrices.cabinAirFilter : 0) +
      (includeWiperBlades ? addOnPrices.wiperBlades : 0);

    const localPct = toNumberOrZero(localAdjustPct);
    const coupon = toNumberOrZero(couponDiscount);

    const bad =
      localPct < -50 || // allow small negative for “cheaper market”, but not absurd
      localPct > 80 ||
      coupon < 0 ||
      !Number.isFinite(localPct) ||
      !Number.isFinite(coupon);

    const subtotal = base + addons;
    const adjusted = subtotal * (1 + localPct / 100);
    const total = clampMin(adjusted - coupon, 0);

    return {
      bad,
      base,
      addons,
      subtotal,
      localPct,
      coupon,
      adjusted,
      total
    };
  }, [
    oilType,
    includePremiumFilter,
    includeTireRotation,
    includeCabinAirFilter,
    includeWiperBlades,
    localAdjustPct,
    couponDiscount
  ]);

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setOilType("synthetic");
    setIncludePremiumFilter(true);
    setIncludeTireRotation(false);
    setIncludeCabinAirFilter(false);
    setIncludeWiperBlades(false);
    setLocalAdjustPct("8");
    setCouponDiscount("15");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Jiffy Lube Oil Change Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate your total cost for an oil change at Jiffy Lube by choosing an oil type,
        adding common service options, and applying a local pricing adjustment and coupon discount.
      </p>

      <div style={{ marginTop: 18 }}>
        {/* Oil type */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Oil Type</label>
          <select
            value={oilType}
            onChange={(e) => setOilType(e.target.value as OilType)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="conventional">Conventional</option>
            <option value="syntheticBlend">Synthetic Blend</option>
            <option value="synthetic">Full Synthetic</option>
          </select>
          <div style={helperStyle}>
            These are planning estimates and may vary by vehicle, location, and promotions.
          </div>
        </div>

        {/* Add-ons */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Common Add-ons</label>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={includePremiumFilter}
                onChange={(e) => setIncludePremiumFilter(e.target.checked)}
              />
              Premium oil filter (+${addOnPrices.premiumFilter})
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={includeTireRotation}
                onChange={(e) => setIncludeTireRotation(e.target.checked)}
              />
              Tire rotation (+${addOnPrices.tireRotation})
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={includeCabinAirFilter}
                onChange={(e) => setIncludeCabinAirFilter(e.target.checked)}
              />
              Cabin air filter (+${addOnPrices.cabinAirFilter})
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={includeWiperBlades}
                onChange={(e) => setIncludeWiperBlades(e.target.checked)}
              />
              Wiper blades (+${addOnPrices.wiperBlades})
            </label>
          </div>

          <div style={helperStyle}>
            Add-ons are optional and shown as typical estimates.
          </div>
        </div>

        {/* Local adjustment */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Local Price Adjustment (%)</label>
          <input
            type="number"
            inputMode="decimal"
            value={localAdjustPct}
            onChange={(e) => setLocalAdjustPct(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
            placeholder="e.g., 8"
          />
          <div style={helperStyle}>
            Use 0% if you don’t want to adjust. Typical range: -10% to +20%.
          </div>
        </div>

        {/* Coupon */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Coupon Discount ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={couponDiscount}
            onChange={(e) => setCouponDiscount(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
            placeholder="e.g., 15"
          />
          <div style={helperStyle}>
            Enter the coupon amount you expect to use (if any).
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values. Local adjustment must be between -50% and +80%,
            and coupon discount can’t be negative.
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
              <span style={{ opacity: 0.85 }}>Base oil service</span>
              <strong>${computed.base.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Add-ons</span>
              <strong>${computed.addons.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Subtotal</span>
              <strong>${computed.subtotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Local adjustment ({computed.localPct.toFixed(1)}%)</span>
              <strong>${computed.adjusted.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Coupon discount</span>
              <strong>-${computed.coupon.toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Total estimated cost</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                ${computed.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          This calculator starts with a typical base price by oil type, adds optional service items,
          applies a local pricing adjustment, and subtracts a coupon discount. Prices are estimates for planning.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Are these official Jiffy Lube prices?</strong>
          <br />
          No. This tool provides planning estimates and prices vary by location, vehicle, and promotions.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>What coupon amount should I enter?</strong>
          <br />
          Use the discount amount shown on your coupon or promotion. If none, set it to $0.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Why does the local adjustment matter?</strong>
          <br />
          Service pricing varies across regions due to labor and overhead differences.
        </p>
      </div>
    </div>
  );
}
