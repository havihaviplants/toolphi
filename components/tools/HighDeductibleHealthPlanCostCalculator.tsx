"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

export default function HighDeductibleHealthPlanCostCalculator() {
  const [monthlyPremium, setMonthlyPremium] = useState("");
  const [annualDeductible, setAnnualDeductible] = useState("");
  const [expectedSpending, setExpectedSpending] = useState("");

  const premiumAnnual = useMemo(() => num(monthlyPremium) * 12, [monthlyPremium]);

  const deductible = useMemo(() => num(annualDeductible), [annualDeductible]);
  const spending = useMemo(() => num(expectedSpending), [expectedSpending]);

  // Simple estimate: you pay up to deductible (before coinsurance phase)
  const outOfPocket = useMemo(() => Math.min(spending, deductible), [spending, deductible]);

  const totalAnnualCost = useMemo(() => premiumAnnual + outOfPocket, [premiumAnnual, outOfPocket]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>High Deductible Health Plan Cost Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate your annual cost under a high-deductible health plan (HDHP) using premiums and
        expected medical spending up to the deductible.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Monthly premium"
          value={monthlyPremium}
          onChange={(e) => setMonthlyPremium(e.target.value)}
        />
        <input
          placeholder="Annual deductible"
          value={annualDeductible}
          onChange={(e) => setAnnualDeductible(e.target.value)}
        />
        <input
          placeholder="Expected annual medical spending"
          value={expectedSpending}
          onChange={(e) => setExpectedSpending(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated annual premium: <strong>{usd(premiumAnnual)}</strong></div>
        <div>Estimated out-of-pocket (up to deductible): <strong>{usd(outOfPocket)}</strong></div>
        <div style={{ marginTop: 6 }}>
          Estimated total annual cost: <strong>{usd(totalAnnualCost)}</strong>
        </div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Note: This simplified estimate assumes your cost-sharing before coinsurance is capped by the deductible.
        Plans vary (coinsurance, out-of-pocket max). Use for quick comparisons.
      </p>
    </div>
  );
}
