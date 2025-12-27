// components/tools/ErCopayVsCoinsuranceCostCalculator.tsx
"use client";

import { useMemo, useState } from "react";

function parseNumber(v: string): number {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function usd(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);
}

export default function ErCopayVsCoinsuranceCostCalculator() {
  const [charges, setCharges] = useState("");
  const [copay, setCopay] = useState("");
  const [coinsPct, setCoinsPct] = useState("20");

  const total = Math.max(0, parseNumber(charges));
  const copayCost = Math.max(0, parseNumber(copay));
  const coinsuranceCost = total * (clamp(parseNumber(coinsPct), 0, 100) / 100);

  const cheaper =
    copayCost === coinsuranceCost
      ? "Tie"
      : copayCost < coinsuranceCost
      ? "Copay"
      : "Coinsurance";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 14px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
        <h1 style={{ fontSize: 22 }}>ER Copay vs Coinsurance Cost Calculator</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.5 }}>
          Compare your ER out-of-pocket cost under a copay vs coinsurance model.
          This helps you understand which option may be cheaper for a given ER bill.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <input
            placeholder="Total ER charges (e.g. 3000)"
            value={charges}
            onChange={(e) => setCharges(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
          <input
            placeholder="ER copay (e.g. 300)"
            value={copay}
            onChange={(e) => setCopay(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
          <input
            placeholder="Coinsurance % (e.g. 20)"
            value={coinsPct}
            onChange={(e) => setCoinsPct(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ marginTop: 14, padding: 14, background: "#f9fafb", borderRadius: 10 }}>
          <div>Copay cost: <strong>{usd(copayCost)}</strong></div>
          <div>Coinsurance cost: <strong>{usd(coinsuranceCost)}</strong></div>
          <div style={{ marginTop: 6 }}>
            Cheaper option: <strong>{cheaper}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
