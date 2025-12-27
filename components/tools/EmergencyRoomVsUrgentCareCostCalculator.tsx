// components/tools/EmergencyRoomVsUrgentCareCostCalculator.tsx
"use client";

import { useMemo, useState } from "react";

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function EmergencyRoomVsUrgentCareCostCalculator() {
  const [erBase, setErBase] = useState("");
  const [erFees, setErFees] = useState("");

  const [urgentBase, setUrgentBase] = useState("");
  const [urgentFees, setUrgentFees] = useState("");

  const erTotal = useMemo(
    () => Math.max(0, parseNumber(erBase)) + Math.max(0, parseNumber(erFees)),
    [erBase, erFees]
  );

  const urgentTotal = useMemo(
    () => Math.max(0, parseNumber(urgentBase)) + Math.max(0, parseNumber(urgentFees)),
    [urgentBase, urgentFees]
  );

  const cheaper = erTotal === urgentTotal ? "Tie" : erTotal < urgentTotal ? "Emergency Room" : "Urgent Care";
  const difference = Math.abs(erTotal - urgentTotal);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 14px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, background: "#fff" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Emergency Room vs Urgent Care Cost Calculator</h1>
        <p style={{ marginTop: 8, color: "#4b5563", lineHeight: 1.5 }}>
          Compare emergency room (ER) and urgent care costs by entering base visit charges and estimated fees.
          This helps you decide which option may be cheaper for non-life-threatening situations.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {/* ER */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
            <strong>Emergency Room</strong>
            <input
              placeholder="ER base cost (e.g. 2000)"
              value={erBase}
              onChange={(e) => setErBase(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <input
              placeholder="ER additional fees (e.g. 600)"
              value={erFees}
              onChange={(e) => setErFees(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <div style={{ marginTop: 8, fontWeight: 700 }}>ER total: {formatUSD(erTotal)}</div>
          </div>

          {/* Urgent Care */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
            <strong>Urgent Care</strong>
            <input
              placeholder="Urgent care base cost (e.g. 250)"
              value={urgentBase}
              onChange={(e) => setUrgentBase(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <input
              placeholder="Urgent care additional fees (e.g. 120)"
              value={urgentFees}
              onChange={(e) => setUrgentFees(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <div style={{ marginTop: 8, fontWeight: 700 }}>Urgent care total: {formatUSD(urgentTotal)}</div>
          </div>
        </div>

        {/* Result */}
        <div style={{ marginTop: 14, padding: 14, background: "#f9fafb", borderRadius: 10 }}>
          <strong>Cheaper option:</strong> {cheaper}
          <div style={{ marginTop: 6 }}>Cost difference: {formatUSD(difference)}</div>
        </div>
      </div>
    </div>
  );
}
