"use client";

import React, { useMemo, useState, ChangeEvent, FormEvent } from "react";

type Method = "percentage" | "quantity" | "fixed-deduction";

type Inputs = {
  purchaseAmount: string;

  method: Method;

  // percentage
  percentRefund: string;

  // quantity
  totalItems: string;
  refundedItems: string;

  // fixed deduction
  deductionAmount: string;
};

type Result = {
  purchaseAmount: number;
  method: Method;

  partialRefund: number;
  effectivePercent: number;

  details: string[];
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function money(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export default function PartialRefundCalculationTool() {
  const defaultInputs = useMemo<Inputs>(
    () => ({
      purchaseAmount: "300",
      method: "percentage",
      percentRefund: "25",
      totalItems: "3",
      refundedItems: "1",
      deductionAmount: "20",
    }),
    []
  );

  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setInputs((prev) => ({ ...prev, [name]: value } as Inputs));
  };

  const reset = () => {
    setInputs(defaultInputs);
    setError(null);
    setResult(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const purchaseAmount = parseNumber(inputs.purchaseAmount);
    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
      setError("Purchase amount must be a valid number greater than 0.");
      return;
    }

    const method = inputs.method;

    if (method === "percentage") {
      const pct = parseNumber(inputs.percentRefund);
      if (!Number.isFinite(pct) || pct < 0) {
        setError("Refund percentage must be a valid number (0 or greater).");
        return;
      }

      const pctClamped = clamp(pct, 0, 100);
      const partialRefund = purchaseAmount * (pctClamped / 100);
      const effectivePercent = (partialRefund / purchaseAmount) * 100;

      setResult({
        purchaseAmount,
        method,
        partialRefund,
        effectivePercent,
        details: [
          `Partial refund = $${money(purchaseAmount)} × ${pctClamped}%`,
          `Refund amount = $${money(partialRefund)}`,
        ],
      });
      return;
    }

    if (method === "quantity") {
      const totalItems = parseNumber(inputs.totalItems);
      const refundedItems = parseNumber(inputs.refundedItems);

      if (
        !Number.isFinite(totalItems) ||
        !Number.isFinite(refundedItems) ||
        totalItems <= 0 ||
        refundedItems < 0
      ) {
        setError("Total items must be > 0 and refunded items must be 0 or greater.");
        return;
      }

      const totalInt = Math.floor(totalItems);
      const refundedInt = Math.floor(refundedItems);

      if (refundedInt > totalInt) {
        setError("Refunded items cannot exceed total items.");
        return;
      }

      const unitValue = purchaseAmount / totalInt;
      const partialRefund = unitValue * refundedInt;
      const effectivePercent = (partialRefund / purchaseAmount) * 100;

      setResult({
        purchaseAmount,
        method,
        partialRefund,
        effectivePercent,
        details: [
          `Unit value = $${money(purchaseAmount)} ÷ ${totalInt} = $${money(unitValue)} per item`,
          `Partial refund = $${money(unitValue)} × ${refundedInt} = $${money(partialRefund)}`,
        ],
      });
      return;
    }

    // fixed-deduction
    const deduction = parseNumber(inputs.deductionAmount);
    if (!Number.isFinite(deduction) || deduction < 0) {
      setError("Deduction amount must be a valid number (0 or greater).");
      return;
    }

    const partialRefund = Math.max(purchaseAmount - deduction, 0);
    const effectivePercent = (partialRefund / purchaseAmount) * 100;

    setResult({
      purchaseAmount,
      method,
      partialRefund,
      effectivePercent,
      details: [
        `Partial refund = max($${money(purchaseAmount)} − $${money(deduction)}, 0)`,
        `Refund amount = $${money(partialRefund)}`,
      ],
    });
  };

  const showPercentage = inputs.method === "percentage";
  const showQuantity = inputs.method === "quantity";
  const showDeduction = inputs.method === "fixed-deduction";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0 }}>Partial Refund Calculation Tool</h1>
        <p style={{ margin: 0, color: "#444" }}>
          Calculate a partial refund using percentage-based refunds, quantity-based refunds, or fixed deductions.
        </p>
      </div>

      {/* Inputs */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Original purchase amount ($)</label>
              <input
                name="purchaseAmount"
                value={inputs.purchaseAmount}
                onChange={handleChange}
                placeholder="e.g. 300"
                inputMode="decimal"
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                Use the refund base amount (what the seller uses to calculate refunds).
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Partial refund method</label>
              <select name="method" value={inputs.method} onChange={handleChange}>
                <option value="percentage">Percentage refund (e.g. 20%)</option>
                <option value="quantity">Quantity-based refund (some items)</option>
                <option value="fixed-deduction">Fixed deduction (refund = amount − deduction)</option>
              </select>
              <div style={{ fontSize: 12, color: "#666" }}>
                Choose the method that matches the seller’s policy or your dispute offer.
              </div>
            </div>

            {showPercentage && (
              <div style={{ display: "grid", gap: 6 }}>
                <label>Refund percentage (%)</label>
                <input
                  name="percentRefund"
                  value={inputs.percentRefund}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  inputMode="decimal"
                />
                <div style={{ fontSize: 12, color: "#666" }}>
                  Example: 25% means you receive 25% of the purchase amount back.
                </div>
              </div>
            )}

            {showQuantity && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Total items</label>
                  <input
                    name="totalItems"
                    value={inputs.totalItems}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    inputMode="numeric"
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label>Items to refund</label>
                  <input
                    name="refundedItems"
                    value={inputs.refundedItems}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    inputMode="numeric"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#666" }}>
                  This assumes all items have equal value. If not, use the percentage method or fixed deduction.
                </div>
              </div>
            )}

            {showDeduction && (
              <div style={{ display: "grid", gap: 6 }}>
                <label>Fixed deduction amount ($)</label>
                <input
                  name="deductionAmount"
                  value={inputs.deductionAmount}
                  onChange={handleChange}
                  placeholder="e.g. 20"
                  inputMode="decimal"
                />
                <div style={{ fontSize: 12, color: "#666" }}>
                  Example: $300 − $20 deduction = $280 partial refund.
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <button type="submit">Calculate</button>
              <button type="button" onClick={reset}>
                Reset
              </button>
            </div>

            {error && (
              <div style={{ border: "1px solid #ffd7d7", background: "#fff5f5", padding: 10, borderRadius: 10 }}>
                <p style={{ margin: 0, color: "#b00020" }}>{error}</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Results</h2>

        {!result ? (
          <p style={{ margin: 0, color: "#444" }}>
            Choose a method and click <strong>Calculate</strong> to see the partial refund amount.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ color: "#444" }}>Calculation</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                {result.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Partial refund amount</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>${money(result.partialRefund)}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                Effective refund rate: {result.effectivePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Note: Seller policies vary. This tool is for estimating a partial refund offer and does not account for tax,
          shipping, or special item-level pricing unless you model it explicitly.
        </p>
      </div>
    </div>
  );
}
