// components/tools/BreakEvenUnitsCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  fixedCosts: string;
  pricePerUnit: string;
  variableCostPerUnit: string;
};

type Result = {
  contributionMargin: number;   // price - variable
  breakevenUnits: number;
  breakevenRevenue: number;
};

function parseNumber(value: string): number {
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function formatNumber(value: number): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function formatCurrency(value: number): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function BreakEvenUnitsCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    fixedCosts: "",
    pricePerUnit: "",
    variableCostPerUnit: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const fixedCosts = parseNumber(inputs.fixedCosts);
    const pricePerUnit = parseNumber(inputs.pricePerUnit);
    const variableCostPerUnit = parseNumber(inputs.variableCostPerUnit);

    const contributionMargin = pricePerUnit - variableCostPerUnit;

    if (pricePerUnit <= 0) {
      setError("Price per unit must be greater than 0.");
      setResult(null);
      return;
    }

    if (contributionMargin <= 0) {
      setError(
        "Contribution margin must be positive. Try increasing the price or decreasing variable costs.",
      );
      setResult(null);
      return;
    }

    const breakevenUnits = fixedCosts / contributionMargin;
    const breakevenRevenue = breakevenUnits * pricePerUnit;

    setResult({
      contributionMargin,
      breakevenUnits,
      breakevenRevenue,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        backgroundColor: "#ffffff",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
        Break-even Units Calculator
      </h2>
      <p style={{ fontSize: 14, color: "#586069", marginBottom: 16 }}>
        Find out how many units you need to sell to cover all of your fixed costs, given your price
        and variable cost per unit.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Total fixed costs (per month)</label>
            <input
              name="fixedCosts"
              value={inputs.fixedCosts}
              onChange={handleChange}
              placeholder="e.g. 15000"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Selling price per unit</label>
            <input
              name="pricePerUnit"
              value={inputs.pricePerUnit}
              onChange={handleChange}
              placeholder="e.g. 50"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Variable cost per unit</label>
            <input
              name="variableCostPerUnit"
              value={inputs.variableCostPerUnit}
              onChange={handleChange}
              placeholder="e.g. 30"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#0366d6",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Calculate break-even point
          </button>

          {error && (
            <p style={{ color: "#d73a49", fontSize: 13, marginTop: 4 }}>
              {error}
            </p>
          )}
        </div>

        <div
          style={{
            borderRadius: 8,
            border: "1px solid #e1e4e8",
            padding: 16,
            backgroundColor: "#f6f8fa",
            minHeight: 140,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Results</h3>
          {!result && (
            <p style={{ fontSize: 13, color: "#586069" }}>
              Enter your costs and price, then click{" "}
              <strong>"Calculate break-even point"</strong> to see the required units.
            </p>
          )}

          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <div>
                <strong>Contribution margin per unit: </strong>
                {formatCurrency(result.contributionMargin)}
              </div>
              <div>
                <strong>Break-even units: </strong>
                {formatNumber(Math.ceil(result.breakevenUnits))}
              </div>
              <div>
                <strong>Break-even revenue: </strong>
                {formatCurrency(result.breakevenRevenue)}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
