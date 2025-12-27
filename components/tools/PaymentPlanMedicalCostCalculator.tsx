"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const int = (v: string) => {
  const n = Math.floor(num(v));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

// Standard amortization formula (fixed payment)
// If APR = 0, fallback to simple division.
function monthlyPayment(principal: number, months: number, aprPct: number): number {
  if (months <= 0) return 0;
  const r = (aprPct / 100) / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return principal * (r * pow) / (pow - 1);
}

export default function PaymentPlanMedicalCostCalculator() {
  const [bill, setBill] = useState("");
  const [months, setMonths] = useState("12");
  const [apr, setApr] = useState("0");

  const principal = useMemo(() => num(bill), [bill]);
  const termMonths = useMemo(() => Math.max(1, int(months)), [months]);
  const aprPct = useMemo(() => Math.min(100, num(apr)), [apr]);

  const { mPay, totalPaid, extraCost } = useMemo(() => {
    const mp = monthlyPayment(principal, termMonths, aprPct);
    const total = mp * termMonths;
    const extra = total - principal;
    return {
      mPay: mp,
      totalPaid: total,
      extraCost: extra < 0 ? 0 : extra,
    };
  }, [principal, termMonths, aprPct]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Payment Plan Medical Cost Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate your monthly payment and total cost if you pay a medical bill over time.
        Set APR to 0% if the payment plan is interest-free.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Medical bill amount"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
        />
        <input
          placeholder="Payment plan term (months)"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
        <input
          placeholder="APR (%) (e.g. 8)"
          value={apr}
          onChange={(e) => setApr(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated monthly payment: <strong>{usd(mPay)}</strong></div>
        <div>Total paid over {termMonths} months: <strong>{usd(totalPaid)}</strong></div>
        <div>Extra cost vs paying upfront: <strong>{usd(extraCost)}</strong></div>
      </div>
    </div>
  );
}
