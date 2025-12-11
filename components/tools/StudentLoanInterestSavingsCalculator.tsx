"use client";

import { useState } from "react";

export default function StudentLoanInterestSavingsCalculator() {
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [payment, setPayment] = useState("");
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState<any>(null);

  const n = (v: string) => Number(v.replace(/,/g, "")) || 0;

  const compute = (P: number, r: number, pay: number) => {
    const mRate = r / 100 / 12;
    let bal = P;
    let months = 0;
    let totalInterest = 0;

    while (bal > 0 && months < 1000) {
      const interest = bal * mRate;
      totalInterest += interest;
      bal = bal + interest - pay;
      if (bal < 0) bal = 0;
      months++;
    }
    return { months, totalInterest };
  };

  const calc = () => {
    const P = n(balance);
    const r = n(rate);
    const p = n(payment);
    const e = n(extra);

    if (P <= 0 || r < 0 || p <= 0) return;

    const base = compute(P, r, p);
    const fast = compute(P, r, p + e);

    setResult({
      baseMonths: base.months,
      fastMonths: fast.months,
      baseInterest: base.totalInterest,
      fastInterest: fast.totalInterest,
      savedInterest: base.totalInterest - fast.totalInterest,
      monthsSaved: base.months - fast.months
    });
  };

  const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div>
      <p style={{ fontSize: 14 }}>
        Calculate how much interest you can save by making extra payments on your student loan.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input placeholder="Loan balance"
               value={balance}
               onChange={(e) => setBalance(e.target.value)} />
        <input placeholder="Annual interest rate (%)"
               value={rate}
               onChange={(e) => setRate(e.target.value)} />
        <input placeholder="Monthly payment"
               value={payment}
               onChange={(e) => setPayment(e.target.value)} />
        <input placeholder="Extra monthly payment"
               value={extra}
               onChange={(e) => setExtra(e.target.value)} />
      </div>

      <button style={{ marginTop: 16 }}
              onClick={calc}>Calculate</button>

      {result && (
        <div style={{ marginTop: 16, background: "#f5f8ff", padding: 12, borderRadius: 6 }}>
          <p><strong>Original payoff time:</strong> {result.baseMonths} months</p>
          <p><strong>New payoff time:</strong> {result.fastMonths} months</p>
          <p><strong>Months saved:</strong> {result.monthsSaved}</p>
          <p><strong>Interest saved:</strong> ${fmt(result.savedInterest)}</p>
        </div>
      )}
    </div>
  );
}
