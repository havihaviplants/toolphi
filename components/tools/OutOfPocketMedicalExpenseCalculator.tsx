// components/tools/OutOfPocketMedicalExpenseCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type ResponsibilityType = "copay" | "coinsurance";

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

export default function OutOfPocketMedicalExpenseCalculator() {
  const [totalCharges, setTotalCharges] = useState<string>("");
  const [deductibleToPay, setDeductibleToPay] = useState<string>("");

  const [responsibilityType, setResponsibilityType] = useState<ResponsibilityType>("coinsurance");
  const [copayAmount, setCopayAmount] = useState<string>("0");
  const [coinsurancePercent, setCoinsurancePercent] = useState<string>("20");

  const charges = useMemo(() => Math.max(0, parseNumber(totalCharges)), [totalCharges]);
  const deductible = useMemo(() => Math.max(0, parseNumber(deductibleToPay)), [deductibleToPay]);

  const copay = useMemo(() => Math.max(0, parseNumber(copayAmount)), [copayAmount]);
  const coinsPct = useMemo(() => clamp(parseNumber(coinsurancePercent), 0, 100), [coinsurancePercent]);

  const remainingAfterDeductible = useMemo(() => {
    const r = charges - deductible;
    return r < 0 ? 0 : r;
  }, [charges, deductible]);

  const coinsuranceAmount = useMemo(() => remainingAfterDeductible * (coinsPct / 100), [
    remainingAfterDeductible,
    coinsPct,
  ]);

  const estimatedOutOfPocket = useMemo(() => {
    if (responsibilityType === "copay") {
      // Common simplification: deductible + copay
      const total = deductible + copay;
      return total < 0 ? 0 : total;
    }
    // coinsurance: deductible + coinsurance on remaining
    const total = deductible + coinsuranceAmount;
    return total < 0 ? 0 : total;
  }, [responsibilityType, deductible, copay, coinsuranceAmount]);

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
        <h1 style={{ fontSize: 22, margin: 0 }}>Out-of-Pocket Medical Expense Calculator</h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Estimate your out-of-pocket cost using total provider charges, deductible you expect to pay, and your
          cost-sharing (copay or coinsurance). This is a planning estimate, not a policy statement.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {/* Charges & Deductible */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Total provider charges (estimated bill)
              <input
                type="text"
                inputMode="numeric"
                value={totalCharges}
                onChange={(e) => setTotalCharges(e.target.value)}
                placeholder="e.g. 1000"
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
                You can use an estimate from a bill, quote, or a cost calculator.
              </span>
            </label>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Deductible you expect to pay (for this visit)
              <input
                type="text"
                inputMode="numeric"
                value={deductibleToPay}
                onChange={(e) => setDeductibleToPay(e.target.value)}
                placeholder="e.g. 200"
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
                Enter 0 if you don’t expect deductible to apply.
              </span>
            </label>
          </div>

          {/* Responsibility type */}
          <label style={{ fontSize: 14, fontWeight: 600 }}>
            Cost-sharing type
            <select
              value={responsibilityType}
              onChange={(e) => setResponsibilityType(e.target.value as ResponsibilityType)}
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
              <option value="coinsurance">Coinsurance (%)</option>
              <option value="copay">Copay (flat amount)</option>
            </select>
          </label>

          {/* Conditional inputs */}
          {responsibilityType === "copay" ? (
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Copay amount
              <input
                type="text"
                inputMode="numeric"
                value={copayAmount}
                onChange={(e) => setCopayAmount(e.target.value)}
                placeholder="e.g. 40"
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
                Copay is a fixed amount you pay per visit or service.
              </span>
            </label>
          ) : (
            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Coinsurance (%)
              <input
                type="text"
                inputMode="numeric"
                value={coinsurancePercent}
                onChange={(e) => setCoinsurancePercent(e.target.value)}
                placeholder="e.g. 20"
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
                Coinsurance applies to the remaining amount after deductible.
              </span>
            </label>
          )}
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
                Estimated out-of-pocket expense
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {formatUSD(estimatedOutOfPocket)}
              </div>
            </div>

            <div style={{ minWidth: 280 }}>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Breakdown</div>
              <div style={{ marginTop: 8, fontSize: 14, color: "#111827" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total charges</span>
                  <span>{formatUSD(charges)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Deductible you pay</span>
                  <span>{formatUSD(deductible)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span>Remaining after deductible</span>
                  <span>{formatUSD(remainingAfterDeductible)}</span>
                </div>

                {responsibilityType === "copay" ? (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span>Copay</span>
                    <span>{formatUSD(copay)}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span>Coinsurance ({coinsPct.toFixed(0)}%)</span>
                    <span>{formatUSD(coinsuranceAmount)}</span>
                  </div>
                )}

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
                  <span>Total out-of-pocket</span>
                  <span>{formatUSD(estimatedOutOfPocket)}</span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#6b7280" }}>
            Simplification note: Plans vary in how copays and coinsurance apply. Use this tool for quick estimates.
          </p>
        </div>

        {/* Compact Info */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>How it works</h2>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Out-of-pocket cost often includes what you pay toward deductible plus your cost-sharing:
            either a flat copay or a coinsurance percentage on the remaining amount.
          </p>

          <h2 style={{ fontSize: 16, marginTop: 14, marginBottom: 8 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Copay vs coinsurance—what’s the difference?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Copay is a fixed amount. Coinsurance is a percentage of the allowed cost (often after deductible).
              </div>
            </div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>What if my deductible is already met?</div>
              <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.6 }}>
                Enter 0 for the deductible you expect to pay for this visit, then use copay or coinsurance only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
