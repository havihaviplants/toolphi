"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  purchasePrice: string;
  salePrice: string;
  taxRate: string;
  holdingType: "short" | "long";
};

type Result = {
  capitalGain: number;
  taxOwed: number;
  netProfit: number;
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

export default function CapitalGainsTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    purchasePrice: "",
    salePrice: "",
    taxRate: "",
    holdingType: "long",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const purchasePrice = parseNumber(inputs.purchasePrice);
    const salePrice = parseNumber(inputs.salePrice);
    const taxRate = parseNumber(inputs.taxRate);

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      setError("Purchase price must be a valid number.");
      return;
    }
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      setError("Sale price must be a valid number.");
      return;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      setError("Tax rate must be 0 or greater.");
      return;
    }

    const capitalGain = salePrice - purchasePrice;
    const taxableGain = Math.max(capitalGain, 0);
    const taxOwed = taxableGain * (taxRate / 100);
    const netProfit = taxableGain - taxOwed;

    setResult({
      capitalGain,
      taxOwed,
      netProfit,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Purchase price</label>
            <input
              name="purchasePrice"
              value={inputs.purchasePrice}
              onChange={handleChange}
              placeholder="e.g. 10000"
            />
          </div>

          <div>
            <label>Sale price</label>
            <input
              name="salePrice"
              value={inputs.salePrice}
              onChange={handleChange}
              placeholder="e.g. 15000"
            />
          </div>

          <div>
            <label>Holding period</label>
            <select
              name="holdingType"
              value={inputs.holdingType}
              onChange={handleChange}
            >
              <option value="long">Long-term</option>
              <option value="short">Short-term</option>
            </select>
          </div>

          <div>
            <label>Capital gains tax rate (%)</label>
            <input
              name="taxRate"
              value={inputs.taxRate}
              onChange={handleChange}
              placeholder="e.g. 15"
            />
          </div>

          <button type="submit">Calculate</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to calculate capital gains tax.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>Capital gain: <strong>${money(result.capitalGain)}</strong></div>
            <div>Tax owed: <strong>${money(result.taxOwed)}</strong></div>
            <div>Net profit after tax: <strong>${money(result.netProfit)}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}
