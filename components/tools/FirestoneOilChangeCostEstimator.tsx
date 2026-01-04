"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function toNumberOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type OilType = "conventional" | "syntheticBlend" | "synthetic";

export default function FirestoneOilChangeCostEstimator() {
  const [oilType, setOilType] = useState<OilType>("synthetic");
  const [includeInspection, setIncludeInspection] = useState(true);
  const [includeTireRotation, setIncludeTireRotation] = useState(false);
  const [includeAlignmentCheck, setIncludeAlignmentCheck] = useState(false);

  const [localAdjustPct, setLocalAdjustPct] = useState<string>("5");

  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Typical planning estimates (not official prices)
  const baseServicePrice: Record<OilType, number> = {
    conventional: 44,
    syntheticBlend: 64,
    synthetic: 74
  };

  const addOnPrices = {
    inspection: 0, // often bundled
    tireRotation: 25,
    alignmentCheck: 20
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
    const base = baseServicePrice[oilType];

    const addons =
      (includeInspection ? addOnPrices.inspection : 0) +
      (includeTireRotation ? addOnPrices.tireRotation : 0) +
      (includeAlignmentCheck ? addOnPrices.alignmentCheck : 0);

    const localPct = toNumberOrZero(localAdjustPct);

    const bad =
      localPct < -40 ||
      localPct > 60 ||
      !Number.isFinite(localPct);

    const subtotal = base + addons;
    const adjusted = subtotal * (1 + localPct / 100);

    return {
      bad,
      base,
      addons,
      subtotal,
      localPct,
      adjusted
    };
  }, [
    oilType,
    includeInspection,
    includeTireRotation,
    includeAlignmentCheck,
    localAdjustPct
  ]);

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setOilType("synthetic");
    setIncludeInspection(true);
    setIncludeTireRotation(false);
    setIncludeAlignmentCheck(false);
    setLocalAdjustPct("5");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800 }}>
        Firestone Oil Change Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate your oil change cost at Firestone based on oil type,
        common service options, and regional pricing differences.
      </p>

      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ fontWeight: 700 }}>Oil Type</label>
          <select
            value={oilType}
            onChange={(e) => setOilType(e.target.value as OilType)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="conventional">Conventional</option>
            <option value="syntheticBlend">Synthetic Blend</option>
            <option value="synthetic">Full Synthetic</option>
          </select>
        </div>

        <div style={spacing}>
          <label style={{ fontWeight: 700 }}>Service Options</label>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={includeInspection}
                onChange={(e) => setIncludeInspection(e.target.checked)}
              />{" "}
              Courtesy inspection (included)
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeTireRotation}
                onChange={(e) => setIncludeTireRotation(e.target.checked)}
              />{" "}
              Tire rotation (+$25)
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeAlignmentCheck}
                onChange={(e) => setIncludeAlignmentCheck(e.target.checked)}
              />{" "}
              Alignment check (+$20)
            </label>
          </div>
          <div style={helperStyle}>
            Service availability and pricing may vary by location.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ fontWeight: 700 }}>Local Price Adjustment (%)</label>
          <input
            type="number"
            value={localAdjustPct}
            onChange={(e) => setLocalAdjustPct(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
          />
          <div style={helperStyle}>
            Typical range: -10% to +20%. Use 0% for no adjustment.
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter a valid local adjustment percentage.
          </p>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={handleCalculate}>Calculate</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>

      {submitted && !invalid && (
        <div style={{ marginTop: 22, padding: 16, border: "1px solid #e5e7eb", borderRadius: 16 }}>
          <h2>Results</h2>
          <p>Base service: ${computed.base.toFixed(2)}</p>
          <p>Add-ons: ${computed.addons.toFixed(2)}</p>
          <p>Subtotal: ${computed.subtotal.toFixed(2)}</p>
          <p>Local adjustment: {computed.localPct.toFixed(1)}%</p>
          <p style={{ fontSize: 22, fontWeight: 800 }}>
            Total estimated cost: ${computed.adjusted.toFixed(2)}
          </p>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3>How it works</h3>
        <p>
          The calculator combines a typical base price by oil type, adds optional
          services, and applies a regional price adjustment to estimate total cost.
        </p>
      </div>
    </div>
  );
}
