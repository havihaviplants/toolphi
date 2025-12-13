"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  annualPayment: number;
};

function parseNumber(v: string): number {
  if (!v) return 0;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function IncomeDrivenRepaymentCalculator() {
  const [income, setIncome] = useState("");
  const [familySize, setFamilySize] = useState("1");
  const [percentage, setPercentage] = useState("10");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const annualIncome = parseNumber(income);
    const pct = parseNumber(percentage);

    if (!annualIncome || !pct) {
      setResult(null);
      return;
    }

    // Simple discretionary-income approximation
    const discretionaryIncome = Math.max(annualIncome - 20000, 0);
    const annualPayment = discretionaryIncome * (pct / 100);
    const monthlyPayment = annualPayment / 12;

    setResult({ monthlyPayment, annualPayment });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        Income-Driven Repayment (IDR) Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Estimate your student loan payment under an income-driven repayment plan.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label>
          Annual income
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 55000"
          />
        </label>

        <label>
          Family size
          <input
            type="number"
            value={familySize}
            onChange={(e) => setFamilySize(e.target.value)}
          />
        </label>

        <label>
          IDR payment percentage (%)
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            step="0.1"
          />
        </label>

        <button onClick={handleCalculate}>Calculate</button>
      </div>

      {result && (
        <div>
          <div>
            <strong>Estimated monthly payment:</strong>{" "}
            {formatCurrency(result.monthlyPayment)}
          </div>
          <div>
            <strong>Estimated annual payment:</strong>{" "}
            {formatCurrency(result.annualPayment)}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            This is a simplified estimate. Actual IDR rules vary by plan and year.
          </div>
        </div>
      )}
    </div>
  );
}
