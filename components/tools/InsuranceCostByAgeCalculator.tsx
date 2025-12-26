"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Inputs = {
  currentAge: string;
  currentMonthlyPremium: string;
  annualIncreasePercent: string;
  targetAge: string;
};

type Result = {
  monthsUntilTarget: number;
  projectedMonthlyPremium: number;
  projectedAnnualPremium: number;
  totalPaidFromNowToTarget: number;
  noteLines: string[];
};

function parseNumber(v: string): number {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function InsuranceCostByAgeCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    currentAge: "30",
    currentMonthlyPremium: "120",
    annualIncreasePercent: "4",
    targetAge: "40",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const yearsDiff = useMemo(() => {
    const currentAge = parseNumber(inputs.currentAge);
    const targetAge = parseNumber(inputs.targetAge);
    if (!Number.isFinite(currentAge) || !Number.isFinite(targetAge)) return NaN;
    return targetAge - currentAge;
  }, [inputs.currentAge, inputs.targetAge]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const currentAge = parseNumber(inputs.currentAge);
    const currentMonthlyPremium = parseNumber(inputs.currentMonthlyPremium);
    const annualIncreasePercent = parseNumber(inputs.annualIncreasePercent);
    const targetAge = parseNumber(inputs.targetAge);

    if (!Number.isFinite(currentAge) || currentAge <= 0 || currentAge > 120) {
      setError("Current age must be a valid number between 1 and 120.");
      return;
    }
    if (!Number.isFinite(targetAge) || targetAge <= 0 || targetAge > 120) {
      setError("Target age must be a valid number between 1 and 120.");
      return;
    }
    if (targetAge <= currentAge) {
      setError("Target age must be greater than current age.");
      return;
    }
    if (!Number.isFinite(currentMonthlyPremium) || currentMonthlyPremium < 0) {
      setError("Current monthly premium must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(annualIncreasePercent) || annualIncreasePercent < 0 || annualIncreasePercent > 50) {
      setError("Annual increase rate must be between 0 and 50 (%).");
      return;
    }

    const years = targetAge - currentAge;
    const monthsUntilTarget = Math.round(years * 12);

    // Projected premium using compound growth: P_target = P_now * (1 + r)^years
    const r = annualIncreasePercent / 100;
    const projectedMonthlyPremium = currentMonthlyPremium * Math.pow(1 + r, years);
    const projectedAnnualPremium = projectedMonthlyPremium * 12;

    // Total paid if premium increases smoothly (approx): sum of geometric series over years (monthly approximation)
    // We'll approximate yearly steps: total = 12 * P_now * (( (1+r)^years - 1 ) / r )  when r>0
    // If r==0, total = 12 * P_now * years
    const totalPaidFromNowToTarget =
      r === 0
        ? currentMonthlyPremium * 12 * years
        : currentMonthlyPremium * 12 * ((Math.pow(1 + r, years) - 1) / r);

    const noteLines: string[] = [];
    noteLines.push("This is a simplified projection using a constant annual growth rate.");
    noteLines.push("Real premiums vary by insurer, location, driving/health history, and underwriting changes.");

    setResult({
      monthsUntilTarget,
      projectedMonthlyPremium,
      projectedAnnualPremium,
      totalPaidFromNowToTarget,
      noteLines,
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
        <h1 style={{ margin: 0, fontSize: 22 }}>Insurance Cost by Age Calculator</h1>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>
          Estimate how your insurance premium may change as you age using a simple annual growth model.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Current age</label>
          <input
            name="currentAge"
            value={inputs.currentAge}
            onChange={handleChange}
            inputMode="decimal"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Current monthly premium</label>
          <input
            name="currentMonthlyPremium"
            value={inputs.currentMonthlyPremium}
            onChange={handleChange}
            inputMode="decimal"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Estimated annual premium increase (%)</label>
          <input
            name="annualIncreasePercent"
            value={inputs.annualIncreasePercent}
            onChange={handleChange}
            inputMode="decimal"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Target age</label>
          <input
            name="targetAge"
            value={inputs.targetAge}
            onChange={handleChange}
            inputMode="decimal"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        {Number.isFinite(yearsDiff) ? (
          <div style={{ fontSize: 13, color: "#444" }}>
            Projection period: <strong>{fmt(yearsDiff)}</strong> years
          </div>
        ) : null}

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
          Calculate
        </button>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>Results</div>

          <div style={{ fontSize: 14 }}>
            <strong>Months until target age:</strong> {fmt(result.monthsUntilTarget)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Projected monthly premium at age {inputs.targetAge}:</strong> {fmt(result.projectedMonthlyPremium)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Projected annual premium at age {inputs.targetAge}:</strong> {fmt(result.projectedAnnualPremium)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Estimated total paid from age {inputs.currentAge} → {inputs.targetAge}:</strong>{" "}
            {fmt(result.totalPaidFromNowToTarget)}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.noteLines.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>

          <section style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              This calculator uses compound growth: projected premium = current premium × (1 + rate)^(years).
              Total paid is estimated using a geometric series approximation.
            </p>
          </section>

          <section style={{ marginTop: 4, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>FAQ</h2>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Is this accurate for every insurer?</strong>
              <div>No. It’s a directional estimate. Actual pricing depends on underwriting and your profile.</div>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Why use a growth rate?</strong>
              <div>It’s a simple way to model premium drift over time when you don’t have a full pricing table.</div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
