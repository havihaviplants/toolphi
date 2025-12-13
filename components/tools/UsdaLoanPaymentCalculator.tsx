"use client";

import { useMemo, useState } from "react";

type Result = {
  baseLoanAmount: number;
  upfrontFeeAmount: number;
  financedLoanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyAnnualFee: number;
  totalMonthlyPayment: number;
};

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function UsdaLoanPaymentCalculator() {
  const [homePrice, setHomePrice] = useState<string>("");
  const [downPayment, setDownPayment] = useState<string>("");
  const [annualRate, setAnnualRate] = useState<string>("");
  const [years, setYears] = useState<string>("30");

  // USDA defaults (can change over time; allow user override)
  const [upfrontFeeRate, setUpfrontFeeRate] = useState<string>("1.00"); // %
  const [annualFeeRate, setAnnualFeeRate] = useState<string>("0.35"); // %

  const [rollUpfrontFee, setRollUpfrontFee] = useState<boolean>(true);
  const [result, setResult] = useState<Result | null>(null);

  const monthlyRate = useMemo(() => {
    const r = parseNumber(annualRate);
    return r > 0 ? r / 100 / 12 : 0;
  }, [annualRate]);

  const handleCalculate = () => {
    const price = parseNumber(homePrice);
    const down = parseNumber(downPayment);
    const termYears = parseNumber(years);
    const upRate = parseNumber(upfrontFeeRate);
    const annRate = parseNumber(annualFeeRate);

    if (!price || !monthlyRate || !termYears) {
      setResult(null);
      return;
    }

    const dp = clamp(down, 0, price);
    const baseLoanAmount = price - dp;

    // Upfront guarantee fee (percentage of base loan)
    const upfrontFeeAmount = baseLoanAmount * (upRate / 100);

    // Financed loan amount: roll upfront fee into loan or pay upfront
    const financedLoanAmount = rollUpfrontFee
      ? baseLoanAmount + upfrontFeeAmount
      : baseLoanAmount;

    const n = termYears * 12;

    // Monthly principal & interest on financed loan
    const monthlyPrincipalAndInterest =
      (financedLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    // USDA annual fee is typically charged annually based on outstanding principal;
    // here we approximate using the starting (financed) loan amount.
    const monthlyAnnualFee = (financedLoanAmount * (annRate / 100)) / 12;

    const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyAnnualFee;

    setResult({
      baseLoanAmount,
      upfrontFeeAmount,
      financedLoanAmount,
      monthlyPrincipalAndInterest,
      monthlyAnnualFee,
      totalMonthlyPayment,
    });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>
        USDA Loan Payment Calculator
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Estimate USDA monthly payments including the upfront guarantee fee and the annual fee
        (approximated as a monthly charge).
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Home price
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            placeholder="e.g. 350000"
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
          Down payment (optional)
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="e.g. 0"
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
            placeholder="e.g. 6.0"
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
            placeholder="e.g. 30"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 6,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <label style={{ fontSize: 14 }}>
            Upfront guarantee fee (%)
            <input
              type="number"
              value={upfrontFeeRate}
              onChange={(e) => setUpfrontFeeRate(e.target.value)}
              placeholder="e.g. 1.00"
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
            Annual fee (%)
            <input
              type="number"
              value={annualFeeRate}
              onChange={(e) => setAnnualFeeRate(e.target.value)}
              placeholder="e.g. 0.35"
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
        </div>

        <label style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={rollUpfrontFee}
            onChange={(e) => setRollUpfrontFee(e.target.checked)}
            style={{ transform: "scale(1.1)" }}
          />
          Roll upfront fee into loan amount
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
              <strong>Base loan amount:</strong>{" "}
              {formatCurrency(result.baseLoanAmount)}
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Upfront guarantee fee:</strong>{" "}
              {formatCurrency(result.upfrontFeeAmount)}{" "}
              <span style={{ color: "#666" }}>
                ({rollUpfrontFee ? "rolled into loan" : "paid upfront"})
              </span>
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Financed loan amount:</strong>{" "}
              {formatCurrency(result.financedLoanAmount)}
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Monthly principal & interest:</strong>{" "}
              {formatCurrency(result.monthlyPrincipalAndInterest)}
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Estimated monthly USDA annual fee:</strong>{" "}
              {formatCurrency(result.monthlyAnnualFee)}
            </div>

            <div style={{ fontSize: 14 }}>
              <strong>Total estimated monthly payment:</strong>{" "}
              {formatCurrency(result.totalMonthlyPayment)}
            </div>

            <div style={{ fontSize: 12, color: "#666" }}>
              Notes: The USDA annual fee is commonly assessed on outstanding principal.
              This tool approximates it using the starting financed loan amount. Actual lender servicing may differ.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
