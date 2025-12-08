"use client";

import { useState } from "react";

type Result = {
  maxMonthlyHousing: number;
  maxLoanAmount: number;
  maxHomePrice: number;
  resultingDti: number;
};

export default function HomeAffordabilityCalculator() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [monthlyDebts, setMonthlyDebts] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  // 보수적인 백엔드 DTI 기준 (총 부채 36% 가정)
  const MAX_TOTAL_DTI = 0.36;

  const handleCalculate = () => {
    const incomeNum = parseFloat(annualIncome);
    const debtsNum = parseFloat(monthlyDebts || "0");
    const downNum = parseFloat(downPayment || "0");
    const rateNum = parseFloat(annualRate);
    const yearsNum = parseFloat(years);

    if (
      !isFinite(incomeNum) ||
      incomeNum <= 0 ||
      !isFinite(rateNum) ||
      rateNum <= 0 ||
      !isFinite(yearsNum) ||
      yearsNum <= 0
    ) {
      // 필수값이 잘못된 경우 계산하지 않음
      setResult(null);
      return;
    }

    const monthlyIncome = incomeNum / 12;
    const allowedTotalDebt = monthlyIncome * MAX_TOTAL_DTI;
    const maxMonthlyHousing = Math.max(allowedTotalDebt - (debtsNum || 0), 0);

    const r = rateNum / 100 / 12;
    const n = yearsNum * 12;

    let maxLoanAmount = 0;
    if (r > 0) {
      // 표준 모기지 상환 공식 역산
      maxLoanAmount =
        maxMonthlyHousing * ((1 - Math.pow(1 + r, -n)) / r);
    } else {
      maxLoanAmount = maxMonthlyHousing * n;
    }

    const maxHomePrice = maxLoanAmount + (downNum || 0);
    const resultingDti =
      monthlyIncome > 0
        ? ((debtsNum + maxMonthlyHousing) / monthlyIncome) * 100
        : 0;

    setResult({
      maxMonthlyHousing,
      maxLoanAmount,
      maxHomePrice,
      resultingDti,
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatNumber = (value: number, digits = 2) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: digits,
    });

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Estimate how much house you can afford based on your income,
        existing debts, and basic mortgage assumptions.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          <span>Annual income (before tax)</span>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            placeholder="90000"
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
          <span>Monthly debt payments</span>
          <input
            type="number"
            value={monthlyDebts}
            onChange={(e) => setMonthlyDebts(e.target.value)}
            placeholder="600"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <span style={{ fontSize: 12, color: "#777" }}>
            Credit cards, car loans, student loans, etc.
          </span>
        </label>

        <label style={{ fontSize: 14 }}>
          <span>Available down payment</span>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="60000"
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
          <span>Mortgage interest rate (annual %)</span>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="6.0"
            step="0.01"
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
          <span>Mortgage term (years)</span>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="30"
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
          padding: "8px 14px",
          borderRadius: 4,
          border: "none",
          background: "#0366d6",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Calculate affordability
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fafafa",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <p>
            <strong>Max monthly mortgage payment: </strong>
            {formatCurrency(result.maxMonthlyHousing)}
          </p>
          <p>
            <strong>Max loan amount: </strong>
            {formatCurrency(result.maxLoanAmount)}
          </p>
          <p>
            <strong>Estimated max home price: </strong>
            {formatCurrency(result.maxHomePrice)}
          </p>
          <p>
            <strong>Resulting DTI (with mortgage): </strong>
            {formatNumber(result.resultingDti)}%
          </p>
          <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
            This calculator uses a conservative 36% total debt-to-income
            (DTI) assumption. Actual lender criteria may vary.
          </p>
        </div>
      )}
    </div>
  );
}
