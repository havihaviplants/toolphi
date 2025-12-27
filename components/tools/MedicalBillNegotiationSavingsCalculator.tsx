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
  }).format(v);

export default function MedicalBillNegotiationSavingsCalculator() {
  const [bill, setBill] = useState("");
  const [discountPct, setDiscountPct] = useState("");

  const { savings, finalBill } = useMemo(() => {
    const total = num(bill);
    const pct = Math.min(100, num(discountPct));
    const saved = total * (pct / 100);
    return {
      savings: saved,
      finalBill: total - saved,
    };
  }, [bill, discountPct]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>
        Medical Bill Negotiation Savings Calculator
      </h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how much you could save by negotiating or receiving a discount
        on your medical bill.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Original medical bill"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
        />
        <input
          placeholder="Discount (%)"
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated savings: <strong>{usd(savings)}</strong></div>
        <div>Final bill after discount: <strong>{usd(finalBill)}</strong></div>
      </div>
    </div>
  );
}
