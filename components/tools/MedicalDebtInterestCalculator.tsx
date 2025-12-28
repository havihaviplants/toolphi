"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const int = (v: string) => Math.max(1, Math.floor(num(v)));

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

// Standard amortization (fixed payment)
function monthlyPayment(balance: number, months: number, aprPct: number) {
  const r = (aprPct / 100) / 12;
  if (r === 0) return balance / months;
  const p = Math.pow(1 + r, months);
  return balance * (r * p) / (p - 1);
}

export default function MedicalDebtInterestCalculator() {
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("12");
  const [months, setMonths] = useState("24");

  const b = useMemo(() => num(balance), [balance]);
  const a = useMemo(() => Math.min(100, num(apr)), [apr]);
  const m = useMemo(() => int(months), [months]);

  const { monthly, totalPaid, interest } = useMemo(() => {
    const mp = monthlyPayment(b, m, a);
    const total = mp * m;
    return {
      monthly: mp,
      totalPaid: total,
      interest: Math.max(0, total - b),
    };
  }, [b, m, a]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Medical Debt Interest Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how much interest you may pay if your medical bills turn into debt.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Medical debt balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <input
          placeholder="APR (%)"
          value={apr}
          onChange={(e) => setApr(e.target.value)}
        />
        <input
          placeholder="Repayment period (months)"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated monthly payment: <strong>{usd(monthly)}</strong></div>
        <div>Total interest paid: <strong>{usd(interest)}</strong></div>
        <div>Total amount paid: <strong>{usd(totalPaid)}</strong></div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Tip: If interest is high, compare this with payment plans or negotiating the bill.
      </p>
    </div>
  );
}
