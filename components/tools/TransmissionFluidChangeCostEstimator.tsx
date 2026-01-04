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

type TransmissionType = "automatic" | "cvt" | "manual" | "dct";
type ServiceType = "drainFill" | "flush";

export default function TransmissionFluidChangeCostEstimator() {
  const [transmissionType, setTransmissionType] = useState<TransmissionType>("automatic");
  const [serviceType, setServiceType] = useState<ServiceType>("drainFill");

  const [fluidQuarts, setFluidQuarts] = useState<string>("8");
  const [pricePerQuart, setPricePerQuart] = useState<string>("10");
  const [laborCost, setLaborCost] = useState<string>("120");

  const [includeFilterGasket, setIncludeFilterGasket] = useState(true);
  const [filterGasketCost, setFilterGasketCost] = useState<string>("45");

  const [localAdjustPct, setLocalAdjustPct] = useState<string>("0"); // optional
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Planning multipliers (not official pricing)
  const typeMultiplier: Record<TransmissionType, number> = {
    automatic: 1.0,
    cvt: 1.15,
    manual: 0.85,
    dct: 1.2
  };

  const serviceMultiplier: Record<ServiceType, number> = {
    drainFill: 1.0,
    flush: 1.35
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

  const computed = useMemo(() => {
    const q = toNumberOrZero(fluidQuarts);
    const p = toNumberOrZero(pricePerQuart);
    const labor = toNumberOrZero(laborCost);
    const fg = toNumberOrZero(filterGasketCost);
    const localPct = toNumberOrZero(localAdjustPct);

    const bad =
      q <= 0 ||
      p < 0 ||
      labor < 0 ||
      (includeFilterGasket && fg < 0) ||
      localPct < -40 ||
      localPct > 60 ||
      !Number.isFinite(q) ||
      !Number.isFinite(p) ||
      !Number.isFinite(labor) ||
      !Number.isFinite(fg) ||
      !Number.isFinite(localPct);

    const fluidCost = q * p;

    const baseSubtotal = fluidCost + labor + (includeFilterGasket ? fg : 0);

    const mult = typeMultiplier[transmissionType] * serviceMultiplier[serviceType];
    const adjustedByTypeService = baseSubtotal * mult;

    const localAdjusted = adjustedByTypeService * (1 + localPct / 100);

    const total = clampMin(localAdjusted, 0);

    return {
      bad,
      q,
      p,
      labor,
      fg,
      localPct,
      fluidCost,
      baseSubtotal,
      mult,
      adjustedByTypeService,
      total
    };
  }, [
    fluidQuarts,
    pricePerQuart,
    laborCost,
    includeFilterGasket,
    filterGasketCost,
    localAdjustPct,
    transmissionType,
    serviceType
  ]);

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setTransmissionType("automatic");
    setServiceType("drainFill");
    setFluidQuarts("8");
    setPricePerQuart("10");
    setLaborCost("120");
    setIncludeFilterGasket(true);
    setFilterGasketCost("45");
    setLocalAdjustPct("0");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Transmission Fluid Change Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate your transmission service cost using fluid capacity, fluid price, labor,
        service type, and optional filter/gasket replacement. Results are planning estimates.
      </p>

      <div style={{ marginTop: 18 }}>
        {/* Transmission type */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Transmission Type</label>
          <select
            value={transmissionType}
            onChange={(e) => setTransmissionType(e.target.value as TransmissionType)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="automatic">Automatic</option>
            <option value="cvt">CVT</option>
            <option value="manual">Manual</option>
            <option value="dct">DCT</option>
          </select>
          <div style={helperStyle}>
            Different transmission types often have different fluid specs and labor complexity.
          </div>
        </div>

        {/* Service type */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="drainFill">Drain &amp; Fill</option>
            <option value="flush">Full Flush</option>
          </select>
          <div style={helperStyle}>
            A flush often costs more due to additional labor/time and higher fluid usage.
          </div>
        </div>

        {/* Fluid capacity */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Fluid Capacity (quarts)</label>
          <input
            type="number"
            inputMode="decimal"
            value={fluidQuarts}
            onChange={(e) => setFluidQuarts(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
            placeholder="e.g., 8"
          />
          <div style={helperStyle}>
            Use the service fill amount for drain &amp; fill (often less than total capacity).
          </div>
        </div>

        {/* Price per quart */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Price per Quart ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={pricePerQuart}
            onChange={(e) => setPricePerQuart(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
            placeholder="e.g., 10"
          />
          <div style={helperStyle}>
            If the shop provides fluid, enter a shop-equivalent per-quart cost.
          </div>
        </div>

        {/* Labor */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Labor Cost ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
            placeholder="e.g., 120"
          />
          <div style={helperStyle}>If DIY, set labor to $0.</div>
        </div>

        {/* Filter & gasket */}
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Filter &amp; Gasket</label>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={includeFilterGasket}
                onChange={(e) => setIncludeFilterGasket(e.target.checked)}
              />
              Include filter &amp; gasket replacement
            </label>

            {includeFilterGasket && (
              <div>
                <label style={{ display: "block", fontWeight: 700 }}>Filter &amp; Gasket Cost ($)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={filterGasketCost}
                  onChange={(e) => setFilterGasketCost(e.target.value)}
                  style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 240 }}
                  placeholder="e.g., 45"
                />
                <div style={helperStyle}>
                  Some vehicles require a filter/pan gasket; others don’t.
                </div>
              </div>
            )}
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
            placeholder="e.g., 0"
          />
          <div style={helperStyle}>
            Optional. Typical range: -10% to +20%.
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: capacity must be &gt; 0, costs can’t be negative,
            and local adjustment must be between -40% and +60%.
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
              <span style={{ opacity: 0.85 }}>Fluid cost</span>
              <strong>${computed.fluidCost.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Labor</span>
              <strong>${computed.labor.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Filter &amp; gasket</span>
              <strong>${(includeFilterGasket ? computed.fg : 0).toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Base subtotal</span>
              <strong>${computed.baseSubtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>
                Type/service multiplier ({computed.mult.toFixed(2)}×)
              </span>
              <strong>${computed.adjustedByTypeService.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Local adjustment ({computed.localPct.toFixed(1)}%)</span>
              <strong>${computed.total.toFixed(2)}</strong>
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
          Total estimate = (fluid capacity × price per quart) + labor + optional filter/gasket cost,
          then adjusted using a planning multiplier for transmission type and service type, plus optional local pricing.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Drain &amp; fill vs flush—what’s the difference?</strong>
          <br />
          Drain &amp; fill replaces a portion of fluid, while a flush typically replaces more fluid and costs more.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Why do CVT and DCT often cost more?</strong>
          <br />
          They can require specialized fluid and tighter service procedures.
        </p>
      </div>
    </div>
  );
}
