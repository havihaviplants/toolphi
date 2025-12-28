"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

export default function PennyStockMarketCapCalculator() {
  const [price, setPrice] = useState("0.25");
  const [sharesOutstanding, setSharesOutstanding] = useState("200000000");
  const [targetPrice, setTargetPrice] = useState("1");

  const { marketCap, targetMarketCap } = useMemo(() => {
    const p = num(price);
    const so = Math.floor(num(sharesOutstanding));
    const tp = num(targetPrice);

    return {
      marketCap: p * so,
      targetMarketCap: tp * so,
    };
  }, [price, sharesOutstanding, targetPrice]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Penny Stock Market Cap Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Calculate market cap from price and shares outstanding, and see market cap at a target price.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input placeholder="Share price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input placeholder="Shares outstanding" value={sharesOutstanding} onChange={(e) => setSharesOutstanding(e.target.value)} />
        <input placeholder="Target price ($)" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Current market cap: <strong>{usd(marketCap)}</strong></div>
        <div>Market cap at target price: <strong>{usd(targetMarketCap)}</strong></div>
      </div>
    </div>
  );
}
