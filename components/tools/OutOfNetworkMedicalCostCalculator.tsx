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

export default function OutOfNetworkMedicalCostCalculator() {
  const [bill, setBill] = useState("");
  const [coveragePercent, setCoveragePercent] = useState("");

  const outOfPocket = useMemo(() => {
    const total = num(bill);
    const pct = Math.min(100, num(coveragePercent));
    return total * (1 - pct / 100);
  }, [bill, coveragePercent]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>
        Out-of-Network Medical Cost Calculator
      </h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how much you may need to pay for out-of-network medical care
        after insurance coverage.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Total medical bill"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
        />
        <input
          placeholder="Insurance coverage (%)"
          value={coveragePercent}
          onChange={(e) => setCoveragePercent(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated out-of-pocket cost</div>
        <strong>{usd(outOfPocket)}</strong>
      </div>
    </div>
  );
}
