// components/tools/HospitalVsClinicCostCalculator.tsx
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

export default function HospitalVsClinicCostCalculator() {
  const [hospitalBase, setHospitalBase] = useState<string>("");
  const [hospitalFees, setHospitalFees] = useState<string>("");

  const [clinicBase, setClinicBase] = useState<string>("");
  const [clinicFees, setClinicFees] = useState<string>("");

  const hBase = useMemo(() => Math.max(0, parseNumber(hospitalBase)), [hospitalBase]);
  const hFees = useMemo(() => Math.max(0, parseNumber(hospitalFees)), [hospitalFees]);

  const cBase = useMemo(() => Math.max(0, parseNumber(clinicBase)), [clinicBase]);
  const cFees = useMemo(() => Math.max(0, parseNumber(clinicFees)), [clinicFees]);

  const hospitalTotal = useMemo(() => hBase + hFees, [hBase, hFees]);
  const clinicTotal = useMemo(() => cBase + cFees, [cBase, cFees]);

  const difference = useMemo(() => Math.abs(hospitalTotal - clinicTotal), [hospitalTotal, clinicTotal]);

  const cheaperLabel = useMemo(() => {
    if (hospitalTotal === clinicTotal) return "Tie";
    return hospitalTotal < clinicTotal ? "Hospital" : "Clinic";
  }, [hospitalTotal, clinicTotal]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 14px" }}>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: 22, margin: 0 }}>Hospital vs Clinic Cost Calculator</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Compare a hospital visit vs a clinic visit by entering base costs and additional fees. This helps you
          estimate which option may be cheaper for your scenario.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {/* Hospital */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Hospital</div>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Hospital base visit cost
              <input
                type="text"
                inputMode="numeric"
                value={hospitalBase}
                onChange={(e) => setHospitalBase(e.target.value)}
                placeholder="e.g. 1200"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginTop: 12 }}>
              Hospital additional fees
              <input
                type="text"
                inputMode="numeric"
                value={hospitalFees}
                onChange={(e) => setHospitalFees(e.target.value)}
                placeholder="e.g. 300"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
              <span style={{ display: "block", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                Include labs, imaging, procedures, facility fees, etc.
              </span>
            </label>

            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
              }}
            >
              <span>Hospital total</span>
              <span>{formatUSD(hospitalTotal)}</span>
            </div>
          </div>

          {/* Clinic */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Clinic</div>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Clinic base visit cost
              <input
                type="text"
                inputMode="numeric"
                value={clinicBase}
                onChange={(e) => setClinicBase(e.target.value)}
                placeholder="e.g. 220"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginTop: 12 }}>
              Clinic additional fees
              <input
                type="text"
                inputMode="numeric"
                value={clinicFees}
                onChange={(e) => setClinicFees(e.target.value)}
                placeholder="e.g. 80"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
              <span style={{ display: "block", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                Include tests or add-ons that may be billed separately.
              </span>
            </label>

            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 800,
              }}
            >
              <span>Clinic total</span>
              <span>{formatUSD(clinicTotal)}</span>
            </div>
          </div>
        </div>

        {/* Result summary */}
        <div
          style={{
            marginTop: 14,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Cheaper option</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {cheaperLabel === "Tie" ? "Tie" : cheaperLabel}
              </div>
            </div>

            <div style={{ minWidth: 280 }}>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Difference</div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#111827" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Hospital total</span>
                  <span>{formatUSD(hospitalTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Clinic total</span>
                  <span>{formatUSD(clinicTotal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid #e5e7eb",
                    fontWeight: 800,
                  }}
                >
                  <span>Absolute difference</span>
                  <span>{formatUSD(difference)}</span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
            Note: Actual pricing varies widely by location and provider. Use this to compare scenarios, not as a quote.
          </p>
        </div>

        {/* Compact Info */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>How it works</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Hospitals often add facility-related charges and higher service rates, while clinics may be cheaper for
            routine care. Enter your best estimates for both settings and compare totals.
          </p>

          <h2 style={{ fontSize: 16, marginTop: 14, marginBottom: 8 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>When is a hospital likely to be cheaper?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Some services may be bundled differently, but for routine care, clinics are often cheaper.
              </div>
            </div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Should I include ER costs here?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                For ER comparisons, it’s better to use an ER vs urgent care cost calculator since pricing differs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
