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

export default function MedicalProcedureCostEstimator() {
  const [procedureCost, setProcedureCost] = useState("");
  const [additionalFees, setAdditionalFees] = useState("");

  const total = useMemo(
    () => num(procedureCost) + num(additionalFees),
    [procedureCost, additionalFees]
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>Medical Procedure Cost Estimator</h1>
      <p style={{ color: "#4b5563" }}>
        Estimate the total cost of a medical procedure or surgery before you
        receive a bill.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Procedure base cost"
          value={procedureCost}
          onChange={(e) => setProcedureCost(e.target.value)}
        />
        <input
          placeholder="Additional fees (hospital, anesthesia, etc.)"
          value={additionalFees}
          onChange={(e) => setAdditionalFees(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Total estimated cost</div>
        <strong>{usd(total)}</strong>
      </div>
    </div>
  );
}
