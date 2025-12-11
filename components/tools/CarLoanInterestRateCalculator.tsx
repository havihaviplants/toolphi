"use client";

import { useState } from "react";

type Result = {
  annualRate: number; // %
  monthlyRate: number; // %
  totalPaid: number;
  totalInterest: number;
};

export default function CarLoanInterestRateCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatNumber = (value: number) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  const calculatePaymentForRate = (P: number, r: number, n: number) => {
    // r: monthly interest rate (e.g. 0.005 for 0.5%)
    if (r === 0) {
      return P / n;
    }
    const factor = Math.pow(1 + r, n);
    return (P * r * factor) / (factor - 1);
  };

  const estimateMonthlyRate = (P: number, payment: number, n: number) => {
    // 간단한 이분 탐색으로 월 이자율 추정
    if (P <= 0 || payment <= 0 || n <= 0) return 0;

    const minPayment = P / n;
    if (payment <= minPayment) {
      // 이자 거의 없는 수준
      return 0;
    }

    let low = 0;
    let high = 1; // 100% per month (말도 안 되는 상한, 단지 탐색용)
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const pm = calculatePaymentForRate(P, mid, n);

      if (pm > payment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return (low + high) / 2;
  };

  const handleCalculate = () => {
    const P = parseNumber(principal);
    const payment = parseNumber(monthlyPayment);
    const termYears = parseNumber(years);
    const n = termYears * 12;

    if (P <= 0 || payment <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    const monthlyRate = estimateMonthlyRate(P, payment, n);
    const monthlyRatePercent = monthlyRate * 100;
    const annualRatePercent = monthlyRate * 12 * 100;

    const totalPaid = payment * n;
    const totalInterest = totalPaid - P;

    setResult({
      annualRate: annualRatePercent,
      monthlyRate: monthlyRatePercent,
      totalPaid,
      totalInterest,
    });
  };

  const handleReset = () => {
    setPrincipal("");
    setMonthlyPayment("");
    setYears("");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate the annual interest rate on a car loan using the loan amount,
        term, and monthly payment.
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
          Car loan amount
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 22000"
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
          Monthly payment
          <input
            type="text"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            placeholder="e.g. 415"
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
          Loan term (years)
          <input
            type="text"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 5"
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
          Calculate interest rate
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
            <strong>Estimated annual interest rate:</strong>{" "}
            {result.annualRate.toFixed(2)}%
          </p>
          <p>
            <strong>Estimated monthly interest rate:</strong>{" "}
            {result.monthlyRate.toFixed(3)}%
          </p>
          <p>
            <strong>Total amount repaid:</strong>{" "}
            {formatNumber(result.totalPaid)}
          </p>
          <p>
            <strong>Total interest paid:</strong>{" "}
            {formatNumber(result.totalInterest)}
          </p>
        </div>
      )}
    </div>
  );
}
