"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  revenue: string;
  cogsRate: string;   // cost of goods sold rate (%)
  rent: string;
  payroll: string;
  otherFixed: string;
};

type Result = {
  grossProfit: number;
  netProfit: number;
  netMargin: number;        // 0.25 = 25%
  breakEvenRevenue: number; // revenue at which net profit ≈ 0
};

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return (value * 100).toFixed(1);
}

export default function StoreProfitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    revenue: "",
    cogsRate: "60",
    rent: "",
    payroll: "",
    otherFixed: "",
  });

  const [result, setResult] = useState<Result | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const revenue = parseNumber(inputs.revenue);
    const cogsRate = parseNumber(inputs.cogsRate) / 100;
    const rent = parseNumber(inputs.rent);
    const payroll = parseNumber(inputs.payroll);
    const otherFixed = parseNumber(inputs.otherFixed);

    const fixedCosts = rent + payroll + otherFixed;
    const grossProfit = revenue - revenue * cogsRate;
    const netProfit = grossProfit - fixedCosts;
    const netMargin = revenue > 0 ? netProfit / revenue : 0;

    let breakEvenRevenue = NaN;
    if (cogsRate < 1) {
      const contributionMarginRate = 1 - cogsRate;
      if (contributionMarginRate > 0) {
        breakEvenRevenue = fixedCosts / contributionMarginRate;
      }
    }

    setResult({
      grossProfit,
      netProfit,
      netMargin,
      breakEvenRevenue,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
        Enter your monthly numbers to see gross profit, net profit and
        break-even revenue for your store.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13 }}>Monthly revenue</label>
          <input
            name="revenue"
            value={inputs.revenue}
            onChange={handleChange}
            placeholder="e.g. 30000"
            inputMode="decimal"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13 }}>COGS rate (%)</label>
          <input
            name="cogsRate"
            value={inputs.cogsRate}
            onChange={handleChange}
            placeholder="e.g. 60"
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
          <label style={{ fontSize: 13 }}>Monthly rent</label>
          <input
            name="rent"
            value={inputs.rent}
            onChange={handleChange}
            placeholder="e.g. 5000"
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
          <label style={{ fontSize: 13 }}>Monthly payroll</label>
          <input
            name="payroll"
            value={inputs.payroll}
            onChange={handleChange}
            placeholder="e.g. 8000"
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
          <label style={{ fontSize: 13 }}>Other fixed costs</label>
          <input
            name="otherFixed"
            value={inputs.otherFixed}
            onChange={handleChange}
            placeholder="e.g. 2000"
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
            padding: "10px 14px",
            borderRadius: 6,
            border: "none",
            background: "#0366d6",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 16,
          }}
        >
          Calculate profit
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 8,
            background: "#f6f8fa",
            border: "1px solid #e1e4e8",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 14,
          }}
        >
          <div>
            <strong>Gross profit: </strong>
            {formatCurrency(result.grossProfit)}
          </div>
          <div>
            <strong>Net profit: </strong>
            {formatCurrency(result.netProfit)}
          </div>
          <div>
            <strong>Net profit margin: </strong>
            {formatPercent(result.netMargin)}%
          </div>
          <div>
            <strong>Break-even revenue: </strong>
            {formatCurrency(result.breakEvenRevenue)}
          </div>
        </div>
      )}
    </div>
  );
}
