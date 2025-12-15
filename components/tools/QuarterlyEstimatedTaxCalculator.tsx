"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  annualTaxableIncome: string; // $
  effectiveTaxRate: string; // %
  annualWithholding: string; // $ optional
  paymentsAlreadyMade: string; // $ optional
  quartersRemaining: string; // 1~4
};

type Result = {
  estimatedAnnualTax: number;
  totalCredits: number; // withholding + already paid
  remainingTax: number;
  paymentPerRemainingQuarter: number;
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

export default function QuarterlyEstimatedTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    annualTaxableIncome: "",
    effectiveTaxRate: "",
    annualWithholding: "",
    paymentsAlreadyMade: "",
    quartersRemaining: "4",
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

    const annualWithholding = inputs.annualWithholding.trim()
      ? parseNumber(inputs.annualWithholding)
      : 0;

    const paymentsAlreadyMade = inputs.paymentsAlreadyMade.trim()
      ? parseNumber(inputs.paymentsAlreadyMade)
      : 0;

    const quartersRemaining = parseNumber(inputs.quartersRemaining);

    if (!Number.isFinite(annualTaxableIncome) || annualTaxableIncome < 0) {
      setError("Annual taxable income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(effectiveTaxRate) || effectiveTaxRate < 0) {
      setError("Effective tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(annualWithholding) || annualWithholding < 0) {
      setError("Annual withholding must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(paymentsAlreadyMade) || paymentsAlreadyMade < 0) {
      setError("Payments already made must be 0 or greater.");
      return;
    }
    if (
      !Number.isFinite(quartersRemaining) ||
      quartersRemaining < 1 ||
      quartersRemaining > 4
    ) {
      setError("Quarters remaining must be between 1 and 4.");
      return;
    }

    const estimatedAnnualTax = annualTaxableIncome * (effectiveTaxRate / 100);
    const totalCredits = annualWithholding + paymentsAlreadyMade;
    const remainingTax = Math.max(estimatedAnnualTax - totalCredits, 0);
    const paymentPerRemainingQuarter = remainingTax / quartersRemaining;

    setResult({
      estimatedAnnualTax,
      totalCredits,
      remainingTax,
      paymentPerRemainingQuarter,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <label>Expected annual taxable income</label>
            <input
              name="annualTaxableIncome"
              value={inputs.annualTaxableIncome}
              onChange={handleChange}
              placeholder="e.g. 120000"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "grid", gap: 4 }}>
            <label>Estimated effective tax rate (%)</label>
            <input
              name="effectiveTaxRate"
              value={inputs.effectiveTaxRate}
              onChange={handleChange}
              placeholder="e.g. 20"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label>Annual withholding (optional)</label>
              <input
                name="annualWithholding"
                value={inputs.annualWithholding}
                onChange={handleChange}
                placeholder="e.g. 5000"
                inputMode="decimal"
              />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              <label>Estimated payments already made (optional)</label>
              <input
                name="paymentsAlreadyMade"
                value={inputs.paymentsAlreadyMade}
                onChange={handleChange}
                placeholder="e.g. 2000"
                inputMode="decimal"
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: 4 }}>
            <label>Quarters remaining this year</label>
            <select
              name="quartersRemaining"
              value={inputs.quartersRemaining}
              onChange={handleChange}
            >
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </div>

          <button type="submit">Calculate</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate quarterly tax payments.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Estimated annual tax: <strong>${money(result.estimatedAnnualTax)}</strong>
            </div>
            <div>
              Withholding + payments already made: <strong>${money(result.totalCredits)}</strong>
            </div>
            <div>
              Remaining tax to pay: <strong>${money(result.remainingTax)}</strong>
            </div>
            <div>
              Payment per remaining quarter:{" "}
              <strong>${money(result.paymentPerRemainingQuarter)}</strong>
            </div>

            <p style={{ marginTop: 8, fontSize: 13, color: "#333" }}>
              Note: This is a simplified estimator using an effective tax rate. Actual IRS estimated
              tax rules and safe harbor thresholds may differ based on your situation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
