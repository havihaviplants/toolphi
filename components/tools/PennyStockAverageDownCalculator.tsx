"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 6 }).format(v);

export default function PennyStockAverageDownCalculator() {
  const [currentShares, setCurrentShares] = useState("2000");
  const [currentAvg, setCurrentAvg] = useState("0.90");
  const [addShares, setAddShares] = useState("2000");
  const [addPrice, setAddPrice] = useState("0.60");

  const { newAvg, totalShares, totalCost } = useMemo(() => {
    const cs = Math.floor(num(currentShares));
    const ca = num(currentAvg);
    const as = Math.floor(num(addShares));
    const ap = num(addPrice);

    const cost = cs * ca + as * ap;
    const shares = cs + as;
    const avg = shares > 0 ? cost / shares : 0;

    return { newAvg: avg, totalShares: shares, totalCost: cost };
  }, [currentShares, currentAvg, addShares, addPrice]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Penny Stock Average Down Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Compute your new average cost and break-even price after buying more shares.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input placeholder="Current shares" value={currentShares} onChange={(e) => setCurrentShares(e.target.value)} />
        <input placeholder="Current average cost ($)" value={currentAvg} onChange={(e) => setCurrentAvg(e.target.value)} />
        <input placeholder="Additional shares to buy" value={addShares} onChange={(e) => setAddShares(e.target.value)} />
        <input placeholder="Buy price ($)" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Total shares: <strong>{totalShares.toLocaleString("en-US")}</strong></div>
        <div>Total cost basis: <strong>{usd(totalCost)}</strong></div>
        <div style={{ marginTop: 6 }}>New average cost (break-even): <strong>{usd(newAvg)}</strong></div>
      </div>
    </div>
  );
}
