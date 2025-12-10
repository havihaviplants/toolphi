"use client";

import { useState } from "react";

interface Result {
  monthlyPayment: number;
  biweeklyPayment: number;
  biweeklyYears: number;
  biweeklyMonths: number;
  totalInterestMonthly: number;
  totalInterestBiweekly: number;
  interestSavings: number;
  timeSavedMonths: number;
}

export default function BiweeklyMortgageCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
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

  const formatYearsMonths = (years: number) => {
    const m = Math.round(years * 12);
    const y = Math.floor(m / 12);
    const mm = m % 12;
    return { years: y, months: mm };
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const P = parseNumber(principal);
    const rAnnual = parseNumber(rate);
    const termYears = parseNumber(years);

    if (P <= 0 || rAnnual <= 0 || termYears <= 0) {
      setError("Please enter positive values for loan amount, rate, and term.");
      return;
    }

    const monthlyRate = rAnnual / 100 / 12;
    const nMonths = termYears * 12;

    // 월 상환액 (표준 원리금 균등)
    const monthlyPayment =
      (P * monthlyRate * Math.pow(1 + monthlyRate, nMonths)) /
      (Math.pow(1 + monthlyRate, nMonths) - 1);

    const totalPaidMonthly = monthlyPayment * nMonths;
    const totalInterestMonthly = totalPaidMonthly - P;

    // Biweekly: 월 상환액의 절반을 2주마다 내고, 1년 26회 납부
    const biweeklyRate = rAnnual / 100 / 26;
    const biweeklyPayment = monthlyPayment / 2;

    // 스케줄 시뮬레이션
    let balance = P;
    let period = 0;
    let totalPaidBiweekly = 0;
    const maxPeriods = 26 * termYears * 2; // 여유 있게 (정상보다 조금 큰 한도)

    while (balance > 0 && period < maxPeriods) {
      period += 1;
      const interest = balance * biweeklyRate;
      let principalPay = biweeklyPayment - interest;

      if (principalPay <= 0) {
        setError(
          "Biweekly payment is too low for this rate and balance. Try a shorter term or higher payment."
        );
        return;
      }

      if (principalPay > balance) {
        principalPay = balance;
      }

      balance -= principalPay;
      totalPaidBiweekly += biweeklyPayment;
    }

    if (period >= maxPeriods && balance > 0) {
      setError(
        "Biweekly payoff period is too long to estimate with the current inputs."
      );
      return;
    }

    const biweeklyYears = period / 26;
    const biweeklyTime = formatYearsMonths(biweeklyYears);
    const totalInterestBiweekly = totalPaidBiweekly - P;
    const interestSavings = totalInterestMonthly - totalInterestBiweekly;

    // 시간 절약 (개월 단위)
    const originalMonths = termYears * 12;
    const biweeklyMonths = biweeklyYears * 12;
    const timeSavedMonths = Math.max(
      0,
      Math.round(originalMonths - biweeklyMonths)
    );

    setResult({
      monthlyPayment,
      biweeklyPayment,
      biweeklyYears: biweeklyTime.years,
      biweeklyMonths: biweeklyTime.months,
      totalInterestMonthly,
      totalInterestBiweekly,
      interestSavings,
      timeSavedMonths,
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
        Compare a standard monthly mortgage schedule with a biweekly payment
        schedule and see how much time and interest you can save.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Loan amount
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
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
          Annual interest rate (%)
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
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
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
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
        Calculate biweekly savings
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
          <p>
            <strong>Monthly payment (standard):</strong> $
            {formatCurrency(result.monthlyPayment)}
          </p>
          <p>
            <strong>Biweekly payment:</strong> $
            {formatCurrency(result.biweeklyPayment)} (every two weeks)
          </p>
          <p>
            <strong>Biweekly payoff time:</strong> {result.biweeklyYears} years
            {result.biweeklyMonths > 0 ? ` ${result.biweeklyMonths} months` : ""}
          </p>
          <p>
            <strong>Total interest (monthly):</strong> $
            {formatCurrency(result.totalInterestMonthly)}
          </p>
          <p>
            <strong>Total interest (biweekly):</strong> $
            {formatCurrency(result.totalInterestBiweekly)}
          </p>
          <p>
            <strong>Interest savings:</strong> $
            {formatCurrency(result.interestSavings)}
          </p>
          <p>
            <strong>Time saved:</strong> {result.timeSavedMonths} months
          </p>
        </div>
      )}
    </div>
  );
}
