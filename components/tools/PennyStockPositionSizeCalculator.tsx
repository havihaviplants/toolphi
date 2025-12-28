"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const usd = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);

export default function PennyStockPositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState("");
  const [riskDollars, setRiskDollars] = useState("100");
  const [entryPrice, setEntryPrice] = useState("1");
  const [stopLossPct, setStopLossPct] = useState("10");

  const { positionValue, shares, riskPerShare } = useMemo(() => {
    const acct = num(accountSize);
    const risk$ = num(riskDollars);
    const price = Math.max(0.0000001, num(entryPrice));
    const stop = clamp(num(stopLossPct), 0, 100) / 100;

    const rps = price * stop; // $ loss per share
    const sh = rps > 0 ? Math.floor(risk$ / rps) : 0;
    const pv = sh * price;

    // (Optional sanity: positionValue shouldn't exceed accountSize, but keep raw)
    return { positionValue: pv, shares: sh, riskPerShare: rps };
  }, [accountSize, riskDollars, entryPrice, stopLossPct]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Penny Stock Position Size Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how many shares to buy based on risk per trade and stop-loss percentage.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input placeholder="Account size" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} />
        <input placeholder="Risk per trade ($)" value={riskDollars} onChange={(e) => setRiskDollars(e.target.value)} />
        <input placeholder="Entry price ($)" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
        <input placeholder="Stop-loss (%)" value={stopLossPct} onChange={(e) => setStopLossPct(e.target.value)} />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Risk per share: <strong>{usd(riskPerShare)}</strong></div>
        <div>Max shares (approx): <strong>{shares.toLocaleString("en-US")}</strong></div>
        <div style={{ marginTop: 6 }}>Position value: <strong>{usd(positionValue)}</strong></div>
      </div>
    </div>
  );
}
