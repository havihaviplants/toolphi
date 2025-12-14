// components/tools/FederalStudentLoanCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type LoanTypeKey = "direct" | "grad_plus" | "parent_plus";

type Result = {
  financedAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

// ⚠️ Federal loan rates/fees can change. This tool ships with *typical* defaults
// (editable by the user) so the page remains useful even when rates update.
const LOAN_TYPE_PRESETS: Record<
  LoanTypeKey,
  { label: string; defaultRateApr: number; defaultOriginationFeePct: number }
> = {
  direct: {
    label: "Direct (Subsidized / Unsubsidized)",
    defaultRateApr: 6.5,
    defaultOriginationFeePct: 1.0,
  },
  grad_plus: {
    label: "Grad PLUS",
    defaultRateApr: 8.0,
    defaultOriginationFeePct: 4.0,
  },
  parent_plus: {
    label: "Parent PLUS",
    defaultRateApr: 8.0,
    defaultOriginationFeePct: 4.0,
  },
};

export default function FederalStudentLoanCalculator() {
  const [loanType, setLoanType] = useState<LoanTypeKey>("direct");
  const [principal, setPrincipal] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>(
    String(LOAN_TYPE_PRESETS.direct.defaultRateApr)
  );
  const [originationFeePct, setOriginationFeePct] = useState<string>(
    String(LOAN_TYPE_PRESETS.direct.defaultOriginationFeePct)
  );
  const [years, setYears] = useState<string>("10");
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const selectedPreset = useMemo(() => LOAN_TYPE_PRESETS[loanType], [loanType]);

  const handleLoanTypeChange = (next: LoanTypeKey) => {
    setLoanType(next);
    setAnnualRate(String(LOAN_TYPE_PRESETS[next].defaultRateApr));
    setOriginationFeePct(String(LOAN_TYPE_PRESETS[next].defaultOriginationFeePct));
    setResult(null);
  };

  const handleCalculate = () => {
    const P = parseNumber(principal);
    const apr = parseNumber(annualRate);
    const feePct = parseNumber(originationFeePct);
    const termYears = parseNumber(years);

    const n = termYears * 12;
    const r = apr / 100 / 12;

    if (P <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    // Model origination fee as an added repaid amount (principal * fee%).
    const feeAmount = P * (feePct / 100);
    const financedAmount = P + feeAmount;

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = financedAmount / n;
    } else {
      monthlyPayment =
        (financedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - financedAmount;

    setResult({
      financedAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
    });
  };

  const handleReset = () => {
    setLoanType("direct");
    setPrincipal("");
    setAnnualRate(String(LOAN_TYPE_PRESETS.direct.defaultRateApr));
    setOriginationFeePct(String(LOAN_TYPE_PRESETS.direct.defaultOriginationFeePct));
    setYears("10");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate monthly payments for a <strong>federal student loan</strong>.
        Select a loan type, adjust the APR and origination fee (defaults are typical
        and editable), and see payment and interest totals.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Loan type
          <select
            value={loanType}
            onChange={(e) => handleLoanTypeChange(e.target.value as LoanTypeKey)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
              background: "#fff",
            }}
          >
            {(Object.keys(LOAN_TYPE_PRESETS) as Array<keyof typeof LOAN_TYPE_PRESETS>).map(
              (key) => (
                <option key={key} value={key}>
                  {LOAN_TYPE_PRESETS[key].label}
                </option>
              )
            )}
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
            Default: {selectedPreset.defaultRateApr}% APR,{" "}
            {selectedPreset.defaultOriginationFeePct}% origination fee
          </div>
        </label>

        <label style={{ fontSize: 14 }}>
          Loan amount (principal)
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 25000"
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
          Annual interest rate (APR, %)
          <input
            type="text"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
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

        <label style={{ fontSize: 14 }}>
          Origination fee (% of principal)
          <input
            type="text"
            value={originationFeePct}
            onChange={(e) => setOriginationFeePct(e.target.value)}
            placeholder="e.g. 1.0"
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
          Repayment term (years)
          <input
            type="text"
            value={years}
            onChange={(e) => setYears(e.target.value)}
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
          Calculate payment
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
            <strong>Financed amount (principal + fee):</strong>{" "}
            {formatNumber(result.financedAmount)}
          </p>
          <p>
            <strong>Estimated monthly payment:</strong>{" "}
            {formatNumber(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total amount repaid:</strong> {formatNumber(result.totalPayment)}
          </p>
          <p>
            <strong>Total interest paid:</strong>{" "}
            {formatNumber(result.totalInterest)}
          </p>
          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Tip: If you want to compare repayment plans, jump to the IDR tools
            after you estimate the standard payment here.
          </p>
        </div>
      )}
    </div>
  );
}
