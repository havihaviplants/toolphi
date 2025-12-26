"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Inputs = {
  durationValue: string;
  durationUnit: "days" | "months";

  rateValue: string;
  rateUnit: "per_day" | "per_month";

  adjustmentPercent: string; // optional risk/age/region factor

  // Optional: allow simple fixed fees
  policyFee: string;
};

type Result = {
  baseCost: number;
  adjustedCost: number;
  totalCost: number;
  monthlyEquivalent: number;
  notes: string[];
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function TemporaryInsuranceCostEstimator() {
  const [inputs, setInputs] = useState<Inputs>({
    durationValue: "14",
    durationUnit: "days",
    rateValue: "6",
    rateUnit: "per_day",
    adjustmentPercent: "10",
    policyFee: "0",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const durationDays = useMemo(() => {
    const dv = parseNumber(inputs.durationValue);
    if (!Number.isFinite(dv)) return NaN;
    if (inputs.durationUnit === "days") return dv;
    // months → convert to days approx
    return dv * 30;
  }, [inputs.durationValue, inputs.durationUnit]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const durationValue = parseNumber(inputs.durationValue);
    const rateValue = parseNumber(inputs.rateValue);
    const adjustmentPercent = inputs.adjustmentPercent.trim() === "" ? 0 : parseNumber(inputs.adjustmentPercent);
    const policyFee = inputs.policyFee.trim() === "" ? 0 : parseNumber(inputs.policyFee);

    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }
    if (!Number.isFinite(rateValue) || rateValue < 0) {
      setError("Rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(adjustmentPercent) || adjustmentPercent < -90 || adjustmentPercent > 300) {
      setError("Adjustment must be between -90% and 300%.");
      return;
    }
    if (!Number.isFinite(policyFee) || policyFee < 0) {
      setError("Policy fee must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      setError("Invalid duration.");
      return;
    }

    // Normalize to total base cost
    // If rate is per_day: base = days * rate
    // If rate is per_month: base = months * rate (use months input if chosen), else days/30 * rate
    let baseCost = 0;
    if (inputs.rateUnit === "per_day") {
      baseCost = durationDays * rateValue;
    } else {
      // per_month
      const months =
        inputs.durationUnit === "months" ? durationValue : durationDays / 30;
      baseCost = months * rateValue;
    }

    const multiplier = 1 + adjustmentPercent / 100;
    const adjustedCost = baseCost * multiplier;
    const totalCost = adjustedCost + policyFee;

    const monthlyEquivalent = totalCost / (durationDays / 30);

    const notes: string[] = [];
    notes.push("Temporary insurance pricing varies widely by insurer, coverage level, and eligibility.");
    notes.push("This estimator uses a simple base-rate × duration model plus an adjustment factor.");
    if (inputs.durationUnit === "months") notes.push("Months are approximated as 30-day periods for monthly equivalent.");

    setResult({
      baseCost,
      adjustedCost,
      totalCost,
      monthlyEquivalent,
      notes,
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
      <div style={{ display: "grid", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Temporary Insurance Cost Estimator</h1>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>
          Estimate short-term insurance costs based on duration, base rate, and optional adjustments.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Coverage duration</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 8 }}>
            <input
              name="durationValue"
              value={inputs.durationValue}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 14"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <select
              name="durationUnit"
              value={inputs.durationUnit}
              onChange={handleChange}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Base rate</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 8 }}>
            <input
              name="rateValue"
              value={inputs.rateValue}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 6"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <select
              name="rateUnit"
              value={inputs.rateUnit}
              onChange={handleChange}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            >
              <option value="per_day">Per day</option>
              <option value="per_month">Per month</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Adjustment (%) (optional)</label>
          <input
            name="adjustmentPercent"
            value={inputs.adjustmentPercent}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 10"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
            Use this as a simple factor for risk, coverage level, age band, or region (e.g., +10%).
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Policy fee (optional)</label>
          <input
            name="policyFee"
            value={inputs.policyFee}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 0"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        {error ? (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              color: "#c53030",
              padding: 10,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Estimate
        </button>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>Results</div>

          <div style={{ fontSize: 14 }}>
            <strong>Base cost:</strong> {fmt(result.baseCost)}
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>Adjusted cost:</strong> {fmt(result.adjustedCost)}
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>Total cost:</strong> {fmt(result.totalCost)}
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>Monthly equivalent:</strong> {fmt(result.monthlyEquivalent)}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>

          <section style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              We estimate cost as base rate × duration, then apply an adjustment factor and optional policy fee.
              Monthly equivalent is estimated using 30-day months.
            </p>
          </section>

          <section style={{ marginTop: 4, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>FAQ</h2>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Is temporary insurance always more expensive?</strong>
              <div>Often, yes. Short-term policies can have higher per-day pricing and fewer benefits.</div>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Should I use per-day or per-month rates?</strong>
              <div>Use whichever matches the quote you have. The estimator converts duration accordingly.</div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
