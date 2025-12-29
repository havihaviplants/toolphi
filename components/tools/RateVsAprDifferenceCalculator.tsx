"use client";

import { useState } from "react";

type Result = {
  paymentRate: number;
  paymentApr: number;
  monthlyDifference: number;
  impliedFeePerMonth: number;
};

function calcMonthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (!isFinite(principal) || principal <= 0) return NaN;
  if (!isFinite(r) || r < 0 || !isFinite(n) || n <= 0) return NaN;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function RateVsAprDifferenceCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [termYears, setTermYears] = useState("30");
  const [rate, setRate] = useState("");
  const [apr, setApr] = useState("");
  const [fees, setFees] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const formatMoney = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const handleCalculate = () => {
    const P = parseFloat(loanAmount);
    const years = parseFloat(termYears);
    const rRate = parseFloat(rate);
    const rApr = parseFloat(apr);
    const fee = parseFloat(fees);

    if (
      !isFinite(P) || P <= 0 ||
      !isFinite(years) || years <= 0 ||
      !isFinite(rRate) || rRate < 0 ||
      !isFinite(rApr) || rApr < 0 ||
      !isFinite(fee) || fee < 0
    ) {
      setResult(null);
      return;
    }

    const paymentRate = calcMonthlyPayment(P, rRate, years);
    const paymentApr = calcMonthlyPayment(P, rApr, years);

    if (!isFinite(paymentRate) || !isFinite(paymentApr)) {
      setResult(null);
      return;
    }

    const monthlyDifference = paymentApr - paymentRate;
    const impliedFeePerMonth = fee / (years * 12);

    setResult({
      paymentRate,
      paymentApr,
      monthlyDifference,
      impliedFeePerMonth,
    });
  };

  return (
    <div>
      <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        APR includes fees and other costs beyond the stated interest rate.
        This tool shows how those fees widen the gap between your rate and APR in monthly payment terms.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input placeholder="Loan amount" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
        <input placeholder="Term (years)" value={termYears} onChange={e => setTermYears(e.target.value)} />
        <input placeholder="Interest rate (%)" value={rate} onChange={e => setRate(e.target.value)} />
        <input placeholder="APR (%)" value={apr} onChange={e => setApr(e.target.value)} />
        <input placeholder="Upfront fees (USD)" value={fees} onChange={e => setFees(e.target.value)} />
      </div>

      <button onClick={handleCalculate}>Calculate</button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <p><strong>Monthly payment (rate):</strong> {formatMoney(result.paymentRate)}</p>
          <p><strong>Monthly payment (APR):</strong> {formatMoney(result.paymentApr)}</p>
          <p><strong>Monthly difference:</strong> {formatMoney(result.monthlyDifference)}</p>
          <p style={{ fontSize: 12, color: "#666" }}>
            Fees translate to about {formatMoney(result.impliedFeePerMonth)} per month over the full term.
          </p>
        </div>
      )}
    </div>
  );
}
