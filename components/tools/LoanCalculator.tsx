"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
};

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(annualRate);
    const yearsValue = parseFloat(years || "0");
    const monthsValue = parseFloat(months || "0");
    const extra = parseFloat(extraPayment || "0");

    if (!isFinite(principal) || principal <= 0) {
      setResult(null);
      return;
    }
    if (!isFinite(rate) || rate <= 0) {
      setResult(null);
      return;
    }

    const totalMonths =
      yearsValue > 0 || monthsValue > 0
        ? yearsValue * 12 + monthsValue
        : 0;

    if (!isFinite(totalMonths) || totalMonths <= 0) {
      setResult(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;

    // 기본 월 상환금 (추가 상환은 아래에서 별도 적용)
    const basePayment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -totalMonths));

    let balance = principal;
    let month = 0;
    let totalInterest = 0;

    // 익스트라 포함 실제 상환 루프
    while (balance > 0 && month < 1000 * 12) {
      month += 1;
      const interest = balance * monthlyRate;
      let payment = basePayment + (extra || 0);

      if (payment > balance + interest) {
        payment = balance + interest;
      }

      const principalPaid = payment - interest;
      balance -= principalPaid;
      if (balance < 0.01) balance = 0;

      totalInterest += interest;

      if (balance <= 0) break;
    }

    const totalPaid = principal + totalInterest;

    setResult({
      monthlyPayment: basePayment,
      totalInterest,
      totalPaid,
      monthsToPayoff: month,
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatNumber = (value: number, digits = 1) =>
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
        Calculate monthly payment, total interest, and total cost for a
        fixed-rate loan. Optionally add an extra monthly payment to see
        how much faster you can pay off the loan.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          <span>Loan amount</span>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="20000"
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
          <span>Annual interest rate (%)</span>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="8.0"
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          <label style={{ fontSize: 14 }}>
            <span>Term (years)</span>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="5"
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
            <span>Term (months)</span>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="0"
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
              You can use years only, months only, or a combination.
            </span>
          </label>
        </div>

        <label style={{ fontSize: 14 }}>
          <span>Extra monthly payment (optional)</span>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            placeholder="50"
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
            Extra amount you plan to pay each month on top of the required payment.
          </span>
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
        Calculate loan
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
            <strong>Base monthly payment (no extra): </strong>
            {formatCurrency(result.monthlyPayment)}
          </p>
          <p>
            <strong>Estimated payoff time: </strong>
            {result.monthsToPayoff} months (
            {formatNumber(result.monthsToPayoff / 12, 1)} years)
          </p>
          <p>
            <strong>Total interest paid: </strong>
            {formatCurrency(result.totalInterest)}
          </p>
          <p>
            <strong>Total paid (principal + interest): </strong>
            {formatCurrency(result.totalPaid)}
          </p>
          <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
            This is a simplified estimate for fixed-rate installment loans.
            Actual lender terms, fees, and compounding rules may change the
            real numbers.
          </p>
        </div>
      )}
    </div>
  );
}
