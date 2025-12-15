// components/tools/AnnualFeeBreakEvenCalculator.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  annualFee: string;
  rewardRatePercent: string; // e.g. 2 for 2%
  monthlySpending: string;
  signupBonusValue: string; // optional
  firstYearFeeWaived: boolean;
};

type Result = {
  annualFeeApplied: number;
  annualRewardsValue: number;
  breakEvenMonthlySpend: number | null;
  breakEvenMonthsAtYourSpend: number | null;
  netValueAfterOneYear: number;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatMonths(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function AnnualFeeBreakEvenCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    annualFee: "",
    rewardRatePercent: "",
    monthlySpending: "",
    signupBonusValue: "",
    firstYearFeeWaived: false,
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setInputs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const annualFee = parseNumber(inputs.annualFee);
    const rewardRatePercent = parseNumber(inputs.rewardRatePercent);
    const monthlySpending = parseNumber(inputs.monthlySpending);
    const signupBonusValueRaw = inputs.signupBonusValue.trim()
      ? parseNumber(inputs.signupBonusValue)
      : 0;

    if (!Number.isFinite(annualFee) || annualFee < 0) {
      setError("Annual fee must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(rewardRatePercent) || rewardRatePercent <= 0) {
      setError("Rewards rate must be greater than 0 (e.g. 2 for 2%).");
      return;
    }
    if (!Number.isFinite(monthlySpending) || monthlySpending < 0) {
      setError("Monthly spending must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(signupBonusValueRaw) || signupBonusValueRaw < 0) {
      setError("Signup bonus value must be a valid number (0 or greater).");
      return;
    }

    const annualFeeApplied = inputs.firstYearFeeWaived ? 0 : annualFee;

    const rewardRate = rewardRatePercent / 100;
    const annualRewardsValue = monthlySpending * 12 * rewardRate;

    const annualSpendToBreakeven =
      rewardRate > 0 ? annualFeeApplied / rewardRate : NaN;

    const breakEvenMonthlySpend =
      Number.isFinite(annualSpendToBreakeven) ? annualSpendToBreakeven / 12 : null;

    const monthlyRewardsValue = monthlySpending * rewardRate;

    const breakEvenMonthsAtYourSpend =
      annualFeeApplied === 0
        ? 0
        : monthlyRewardsValue > 0
          ? annualFeeApplied / monthlyRewardsValue
          : null;

    const netValueAfterOneYear =
      annualRewardsValue + signupBonusValueRaw - annualFeeApplied;

    setResult({
      annualFeeApplied,
      annualRewardsValue,
      breakEvenMonthlySpend:
        breakEvenMonthlySpend !== null && Number.isFinite(breakEvenMonthlySpend)
          ? breakEvenMonthlySpend
          : null,
      breakEvenMonthsAtYourSpend:
        breakEvenMonthsAtYourSpend !== null && Number.isFinite(breakEvenMonthsAtYourSpend)
          ? breakEvenMonthsAtYourSpend
          : null,
      netValueAfterOneYear,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 16,
        backgroundColor: "#fff",
        display: "grid",
        gap: 16,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Annual fee</label>
            <input
              name="annualFee"
              value={inputs.annualFee}
              onChange={handleChange}
              placeholder="e.g. 95"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Rewards rate (%)</label>
            <input
              name="rewardRatePercent"
              value={inputs.rewardRatePercent}
              onChange={handleChange}
              placeholder="e.g. 2 (for 2% cashback)"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Monthly spending</label>
            <input
              name="monthlySpending"
              value={inputs.monthlySpending}
              onChange={handleChange}
              placeholder="e.g. 800"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Signup bonus value (optional)</label>
            <input
              name="signupBonusValue"
              value={inputs.signupBonusValue}
              onChange={handleChange}
              placeholder="e.g. 200"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              name="firstYearFeeWaived"
              checked={inputs.firstYearFeeWaived}
              onChange={handleChange}
            />
            First-year annual fee waived
          </label>

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              backgroundColor: "#111",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Calculate
          </button>

          {error && (
            <p style={{ color: "#b00020", fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
      </form>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #e1e4e8",
          padding: 16,
          backgroundColor: "#f6f8fa",
          minHeight: 140,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px 0" }}>
          Results
        </h3>

        {!result ? (
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
            Enter values and click Calculate.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Annual fee applied</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.annualFeeApplied)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Estimated rewards (per year)</span>
              <strong style={{ fontSize: 14 }}>${formatMoney(result.annualRewardsValue)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Break-even monthly spend</span>
              <strong style={{ fontSize: 14 }}>
                {result.breakEvenMonthlySpend === null ? "-" : `$${formatMoney(result.breakEvenMonthlySpend)}`}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Break-even time (at your spend)</span>
              <strong style={{ fontSize: 14 }}>
                {result.breakEvenMonthsAtYourSpend === null
                  ? "-"
                  : `${formatMonths(result.breakEvenMonthsAtYourSpend)} months`}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#555" }}>Net value after 1 year</span>
              <strong style={{ fontSize: 14 }}>
                ${formatMoney(result.netValueAfterOneYear)}
              </strong>
            </div>

            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
              {result.annualFeeApplied === 0
                ? "With the first-year fee waived, you break even immediately (fee = $0)."
                : result.netValueAfterOneYear >= 0
                  ? "At your current spending, the rewards likely cover the annual fee."
                  : "At your current spending, you may not earn enough rewards to cover the annual fee."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
