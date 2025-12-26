// components/tools/MedicalBillCostCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type VisitType = "clinic" | "hospital" | "urgentCare" | "er";
type PaymentType = "selfPay" | "insurance";

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MedicalBillCostCalculator() {
  const [visitType, setVisitType] = useState<VisitType>("clinic");
  const [paymentType, setPaymentType] = useState<PaymentType>("selfPay");

  const [baseCost, setBaseCost] = useState<string>("");
  const [additionalFees, setAdditionalFees] = useState<string>("");

  const base = useMemo(() => parseNumber(baseCost), [baseCost]);
  const extra = useMemo(() => parseNumber(additionalFees), [additionalFees]);

  const estimatedTotal = useMemo(() => {
    const raw = base + extra;
    return raw < 0 ? 0 : raw;
  }, [base, extra]);

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
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "18px 14px",
      }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: 22, margin: 0 }}>Medical Bill Cost Calculator</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Estimate your total medical bill by combining a base visit cost and additional fees
          (tests, imaging, procedures). This is a quick planning tool—not an exact bill.
        </p>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
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

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Payment method (for context)
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
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
                <option value="selfPay">Self-pay</option>
                <option value="insurance">Insurance</option>
              </select>
            </label>
          </div>

          {/* Inputs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Base cost ({visitLabel})
              <input
                type="text"
                inputMode="numeric"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
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
              <span style={{ display: "block", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                Tip: use the pre-insurance charge if you only want a rough total.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Additional fees (tests, imaging, procedures)
              <input
                type="text"
                inputMode="numeric"
                value={additionalFees}
                onChange={(e) => setAdditionalFees(e.target.value)}
                placeholder="e.g. 450"
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
                Include lab fees, X-rays, MRI/CT, specialist add-ons, etc.
              </span>
            </label>
          </div>
        </div>

        {/* Result Card */}
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
                Estimated total medical bill
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {formatUSD(estimatedTotal)}
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
                  <span>{formatUSD(estimatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
            Note: This estimate does not apply insurance discounts, copays, coinsurance, or negotiated rates.
            Payment method is shown only to match user intent.
          </p>
        </div>

        {/* Short How it works + FAQ (compact, readable) */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>How it works</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Most medical bills combine a base visit charge plus itemized services. If you’re comparing
            settings (clinic vs hospital vs ER), try adjusting the base cost and fees to model different scenarios.
          </p>

          <h2 style={{ fontSize: 16, marginTop: 14, marginBottom: 8 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Is this an exact bill?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                No. It’s a planning estimate. Actual bills vary by provider, location, and services.
              </div>
            </div>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Why do costs differ so much?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Different facilities bill differently, and itemized services can stack quickly (labs, imaging, specialists).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
