"use client";

import { useState } from "react";

export default function InterestOnlyLoanCostCalculator() {
  const [loan, setLoan] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<any>(null);

  const n = (v: string) => Number(v.replace(/,/g, "")) || 0;

  const calc = () => {
    const L = n(loan);
    const r = n(rate) / 100;
    const y = n(years);

    if (L <= 0 || r <= 0 || y <= 0) return;

    const monthlyRate = r / 12;

    // Interest-only payment
    const interestOnlyPayment = L * monthlyRate;

    // Fully amortized payment
    const totalMonths = y * 12;
    const amortizedPayment =
      (L * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

    setResult({
      interestOnlyPayment,
      amortizedPayment,
      totalMonths,
      monthlyRate: monthlyRate * 100
    });
  };

  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div>
      <p style={{ fontSize: 14 }}>
        Compare interest-only loan payments with fully amortized payments.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Loan amount"
          value={loan}
          onChange={(e) => setLoan(e.target.value)}
        />
        <input
          placeholder="Annual interest rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <input
          placeholder="Loan term (years)"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </div>

      <button style={{ marginTop: 16 }} onClick={calc}>
        Calculate
      </button>

      {result && (
        <div style={{ marginTop: 16, background: "#f6f9ff", padding: 12, borderRadius: 6 }}>
          <p>
            <strong>Interest-only monthly payment:</strong> ${fmt(result.interestOnlyPayment)}
          </p>
          <p>
            <strong>Fully amortized monthly payment:</strong> ${fmt(result.amortizedPayment)}
          </p>
          <p>
            <strong>Monthly interest rate:</strong> {fmt(result.monthlyRate)}%
          </p>
          <p>
            <strong>Total months:</strong> {result.totalMonths}
          </p>
        </div>
      )}
    </div>
  );
}
