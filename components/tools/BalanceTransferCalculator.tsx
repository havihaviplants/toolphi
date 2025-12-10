"use client";

import { useState } from "react";

interface ScenarioResult {
  months: number;
  years: number;
  totalPaid: number;
  interestPaid: number;
}

interface Result {
  current: ScenarioResult;
  transfer: ScenarioResult;
  interestSavings: number;
}

export default function BalanceTransferCalculator() {
  const [balance, setBalance] = useState("");
  const [currentApr, setCurrentApr] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const [transferFeePercent, setTransferFeePercent] = useState("3");
  const [introApr, setIntroApr] = useState("0");
  const [introMonths, setIntroMonths] = useState("12");
  const [goToApr, setGoToApr] = useState("19.99");

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

  const calcCurrentScenario = (
    balance: number,
    apr: number,
    payment: number
  ): ScenarioResult | null => {
    if (balance <= 0 || payment <= 0) return null;

    const monthlyRate = apr / 100 / 12;
    const maxMonths = 600;
    let b = balance;
    let months = 0;
    let totalPaid = 0;
    let interestPaid = 0;

    while (b > 0 && months < maxMonths) {
      months += 1;
      const interest = b * monthlyRate;
      interestPaid += interest;

      let pay = payment;
      if (pay <= interest && monthlyRate > 0) {
        return null;
      }

      let principalPay = pay - interest;
      if (principalPay > b) {
        principalPay = b;
        pay = interest + principalPay;
      }

      b -= principalPay;
      totalPaid += pay;
    }

    if (months >= maxMonths && b > 0) return null;

    return {
      months,
      years: months / 12,
      totalPaid,
      interestPaid,
    };
  };

  const calcTransferScenario = (
    balance: number,
    payment: number,
    feePercent: number,
    introApr: number,
    introMonths: number,
    goToApr: number
  ): ScenarioResult | null => {
    if (balance <= 0 || payment <= 0) return null;

    const fee = balance * (feePercent / 100);
    let b = balance + fee;

    const maxMonths = 600;
    let months = 0;
    let totalPaid = 0;
    let interestPaid = 0;

    while (b > 0 && months < maxMonths) {
      months += 1;

      const isIntro = months <= introMonths;
      const apr = isIntro ? introApr : goToApr;
      const monthlyRate = apr / 100 / 12;

      const interest = b * monthlyRate;
      interestPaid += interest;

      let pay = payment;
      if (pay <= interest && monthlyRate > 0) {
        return null;
      }

      let principalPay = pay - interest;
      if (principalPay > b) {
        principalPay = b;
        pay = interest + principalPay;
      }

      b -= principalPay;
      totalPaid += pay;
    }

    if (months >= maxMonths && b > 0) return null;

    return {
      months,
      years: months / 12,
      totalPaid,
      interestPaid,
    };
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const B = parseNumber(balance);
    const aprCurrent = parseNumber(currentApr);
    const payment = parseNumber(monthlyPayment);
    const feePercent = parseNumber(transferFeePercent);
    const aprIntro = parseNumber(introApr);
    const monthsIntro = parseNumber(introMonths);
    const aprGoto = parseNumber(goToApr);

    if (B <= 0 || payment <= 0 || aprCurrent < 0) {
      setError(
        "Please enter a positive balance, current APR, and monthly payment."
      );
      return;
    }

    if (feePercent < 0 || aprIntro < 0 || aprGoto < 0 || monthsIntro < 0) {
      setError("Rates, fees, and intro period cannot be negative.");
      return;
    }

    const currentScenario = calcCurrentScenario(B, aprCurrent, payment);
    if (!currentScenario) {
      setError(
        "With your current APR and monthly payment, the balance may never be fully paid off. Try increasing your payment."
      );
      return;
    }

    const transferScenario = calcTransferScenario(
      B,
      payment,
      feePercent,
      aprIntro,
      monthsIntro,
      aprGoto
    );

    if (!transferScenario) {
      setError(
        "With the transfer offer settings and your monthly payment, the balance may not be fully paid. Try increasing your payment or adjusting terms."
      );
      return;
    }

    const interestSavings =
      currentScenario.interestPaid - transferScenario.interestPaid;

    setResult({
      current: currentScenario,
      transfer: transferScenario,
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
        Compare the cost of staying with your current credit card versus moving
        your balance to a new card with an introductory rate and transfer fee.
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
            Current card
          </legend>
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <label style={{ fontSize: 14 }}>
              Current balance
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
              Current APR (%)
              <input
                type="number"
                value={currentApr}
                onChange={(e) => setCurrentApr(e.target.value)}
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
              Monthly payment amount
              <input
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
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
            Balance transfer offer
          </legend>
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <label style={{ fontSize: 14 }}>
              Transfer fee (% of balance)
              <input
                type="number"
                value={transferFeePercent}
                onChange={(e) => setTransferFeePercent(e.target.value)}
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
              Intro APR (%)
              <input
                type="number"
                value={introApr}
                onChange={(e) => setIntroApr(e.target.value)}
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
              Intro period (months)
              <input
                type="number"
                value={introMonths}
                onChange={(e) => setIntroMonths(e.target.value)}
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
              Go-to APR after intro (%)
              <input
                type="number"
                value={goToApr}
                onChange={(e) => setGoToApr(e.target.value)}
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
        Compare balance transfer
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
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Current card</p>
          <p>
            Payoff time: {result.current.months} months (
            {result.current.years.toFixed(1)} years)
          </p>
          <p>
            Total interest: $
            {formatCurrency(result.current.interestPaid)}
          </p>

          <p
            style={{
              fontWeight: 500,
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            After balance transfer
          </p>
          <p>
            Payoff time: {result.transfer.months} months (
            {result.transfer.years.toFixed(1)} years)
          </p>
          <p>
            Total interest (including intro/go-to APR): $
            {formatCurrency(result.transfer.interestPaid)}
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
                color:
                  result.interestSavings >= 0 ? "#15803d" : "#b91c1c",
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
