"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  buyPrice: string;   // per coin
  sellPrice: string;  // per coin
  quantity: string;   // coins
  fees: string;       // total fees
  taxRate: string;    // %
};

type Result = {
  grossProceeds: number;
  costBasis: number;
  grossGain: number;
  taxableGain: number;
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

export default function CryptoTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    buyPrice: "",
    sellPrice: "",
    quantity: "",
    fees: "",
    taxRate: "",
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

    const buyPrice = parseNumber(inputs.buyPrice);
    const sellPrice = parseNumber(inputs.sellPrice);
    const quantity = parseNumber(inputs.quantity);
    const fees = inputs.fees.trim() ? parseNumber(inputs.fees) : 0;
    const taxRate = parseNumber(inputs.taxRate);

    if (!Number.isFinite(buyPrice) || buyPrice < 0) {
      setError("Buy price must be a valid number.");
      return;
    }
    if (!Number.isFinite(sellPrice) || sellPrice < 0) {
      setError("Sell price must be a valid number.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    if (!Number.isFinite(fees) || fees < 0) {
      setError("Fees must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0) {
      setError("Tax rate must be 0 or greater.");
      return;
    }

    const grossProceeds = sellPrice * quantity;
    const costBasis = buyPrice * quantity + fees;
    const grossGain = grossProceeds - costBasis;
    const taxableGain = Math.max(grossGain, 0);
    const taxOwed = taxableGain * (taxRate / 100);
    const netProfit = grossGain - taxOwed;

    setResult({
      grossProceeds,
      costBasis,
      grossGain,
      taxableGain,
      taxOwed,
      netProfit,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Buy price per coin</label>
            <input
              name="buyPrice"
              value={inputs.buyPrice}
              onChange={handleChange}
              placeholder="e.g. 30000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Sell price per coin</label>
            <input
              name="sellPrice"
              value={inputs.sellPrice}
              onChange={handleChange}
              placeholder="e.g. 40000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Quantity sold</label>
            <input
              name="quantity"
              value={inputs.quantity}
              onChange={handleChange}
              placeholder="e.g. 0.5"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Total fees (optional)</label>
            <input
              name="fees"
              value={inputs.fees}
              onChange={handleChange}
              placeholder="e.g. 50"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Capital gains tax rate (%)</label>
            <input
              name="taxRate"
              value={inputs.taxRate}
              onChange={handleChange}
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
          <p>Enter values to estimate crypto tax.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Gross proceeds: <strong>${money(result.grossProceeds)}</strong>
            </div>
            <div>
              Cost basis: <strong>${money(result.costBasis)}</strong>
            </div>
            <div>
              Gross gain: <strong>${money(result.grossGain)}</strong>
            </div>
            <div>
              Tax owed: <strong>${money(result.taxOwed)}</strong>
            </div>
            <div>
              Net profit after tax: <strong>${money(result.netProfit)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This is a simplified estimator using a single tax rate. Actual crypto tax may depend
        on lots, holding periods, and local rules.
      </p>
    </div>
  );
}
