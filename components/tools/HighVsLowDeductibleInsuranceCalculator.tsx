"use client";
import { useMemo, useState } from "react";

const n = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pct = (v: string) => Math.min(Math.max(n(v) / 100, 0), 1);
const money = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-";

function calcTotalCost(
  premium: number,
  deductible: number,
  coinsurance: number,
  expenses: number
) {
  const payDeductible = Math.min(expenses, deductible);
  const remaining = Math.max(0, expenses - payDeductible);
  const payCoinsurance = remaining * coinsurance;
  return premium + payDeductible + payCoinsurance;
}

export default function HighVsLowDeductibleInsuranceCalculator() {
  const [highPremium, setHighPremium] = useState("1800");
  const [highDed, setHighDed] = useState("3000");
  const [highCoins, setHighCoins] = useState("20");

  const [lowPremium, setLowPremium] = useState("3200");
  const [lowDed, setLowDed] = useState("500");
  const [lowCoins, setLowCoins] = useState("10");

  const [expenses, setExpenses] = useState("6000");

  const result = useMemo(() => {
    const exp = n(expenses);

    const highTotal = calcTotalCost(
      n(highPremium),
      n(highDed),
      pct(highCoins),
      exp
    );

    const lowTotal = calcTotalCost(
      n(lowPremium),
      n(lowDed),
      pct(lowCoins),
      exp
    );

    return { highTotal, lowTotal };
  }, [
    highPremium,
    highDed,
    highCoins,
    lowPremium,
    lowDed,
    lowCoins,
    expenses,
  ]);

  return (
    <div>
      <h3>High Deductible Plan</h3>
      <input value={highPremium} onChange={e => setHighPremium(e.target.value)} placeholder="Annual Premium" />
      <input value={highDed} onChange={e => setHighDed(e.target.value)} placeholder="Deductible" />
      <input value={highCoins} onChange={e => setHighCoins(e.target.value)} placeholder="Coinsurance %" />

      <h3 style={{ marginTop: 16 }}>Low Deductible Plan</h3>
      <input value={lowPremium} onChange={e => setLowPremium(e.target.value)} placeholder="Annual Premium" />
      <input value={lowDed} onChange={e => setLowDed(e.target.value)} placeholder="Deductible" />
      <input value={lowCoins} onChange={e => setLowCoins(e.target.value)} placeholder="Coinsurance %" />

      <h3 style={{ marginTop: 16 }}>Expected Covered Expenses</h3>
      <input value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="Expected expenses" />

      <div style={{ marginTop: 20 }}>
        <h3>Results</h3>
        <p>High Deductible Total Cost: ${money(result.highTotal)}</p>
        <p>Low Deductible Total Cost: ${money(result.lowTotal)}</p>
        <p style={{ fontWeight: "bold" }}>
          Cheaper Option:{" "}
          {result.highTotal < result.lowTotal ? "High Deductible" : "Low Deductible"}
        </p>
      </div>
    </div>
  );
}
