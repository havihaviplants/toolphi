"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

function toNumberOrZero(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

type InsulationLevel = "poor" | "average" | "good";
type HeatingIntensity = "mild" | "moderate" | "cold" | "veryCold";
type Period = "month" | "season";

export default function HomeHeatingOilCostEstimator() {
  const [squareFeet, setSquareFeet] = useState<string>("1800");
  const [insulation, setInsulation] = useState<InsulationLevel>("average");
  const [intensity, setIntensity] = useState<HeatingIntensity>("cold");
  const [efficiencyPct, setEfficiencyPct] = useState<string>("82");
  const [oilPricePerGallon, setOilPricePerGallon] = useState<string>("4.00");

  const [period, setPeriod] = useState<Period>("season");
  const [monthsInSeason, setMonthsInSeason] = useState<string>("5");

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

  // Planning model:
  // monthlyGallonsPer1000sqft = base (by climate intensity) * insulation factor * efficiency factor
  // Then multiply by (sqft / 1000) and months.
  const computed = useMemo(() => {
    const sqft = toNumberOrZero(squareFeet);
    const eff = toNumberOrZero(efficiencyPct);
    const price = toNumberOrZero(oilPricePerGallon);
    const seasonMonths = toNumberOrZero(monthsInSeason);

    const bad =
      sqft <= 0 ||
      eff <= 0 ||
      eff > 100 ||
      price < 0 ||
      (period === "season" && (seasonMonths <= 0 || seasonMonths > 12)) ||
      !Number.isFinite(sqft) ||
      !Number.isFinite(eff) ||
      !Number.isFinite(price) ||
      !Number.isFinite(seasonMonths);

    const intensityBaseMonthlyPer1000: Record<HeatingIntensity, number> = {
      mild: 10,
      moderate: 18,
      cold: 26,
      veryCold: 34
    };

    const insulationFactor: Record<InsulationLevel, number> = {
      poor: 1.25,
      average: 1.0,
      good: 0.8
    };

    // If efficiency is lower, gallons required increases.
    // Compare against a reference efficiency (82% typical older-ish furnace).
    const referenceEff = 82;
    const effFactor = referenceEff / clamp(eff, 50, 100);

    const monthlyGallons =
      intensityBaseMonthlyPer1000[intensity] *
      insulationFactor[insulation] *
      effFactor *
      (sqft / 1000);

    const months = period === "month" ? 1 : seasonMonths;

    const totalGallons = monthlyGallons * months;
    const totalCost = totalGallons * price;

    const effectiveMonthlyCost = months > 0 ? totalCost / months : 0;

    return {
      bad,
      sqft,
      eff,
      price,
      months,
      monthlyGallons,
      totalGallons,
      totalCost,
      effectiveMonthlyCost,
      effFactor
    };
  }, [
    squareFeet,
    insulation,
    intensity,
    efficiencyPct,
    oilPricePerGallon,
    period,
    monthsInSeason
  ]);

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setSquareFeet("1800");
    setInsulation("average");
    setIntensity("cold");
    setEfficiencyPct("82");
    setOilPricePerGallon("4.00");
    setPeriod("season");
    setMonthsInSeason("5");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Home Heating Oil Cost Estimator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Estimate heating oil usage and cost using your home size, insulation, local heating intensity,
        furnace efficiency, and oil price per gallon. Results are planning estimates.
      </p>

      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Home Size (sq ft)</label>
          <input
            type="number"
            inputMode="numeric"
            value={squareFeet}
            onChange={(e) => setSquareFeet(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 1800"
          />
          <div style={helperStyle}>Enter heated living area (not total lot size).</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Insulation Level</label>
          <select
            value={insulation}
            onChange={(e) => setInsulation(e.target.value as InsulationLevel)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="poor">Poor (drafty / older)</option>
            <option value="average">Average</option>
            <option value="good">Good (well-insulated)</option>
          </select>
          <div style={helperStyle}>Better insulation typically reduces heating oil usage.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Heating Intensity</label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as HeatingIntensity)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="cold">Cold</option>
            <option value="veryCold">Very cold</option>
          </select>
          <div style={helperStyle}>Choose based on your typical winter temperatures.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Furnace Efficiency (%)</label>
          <input
            type="number"
            inputMode="decimal"
            value={efficiencyPct}
            onChange={(e) => setEfficiencyPct(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 82"
          />
          <div style={helperStyle}>
            Typical older systems: ~75–85%. Newer high-efficiency: ~90–95%.
          </div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Oil Price per Gallon ($)</label>
          <input
            type="number"
            inputMode="decimal"
            value={oilPricePerGallon}
            onChange={(e) => setOilPricePerGallon(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
            placeholder="e.g., 4.00"
          />
          <div style={helperStyle}>Use your latest delivered price or local average.</div>
        </div>

        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Time Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            style={{ ...inputBase, marginTop: 8, maxWidth: 360 }}
          >
            <option value="month">One month</option>
            <option value="season">Heating season</option>
          </select>

          {period === "season" && (
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontWeight: 700 }}>Months in Heating Season</label>
              <input
                type="number"
                inputMode="numeric"
                value={monthsInSeason}
                onChange={(e) => setMonthsInSeason(e.target.value)}
                style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                placeholder="e.g., 5"
              />
              <div style={helperStyle}>
                Common ranges: 4–6 months (varies by location).
              </div>
            </div>
          )}
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: home size must be &gt; 0, efficiency must be 1–100,
            price can’t be negative, and season months must be 1–12.
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
              <span style={{ opacity: 0.85 }}>Estimated monthly usage</span>
              <strong>{computed.monthlyGallons.toFixed(1)} gallons/month</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Estimated usage (selected period)</span>
              <strong>{computed.totalGallons.toFixed(0)} gallons</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Estimated total cost</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                ${computed.totalCost.toFixed(2)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Estimated average monthly cost</span>
              <strong>${computed.effectiveMonthlyCost.toFixed(2)}/month</strong>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Model note: usage is estimated from typical monthly gallons per 1,000 sq ft adjusted by insulation,
            heating intensity, and furnace efficiency (efficiency factor ~ {computed.effFactor.toFixed(2)}×).
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          The calculator estimates monthly gallons based on typical usage per 1,000 sq ft for your heating intensity,
          then adjusts for insulation level and furnace efficiency. Total cost is estimated gallons × oil price per gallon.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Is this estimate accurate for every home?</strong>
          <br />
          No—this is a planning estimate. Actual usage depends on thermostat settings, wind exposure,
          insulation quality, occupant behavior, and the heating system condition.
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Where can I get a better usage estimate?</strong>
          <br />
          Use past deliveries: (gallons delivered) ÷ (days covered) to approximate daily usage,
          then apply the monthly cost tool.
        </p>
      </div>
    </div>
  );
}
