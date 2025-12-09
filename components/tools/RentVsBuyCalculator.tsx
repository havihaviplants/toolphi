"use client";

import { useState } from "react";

function parseNumber(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function RentVsBuyCalculator() {
  const [monthlyRent, setMonthlyRent] = useState("");
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("6.5");
  const [termYears, setTermYears] = useState("30");
  const [taxInsuranceHoa, setTaxInsuranceHoa] = useState("");

  const [result, setResult] = useState<{
    monthlyRent: number;
    monthlyMortgage: number;
    monthlyOwnership: number;
  } | null>(null);

  const handleCalculate = () => {
    const rent = parseNumber(monthlyRent);
    const price = parseNumber(homePrice);
    const down = parseNumber(downPayment);
    const rate = parseNumber(interestRate) / 100;
    const years = parseNumber(termYears) || 30;
    const extra = parseNumber(taxInsuranceHoa); // monthly tax + insurance + HOA

    if (!price || price <= 0 || !years || years <= 0 || rate < 0) {
      setResult(null);
      return;
    }

    const principal = price - down;
    const n = years * 12;
    const r = rate / 12;

    let monthlyMortgage = 0;
    if (r === 0) {
      monthlyMortgage = principal / n;
    } else {
      monthlyMortgage = (principal * r) / (1 - Math.pow(1 + r, -n));
    }

    const monthlyOwnership = monthlyMortgage + extra;

    setResult({
      monthlyRent: Math.round(rent * 100) / 100,
      monthlyMortgage: Math.round(monthlyMortgage * 100) / 100,
      monthlyOwnership: Math.round(monthlyOwnership * 100) / 100,
    });
  };

  const verdict =
    result &&
    (result.monthlyOwnership < result.monthlyRent
      ? "Buying looks cheaper per month than renting based on these inputs."
      : result.monthlyOwnership > result.monthlyRent
      ? "Renting looks cheaper per month than buying based on these inputs."
      : "Renting and buying have similar monthly cost with these inputs.");

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Compare your current rent with the estimated monthly cost of owning a home,
        including mortgage, tax, insurance, and HOA.
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
            Current monthly rent ($)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            placeholder="2000"
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
            Home price ($)
          </label>
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
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

        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Down payment ($)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="40000"
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
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
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
              Interest rate (%)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
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
              Term (years)
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

        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Monthly tax + insurance + HOA ($, optional)
          </label>
          <input
            type="number"
            value={taxInsuranceHoa}
            onChange={(e) => setTaxInsuranceHoa(e.target.value)}
            placeholder="400"
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
        Compare rent vs buy
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
            <strong>Monthly rent:</strong> ${result.monthlyRent}
          </p>
          <p>
            <strong>Monthly mortgage (principal + interest):</strong> $
            {result.monthlyMortgage}
          </p>
          <p>
            <strong>Estimated total monthly ownership cost:</strong> $
            {result.monthlyOwnership}
          </p>
          <p style={{ marginTop: 8 }}>{verdict}</p>
        </div>
      )}
    </div>
  );
}
