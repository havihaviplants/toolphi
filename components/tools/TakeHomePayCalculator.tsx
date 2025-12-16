"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Period = "annual" | "monthly";

type Inputs = {
  grossIncome: string;     // $
  period: Period;          // annual or monthly
  taxRate: string;         // %
  deductions: string;      // $ (same period)
};

type Result = {
  grossIncome: number;
  period: Period;
  taxRate: number;
  deductions: number;
  estimatedTax: number;
  netIncome: number;
  netAnnual: number;
  netMonthly: number;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function money(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function TakeHomePayCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    grossIncome: "",
    period: "annual",
    taxRate: "",
    deductions: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Period;
    setInputs((prev) => ({ ...prev, period: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const grossIncome = parseNumber(inputs.grossIncome);
    const taxRate = parseNumber(inputs.taxRate);
    const deductions = inputs.deductions.trim() ? parseNumber(inputs.deductions) : 0;

    if (!Number.isFinite(grossIncome) || grossIncome < 0) {
      setError("Gross income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      setError("Tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(deductions) || deductions < 0) {
      setError("Deductions must be 0 or greater.");
      return;
    }
    if (deductions > grossIncome) {
      setError("Deductions cannot be greater than gross income (check your inputs).");
      return;
    }

    const estimatedTax = grossIncome * (taxRate / 100);
    const netIncome = grossIncome - estimatedTax - deductions;

    const netAnnual = inputs.period === "annual" ? netIncome : netIncome * 12;
    const netMonthly = inputs.period === "monthly" ? netIncome : netIncome / 12;

    setResult({
      grossIncome,
      period: inputs.period,
      taxRate,
      deductions,
      estimatedTax,
      netIncome,
      netAnnual,
      netMonthly,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Gross income</label>
            <input
              name="grossIncome"
              value={inputs.grossIncome}
              onChange={handleInputChange}
              placeholder="e.g. 90000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Income period</label>
            <select value={inputs.period} onChange={handlePeriodChange}>
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label>Estimated total tax rate (%)</label>
            <input
              name="taxRate"
              value={inputs.taxRate}
              onChange={handleInputChange}
              placeholder="e.g. 22"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Other deductions (optional)</label>
            <input
              name="deductions"
              value={inputs.deductions}
              onChange={handleInputChange}
              placeholder="e.g. 3000"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate take-home pay.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Estimated tax: <strong>${money(result.estimatedTax)}</strong>
            </div>
            <div>
              Deductions: <strong>${money(result.deductions)}</strong>
            </div>
            <div>
              Net pay ({result.period}): <strong>${money(result.netIncome)}</strong>
            </div>
            <div>
              Net monthly (approx): <strong>${money(result.netMonthly)}</strong>
            </div>
            <div>
              Net annual (approx): <strong>${money(result.netAnnual)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This uses a simplified flat tax rate and deductions you enter. Actual take-home pay
        can vary due to brackets, payroll taxes, and local rules.
      </p>
    </div>
  );
}
