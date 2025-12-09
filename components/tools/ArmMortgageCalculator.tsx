"use client";

import { useState } from "react";

function parseNumber(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ArmMortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [introRate, setIntroRate] = useState("");
  const [introYears, setIntroYears] = useState("");
  const [afterRate, setAfterRate] = useState("");
  const [termYears, setTermYears] = useState("");

  const [result, setResult] = useState<{
    introPayment: number;
    remainingBalance: number;
    adjustedPayment: number;
  } | null>(null);

  const handleCalculate = () => {
    const principal = parseNumber(loanAmount);
    const introR = parseNumber(introRate) / 100;
    const afterR = parseNumber(afterRate) / 100;
    const introY = parseNumber(introYears);
    const termY = parseNumber(termYears);

    if (!principal || principal <= 0 || termY <= 0 || introY <= 0) {
      setResult(null);
      return;
    }

    const nTotal = termY * 12;
    const nIntro = introY * 12;
    const nRemain = nTotal - nIntro;

    if (nRemain <= 0) {
      setResult(null);
      return;
    }

    const rIntroMonthly = introR / 12;
    const rAfterMonthly = afterR / 12;

    // 1) Intro period monthly payment (standard amortization on full term)
    let introPayment = 0;
    if (rIntroMonthly === 0) {
      introPayment = principal / nTotal;
    } else {
      introPayment =
        (principal * rIntroMonthly) /
        (1 - Math.pow(1 + rIntroMonthly, -nTotal));
    }

    // 2) Remaining balance after intro period
    let remainingBalance = principal;
    if (rIntroMonthly === 0) {
      remainingBalance = principal - introPayment * nIntro;
    } else {
      const factor = Math.pow(1 + rIntroMonthly, nIntro);
      remainingBalance =
        principal * factor -
        introPayment * ((factor - 1) / rIntroMonthly);
    }

    // 3) Adjusted monthly payment using remaining balance and new rate
    let adjustedPayment = 0;
    if (rAfterMonthly === 0) {
      adjustedPayment = remainingBalance / nRemain;
    } else {
      adjustedPayment =
        (remainingBalance * rAfterMonthly) /
        (1 - Math.pow(1 + rAfterMonthly, -nRemain));
    }

    setResult({
      introPayment: Math.round(introPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      adjustedPayment: Math.round(adjustedPayment * 100) / 100,
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
        See how your monthly payment changes between the introductory ARM
        period and after the rate adjusts.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Loan amount ($)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="400000"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Intro rate (%)
            </label>
            <input
              type="number"
              value={introRate}
              onChange={(e) => setIntroRate(e.target.value)}
              placeholder="4.5"
              step="0.01"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Intro period (years)
            </label>
            <input
              type="number"
              value={introYears}
              onChange={(e) => setIntroYears(e.target.value)}
              placeholder="5"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Rate after adjustment (%)
            </label>
            <input
              type="number"
              value={afterRate}
              onChange={(e) => setAfterRate(e.target.value)}
              placeholder="7.0"
              step="0.01"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Total term (years)
            </label>
            <input
              type="number"
              value={termYears}
              onChange={(e) => setTermYears(e.target.value)}
              placeholder="30"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>
        </div>
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
        Calculate ARM payments
      </button>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fafafa",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Monthly payment during intro period:</strong> $
            {result.introPayment}
          </p>
          <p>
            <strong>Remaining balance after intro period:</strong> $
            {result.remainingBalance}
          </p>
          <p>
            <strong>Estimated monthly payment after adjustment:</strong> $
            {result.adjustedPayment}
          </p>
          <p style={{ marginTop: 8 }}>
            This is an estimate only. Actual ARM payments may vary based on your
            specific loan terms, caps, and index changes.
          </p>
        </div>
      )}
    </div>
  );
}
