"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  taxableIncome: string;   // $
  effectiveTaxRate: string; // %
  alreadyPaid: string;     // $ (withholding/estimated payments)
  credits: string;         // $ (reduce total tax)
};

type Result = {
  taxableIncome: number;
  effectiveTaxRate: number;
  alreadyPaid: number;
  credits: number;
  estimatedTotalTax: number;
  balance: number; // + = owe, - = refund
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

export default function HowMuchTaxDoIOweCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    taxableIncome: "",
    effectiveTaxRate: "",
    alreadyPaid: "",
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
    const alreadyPaid = inputs.alreadyPaid.trim() ? parseNumber(inputs.alreadyPaid) : 0;
    const credits = inputs.credits.trim() ? parseNumber(inputs.credits) : 0;

    if (!Number.isFinite(taxableIncome) || taxableIncome < 0) {
      setError("Taxable income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(effectiveTaxRate) || effectiveTaxRate < 0) {
      setError("Effective tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(alreadyPaid) || alreadyPaid < 0) {
      setError("Taxes already paid must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(credits) || credits < 0) {
      setError("Credits must be 0 or greater.");
      return;
    }

    const rawTax = taxableIncome * (effectiveTaxRate / 100);
    const estimatedTotalTax = Math.max(rawTax - credits, 0);
    const balance = estimatedTotalTax - alreadyPaid; // + owe, - refund

    setResult({
      taxableIncome,
      effectiveTaxRate,
      alreadyPaid,
      credits,
      estimatedTotalTax,
      balance,
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
            <label>Taxes already paid / withheld (optional)</label>
            <input
              name="alreadyPaid"
              value={inputs.alreadyPaid}
              onChange={handleChange}
              placeholder="e.g. 15000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Credits (optional, reduces total tax)</label>
            <input
              name="credits"
              value={inputs.credits}
              onChange={handleChange}
              placeholder="e.g. 2000"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate tax owed or refund.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Estimated total tax: <strong>${money(result.estimatedTotalTax)}</strong>
            </div>
            <div>
              Already paid: <strong>${money(result.alreadyPaid)}</strong>
            </div>

            {result.balance > 0 ? (
              <div>
                Estimated remaining owed: <strong>${money(result.balance)}</strong>
              </div>
            ) : result.balance < 0 ? (
              <div>
                Estimated refund: <strong>${money(Math.abs(result.balance))}</strong>
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
        Note: This is a simplified estimate using a flat effective rate. Actual taxes depend on
        brackets, filing status, payroll taxes, and local rules.
      </p>
    </div>
  );
}
