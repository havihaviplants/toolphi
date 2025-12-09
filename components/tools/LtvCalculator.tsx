"use client";

import { useState } from "react";

function parseNumber(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function LtvCalculator() {
  const [propertyValue, setPropertyValue] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [ltv, setLtv] = useState<number | null>(null);

  const handleCalculate = () => {
    const value = parseNumber(propertyValue);
    const loan = parseNumber(loanAmount);

    if (!value || value <= 0 || !loan || loan <= 0) {
      setLtv(null);
      return;
    }

    const ratio = (loan / value) * 100;
    setLtv(parseFloat(ratio.toFixed(2)));
  };

  let verdict: string | null = null;
  if (ltv !== null) {
    if (ltv < 80) {
      verdict =
        "Great — your LTV is below 80%, which usually qualifies for better rates and no PMI.";
    } else if (ltv <= 90) {
      verdict =
        "Okay — your LTV is common for many loans, but you may still pay PMI.";
    } else {
      verdict =
        "High — your LTV may limit loan options or refinancing until you build more equity.";
    }
  }

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Calculate how much of the property value is financed by your loan. Lenders use
        LTV to decide approval, pricing, and whether you need PMI.
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
            Property value / purchase price ($)
          </label>
          <input
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
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
            Loan amount ($)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="320000"
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
        Calculate LTV
      </button>

      {ltv !== null && (
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
            <strong>LTV ratio:</strong> {ltv}%
          </p>
          {verdict && <p style={{ marginTop: 8 }}>{verdict}</p>}
        </div>
      )}
    </div>
  );
}
