"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

const pct = (v: number) =>
  `${(v * 100).toLocaleString("en-US", { maximumFractionDigits: 4 })}%`;

export default function PennyStockDilutionImpactCalculator() {
  const [sharesOutstanding, setSharesOutstanding] = useState("100000000");
  const [sharePrice, setSharePrice] = useState("0.20");
  const [newShares, setNewShares] = useState("50000000");
  const [yourShares, setYourShares] = useState("200000");

  const res = useMemo(() => {
    const so = Math.floor(num(sharesOutstanding));
    const p = num(sharePrice);
    const ns = Math.floor(num(newShares));
    const ys = Math.floor(num(yourShares));

    const beforeOwn = so > 0 ? ys / so : 0;
    const afterSO = so + ns;
    const afterOwn = afterSO > 0 ? ys / afterSO : 0;

    const marketCapBefore = so * p;
    const marketCapAfter = afterSO * p; // simplified (price may change in reality)

    return { beforeOwn, afterOwn, afterSO, marketCapBefore, marketCapAfter };
  }, [sharesOutstanding, sharePrice, newShares, yourShares]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Penny Stock Dilution Impact Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how dilution changes ownership percentage when new shares are issued.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input placeholder="Current shares outstanding" value={sharesOutstanding} onChange={(e) => setSharesOutstanding(e.target.value)} />
        <input placeholder="Current share price ($)" value={sharePrice} onChange={(e) => setSharePrice(e.target.value)} />
        <input placeholder="New shares issued" value={newShares} onChange={(e) => setNewShares(e.target.value)} />
        <input placeholder="Your shares held" value={yourShares} onChange={(e) => setYourShares(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Ownership before: <strong>{pct(res.beforeOwn)}</strong></div>
        <div>Ownership after: <strong>{pct(res.afterOwn)}</strong></div>
        <div style={{ marginTop: 6 }}>Shares outstanding after: <strong>{res.afterSO.toLocaleString("en-US")}</strong></div>
        <div>Market cap (simplified): <strong>{usd(res.marketCapAfter)}</strong> (before: {usd(res.marketCapBefore)})</div>
      </div>
    </div>
  );
}
