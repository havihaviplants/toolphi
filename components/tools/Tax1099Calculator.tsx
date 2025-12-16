"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  netIncome: string;        // annual, after expenses
  seTaxRate: string;        // %
  incomeTaxRate: string;    // %
};

type Result = {
  netIncome: number;
  seTax: number;
  incomeTax: number;
  totalTax: number;
  takeHome: number;
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

export default function Tax1099Calculator() {
  const [inputs, setInputs] = useState<Inputs>({
    netIncome: "",
    seTaxRate: "15.3",
    incomeTaxRate: "",
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

    const netIncome = parseNumber(inputs.netIncome);
    const seTaxRate = parseNumber(inputs.seTaxRate);
    const incomeTaxRate = parseNumber(inputs.incomeTaxRate);

    if (!Number.isFinite(netIncome) || netIncome < 0) {
      setError("Net 1099 income must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(seTaxRate) || seTaxRate < 0) {
      setError("Self-employment tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(incomeTaxRate) || incomeTaxRate < 0) {
      setError("Income tax rate must be 0 or greater.");
      return;
    }

    const seTax = netIncome * (seTaxRate / 100);
    const incomeTax = netIncome * (incomeTaxRate / 100);
    const totalTax = seTax + incomeTax;
    const takeHome = netIncome - totalTax;

    setResult({
      netIncome,
      seTax,
      incomeTax,
      totalTax,
      takeHome,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Annual net 1099 income (after expenses)</label>
            <input
              name="netIncome"
              value={inputs.netIncome}
              onChange={handleChange}
              placeholder="e.g. 80000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Estimated self-employment tax rate (%)</label>
            <input
              name="seTaxRate"
              value={inputs.seTaxRate}
              onChange={handleChange}
              placeholder="e.g. 15.3"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Estimated income tax rate (%)</label>
            <input
              name="incomeTaxRate"
              value={inputs.incomeTaxRate}
              onChange={handleChange}
              placeholder="e.g. 12"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate 1099 taxes and take-home pay.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Net 1099 income: <strong>${money(result.netIncome)}</strong>
            </div>
            <div>
              Self-employment tax: <strong>${money(result.seTax)}</strong>
            </div>
            <div>
              Income tax: <strong>${money(result.incomeTax)}</strong>
            </div>
            <div>
              Total tax: <strong>${money(result.totalTax)}</strong>
            </div>
            <div>
              Take-home pay: <strong>${money(result.takeHome)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This is a simplified estimator using flat rates you enter. Actual 1099 taxes depend on
        deductions, credits, brackets, and filing status.
      </p>
    </div>
  );
}
