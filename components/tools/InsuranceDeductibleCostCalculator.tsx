"use client";
import { useMemo, useState } from "react";

function n(v: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function money(x: number) {
  if (!Number.isFinite(x)) return "-";
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function InsuranceDeductibleCostCalculator() {
  const [annualPremium, setAnnualPremium] = useState("2400");
  const [deductible, setDeductible] = useState("1500");
  const [coinsurancePct, setCoinsurancePct] = useState("20");
  const [oopMax, setOopMax] = useState("6000"); // optional
  const [expectedExpenses, setExpectedExpenses] = useState("10000");

  const result = useMemo(() => {
    const premium = n(annualPremium);
    const ded = n(deductible);
    const coins = clamp01(n(coinsurancePct) / 100);
    const oop = n(oopMax);
    const expenses = n(expectedExpenses);

    if (premium < 0 || ded < 0 || coins < 0 || expenses < 0) return null;

    // Covered expenses out-of-pocket model:
    // pay up to deductible, then coinsurance on the remaining, optionally capped by oopMax.
    const payDeductible = Math.min(expenses, ded);
    const remaining = Math.max(0, expenses - payDeductible);
    const payCoinsurance = remaining * coins;

    let oopForExpenses = payDeductible + payCoinsurance;

    // If out-of-pocket max provided (>0), cap it
    if (oop > 0) oopForExpenses = Math.min(oopForExpenses, oop);

    const totalAnnualCost = premium + oopForExpenses;

    return {
      premium,
      ded,
      coins,
      oop,
      expenses,
      payDeductible,
      payCoinsurance,
      oopForExpenses,
      totalAnnualCost,
    };
  }, [annualPremium, deductible, coinsurancePct, oopMax, expectedExpenses]);

  return (
    <div>
      <label>Annual Premium ($)</label>
      <input
        type="number"
        value={annualPremium}
        onChange={(e) => setAnnualPremium(e.target.value)}
        placeholder="2400"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Deductible ($)</label>
      <input
        type="number"
        value={deductible}
        onChange={(e) => setDeductible(e.target.value)}
        placeholder="1500"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Coinsurance (%) — your share after deductible</label>
      <input
        type="number"
        value={coinsurancePct}
        onChange={(e) => setCoinsurancePct(e.target.value)}
        placeholder="20"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Out-of-Pocket Max ($) (optional)</label>
      <input
        type="number"
        value={oopMax}
        onChange={(e) => setOopMax(e.target.value)}
        placeholder="6000"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Expected Covered Expenses This Year ($)</label>
      <input
        type="number"
        value={expectedExpenses}
        onChange={(e) => setExpectedExpenses(e.target.value)}
        placeholder="10000"
        style={{ width: "100%", marginBottom: 12 }}
      />

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Estimated Total Annual Cost: ${money(result.totalAnnualCost)}</h3>
          <p style={{ color: "#555", marginTop: 6 }}>
            Premium (${money(result.premium)}) + Out-of-pocket for covered expenses (${money(result.oopForExpenses)})
          </p>

          <div style={{ marginTop: 12, color: "#555", fontSize: 14, lineHeight: 1.6 }}>
            <div>
              <strong>Breakdown</strong>
            </div>
            <div>• Deductible paid: ${money(result.payDeductible)}</div>
            <div>
              • Coinsurance paid: ${money(result.payCoinsurance)} ({Math.round(result.coins * 100)}% of remaining covered expenses)
            </div>
            {result.oop > 0 ? (
              <div>• Out-of-pocket max applied: capped at ${money(result.oop)}</div>
            ) : (
              <div>• Out-of-pocket max not used</div>
            )}
          </div>

          <p style={{ marginTop: 12, color: "#777", fontSize: 13, lineHeight: 1.6 }}>
            Notes: This is a simplified estimator. Real plans may include copays, exclusions, tiered networks, and service-specific rules.
          </p>
        </div>
      )}
    </div>
  );
}
