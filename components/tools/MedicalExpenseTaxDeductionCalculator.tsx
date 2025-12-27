"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

export default function MedicalExpenseTaxDeductionCalculator() {
  const [agi, setAgi] = useState("");
  const [medicalExpenses, setMedicalExpenses] = useState("");
  const [thresholdPct, setThresholdPct] = useState("7.5");

  const agiNum = useMemo(() => num(agi), [agi]);
  const expNum = useMemo(() => num(medicalExpenses), [medicalExpenses]);
  const pct = useMemo(() => clamp(num(thresholdPct), 0, 100), [thresholdPct]);

  const thresholdAmount = useMemo(() => agiNum * (pct / 100), [agiNum, pct]);

  const deductible = useMemo(() => {
    const d = expNum - thresholdAmount;
    return d > 0 ? d : 0;
  }, [expNum, thresholdAmount]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Medical Expense Tax Deduction Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how much of your medical expenses may be tax-deductible based on your AGI and a
        threshold percentage (often 7.5%).
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Adjusted Gross Income (AGI)"
          value={agi}
          onChange={(e) => setAgi(e.target.value)}
        />
        <input
          placeholder="Qualified medical expenses"
          value={medicalExpenses}
          onChange={(e) => setMedicalExpenses(e.target.value)}
        />
        <input
          placeholder="Threshold (%) (e.g. 7.5)"
          value={thresholdPct}
          onChange={(e) => setThresholdPct(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Threshold amount: <strong>{usd(thresholdAmount)}</strong></div>
        <div>Estimated deductible medical expenses: <strong>{usd(deductible)}</strong></div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Note: Tax rules vary. This tool provides an estimate for planning and comparison purposes.
      </p>
    </div>
  );
}
