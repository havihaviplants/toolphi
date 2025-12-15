// components/tools/TravelRewardsValueCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  monthlyTravelSpending: string; // $
  monthlyOtherSpending: string; // $
  travelEarnRate: string; // points per $1 (e.g. 3)
  otherEarnRate: string; // points per $1 (e.g. 1)
  centsPerPoint: string; // CPP for travel redemptions (e.g. 1.5)
  annualFee: string; // optional $
  signupBonusPoints: string; // optional points
};

type Result = {
  monthlyPointsTravel: number;
  monthlyPointsOther: number;
  monthlyPointsTotal: number;
  yearlyPointsTotal: number;

  monthlyValue: number; // $
  yearlyValue: number; // $
  yearlyNetAfterFee: number; // $

  signupBonusValue: number; // $
  totalFirstYearNet: number; // $ (yearly value + signup value - fee)
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatNumber(n: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}

export default function TravelRewardsValueCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    monthlyTravelSpending: "",
    monthlyOtherSpending: "",
    travelEarnRate: "",
    otherEarnRate: "",
    centsPerPoint: "",
    annualFee: "",
    signupBonusPoints: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const monthlyTravelSpending = parseNumber(inputs.monthlyTravelSpending);
    const monthlyOtherSpending = parseNumber(inputs.monthlyOtherSpending);
    const travelEarnRate = parseNumber(inputs.travelEarnRate);
    const otherEarnRate = parseNumber(inputs.otherEarnRate);
    const centsPerPoint = parseNumber(inputs.centsPerPoint);

    const annualFee = inputs.annualFee.trim() ? parseNumber(inputs.annualFee) : 0;
    const signupBonusPoints = inputs.signupBonusPoints.trim()
      ? parseNumber(inputs.signupBonusPoints)
      : 0;

    if (!Number.isFinite(monthlyTravelSpending) || monthlyTravelSpending < 0) {
      setError("Monthly travel spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(monthlyOtherSpending) || monthlyOtherSpending < 0) {
      setError("Monthly non-travel spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(travelEarnRate) || travelEarnRate <= 0) {
      setError("Travel earn rate must be greater than 0 (e.g. 3 points per $1).");
      return;
    }
    if (!Number.isFinite(otherEarnRate) || otherEarnRate <= 0) {
      setError("Non-travel earn rate must be greater than 0 (e.g. 1 point per $1).");
      return;
    }
    if (!Number.isFinite(centsPerPoint) || centsPerPoint <= 0) {
      setError("Cents per point (CPP) must be greater than 0 (e.g. 1.5).");
      return;
    }
    if (!Number.isFinite(annualFee) || annualFee < 0) {
      setError("Annual fee must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(signupBonusPoints) || signupBonusPoints < 0) {
      setError("Signup bonus points must be a valid number (0 or greater).");
      return;
    }

    const monthlyPointsTravel = monthlyTravelSpending * travelEarnRate;
    const monthlyPointsOther = monthlyOtherSpending * otherEarnRate;
    const monthlyPointsTotal = monthlyPointsTravel + monthlyPointsOther;

    const yearlyPointsTotal = monthlyPointsTotal * 12;

    const dollarsPerPoint = centsPerPoint / 100;

    const monthlyValue = monthlyPointsTotal * dollarsPerPoint;
    const yearlyValue = monthlyValue * 12;

    const yearlyNetAfterFee = yearlyValue - annualFee;

    const signupBonusValue = signupBonusPoints * dollarsPerPoint;
    const totalFirstYearNet = yearlyValue + signupBonusValue - annualFee;

    setResult({
      monthlyPointsTravel,
      monthlyPointsOther,
      monthlyPointsTotal,
      yearlyPointsTotal,
      monthlyValue,
      yearlyValue,
      yearlyNetAfterFee,
      signupBonusValue,
      totalFirstYearNet,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 16,
        backgroundColor: "#fff",
        display: "grid",
        gap: 16,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Monthly travel spending</label>
            <input
              name="monthlyTravelSpending"
              value={inputs.monthlyTravelSpending}
              onChange={handleChange}
              placeholder="e.g. 600"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Monthly non-travel spending</label>
            <input
              name="monthlyOtherSpending"
              value={inputs.monthlyOtherSpending}
              onChange={handleChange}
              placeholder="e.g. 1400"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Travel earn rate (points per $1)</label>
            <input
              name="travelEarnRate"
              value={inputs.travelEarnRate}
              onChange={handleChange}
              placeholder="e.g. 3"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Non-travel earn rate (points per $1)</label>
            <input
              name="otherEarnRate"
              value={inputs.otherEarnRate}
              onChange={handleChange}
              placeholder="e.g. 1"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Point value for travel (cents per point)</label>
            <input
              name="centsPerPoint"
              value={inputs.centsPerPoint}
              onChange={handleChange}
              placeholder="e.g. 1.5"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Annual fee (optional)</label>
            <input
              name="annualFee"
              value={inputs.annualFee}
              onChange={handleChange}
              placeholder="e.g. 95"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Signup bonus points (optional)</label>
            <input
              name="signupBonusPoints"
              value={inputs.signupBonusPoints}
              onChange={handleChange}
              placeholder="e.g. 60000"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              backgroundColor: "#111",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Calculate
          </button>

          {error && (
            <p style={{ color: "#b00020", fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
      </form>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #e1e4e8",
          padding: 16,
          backgroundColor: "#f6f8fa",
          minHeight: 180,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px 0" }}>
          Results
        </h3>

        {!result ? (
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
            Enter values and click Calculate.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Monthly points (travel)</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.monthlyPointsTravel, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Monthly points (non-travel)</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.monthlyPointsOther, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Monthly points (total)</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.monthlyPointsTotal, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Yearly points (total)</span>
              <strong style={{ fontSize: 14 }}>{formatNumber(result.yearlyPointsTotal, 0)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Monthly value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.monthlyValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Yearly value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.yearlyValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Net yearly value (after fee)</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.yearlyNetAfterFee)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Signup bonus value</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.signupBonusValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Total first-year net</span>
              <strong style={{ fontSize: 14 }}>${formatNumber(result.totalFirstYearNet)}</strong>
            </div>

            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
              Tip: Travel redemption values vary a lot. If unsure, try 1.2–2.0 cents per point.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
