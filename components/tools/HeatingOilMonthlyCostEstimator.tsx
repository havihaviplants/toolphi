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

export default function HeatingOilMonthlyCostEstimator() {
  const [pricePerGallon, setPricePerGallon] = useState<string>("4.00");
  const [dailyUsage, setDailyUsage] = useState<string>("3.0");
  const [heatingDays, setHeatingDays] = useState<string>("30");

  const [includeDeliveryFee, setIncludeDeliveryFee] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<string>("25");

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
    const p = toNumberOrZero(pricePerGallon);
    const d = toNumberOrZero(dailyUsage);
    const days = toNumberOrZero(heatingDays);

    const fee = toNumberOrZero(deliveryFee);
    const t = toNumberOrZero(taxPct);

    const bad =
      p < 0 ||
      d < 0 ||
      days <= 0 ||
      (includeDeliveryFee && fee < 0) ||
      (includeTaxPct && (t < 0 || t > 30)) ||
      !Number.isFinite(p) ||
      !Number.isFinite(d) ||
      !Number.isFinite(days) ||
      !Number.isFinite(fee) ||
      !Number.isFinite(t);

    const monthlyGallons = d * days;
    const fuelSubtotal = monthlyGallons * p;

    const taxAmount = includeTaxPct ? fuelSubtotal * (t / 100) : 0;
    const total = clampMin(
      fuelSubtotal + taxAmount + (includeDeliveryFee ? fee : 0),
      0
    );

    const effectivePricePerGallon = monthlyGallons > 0 ? total / monthlyGallons : 0;

    return {
      bad,
      p,
      d,
      days,
      monthlyGallons,
      fuelSubtotal,
      taxAmount,
      total,
      effectivePricePerGallon
    };
  }, [
    pricePerGallon,
    dailyUsage,
    heatingDays,
    includeDeliveryFee,
    deliveryFee,
    includeTaxPct,
    taxPct
  ]);

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setPricePerGallon("4.00");
    setDailyUsage("3.0");
    setHeatingDays("30");
    setIncludeDeliveryFee(false);
    setDeliveryFee("25");
    setIncludeTaxPct(false);
    setTaxPct("0");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Heating Oil Monthly Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate your monthly heating oil bill from price per gallon, daily usage,
        and heating days. Optional delivery fee and tax can be included.
      </p>

      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Price per Gallon ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={pricePerGallon}
            onChange={(e) => setPricePerGallon(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 4.00"
          />
          <div style={helperStyle}>
            Use your recent delivery price or a local average price per gallon.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Average Daily Usage (gallons/day)</label>
          <input
            type="number"
            inputMode="decimal"
            value={dailyUsage}
            onChange={(e) => setDailyUsage(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 3.0"
          />
          <div style={helperStyle}>
            Typical usage varies by climate, home size, insulation, and thermostat settings.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Heating Days in the Month</label>
          <input
            type="number"
            inputMode="numeric"
            value={heatingDays}
            onChange={(e) => setHeatingDays(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 30"
          />
          <div style={helperStyle}>
            If you only heat part of the month, enter that number of days.
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label style={{ display: "block", fontWeight: 700 }}>Optional Add-ons</label>

          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            <div>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={includeDeliveryFee}
                  onChange={(e) => setIncludeDeliveryFee(e.target.checked)}
                />
                Include a delivery fee
              </label>
              {includeDeliveryFee && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontWeight: 700 }}>Delivery Fee ($)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                    placeholder="e.g., 25"
                  />
                  <div style={helperStyle}>
                    Some suppliers charge a fixed delivery fee or minimum charge.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={includeTaxPct}
                  onChange={(e) => setIncludeTaxPct(e.target.checked)}
                />
                Include sales tax (percent)
              </label>
              {includeTaxPct && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontWeight: 700 }}>Tax Rate (%)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                    style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                    placeholder="e.g., 6.25"
                  />
                  <div style={helperStyle}>
                    Enter your local tax rate. Typical range is 0–10% (some areas may differ).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: days must be &gt; 0, costs can’t be negative,
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
              <span style={{ opacity: 0.85 }}>Estimated monthly usage</span>
              <strong>{computed.monthlyGallons.toFixed(1)} gallons</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Fuel subtotal</span>
              <strong>${computed.fuelSubtotal.toFixed(2)}</strong>
            </div>

            {includeTaxPct && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ opacity: 0.85 }}>Tax</span>
                <strong>${computed.taxAmount.toFixed(2)}</strong>
              </div>
            )}

            {includeDeliveryFee && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ opacity: 0.85 }}>Delivery fee</span>
                <strong>${toNumberOrZero(deliveryFee).toFixed(2)}</strong>
              </div>
            )}

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Total estimated monthly cost</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                ${computed.total.toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Effective price per gallon</span>
              <strong>${computed.effectivePricePerGallon.toFixed(2)}/gal</strong>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          Monthly gallons = daily usage × heating days. Monthly cost = (monthly gallons × price per gallon)
          plus optional tax and delivery fees. The effective price per gallon reflects those add-ons.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>How do I estimate daily usage?</strong>
          <br />
          You can approximate it from past deliveries: (gallons delivered) ÷ (days until the next delivery).
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Does this include delivery minimums?</strong>
          <br />
          Not directly—use the delivery fee field to approximate any minimum charge or fixed fee.
        </p>
      </div>
    </div>
  );
}
