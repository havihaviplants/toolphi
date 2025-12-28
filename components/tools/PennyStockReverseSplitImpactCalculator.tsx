"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const int = (v: string) => Math.max(1, Math.floor(num(v)));
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 }).format(v);

export default function PennyStockReverseSplitImpactCalculator() {
  const [shares, setShares] = useState("10000");
  const [price, setPrice] = useState("0.40");
  const [splitFor, setSplitFor] = useState("10"); // 1-for-10

  const { newShares, newPrice, valueBefore, valueAfter } = useMemo(() => {
    const sh = Math.floor(num(shares));
    const p = num(price);
    const r = int(splitFor);

    const ns = r > 0 ? Math.floor(sh / r) : 0;
    const np = p * r;

    const vb = sh * p;
    const va = ns * np;

    return { newShares: ns, newPrice: np, valueBefore: vb, valueAfter: va };
  }, [shares, price, splitFor]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Penny Stock Reverse Split Impact Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how a reverse split changes shares and price (e.g., 1-for-10).
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input placeholder="Current shares" value={shares} onChange={(e) => setShares(e.target.value)} />
        <input placeholder="Current price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input placeholder="Reverse split ratio (1-for-X)" value={splitFor} onChange={(e) => setSplitFor(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>New shares: <strong>{newShares.toLocaleString("en-US")}</strong></div>
        <div>Post-split price: <strong>{usd(newPrice)}</strong></div>
        <div style={{ marginTop: 6 }}>Position value (approx): <strong>{usd(valueAfter)}</strong> (before: {usd(valueBefore)})</div>
      </div>
    </div>
  );
}
