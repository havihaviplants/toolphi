"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type DividendType = "qualified" | "ordinary";

type Inputs = {
  dividendAmount: string; // $
  dividendType: DividendType;
  taxRate: string; // %
};

type Result = {
  dividendAmount: number;
  taxOwed: number;
  netDividends: number;
  dividendType: DividendType;
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

export default function DividendTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    dividendAmount: "",
    dividendType: "qualified",
    taxRate: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DividendType;
    setInputs((prev) => ({ ...prev, dividendType: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const dividendAmount = parseNumber(inputs.dividendAmount);
    const taxRate = parseNumber(inputs.taxRate);

    if (!Number.isFinite(dividendAmount) || dividendAmount < 0) {
      setError("Dividend amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      setError("Tax rate must be 0 or greater.");
      return;
    }

    const taxOwed = dividendAmount * (taxRate / 100);
    const netDividends = dividendAmount - taxOwed;

    setResult({
      dividendAmount,
      taxOwed,
      netDividends,
      dividendType: inputs.dividendType,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Total dividend amount</label>
            <input
              name="dividendAmount"
              value={inputs.dividendAmount}
              onChange={handleInputChange}
              placeholder="e.g. 5000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Dividend type</label>
            <select value={inputs.dividendType} onChange={handleTypeChange}>
              <option value="qualified">Qualified dividends</option>
              <option value="ordinary">Ordinary dividends</option>
            </select>
          </div>

          <div>
            <label>Tax rate for this dividend type (%)</label>
            <input
              name="taxRate"
              value={inputs.taxRate}
              onChange={handleInputChange}
              placeholder="e.g. 15"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate dividend tax.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Dividend type:{" "}
              <strong>
                {result.dividendType === "qualified"
                  ? "Qualified dividends"
                  : "Ordinary dividends"}
              </strong>
            </div>
            <div>
              Dividend amount: <strong>${money(result.dividendAmount)}</strong>
            </div>
            <div>
              Tax owed: <strong>${money(result.taxOwed)}</strong>
            </div>
            <div>
              Net dividends: <strong>${money(result.netDividends)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This estimator applies a single rate you enter. Real dividend taxation can depend on
        filing status, income thresholds, and jurisdiction.
      </p>
    </div>
  );
}
