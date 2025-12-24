"use client";
import { useMemo, useState } from "react";

const n = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pct01 = (v: string) => Math.min(Math.max(n(v) / 100, 0), 1);
const money = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-";

function totalCost(premium: number, deductible: number, coinsurance: number, expenses: number) {
  const payDeductible = Math.min(expenses, deductible);
  const remaining = Math.max(0, expenses - payDeductible);
  const payCoinsurance = remaining * coinsurance;
  return {
    payDeductible,
    payCoinsurance,
    total: premium + payDeductible + payCoinsurance,
  };
}

type PlanKey = "basic" | "standard" | "full";

export default function InsuranceCoverageLevelCostComparisonCalculator() {
  // Basic
  const [basicPremium, setBasicPremium] = useState("1800");
  const [basicDed, setBasicDed] = useState("3000");
  const [basicCoins, setBasicCoins] = useState("30");

  // Standard
  const [standardPremium, setStandardPremium] = useState("2600");
  const [standardDed, setStandardDed] = useState("1500");
  const [standardCoins, setStandardCoins] = useState("20");

  // Full
  const [fullPremium, setFullPremium] = useState("3400");
  const [fullDed, setFullDed] = useState("500");
  const [fullCoins, setFullCoins] = useState("10");

  const [expenses, setExpenses] = useState("6000");

  const result = useMemo(() => {
    const exp = n(expenses);

    const basic = totalCost(n(basicPremium), n(basicDed), pct01(basicCoins), exp);
    const standard = totalCost(
      n(standardPremium),
      n(standardDed),
      pct01(standardCoins),
      exp
    );
    const full = totalCost(n(fullPremium), n(fullDed), pct01(fullCoins), exp);

    const rows: Array<{ key: PlanKey; label: string; total: number; ded: number; coins: number }> = [
      { key: "basic", label: "Basic", total: basic.total, ded: basic.payDeductible, coins: basic.payCoinsurance },
      { key: "standard", label: "Standard", total: standard.total, ded: standard.payDeductible, coins: standard.payCoinsurance },
      { key: "full", label: "Full", total: full.total, ded: full.payDeductible, coins: full.payCoinsurance },
    ];

    const sorted = [...rows].sort((a, b) => a.total - b.total);
    return { rows, sorted };
  }, [
    basicPremium,
    basicDed,
    basicCoins,
    standardPremium,
    standardDed,
    standardCoins,
    fullPremium,
    fullDed,
    fullCoins,
    expenses,
  ]);

  const cheapest = result.sorted[0];

  return (
    <div>
      <p style={{ marginBottom: 12, color: "#555" }}>
        Enter plan details and your expected covered expenses. We estimate total annual cost as:
        <br />
        <strong>Total = Premium + Deductible Paid + Coinsurance on remaining expenses</strong>
      </p>

      <h3>Basic Coverage</h3>
      <input
        type="number"
        value={basicPremium}
        onChange={(e) => setBasicPremium(e.target.value)}
        placeholder="Annual Premium"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={basicDed}
        onChange={(e) => setBasicDed(e.target.value)}
        placeholder="Deductible"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={basicCoins}
        onChange={(e) => setBasicCoins(e.target.value)}
        placeholder="Coinsurance %"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <h3>Standard Coverage</h3>
      <input
        type="number"
        value={standardPremium}
        onChange={(e) => setStandardPremium(e.target.value)}
        placeholder="Annual Premium"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={standardDed}
        onChange={(e) => setStandardDed(e.target.value)}
        placeholder="Deductible"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={standardCoins}
        onChange={(e) => setStandardCoins(e.target.value)}
        placeholder="Coinsurance %"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <h3>Full Coverage</h3>
      <input
        type="number"
        value={fullPremium}
        onChange={(e) => setFullPremium(e.target.value)}
        placeholder="Annual Premium"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={fullDed}
        onChange={(e) => setFullDed(e.target.value)}
        placeholder="Deductible"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        value={fullCoins}
        onChange={(e) => setFullCoins(e.target.value)}
        placeholder="Coinsurance %"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <h3>Expected Covered Expenses (per year)</h3>
      <input
        type="number"
        value={expenses}
        onChange={(e) => setExpenses(e.target.value)}
        placeholder="Expected expenses"
        style={{ width: "100%", marginBottom: 16 }}
      />

      <div style={{ marginTop: 10 }}>
        <h3>Results</h3>
        <p style={{ fontWeight: "bold" }}>
          Cheapest (estimated): {cheapest.label} — ${money(cheapest.total)}
        </p>

        <div style={{ marginTop: 8, color: "#555", fontSize: 14, lineHeight: 1.7 }}>
          {result.sorted.map((r) => (
            <div key={r.key}>
              • {r.label}: Total ${money(r.total)} (Deductible paid ${money(r.ded)} + Coinsurance ${money(r.coins)})
            </div>
          ))}
        </div>

        <p style={{ marginTop: 12, color: "#777", fontSize: 13, lineHeight: 1.6 }}>
          Note: This is a simplified model. Real plans can include copays, exclusions, networks, and service-specific rules.
        </p>
      </div>
    </div>
  );
}
