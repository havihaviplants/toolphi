// components/tools/SelfPayMedicalCostCalculator.tsx
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

export default function SelfPayMedicalCostCalculator() {
  const [visitType, setVisitType] = useState<VisitType>("clinic");

  const [selfPayBasePrice, setSelfPayBasePrice] = useState<string>("");
  const [additionalFees, setAdditionalFees] = useState<string>("");

  const [upfrontDiscountPercent, setUpfrontDiscountPercent] = useState<string>("0");

  const base = useMemo(() => parseNumber(selfPayBasePrice), [selfPayBasePrice]);
  const extra = useMemo(() => parseNumber(additionalFees), [additionalFees]);
  const discountPct = useMemo(
    () => clamp(parseNumber(upfrontDiscountPercent), 0, 100),
    [upfrontDiscountPercent]
  );

  const subtotal = useMemo(() => {
    const raw = base + extra;
    return raw < 0 ? 0 : raw;
  }, [base, extra]);

  const discountAmount = useMemo(() => subtotal * (discountPct / 100), [subtotal, discountPct]);

  const estimatedTotal = useMemo(() => {
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
        <h1 style={{ fontSize: 22, margin: 0 }}>Self-Pay Medical Cost Calculator</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Estimate what you may pay when you choose self-pay (cash pay). Enter a self-pay base price,
          add expected fees, and optionally apply an upfront discount.
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
              Self-pay base price — {visitLabel}
              <input
                type="text"
                inputMode="numeric"
                value={selfPayBasePrice}
                onChange={(e) => setSelfPayBasePrice(e.target.value)}
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
              <span style={{ display: "block", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                Enter the quoted cash/self-pay price if you have it. Otherwise use a rough estimate.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Additional fees (tests, imaging, procedures)
              <input
                type="text"
                inputMode="numeric"
                value={additionalFees}
                onChange={(e) => setAdditionalFees(e.target.value)}
                placeholder="e.g. 90"
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
                Add labs, X-rays, specialist fees, or procedure add-ons.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Upfront payment discount (%)
              <input
                type="text"
                inputMode="numeric"
                value={upfrontDiscountPercent}
                onChange={(e) => setUpfrontDiscountPercent(e.target.value)}
                placeholder="e.g. 10"
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
                Some providers discount for paying upfront—enter 0 if none.
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
                Estimated self-pay total
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {formatUSD(estimatedTotal)}
              </div>
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Breakdown</div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#111827" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Self-pay base</span>
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
                  <span>Upfront discount ({discountPct.toFixed(0)}%)</span>
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
                  <span>{formatUSD(estimatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
            This estimate does not include insurance pricing or negotiated rates. Use it to plan self-pay scenarios.
          </p>
        </div>

        {/* Compact Info */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>How it works</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Self-pay costs often start with a quoted cash price, then increase with itemized services.
            If an upfront discount is offered, applying it can help you estimate a more realistic out-of-pocket total.
          </p>

          <h2 style={{ fontSize: 16, marginTop: 14, marginBottom: 8 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Is self-pay always cheaper?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Not always. It can be cheaper for simple visits, but expensive services may be lower with insurance.
              </div>
            </div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>What should I include as “additional fees”?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Labs, imaging, procedures, specialist add-ons, and any expected extras beyond the base visit price.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
