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

export default function HeatingOilPrebuyVsPayAsYouGoCalculator() {
  const [seasonGallons, setSeasonGallons] = useState<string>("600");

  const [prebuyPrice, setPrebuyPrice] = useState<string>("3.70");
  const [prebuyFee, setPrebuyFee] = useState<string>("50");

  const [paygAvgPrice, setPaygAvgPrice] = useState<string>("4.10");
  const [paygFees, setPaygFees] = useState<string>("0");

  const [includeOpportunityCost, setIncludeOpportunityCost] = useState(false);
  const [annualReturnPct, setAnnualReturnPct] = useState<string>("4.0");
  const [prebuyMonthsAhead, setPrebuyMonthsAhead] = useState<string>("6");

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
    const g = toNumberOrZero(seasonGallons);

    const pPre = toNumberOrZero(prebuyPrice);
    const feePre = toNumberOrZero(prebuyFee);

    const pPayg = toNumberOrZero(paygAvgPrice);
    const feePayg = toNumberOrZero(paygFees);

    const r = toNumberOrZero(annualReturnPct);
    const m = toNumberOrZero(prebuyMonthsAhead);

    const bad =
      g <= 0 ||
      pPre < 0 ||
      pPayg < 0 ||
      feePre < 0 ||
      feePayg < 0 ||
      (includeOpportunityCost && (r < 0 || r > 30 || m < 0 || m > 24)) ||
      !Number.isFinite(g) ||
      !Number.isFinite(pPre) ||
      !Number.isFinite(pPayg) ||
      !Number.isFinite(feePre) ||
      !Number.isFinite(feePayg) ||
      !Number.isFinite(r) ||
      !Number.isFinite(m);

    const prebuySubtotal = g * pPre + feePre;
    const paygSubtotal = g * pPayg + feePayg;

    // Optional opportunity cost: money paid upfront could have earned a return.
    const months = includeOpportunityCost ? m : 0;
    const annualRate = includeOpportunityCost ? r / 100 : 0;

    // Simple prorated estimate (not compounding): opportunityCost ≈ prebuySubtotal * annualRate * (months/12)
    const opportunityCost = includeOpportunityCost
      ? prebuySubtotal * annualRate * (months / 12)
      : 0;

    const prebuyTotalWithOpp = prebuySubtotal + opportunityCost;

    const diff = paygSubtotal - prebuyTotalWithOpp; // positive => prebuy cheaper

    const winner = diff > 0 ? "prebuy" : diff < 0 ? "payg" : "tie";

    return {
      bad,
      g,
      prebuySubtotal,
      paygSubtotal,
      opportunityCost,
      prebuyTotalWithOpp: clampMin(prebuyTotalWithOpp, 0),
      diff,
      winner
    };
  }, [
    seasonGallons,
    prebuyPrice,
    prebuyFee,
    paygAvgPrice,
    paygFees,
    includeOpportunityCost,
    annualReturnPct,
    prebuyMonthsAhead
  ]);

  const inputInvalid: CSSProperties = invalid ? { border: "2px solid #e11d48" } : {};

  function handleCalculate() {
    setSubmitted(true);
    setInvalid(computed.bad);
  }

  function handleReset() {
    setSeasonGallons("600");
    setPrebuyPrice("3.70");
    setPrebuyFee("50");
    setPaygAvgPrice("4.10");
    setPaygFees("0");
    setIncludeOpportunityCost(false);
    setAnnualReturnPct("4.0");
    setPrebuyMonthsAhead("6");
    setSubmitted(false);
    setInvalid(false);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.2 }}>
        Heating Oil Prebuy vs Pay-As-You-Go Comparison Calculator
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.9 }}>
        Compare a locked-price prebuy plan against expected pay-as-you-go seasonal pricing.
        Includes optional opportunity cost for paying upfront.
      </p>

      <div style={{ marginTop: 18 }}>
        <div style={spacing}>
          <label style={{ display: "block", fontWeight: 700 }}>Expected Seasonal Gallons</label>
          <input
            type="number"
            inputMode="decimal"
            value={seasonGallons}
            onChange={(e) => setSeasonGallons(e.target.value)}
            style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 280 }}
            placeholder="e.g., 600"
          />
          <div style={helperStyle}>
            Use last season’s total gallons if available. Otherwise estimate from monthly usage × season months.
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 14, border: "1px solid #e5e7eb", borderRadius: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Prebuy (Locked Price)</h2>

          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>Locked Price per Gallon ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={prebuyPrice}
              onChange={(e) => setPrebuyPrice(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 3.70"
            />
            <div style={helperStyle}>Enter the prebuy contract/locked price.</div>
          </div>

          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>Prebuy Fee ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={prebuyFee}
              onChange={(e) => setPrebuyFee(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 50"
            />
            <div style={helperStyle}>If there’s no fee, enter 0.</div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 14, border: "1px solid #e5e7eb", borderRadius: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Pay-As-You-Go (Market Price)</h2>

          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>Expected Average Price per Gallon ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={paygAvgPrice}
              onChange={(e) => setPaygAvgPrice(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 4.10"
            />
            <div style={helperStyle}>
              Use your best estimate of the average price across the heating season.
            </div>
          </div>

          <div style={spacing}>
            <label style={{ display: "block", fontWeight: 700 }}>Pay-As-You-Go Fees ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={paygFees}
              onChange={(e) => setPaygFees(e.target.value)}
              style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
              placeholder="e.g., 0"
            />
            <div style={helperStyle}>Delivery fees or minimum charges can be approximated here.</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label style={{ display: "block", fontWeight: 700 }}>Optional (Advanced)</label>
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={includeOpportunityCost}
                onChange={(e) => setIncludeOpportunityCost(e.target.checked)}
              />
              Include opportunity cost of paying upfront
            </label>

            {includeOpportunityCost && (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700 }}>Annual Return Rate (%)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={annualReturnPct}
                    onChange={(e) => setAnnualReturnPct(e.target.value)}
                    style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                    placeholder="e.g., 4.0"
                  />
                  <div style={helperStyle}>
                    If you could earn interest elsewhere, enter the expected annual return.
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 700 }}>Months Paid Ahead</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={prebuyMonthsAhead}
                    onChange={(e) => setPrebuyMonthsAhead(e.target.value)}
                    style={{ ...inputBase, ...inputInvalid, marginTop: 8, maxWidth: 260 }}
                    placeholder="e.g., 6"
                  />
                  <div style={helperStyle}>
                    Example: paying in September for winter deliveries might be ~5–7 months ahead.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {submitted && invalid && (
          <p style={{ color: "#e11d48", marginTop: 12, fontWeight: 700 }}>
            Please enter valid values: gallons must be &gt; 0, prices/fees can’t be negative,
            and advanced values must be within reasonable ranges.
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
              <span style={{ opacity: 0.85 }}>Prebuy subtotal</span>
              <strong>${computed.prebuySubtotal.toFixed(2)}</strong>
            </div>

            {includeOpportunityCost && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ opacity: 0.85 }}>Opportunity cost (estimate)</span>
                <strong>${computed.opportunityCost.toFixed(2)}</strong>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Prebuy total (with opportunity cost)</span>
              <strong>${computed.prebuyTotalWithOpp.toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Pay-as-you-go total</span>
              <strong>${computed.paygSubtotal.toFixed(2)}</strong>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", marginTop: 6 }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ opacity: 0.85 }}>Estimated savings (prebuy vs pay-as-you-go)</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                {computed.diff >= 0 ? "+" : "-"}${Math.abs(computed.diff).toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
              Interpretation: {computed.winner === "prebuy"
                ? "Prebuy is cheaper under your assumptions."
                : computed.winner === "payg"
                ? "Pay-as-you-go is cheaper under your assumptions."
                : "They are equal under your assumptions."}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>How it works</h3>
        <p style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
          Prebuy total = seasonal gallons × locked price + prebuy fee (+ optional opportunity cost).
          Pay-as-you-go total = seasonal gallons × expected average market price + fees.
          The difference estimates whether prebuy is worth it under your assumptions.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 18 }}>FAQ</h3>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>How do I estimate the pay-as-you-go average price?</strong>
          <br />
          Use last season’s average, a local supplier forecast, or test multiple scenarios (low/medium/high).
        </p>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          <strong>Should I always include opportunity cost?</strong>
          <br />
          If you’re paying several months ahead and could otherwise earn interest, it makes the comparison more realistic.
        </p>
      </div>
    </div>
  );
}
