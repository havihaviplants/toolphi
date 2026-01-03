"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  purchaseAmount: string;

  // Refund option
  refundFeePercent: string;
  refundFixedFee: string;
  refundDelayDays: string;

  // Store credit option
  storeCreditBonusPercent: string;
  storeCreditDelayDays: string;

  // Time value (simple opportunity cost)
  annualRatePercent: string;
};

type Result = {
  purchaseAmount: number;

  refundFeePercent: number;
  refundFixedFee: number;
  refundDelayDays: number;

  storeCreditBonusPercent: number;
  storeCreditDelayDays: number;

  annualRatePercent: number;

  refundFeesTotal: number;
  refundNet: number;
  refundEffective: number;

  storeCreditGross: number;
  storeCreditEffective: number;

  winner: "refund" | "storeCredit";
  diff: number;
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

function clampNonNegative(n: number) {
  if (!Number.isFinite(n)) return NaN;
  return Math.max(n, 0);
}

export default function RefundVsStoreCreditComparisonCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    purchaseAmount: "200",

    refundFeePercent: "5",
    refundFixedFee: "0",
    refundDelayDays: "7",

    storeCreditBonusPercent: "10",
    storeCreditDelayDays: "0",

    annualRatePercent: "8",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setInputs({
      purchaseAmount: "200",

      refundFeePercent: "5",
      refundFixedFee: "0",
      refundDelayDays: "7",

      storeCreditBonusPercent: "10",
      storeCreditDelayDays: "0",

      annualRatePercent: "8",
    });
    setResult(null);
    setError(null);
  };

  const timeDiscountFactor = (annualRatePercent: number, days: number) => {
    // Simple discount factor using linear approximation for small periods:
    // effective = amount / (1 + rate * days/365)
    const rate = annualRatePercent / 100;
    return 1 / (1 + rate * (days / 365));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const purchaseAmount = parseNumber(inputs.purchaseAmount);

    const refundFeePercent = parseNumber(inputs.refundFeePercent);
    const refundFixedFee = inputs.refundFixedFee.trim() ? parseNumber(inputs.refundFixedFee) : 0;
    const refundDelayDays = parseNumber(inputs.refundDelayDays);

    const storeCreditBonusPercent = parseNumber(inputs.storeCreditBonusPercent);
    const storeCreditDelayDays = parseNumber(inputs.storeCreditDelayDays);

    const annualRatePercent = parseNumber(inputs.annualRatePercent);

    if (!Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
      setError("Purchase amount must be a valid number greater than 0.");
      return;
    }

    const rFeePct = clampNonNegative(refundFeePercent);
    const rFixed = clampNonNegative(refundFixedFee);
    const rDelay = clampNonNegative(refundDelayDays);

    const scBonus = clampNonNegative(storeCreditBonusPercent);
    const scDelay = clampNonNegative(storeCreditDelayDays);

    const rate = clampNonNegative(annualRatePercent);

    if (![rFeePct, rFixed, rDelay, scBonus, scDelay, rate].every((x) => Number.isFinite(x))) {
      setError("All inputs must be valid numbers (0 or greater).");
      return;
    }

    const refundFeesTotal = purchaseAmount * (rFeePct / 100) + rFixed;
    const refundNet = Math.max(purchaseAmount - refundFeesTotal, 0);

    const refundEffective = refundNet * timeDiscountFactor(rate, rDelay);

    const storeCreditGross = purchaseAmount * (1 + scBonus / 100);
    const storeCreditEffective = storeCreditGross * timeDiscountFactor(rate, scDelay);

    const winner = refundEffective >= storeCreditEffective ? "refund" : "storeCredit";
    const diff = Math.abs(refundEffective - storeCreditEffective);

    setResult({
      purchaseAmount,

      refundFeePercent: rFeePct,
      refundFixedFee: rFixed,
      refundDelayDays: rDelay,

      storeCreditBonusPercent: scBonus,
      storeCreditDelayDays: scDelay,

      annualRatePercent: rate,

      refundFeesTotal,
      refundNet,
      refundEffective,

      storeCreditGross,
      storeCreditEffective,

      winner,
      diff,
    });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0 }}>Refund vs Store Credit Comparison Calculator</h1>
        <p style={{ margin: 0, color: "#444" }}>
          Compare a cash refund vs store credit by factoring in fees, delays, and store-credit bonuses.
        </p>
      </div>

      {/* Inputs */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Purchase amount ($)</label>
              <input
                name="purchaseAmount"
                value={inputs.purchaseAmount}
                onChange={handleChange}
                placeholder="e.g. 200"
                inputMode="decimal"
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                This is the amount you paid (or the refund base amount).
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 14, display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>Option A: Cash Refund</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Refund fee (%)</label>
                  <input
                    name="refundFeePercent"
                    value={inputs.refundFeePercent}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    inputMode="decimal"
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label>Fixed refund fee ($)</label>
                  <input
                    name="refundFixedFee"
                    value={inputs.refundFixedFee}
                    onChange={handleChange}
                    placeholder="e.g. 0"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Refund delay (days)</label>
                <input
                  name="refundDelayDays"
                  value={inputs.refundDelayDays}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                  inputMode="numeric"
                />
                <div style={{ fontSize: 12, color: "#666" }}>
                  How many days until you actually receive the refund.
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 14, display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>Option B: Store Credit</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Store credit bonus (%)</label>
                  <input
                    name="storeCreditBonusPercent"
                    value={inputs.storeCreditBonusPercent}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    inputMode="decimal"
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label>Store credit delay (days)</label>
                  <input
                    name="storeCreditDelayDays"
                    value={inputs.storeCreditDelayDays}
                    onChange={handleChange}
                    placeholder="e.g. 0"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                Store credit can have restrictions (expiry, limited categories, one-store only). This tool compares
                estimated value only.
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 14, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>Time value assumption (optional)</div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Annual opportunity cost rate (%)</label>
                <input
                  name="annualRatePercent"
                  value={inputs.annualRatePercent}
                  onChange={handleChange}
                  placeholder="e.g. 8"
                  inputMode="decimal"
                />
                <div style={{ fontSize: 12, color: "#666" }}>
                  Used to discount delayed value. If you don’t want this, set it to 0.
                </div>
              </div>
            </div>

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
            Fill in the inputs and click <strong>Calculate</strong> to compare both options.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ color: "#444" }}>Effective value comparison (after fees + delay)</div>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>Cash refund (net after fees)</span>
                  <strong>${money(result.refundNet)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>Cash refund (effective value)</span>
                  <strong>${money(result.refundEffective)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>Store credit (with bonus)</span>
                  <strong>${money(result.storeCreditGross)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span>Store credit (effective value)</span>
                  <strong>${money(result.storeCreditEffective)}</strong>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Winner</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {result.winner === "refund" ? "Cash Refund" : "Store Credit"}{" "}
                <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>
                  (difference: ${money(result.diff)})
                </span>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                This comparison is an estimate. Store credit restrictions can make it less valuable than the number
                suggests.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How it works / FAQ (SEO 강화) */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>How it works</h3>
        <p style={{ margin: 0, color: "#444" }}>
          This tool estimates the value of a cash refund after fees and discounts delayed money using a simple
          opportunity-cost rate. Store credit is increased by any bonus percent and can also be discounted if you
          cannot use it immediately.
        </p>

        <h3 style={{ marginTop: 14 }}>FAQ</h3>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <div>
            <strong>Should I set the annual rate to 0?</strong>
            <div style={{ color: "#444" }}>
              If you don’t want to discount delayed value, set the rate to 0 and it becomes a simple fee/bonus comparison.
            </div>
          </div>
          <div>
            <strong>Why might store credit be worse than the number suggests?</strong>
            <div style={{ color: "#444" }}>
              Expiration dates, category restrictions, and being locked to one store can reduce real-world value.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
