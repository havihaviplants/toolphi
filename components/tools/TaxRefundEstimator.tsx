"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  taxableIncome: string;    // $
  effectiveTaxRate: string; // %
  taxesWithheld: string;    // $
  credits: string;          // $
};

type Result = {
  taxableIncome: number;
  effectiveTaxRate: number;
  taxesWithheld: number;
  credits: number;
  estimatedTotalTax: number;
  refundOrOwed: number; // + = refund, - = owed
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

export default function TaxRefundEstimator() {
  const [inputs, setInputs] = useState<Inputs>({
    taxableIncome: "",
    effectiveTaxRate: "",
    taxesWithheld: "",
    credits: "",
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

    const taxableIncome = parseNumber(inputs.taxableIncome);
    const effectiveTaxRate = parseNumber(inputs.effectiveTaxRate);
    const taxesWithheld = inputs.taxesWithheld.trim() ? parseNumber(inputs.taxesWithheld) : 0;
    const credits = inputs.credits.trim() ? parseNumber(inputs.credits) : 0;

    if (!Number.isFinite(taxableIncome) || taxableIncome < 0) {
      setError("Taxable income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(effectiveTaxRate) || effectiveTaxRate < 0) {
      setError("Effective tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(taxesWithheld) || taxesWithheld < 0) {
      setError("Taxes withheld must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(credits) || credits < 0) {
      setError("Credits must be 0 or greater.");
      return;
    }

    const rawTax = taxableIncome * (effectiveTaxRate / 100);
    const estimatedTotalTax = Math.max(rawTax - credits, 0);

    // Refund positive if withheld > tax, owed negative if tax > withheld
    const refundOrOwed = taxesWithheld - estimatedTotalTax;

    setResult({
      taxableIncome,
      effectiveTaxRate,
      taxesWithheld,
      credits,
      estimatedTotalTax,
      refundOrOwed,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Estimated taxable income</label>
            <input
              name="taxableIncome"
              value={inputs.taxableIncome}
              onChange={handleChange}
              placeholder="e.g. 80000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Estimated effective tax rate (%)</label>
            <input
              name="effectiveTaxRate"
              value={inputs.effectiveTaxRate}
              onChange={handleChange}
              placeholder="e.g. 18"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Total taxes withheld / already paid</label>
            <input
              name="taxesWithheld"
              value={inputs.taxesWithheld}
              onChange={handleChange}
              placeholder="e.g. 16000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Tax credits (optional, reduces total tax)</label>
            <input
              name="credits"
              value={inputs.credits}
              onChange={handleChange}
              placeholder="e.g. 1000"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate your tax refund or amount owed.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Estimated total tax: <strong>${money(result.estimatedTotalTax)}</strong>
            </div>
            <div>
              Taxes withheld: <strong>${money(result.taxesWithheld)}</strong>
            </div>

            {result.refundOrOwed > 0 ? (
              <div>
                Estimated refund: <strong>${money(result.refundOrOwed)}</strong>
              </div>
            ) : result.refundOrOwed < 0 ? (
              <div>
                Estimated amount owed: <strong>${money(Math.abs(result.refundOrOwed))}</strong>
              </div>
            ) : (
              <div>
                Balance: <strong>$0</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This is a simplified estimator using a flat effective rate. Actual refunds depend on
        brackets, withholding, credits, and local rules.
      </p>
    </div>
  );
}
