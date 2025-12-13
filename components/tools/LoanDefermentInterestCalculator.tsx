"use client";

import { useMemo, useState } from "react";

type Result = {
  accruedInterest: number;
  newBalanceIfCapitalized: number;
  endBalanceIfNotCapitalized: number;
  effectiveIncreasePct: number;
};

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(2)}%`;
}

export default function LoanDefermentInterestCalculator() {
  const [balance, setBalance] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [months, setMonths] = useState<string>("");
  const [capitalized, setCapitalized] = useState<boolean>(true);
  const [result, setResult] = useState<Result | null>(null);

  const monthlyRate = useMemo(() => {
    const r = parseNumber(annualRate);
    return r > 0 ? r / 100 / 12 : 0;
  }, [annualRate]);

  const handleCalculate = () => {
    const principal = parseNumber(balance);
    const m = parseNumber(months);

    if (!principal || !monthlyRate || !m) {
      setResult(null);
      return;
    }

    // Interest accrual model:
    // - Most deferments accrue interest daily, but we approximate monthly for simplicity & clarity.
    // - If capitalized: balance increases by accrued interest at end of deferment.
    // - If not capitalized: interest accrues but balance does not increase (interest may still be owed).
    //
    // We compute accrued interest using monthly compounding to reflect "interest on interest" during deferment.
    const endBalanceIfCompounded = principal * Math.pow(1 + monthlyRate, m);
    const accruedInterest = endBalanceIfCompounded - principal;

    const newBalanceIfCapitalized = principal + accruedInterest;
    const endBalanceIfNotCapitalized = principal;

    const effectiveIncreasePct = (accruedInterest / principal) * 100;

    setResult({
      accruedInterest,
      newBalanceIfCapitalized,
      endBalanceIfNotCapitalized,
      effectiveIncreasePct,
    });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        Loan Deferment Interest Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Estimate how much interest accrues during deferment, and what your balance
        could be if interest is capitalized.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Current loan balance
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="e.g. 25000"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Annual interest rate (%)
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="e.g. 6"
            step="0.01"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Deferment period (months)
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            placeholder="e.g. 12"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <label style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={capitalized}
            onChange={(e) => setCapitalized(e.target.checked)}
            style={{ transform: "scale(1.1)" }}
          />
          Capitalize interest at end of deferment (add interest to balance)
        </label>

        <button
          onClick={handleCalculate}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Calculate
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: 16,
            border: "1px solid #e5e5e5",
            borderRadius: 14,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 14 }}>
              <strong>Accrued interest:</strong>{" "}
              {formatCurrency(result.accruedInterest)}{" "}
              <span style={{ color: "#666" }}>
                ({formatPercent(result.effectiveIncreasePct)} of balance)
              </span>
            </div>

            {capitalized ? (
              <div style={{ fontSize: 14 }}>
                <strong>New balance (if capitalized):</strong>{" "}
                {formatCurrency(result.newBalanceIfCapitalized)}
              </div>
            ) : (
              <div style={{ fontSize: 14 }}>
                <strong>End-of-deferment balance (not capitalized):</strong>{" "}
                {formatCurrency(result.endBalanceIfNotCapitalized)}
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Note: Interest may still be owed even if it is not added to the balance.
                </div>
              </div>
            )}

            <div style={{ fontSize: 12, color: "#666" }}>
              Calculation note: This tool approximates interest accrual using monthly compounding.
              Actual deferment rules may vary by lender and loan type.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
