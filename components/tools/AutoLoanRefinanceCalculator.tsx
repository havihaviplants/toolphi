"use client";

import { useState } from "react";

interface Result {
  currentMonthly: number;
  currentTotalInterest: number;
  newMonthly: number;
  newTotalInterest: number;
  interestSavings: number;
}

export default function AutoLoanRefinanceCalculator() {
  const [balance, setBalance] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [currentYears, setCurrentYears] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newYears, setNewYears] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseNumber = (v: string) => {
    const n = parseFloat(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calcMonthlyPayment = (P: number, annualRate: number, years: number) => {
    const n = years * 12;
    if (P <= 0 || years <= 0) return 0;
    if (annualRate <= 0) return P / n;

    const r = annualRate / 100 / 12;
    const numerator = P * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    return numerator / denominator;
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const B = parseNumber(balance);
    const rCurrent = parseNumber(currentRate);
    const tCurrent = parseNumber(currentYears);
    const rNew = parseNumber(newRate);
    const tNew = parseNumber(newYears);

    if (B <= 0 || tCurrent <= 0 || tNew <= 0) {
      setError("Please enter a positive balance and valid loan terms.");
      return;
    }

    if (rCurrent < 0 || rNew < 0) {
      setError("Interest rates cannot be negative.");
      return;
    }

    const mCurrent = calcMonthlyPayment(B, rCurrent, tCurrent);
    const mNew = calcMonthlyPayment(B, rNew, tNew);

    if (mCurrent <= 0 || mNew <= 0) {
      setError("Unable to calculate payments. Please check your inputs.");
      return;
    }

    const nCurrent = tCurrent * 12;
    const nNew = tNew * 12;

    const totalPaidCurrent = mCurrent * nCurrent;
    const totalPaidNew = mNew * nNew;

    const currentInterest = totalPaidCurrent - B;
    const newInterest = totalPaidNew - B;
    const interestSavings = currentInterest - newInterest;

    setResult({
      currentMonthly: mCurrent,
      currentTotalInterest: currentInterest,
      newMonthly: mNew,
      newTotalInterest: newInterest,
      interestSavings,
    });
  };

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Compare your existing auto loan with a refinance offer. See how your
        monthly payment and total interest change with a new rate and term.
      </p>

      <div
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <fieldset
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 6,
            padding: 10,
          }}
        >
          <legend
            style={{
              fontSize: 13,
              padding: "0 4px",
              color: "#444",
            }}
          >
            Current auto loan
          </legend>
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <label style={{ fontSize: 14 }}>
              Remaining balance
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ fontSize: 14 }}>
              Current interest rate (APR %)
              <input
                type="number"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ fontSize: 14 }}>
              Remaining term (years)
              <input
                type="number"
                value={currentYears}
                onChange={(e) => setCurrentYears(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              />
            </label>
          </div>
        </fieldset>

        <fieldset
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 6,
            padding: 10,
          }}
        >
          <legend
            style={{
              fontSize: 13,
              padding: "0 4px",
              color: "#444",
            }}
          >
            New refinance offer
          </legend>
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <label style={{ fontSize: 14 }}>
              New interest rate (APR %)
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ fontSize: 14 }}>
              New loan term (years)
              <input
                type="number"
                value={newYears}
                onChange={(e) => setNewYears(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              />
            </label>
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        style={{
          padding: "8px 16px",
          borderRadius: 4,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Compare refinance
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 4,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {result && !error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e5e5e5",
            background: "#fafafa",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Current loan</p>
          <p>
            Monthly payment: ${formatCurrency(result.currentMonthly)}
          </p>
          <p>
            Total interest over remaining term: $
            {formatCurrency(result.currentTotalInterest)}
          </p>

          <p
            style={{
              fontWeight: 500,
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            New refinance loan
          </p>
          <p>
            Monthly payment: ${formatCurrency(result.newMonthly)}
          </p>
          <p>
            Total interest over new term: $
            {formatCurrency(result.newTotalInterest)}
          </p>

          <p
            style={{
              marginTop: 12,
              fontWeight: 500,
            }}
          >
            Interest savings:
            <span
              style={{
                marginLeft: 4,
                color: result.interestSavings >= 0 ? "#15803d" : "#b91c1c",
              }}
            >
              {result.interestSavings >= 0 ? "" : "-"}$
              {formatCurrency(Math.abs(result.interestSavings))}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
