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

function monthlyPayment(balance: number, months: number, aprPct: number) {
  const r = (aprPct / 100) / 12;
  if (r === 0) return balance / months;
  const p = Math.pow(1 + r, months);
  return balance * (r * p) / (p - 1);
}

function totals(balance: number, months: number, aprPct: number) {
  const m = monthlyPayment(balance, months, aprPct);
  const totalPaid = m * months;
  return {
    monthly: m,
    totalPaid,
    interest: Math.max(0, totalPaid - balance),
  };
}

export default function MedicalDebtVsCreditCardPayoffCalculator() {
  const [balance, setBalance] = useState("");
  const [mdApr, setMdApr] = useState("8");
  const [mdMonths, setMdMonths] = useState("24");
  const [ccApr, setCcApr] = useState("18");
  const [ccMonths, setCcMonths] = useState("24");

  const b = useMemo(() => num(balance), [balance]);

  const md = useMemo(
    () => totals(b, int(mdMonths), Math.min(100, num(mdApr))),
    [b, mdApr, mdMonths]
  );

  const cc = useMemo(
    () => totals(b, int(ccMonths), Math.min(100, num(ccApr))),
    [b, ccApr, ccMonths]
  );

  const cheaper =
    md.totalPaid === cc.totalPaid
      ? "Tie"
      : md.totalPaid < cc.totalPaid
      ? "Medical Debt"
      : "Credit Card";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>
        Medical Debt vs Credit Card Payoff Calculator
      </h1>
      <p style={{ color: "#4b5563" }}>
        Compare the total cost of paying medical debt directly versus transferring it to a credit card.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Medical debt balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />

        <input
          placeholder="Medical debt APR (%)"
          value={mdApr}
          onChange={(e) => setMdApr(e.target.value)}
        />
        <input
          placeholder="Medical debt repayment period (months)"
          value={mdMonths}
          onChange={(e) => setMdMonths(e.target.value)}
        />

        <input
          placeholder="Credit card APR (%)"
          value={ccApr}
          onChange={(e) => setCcApr(e.target.value)}
        />
        <input
          placeholder="Credit card repayment period (months)"
          value={ccMonths}
          onChange={(e) => setCcMonths(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>
          Medical debt total interest: <strong>{usd(md.interest)}</strong>
        </div>
        <div>
          Credit card total interest: <strong>{usd(cc.interest)}</strong>
        </div>
        <div style={{ marginTop: 6 }}>
          Cheaper option overall: <strong>{cheaper}</strong>
        </div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Tip: Credit cards often have higher APRs but may offer short-term flexibility.
        Compare carefully before transferring medical debt.
      </p>
    </div>
  );
}
