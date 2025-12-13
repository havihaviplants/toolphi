"use client";

import { useState } from "react";

type Frequency = "monthly" | "biweekly" | "weekly";

type Result = {
  paymentPerPeriod: number;
  periodsPerYear: number;
  totalPayment: number;
  totalInterest: number;
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

function getPeriodsPerYear(freq: Frequency): number {
  if (freq === "weekly") return 52;
  if (freq === "biweekly") return 26;
  return 12;
}

export default function EducationLoanRepaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const principal = parseNumber(loanAmount);
    const rate = parseNumber(annualRate);
    const termYears = parseNumber(years);

    if (!principal || !rate || !termYears) {
      setResult(null);
      return;
    }

    const periodsPerYear = getPeriodsPerYear(frequency);
    const periodicRate = rate / 100 / periodsPerYear;
    const n = termYears * periodsPerYear;

    const paymentPerPeriod =
      (principal * periodicRate * Math.pow(1 + periodicRate, n)) /
      (Math.pow(1 + periodicRate, n) - 1);

    const totalPayment = paymentPerPeriod * n;
    const totalInterest = totalPayment - principal;

    setResult({
      paymentPerPeriod,
      periodsPerYear,
      totalPayment,
      totalInterest,
    });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        Education Loan Repayment Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Estimate education loan repayments across monthly, biweekly, or weekly schedules.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Education loan amount
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 20000"
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
            placeholder="e.g. 10"
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
          Loan term (years)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 10"
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
          Repayment frequency
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            <option value="monthly">Monthly (12 / year)</option>
            <option value="biweekly">Biweekly (26 / year)</option>
            <option value="weekly">Weekly (52 / year)</option>
          </select>
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
              <strong>Repayment per period:</strong>{" "}
              {formatCurrency(result.paymentPerPeriod)}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Total repaid:</strong> {formatCurrency(result.totalPayment)}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Total interest:</strong>{" "}
              {formatCurrency(result.totalInterest)}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Assumes a fixed-rate amortizing education loan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
