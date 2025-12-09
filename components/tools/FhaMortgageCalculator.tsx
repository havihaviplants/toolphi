"use client";

import { useState } from "react";

interface Result {
  baseLoan: number;
  loanWithUpfrontMip: number;
  monthlyPI: number;
  monthlyMip: number;
  totalMonthly: number;
}

export default function FhaMortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPercent, setDownPercent] = useState("");
  const [rate, setRate] = useState("");
  const [termYears, setTermYears] = useState("");
  const [upfrontMip, setUpfrontMip] = useState(""); // %
  const [annualMip, setAnnualMip] = useState(""); // %
  const [result, setResult] = useState<Result | null>(null);

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
    const price = parseNumber(homePrice);
    const dp = parseNumber(downPercent);
    const r = parseNumber(rate);
    const years = parseNumber(termYears);
    const upfront = parseNumber(upfrontMip);
    const annual = parseNumber(annualMip);

    if (price <= 0 || years <= 0 || r < 0) {
      setResult(null);
      return;
    }

    const downAmount = price * (dp / 100);
    const baseLoan = price - downAmount;

    const loanWithUpfrontMip = baseLoan * (1 + upfront / 100);

    const monthlyRate = r / 100 / 12;
    const n = years * 12;

    let monthlyPI = 0;
    if (monthlyRate === 0) {
      monthlyPI = loanWithUpfrontMip / n;
    } else {
      const pow = Math.pow(1 + monthlyRate, n);
      monthlyPI =
        (loanWithUpfrontMip * monthlyRate * pow) / (pow - 1);
    }

    const monthlyMip = (baseLoan * (annual / 100)) / 12;
    const totalMonthly = monthlyPI + monthlyMip;

    setResult({
      baseLoan,
      loanWithUpfrontMip,
      monthlyPI,
      monthlyMip,
      totalMonthly,
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
        Estimate your FHA monthly payment, including principal, interest,
        and FHA mortgage insurance (MIP).
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Home price
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
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
          Down payment (%)
          <input
            type="number"
            value={downPercent}
            onChange={(e) => setDownPercent(e.target.value)}
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
          Term (years)
          <input
            type="number"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
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
          Upfront MIP (% of base loan)
          <input
            type="number"
            value={upfrontMip}
            onChange={(e) => setUpfrontMip(e.target.value)}
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
          Annual MIP rate (%)
          <input
            type="number"
            value={annualMip}
            onChange={(e) => setAnnualMip(e.target.value)}
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
        Calculate FHA payment
      </button>

      {result && (
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
            <strong>Base FHA loan amount:</strong> $
            {formatCurrency(result.baseLoan)}
          </p>
          <p>
            <strong>Loan with upfront MIP:</strong> $
            {formatCurrency(result.loanWithUpfrontMip)}
          </p>
          <p>
            <strong>Monthly principal & interest:</strong> $
            {formatCurrency(result.monthlyPI)}
          </p>
          <p>
            <strong>Monthly FHA MIP:</strong> $
            {formatCurrency(result.monthlyMip)}
          </p>
          <p>
            <strong>Total estimated monthly payment:</strong> $
            {formatCurrency(result.totalMonthly)}
          </p>
        </div>
      )}
    </div>
  );
}
