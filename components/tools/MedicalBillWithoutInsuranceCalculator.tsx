// components/tools/MedicalBillWithoutInsuranceCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type VisitType = "clinic" | "hospital" | "urgentCare" | "er";

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function MedicalBillWithoutInsuranceCalculator() {
  const [visitType, setVisitType] = useState<VisitType>("clinic");

  const [baseCost, setBaseCost] = useState<string>("");
  const [additionalFees, setAdditionalFees] = useState<string>("");

  const [discountPercent, setDiscountPercent] = useState<string>("0");

  const base = useMemo(() => parseNumber(baseCost), [baseCost]);
  const extra = useMemo(() => parseNumber(additionalFees), [additionalFees]);
  const discountPct = useMemo(() => clamp(parseNumber(discountPercent), 0, 100), [discountPercent]);

  const subtotal = useMemo(() => {
    const raw = base + extra;
    return raw < 0 ? 0 : raw;
  }, [base, extra]);

  const discountAmount = useMemo(() => subtotal * (discountPct / 100), [subtotal, discountPct]);

  const estimatedNoInsuranceBill = useMemo(() => {
    const raw = subtotal - discountAmount;
    return raw < 0 ? 0 : raw;
  }, [subtotal, discountAmount]);

  const visitLabel = useMemo(() => {
    switch (visitType) {
      case "clinic":
        return "Clinic visit";
      case "hospital":
        return "Hospital visit";
      case "urgentCare":
        return "Urgent care";
      case "er":
        return "Emergency room";
      default:
        return "Medical visit";
    }
  }, [visitType]);

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
        <h1 style={{ fontSize: 22, margin: 0 }}>Medical Bill Without Insurance Calculator</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Estimate what you might pay without insurance. Enter a base visit cost and any additional fees, then
          optionally apply a self-pay discount.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {/* Visit Type */}
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            Visit type
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 10px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value="clinic">Clinic</option>
              <option value="hospital">Hospital</option>
              <option value="urgentCare">Urgent care</option>
              <option value="er">Emergency room (ER)</option>
            </select>
          </label>

          {/* Costs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Base cost (no insurance) — {visitLabel}
              <input
                type="text"
                inputMode="numeric"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                placeholder="e.g. 180"
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
                If you know a self-pay price list, enter that number here.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Additional fees (tests, imaging, procedures)
              <input
                type="text"
                inputMode="numeric"
                value={additionalFees}
                onChange={(e) => setAdditionalFees(e.target.value)}
                placeholder="e.g. 70"
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
                Include lab work, X-rays, MRI/CT, specialist add-ons, etc.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Self-pay discount (%)
              <input
                type="text"
                inputMode="numeric"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 15"
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
                Many providers offer discounts for upfront/self-pay—enter 0 if none.
              </span>
            </label>
          </div>
        </div>

        {/* Result */}
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
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                Estimated bill (no insurance)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {formatUSD(estimatedNoInsuranceBill)}
              </div>
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Breakdown</div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#111827" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Base cost</span>
                  <span>{formatUSD(base)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Additional fees</span>
                  <span>{formatUSD(extra)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Subtotal</span>
                  <span>{formatUSD(subtotal)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <span>Self-pay discount ({discountPct.toFixed(0)}%)</span>
                  <span>- {formatUSD(discountAmount)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid #e5e7eb",
                    fontWeight: 700,
                  }}
                >
                  <span>Total</span>
                  <span>{formatUSD(estimatedNoInsuranceBill)}</span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
            This is a planning estimate. Actual self-pay pricing varies by provider, location, and itemized services.
          </p>
        </div>

        {/* Compact Info */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>How it works</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Without insurance, you may be billed the full price for the visit plus itemized charges.
            If your provider offers a self-pay discount, apply it to get a closer estimate.
          </p>

          <h2 style={{ fontSize: 16, marginTop: 14, marginBottom: 8 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>What discount should I use?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Use the discount your provider quotes. If you’re unsure, try 0–20% to model a range.
              </div>
            </div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Does this include prescriptions?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Not by default. Add prescription costs into “additional fees” if you want them included.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
