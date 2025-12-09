"use client";

import { useState } from "react";

function parseNumber(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

type MortgageResult = {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
};

function calcMortgage(loanAmount: number, ratePercent: number, years: number): MortgageResult {
  const principal = loanAmount;
  const r = ratePercent / 100 / 12;
  const n = years * 12;

  if (!principal || principal <= 0 || !years || years <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: 0,
    };
  }

  let monthlyPayment = 0;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    monthlyPayment = (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  const totalCost = monthlyPayment * n;
  const totalInterest = totalCost - principal;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

export default function MortgageComparisonCalculator() {
  const [loanAmountA, setLoanAmountA] = useState("");
  const [rateA, setRateA] = useState("6.5");
  const [termA, setTermA] = useState("30");

  const [loanAmountB, setLoanAmountB] = useState("");
  const [rateB, setRateB] = useState("5.8");
  const [termB, setTermB] = useState("15");

  const [resultA, setResultA] = useState<MortgageResult | null>(null);
  const [resultB, setResultB] = useState<MortgageResult | null>(null);

  const handleCompare = () => {
    const loanA = parseNumber(loanAmountA || loanAmountB); // A 비우면 B를 기본값으로 사용
    const loanB = parseNumber(loanAmountB || loanAmountA); // B 비우면 A를 기본값으로 사용
    const rA = parseNumber(rateA);
    const rB = parseNumber(rateB);
    const yA = parseNumber(termA);
    const yB = parseNumber(termB);

    if (!loanA || !loanB || loanA <= 0 || loanB <= 0) {
      setResultA(null);
      setResultB(null);
      return;
    }

    const resA = calcMortgage(loanA, rA, yA);
    const resB = calcMortgage(loanB, rB, yB);

    setResultA(resA);
    setResultB(resB);
  };

  const betterOption =
    resultA && resultB
      ? resultA.totalCost < resultB.totalCost
        ? "Option A has a lower total cost over the life of the loan."
        : resultA.totalCost > resultB.totalCost
        ? "Option B has a lower total cost over the life of the loan."
        : "Both options have a similar total cost."
      : null;

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Compare two mortgage offers side by side to see which one has the lower monthly
        payment, total interest, and total cost.
      </p>

      <div
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Option A */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Option A
          </h3>

          <div
            style={{
              display: "grid",
              gap: 8,
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
                value={loanAmountA}
                onChange={(e) => setLoanAmountA(e.target.value)}
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
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 8,
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
                  value={rateA}
                  onChange={(e) => setRateA(e.target.value)}
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
                  value={termA}
                  onChange={(e) => setTermA(e.target.value)}
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
        </div>

        {/* Option B */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Option B
          </h3>

          <div
            style={{
              display: "grid",
              gap: 8,
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
                value={loanAmountB}
                onChange={(e) => setLoanAmountB(e.target.value)}
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
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 8,
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
                  value={rateB}
                  onChange={(e) => setRateB(e.target.value)}
                  placeholder="5.8"
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
                  value={termB}
                  onChange={(e) => setTermB(e.target.value)}
                  placeholder="15"
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
        </div>
      </div>

      <button
        type="button"
        onClick={handleCompare}
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
        Compare mortgages
      </button>

      {resultA && resultB && (
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
          <h4
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Results
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <p>
                <strong>Option A monthly:</strong> ${resultA.monthlyPayment}
              </p>
              <p>
                <strong>Option A total interest:</strong> ${resultA.totalInterest}
              </p>
              <p>
                <strong>Option A total cost:</strong> ${resultA.totalCost}
              </p>
            </div>

            <div>
              <p>
                <strong>Option B monthly:</strong> ${resultB.monthlyPayment}
              </p>
              <p>
                <strong>Option B total interest:</strong> ${resultB.totalInterest}
              </p>
              <p>
                <strong>Option B total cost:</strong> ${resultB.totalCost}
              </p>
            </div>
          </div>

          {betterOption && (
            <p style={{ marginTop: 10 }}>
              {betterOption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
