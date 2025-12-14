// components/tools/StudentLoanConsolidationCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type LoanRow = { id: string; balance: string; apr: string };

type Result = {
  totalBalance: number;
  weightedApr: number; // before rounding
  roundedApr: number;  // after rounding (optional)
  termYears: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
};

const uid = () => Math.random().toString(36).slice(2, 10);

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Federal Direct Consolidation interest rate is a weighted average rounded UP to nearest 1/8 of 1%.
// 1/8% = 0.125
function roundUpToNearestEighthPercent(ratePct: number) {
  const step = 0.125;
  return Math.ceil(ratePct / step) * step;
}

// Common federal consolidation term estimate by total balance (approx, used as "auto term").
// This is an estimate; user can override.
function estimateTermYearsByBalance(total: number) {
  if (total <= 9999) return 10;
  if (total <= 19999) return 15;
  if (total <= 39999) return 20;
  if (total <= 59999) return 25;
  return 30;
}

function calcPayment(principal: number, aprPct: number, years: number) {
  const n = years * 12;
  const r = aprPct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function StudentLoanConsolidationCalculator() {
  const [rows, setRows] = useState<LoanRow[]>([
    { id: uid(), balance: "", apr: "" },
    { id: uid(), balance: "", apr: "" },
  ]);

  const [useDirectConsolidationRounding, setUseDirectConsolidationRounding] =
    useState<boolean>(true);

  const [autoTerm, setAutoTerm] = useState<boolean>(true);
  const [termYears, setTermYears] = useState<string>("10");
  const [result, setResult] = useState<Result | null>(null);

  const totals = useMemo(() => {
    const parsed = rows.map((r) => ({
      balance: parseNumber(r.balance),
      apr: parseNumber(r.apr),
    }));
    const totalBalance = parsed.reduce((acc, x) => acc + x.balance, 0);
    const weightedApr =
      totalBalance > 0
        ? parsed.reduce((acc, x) => acc + x.balance * x.apr, 0) / totalBalance
        : 0;

    return { totalBalance, weightedApr };
  }, [rows]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: uid(), balance: "", apr: "" }]);
    setResult(null);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setResult(null);
  };

  const handleUpdateRow = (id: string, key: "balance" | "apr", value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
    setResult(null);
  };

  const handleReset = () => {
    setRows([
      { id: uid(), balance: "", apr: "" },
      { id: uid(), balance: "", apr: "" },
    ]);
    setUseDirectConsolidationRounding(true);
    setAutoTerm(true);
    setTermYears("10");
    setResult(null);
  };

  const handleCalculate = () => {
    const totalBalance = totals.totalBalance;
    if (totalBalance <= 0) {
      setResult(null);
      return;
    }

    const weightedApr = totals.weightedApr;
    const roundedApr = useDirectConsolidationRounding
      ? roundUpToNearestEighthPercent(weightedApr)
      : weightedApr;

    const years = autoTerm ? estimateTermYearsByBalance(totalBalance) : parseNumber(termYears);
    if (years <= 0) {
      setResult(null);
      return;
    }

    const monthlyPayment = calcPayment(totalBalance, roundedApr, years);
    const totalPaid = monthlyPayment * years * 12;
    const totalInterest = totalPaid - totalBalance;

    setResult({
      totalBalance,
      weightedApr,
      roundedApr,
      termYears: years,
      monthlyPayment,
      totalPaid,
      totalInterest,
    });
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate your <strong>student loan consolidation</strong> terms by combining multiple
        loans into one balance and calculating the <strong>weighted average interest rate</strong>.
        Optionally apply <strong>Direct Consolidation rounding</strong> (rounded up to the nearest
        1/8 of 1%) and estimate a repayment term based on total balance.
      </p>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, marginBottom: 6 }}>
          Enter your current loans (balance + APR)
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((r, idx) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <label style={{ fontSize: 13 }}>
                Balance
                <input
                  type="text"
                  value={r.balance}
                  onChange={(e) => handleUpdateRow(r.id, "balance", e.target.value)}
                  placeholder="e.g. 12000"
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

              <label style={{ fontSize: 13 }}>
                APR (%)
                <input
                  type="text"
                  value={r.apr}
                  onChange={(e) => handleUpdateRow(r.id, "apr", e.target.value)}
                  placeholder="e.g. 6.5"
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

              <div style={{ paddingTop: 18 }}>
                {rows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(r.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    aria-label={`Remove loan row ${idx + 1}`}
                  >
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleAddRow}
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Add another loan
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={useDirectConsolidationRounding}
            onChange={(e) => {
              setUseDirectConsolidationRounding(e.target.checked);
              setResult(null);
            }}
          />
          Apply Direct Consolidation rounding (round up to nearest 1/8 of 1%)
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={autoTerm}
            onChange={(e) => {
              setAutoTerm(e.target.checked);
              setResult(null);
            }}
          />
          Auto-estimate repayment term from total balance
        </label>

        {!autoTerm && (
          <label style={{ fontSize: 14 }}>
            Repayment term (years)
            <input
              type="text"
              value={termYears}
              onChange={(e) => {
                setTermYears(e.target.value);
                setResult(null);
              }}
              placeholder="e.g. 10"
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
        )}

        <div style={{ fontSize: 12, color: "#666" }}>
          Current totals: <strong>{formatNumber(totals.totalBalance)}</strong> balance, weighted APR{" "}
          <strong>{formatNumber(totals.weightedApr)}%</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleCalculate}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "none",
            background: "#0366d6",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Calculate consolidation
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Total consolidated balance:</strong> {formatNumber(result.totalBalance)}
          </p>
          <p>
            <strong>Weighted average APR (before rounding):</strong>{" "}
            {formatNumber(result.weightedApr)}%
          </p>
          <p>
            <strong>APR used for payment estimate:</strong> {formatNumber(result.roundedApr)}%
          </p>
          <p>
            <strong>Estimated term:</strong> {result.termYears} years
          </p>
          <p>
            <strong>Estimated monthly payment:</strong> {formatNumber(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total repaid:</strong> {formatNumber(result.totalPaid)}
          </p>
          <p>
            <strong>Total interest:</strong> {formatNumber(result.totalInterest)}
          </p>

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Note: This is an estimate. Consolidation terms and rounding rules vary by program.
            Use this as a planning tool, then compare with your servicer’s official offer.
          </p>
        </div>
      )}
    </div>
  );
}
