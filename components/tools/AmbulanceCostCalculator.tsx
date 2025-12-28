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
    maximumFractionDigits: 2,
  }).format(v);

export default function AmbulanceCostCalculator() {
  const [baseFee, setBaseFee] = useState("");
  const [perMile, setPerMile] = useState("");
  const [miles, setMiles] = useState("");

  const total = useMemo(() => {
    return num(baseFee) + num(perMile) * num(miles);
  }, [baseFee, perMile, miles]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Ambulance Cost Calculator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate the cost of an ambulance ride using base fees and distance-based charges.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Base ambulance fee"
          value={baseFee}
          onChange={(e) => setBaseFee(e.target.value)}
        />
        <input
          placeholder="Cost per mile"
          value={perMile}
          onChange={(e) => setPerMile(e.target.value)}
        />
        <input
          placeholder="Distance traveled (miles)"
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated ambulance cost</div>
        <strong>{usd(total)}</strong>
      </div>
    </div>
  );
}
