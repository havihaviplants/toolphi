"use client";

import { useState } from "react";

type PlanResult = {
  name: string;
  monthly: number;
  annual: number;
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function IDRPlanComparisonCalculator() {
  const [income, setIncome] = useState("");
  const [results, setResults] = useState<PlanResult[] | null>(null);

  const plans = [
    { name: "IBR", percent: 10 },
    { name: "PAYE", percent: 10 },
    { name: "SAVE", percent: 5 },
    { name: "ICR", percent: 20 },
  ];

  const handleCalculate = () => {
    const annualIncome = Number(income);
    if (!annualIncome) {
      setResults(null);
      return;
    }

    const discretionaryIncome = Math.max(annualIncome - 20000, 0);

    const computed = plans.map((p) => {
      const annual = discretionaryIncome * (p.percent / 100);
      return {
        name: p.name,
        annual,
        monthly: annual / 12,
      };
    });

    setResults(computed);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        IDR Plan Comparison Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Compare income-driven repayment plans side by side.
      </p>

      <label>
        Annual income
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="e.g. 60000"
        />
      </label>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleCalculate}>Compare Plans</button>
      </div>

      {results && (
        <table style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              <th align="left">Plan</th>
              <th align="right">Monthly Payment</th>
              <th align="right">Annual Payment</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td align="right">{formatCurrency(r.monthly)}</td>
                <td align="right">{formatCurrency(r.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {results && (
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Estimates are simplified. Actual eligibility and calculations vary by
          federal rules and year.
        </p>
      )}
    </div>
  );
}
