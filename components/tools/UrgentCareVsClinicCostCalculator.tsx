// components/tools/UrgentCareVsClinicCostCalculator.tsx
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

export default function UrgentCareVsClinicCostCalculator() {
  const [urgentBase, setUrgentBase] = useState("");
  const [urgentFees, setUrgentFees] = useState("");

  const [clinicBase, setClinicBase] = useState("");
  const [clinicFees, setClinicFees] = useState("");

  const urgentTotal = useMemo(
    () => Math.max(0, parseNumber(urgentBase)) + Math.max(0, parseNumber(urgentFees)),
    [urgentBase, urgentFees]
  );

  const clinicTotal = useMemo(
    () => Math.max(0, parseNumber(clinicBase)) + Math.max(0, parseNumber(clinicFees)),
    [clinicBase, clinicFees]
  );

  const cheaper = urgentTotal === clinicTotal ? "Tie" : urgentTotal < clinicTotal ? "Urgent Care" : "Clinic";
  const difference = Math.abs(urgentTotal - clinicTotal);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 14px" }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, background: "#fff" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Urgent Care vs Clinic Cost Calculator</h1>
        <p style={{ marginTop: 8, color: "#4b5563", lineHeight: 1.5 }}>
          Compare urgent care and clinic visit costs by entering base charges and estimated fees.
          This helps you decide which option may be more cost-effective for non-emergency care.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {/* Urgent Care */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
            <strong>Urgent Care</strong>
            <input
              placeholder="Urgent care base cost (e.g. 280)"
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
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              Urgent care total: {formatUSD(urgentTotal)}
            </div>
          </div>

          {/* Clinic */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
            <strong>Clinic</strong>
            <input
              placeholder="Clinic base cost (e.g. 180)"
              value={clinicBase}
              onChange={(e) => setClinicBase(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <input
              placeholder="Clinic additional fees (e.g. 60)"
              value={clinicFees}
              onChange={(e) => setClinicFees(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              Clinic total: {formatUSD(clinicTotal)}
            </div>
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
