"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  annualTaxableIncome: string; // $
  effectiveTaxRate: string;    // %
  paymentsPerYear: string;     // e.g. 4
};

type Result = {
  annualTaxableIncome: number;
  effectiveTaxRate: number;
  paymentsPerYear: number;
  estimatedAnnualTax: number;
  estimatedPayment: number;
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

export default function EstimatedTaxPaymentCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    annualTaxableIncome: "",
    effectiveTaxRate: "",
    paymentsPerYear: "4",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const annualTaxableIncome = parseNumber(inputs.annualTaxableIncome);
    const effectiveTaxRate = parseNumber(inputs.effectiveTaxRate);
    const paymentsPerYear = parseNumber(inputs.paymentsPerYear);

    if (!Number.isFinite(annualTaxableIncome) || annualTaxableIncome < 0) {
      setError("Annual taxable income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(effectiveTaxRate) || effectiveTaxRate < 0) {
      setError("Effective tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(paymentsPerYear) || paymentsPerYear <= 0) {
      setError("Payments per year must be greater than 0.");
      return;
    }

    const estimatedAnnualTax = annualTaxableIncome * (effectiveTaxRate / 100);
    const estimatedPayment = estimatedAnnualTax / paymentsPerYear;

    setResult({
      annualTaxableIncome,
      effectiveTaxRate,
      paymentsPerYear,
      estimatedAnnualTax,
      estimatedPayment,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Estimated annual taxable income</label>
            <input
              name="annualTaxableIncome"
              value={inputs.annualTaxableIncome}
              onChange={handleChange}
              placeholder="e.g. 100000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Estimated effective tax rate (%)</label>
            <input
              name="effectiveTaxRate"
              value={inputs.effectiveTaxRate}
              onChange={handleChange}
              placeholder="e.g. 20"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Payments per year</label>
            <select
              name="paymentsPerYear"
              value={inputs.paymentsPerYear}
              onChange={handleChange}
            >
              <option value="4">4 (Quarterly)</option>
              <option value="12">12 (Monthly)</option>
              <option value="1">1 (Annual)</option>
            </select>
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate tax payments.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Estimated annual tax: <strong>${money(result.estimatedAnnualTax)}</strong>
            </div>
            <div>
              Payments per year: <strong>{result.paymentsPerYear}</strong>
            </div>
            <div>
              Estimated payment each time: <strong>${money(result.estimatedPayment)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This tool uses a simplified effective-rate estimate. Actual estimated tax rules vary by
        jurisdiction and safe-harbor thresholds.
      </p>
    </div>
  );
}
