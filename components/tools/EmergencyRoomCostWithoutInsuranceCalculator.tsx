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

export default function EmergencyRoomCostWithoutInsuranceCalculator() {
  const [facilityFee, setFacilityFee] = useState("");
  const [physicianFee, setPhysicianFee] = useState("");
  const [additionalCosts, setAdditionalCosts] = useState("");

  const total = useMemo(() => {
    return num(facilityFee) + num(physicianFee) + num(additionalCosts);
  }, [facilityFee, physicianFee, additionalCosts]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>
        Emergency Room Cost Without Insurance Calculator
      </h1>
      <p style={{ color: "#4b5563" }}>
        Estimate how much an emergency room visit may cost if you do not have
        health insurance.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="ER facility fee"
          value={facilityFee}
          onChange={(e) => setFacilityFee(e.target.value)}
        />
        <input
          placeholder="Physician/provider fee"
          value={physicianFee}
          onChange={(e) => setPhysicianFee(e.target.value)}
        />
        <input
          placeholder="Additional services (labs, imaging)"
          value={additionalCosts}
          onChange={(e) => setAdditionalCosts(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Estimated ER cost (uninsured)</div>
        <strong>{usd(total)}</strong>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Note: Actual ER costs vary widely by hospital, severity, and services provided.
        This estimate is for planning purposes only.
      </p>
    </div>
  );
}
