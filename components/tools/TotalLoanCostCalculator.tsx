"use client";

import { useState } from "react";

interface BaseResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  months: number;
  years: number;
}

interface ExtraResult {
  monthlyPaymentWithExtra: number;
  totalPaidWithExtra: number;
  totalInterestWithExtra: number;
  monthsWithExtra: number;
  yearsWithExtra: number;
  interestSavings: number;
  timeSavedMonths: number;
}

interface Result {
  base: BaseResult;
  extra?: ExtraResult;
}

export default function TotalLoanCostCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [extraMonthly, setExtraMonthly] = useState("");
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

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const P = parseNumber(amount);
    const annualRate = parseNumber(rate);
    const termYears = parseNumber(years);
    const extra = parseNumber(extraMonthly);

    if (P <= 0 || termYears <= 0) {
      setError("Please enter a positive loan amount and term.");
      return;
    }

    if (annualRate < 0) {
      setError("Interest rate cannot be negative.");
      return;
    }

    const n = termYears * 12;
    let monthlyPayment = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    const r = annualRate / 100 / 12;

    if (r === 0) {
      // No interest
      monthlyPayment = P / n;
      totalPaid = monthlyPayment * n;
      totalInterest = 0;
    } else {
      monthlyPayment =
        (P * r * Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1);
      totalPaid = monthlyPayment * n;
      totalInterest = totalPaid - P;
    }

    const base: BaseResult = {
      monthlyPayment,
      totalPaid,
      totalInterest,
      months: n,
      years: termYears,
    };

    let extraResult: ExtraResult | undefined = undefined;

    if (extra > 0) {
      const paymentWithExtra = monthlyPayment + extra;
      let balance = P;
      let months = 0;
      let totalPaidExtra = 0;
      let totalInterestExtra = 0;
      const maxMonths = n * 2; // safety limit

      if (r === 0) {
        // 단순 상환 (무이자)
        months = Math.ceil(P / paymentWithExtra);
        totalPaidExtra = paymentWithExtra * months;
        totalInterestExtra = 0;
      } else {
        while (balance > 0 && months < maxMonths) {
          months += 1;
          const interest = balance * r;
          totalInterestExtra += interest;

          let payment = paymentWithExtra;
          if (payment <= interest) {
            setError(
              "Extra payment is too small to reduce the principal. Increase the extra monthly amount."
            );
            return;
          }

          let principalPay = payment - interest;
          if (principalPay > balance) {
            principalPay = balance;
            payment = interest + principalPay;
          }

          balance -= principalPay;
          totalPaidExtra += payment;
        }

        if (months >= maxMonths && balance > 0) {
          setError(
            "With the current extra payment, the payoff period is too long to estimate. Try increasing the extra amount."
          );
          return;
        }
      }

      const yearsWithExtra = months / 12;
      const interestSavings = totalInterest - totalInterestExtra;
      const timeSavedMonths = n - months;

      extraResult = {
        monthlyPaymentWithExtra: paymentWithExtra,
        totalPaidWithExtra: totalPaidExtra,
        totalInterestWithExtra: totalInterestExtra,
        monthsWithExtra: months,
        yearsWithExtra,
        interestSavings,
        timeSavedMonths: Math.max(0, timeSavedMonths),
      };
    }

    setResult({
      base,
      extra: extraResult,
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
        See the total cost of a loan, including monthly payment, total paid, and
        total interest. Optionally add an extra monthly payment to see how much
        time and interest you can save.
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

        <label style={{ fontSize: 14 }}>
          Extra monthly payment (optional)
          <input
            type="number"
            value={extraMonthly}
            onChange={(e) => setExtraMonthly(e.target.value)}
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
        Calculate total loan cost
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
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Base loan</p>
          <p>
            Monthly payment: ${formatCurrency(result.base.monthlyPayment)}
          </p>
          <p>
            Total paid over term: ${formatCurrency(result.base.totalPaid)}
          </p>
          <p>
            Total interest paid: ${formatCurrency(result.base.totalInterest)}
          </p>
          <p>
            Payoff time: {result.base.months} months (
            {result.base.years.toFixed(1)} years)
          </p>

          {result.extra && (
            <div style={{ marginTop: 12 }}>
              <p
                style={{
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                With extra monthly payment
              </p>
              <p>
                New monthly payment: $
                {formatCurrency(result.extra.monthlyPaymentWithExtra)}
              </p>
              <p>
                Total paid: $
                {formatCurrency(result.extra.totalPaidWithExtra)}
              </p>
              <p>
                Total interest paid: $
                {formatCurrency(result.extra.totalInterestWithExtra)}
              </p>
              <p>
                Payoff time: {result.extra.monthsWithExtra} months (
                {result.extra.yearsWithExtra.toFixed(1)} years)
              </p>
              <p
                style={{
                  marginTop: 8,
                  fontWeight: 500,
                }}
              >
                Interest savings:
                <span
                  style={{
                    marginLeft: 4,
                    color:
                      result.extra.interestSavings >= 0
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                >
                  {result.extra.interestSavings >= 0 ? "" : "-"}$
                  {formatCurrency(Math.abs(result.extra.interestSavings))}
                </span>
              </p>
              <p>
                Time saved: {result.extra.timeSavedMonths} months
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
