"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  purchaseAmount: string; // $
  feePercent: string; // %
  fixedFee: string; // $
};

type Result = {
  purchaseAmount: number;
  feePercent: number;
  fixedFee: number;
  percentageFee: number;
  totalFees: number;
  finalRefund: number;
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

export default function RefundFeeCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    purchaseAmount: "",
    feePercent: "",
    fixedFee: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const purchaseAmount = parseNumber(inputs.purchaseAmount);
    const feePercent = parseNumber(inputs.feePercent);
    const fixedFee = inputs.fixedFee.trim() ? parseNumber(inputs.fixedFee) : 0;

    if (!Number.isFinite(purchaseAmount) || purchaseAmount < 0) {
      setError("Purchase amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(feePercent) || feePercent < 0) {
      setError("Fee percent must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(fixedFee) || fixedFee < 0) {
      setError("Fixed fee must be a valid number (0 or greater).");
      return;
    }

    const percentageFee = purchaseAmount * (feePercent / 100);
    const totalFees = percentageFee + fixedFee;
    const finalRefund = Math.max(purchaseAmount - totalFees, 0);

    setResult({
      purchaseAmount,
      feePercent,
      fixedFee,
      percentageFee,
      totalFees,
      finalRefund,
    });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0 }}>Refund Fee Calculator</h1>
        <p style={{ margin: 0, color: "#444" }}>
          Estimate how much refund fees (restocking or processing charges) reduce the final amount
          you receive.
        </p>
      </div>

      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Original purchase amount ($)</label>
              <input
                name="purchaseAmount"
                value={inputs.purchaseAmount}
                onChange={handleChange}
                placeholder="e.g. 500"
                inputMode="decimal"
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                The refund fee is usually deducted from this amount.
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Refund / restocking fee (%)</label>
              <input
                name="feePercent"
                value={inputs.feePercent}
                onChange={handleChange}
                placeholder="e.g. 10"
                inputMode="decimal"
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                Example: 10% means you lose 10% of the purchase amount.
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Fixed processing fee (optional, $)</label>
              <input
                name="fixedFee"
                value={inputs.fixedFee}
                onChange={handleChange}
                placeholder="e.g. 5"
                inputMode="decimal"
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                Leave blank if there is no fixed fee.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <button type="submit">Calculate</button>
              <button
                type="button"
                onClick={() => {
                  setInputs({ purchaseAmount: "", feePercent: "", fixedFee: "" });
                  setResult(null);
                  setError(null);
                }}
              >
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

      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Results</h2>

        {!result ? (
          <p style={{ margin: 0, color: "#444" }}>
            Enter values above and click <strong>Calculate</strong> to see your final refund amount.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ color: "#444" }}>Fee breakdown</div>
              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  Percentage fee: <strong>${money(result.percentageFee)}</strong>
                </div>
                <div>
                  Fixed fee: <strong>${money(result.fixedFee)}</strong>
                </div>
                <div>
                  Total fees: <strong>${money(result.totalFees)}</strong>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Final refund amount</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>${money(result.finalRefund)}</div>
            </div>
          </div>
        )}

        <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Note: This tool assumes the percentage fee is applied to the original amount, then the fixed fee is deducted.
          Taxes and shipping depend on the seller policy.
        </p>
      </div>
    </div>
  );
}
