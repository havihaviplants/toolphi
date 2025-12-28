"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

export default function MedicalBillNegotiationChanceCalculator() {
  const [bill, setBill] = useState("");
  const [discountPct, setDiscountPct] = useState("25");
  const [successChancePct, setSuccessChancePct] = useState("40");

  const original = useMemo(() => num(bill), [bill]);
  const discount = useMemo(() => clamp(num(discountPct), 0, 100), [discountPct]);
  const chance = useMemo(() => clamp(num(successChancePct), 0, 100), [successChancePct]);

  const { savingsIfSuccessful, expectedSavings, expectedFinalBill } = useMemo(() => {
    const saveIf = original * (discount / 100);
    const expected = saveIf * (chance / 100);
    return {
      savingsIfSuccessful: saveIf,
      expectedSavings: expected,
      expectedFinalBill: Math.max(0, original - expected),
    };
  }, [original, discount, chance]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Medical Bill Negotiation Chance Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate expected savings from negotiating a medical bill by factoring in both a discount rate and
        your chance of success.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Original medical bill"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
        />
        <input
          placeholder="Target discount (%)"
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
        />
        <input
          placeholder="Chance of success (%)"
          value={successChancePct}
          onChange={(e) => setSuccessChancePct(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>
          Savings if successful: <strong>{usd(savingsIfSuccessful)}</strong>
        </div>
        <div>
          Expected savings (discount × chance): <strong>{usd(expectedSavings)}</strong>
        </div>
        <div style={{ marginTop: 6 }}>
          Expected final bill: <strong>{usd(expectedFinalBill)}</strong>
        </div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Tip: If expected savings are meaningful, negotiation may be worth your time.
        If not, compare payment plans or other financing options.
      </p>
    </div>
  );
}
