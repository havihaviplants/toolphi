// components/tools/MortgageRateBuydownCalculator.tsx
"use client";

import { useState } from "react";

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function MortgageRateBuydownCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [baseRate, setBaseRate] = useState("");
  const [buydownType, setBuydownType] = useState<"2-1" | "1-0">("2-1");
  const [result, setResult] = useState<any>(null);

  const formatMoney = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const handleCalculate = () => {
    const P = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const r = parseFloat(baseRate);

    if (!isFinite(P) || !isFinite(years) || !isFinite(r)) {
      setResult(null);
      return;
    }

    const basePayment = calcMonthlyPayment(P, r, years);

    const year1Rate = buydownType === "2-1" ? r - 2 : r - 1;
    const year2Rate = buydownType === "2-1" ? r - 1 : r;

    const year1Payment = calcMonthlyPayment(P, year1Rate, years);
    const year2Payment = calcMonthlyPayment(P, year2Rate, years);

    setResult({
      basePayment,
      year1Payment,
      year2Payment,
      savingsYear1: basePayment - year1Payment,
      savingsYear2: basePayment - year2Payment,
    });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        Temporary rate buydowns lower your mortgage rate for the first 1–2 years. This calculator
        shows how much you save early on compared to the standard rate.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <input placeholder="Loan amount" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
        <input placeholder="Standard rate (%)" value={baseRate} onChange={e => setBaseRate(e.target.value)} />
        <select value={buydownType} onChange={e => setBuydownType(e.target.value as any)}>
          <option value="2-1">2-1 Buydown</option>
          <option value="1-0">1-0 Buydown</option>
        </select>
      </div>

      <button onClick={handleCalculate} style={{ marginTop: 12 }}>Calculate</button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <p><strong>Standard payment:</strong> {formatMoney(result.basePayment)}</p>
          <p><strong>Year 1 payment:</strong> {formatMoney(result.year1Payment)}</p>
          <p><strong>Year 2 payment:</strong> {formatMoney(result.year2Payment)}</p>
          <p><strong>Year 1 savings:</strong> {formatMoney(result.savingsYear1)}</p>
          <p><strong>Year 2 savings:</strong> {formatMoney(result.savingsYear2)}</p>
        </div>
      )}
    </div>
  );
}
