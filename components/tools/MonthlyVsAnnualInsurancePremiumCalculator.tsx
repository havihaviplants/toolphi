"use client";
import { useMemo, useState } from "react";

const n = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const pct01 = (v: string) => Math.min(Math.max(n(v) / 100, 0), 1);
const money = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-";

export default function MonthlyVsAnnualInsurancePremiumCalculator() {
  const [monthlyPremium, setMonthlyPremium] = useState("200");
  const [monthlyBillingFee, setMonthlyBillingFee] = useState("5");

  const [annualDiscountPct, setAnnualDiscountPct] = useState("8");
  const [annualOneTimeFee, setAnnualOneTimeFee] = useState("0");

  const result = useMemo(() => {
    const mPrem = n(monthlyPremium);
    const mFee = n(monthlyBillingFee);

    const discount = pct01(annualDiscountPct);
    const aFee = n(annualOneTimeFee);

    const monthlyTotal = (mPrem + mFee) * 12;

    const annualBase = mPrem * 12;
    const annualAfterDiscount = annualBase * (1 - discount);
    const annualTotal = annualAfterDiscount + aFee;

    const diff = monthlyTotal - annualTotal; // positive = annual saves

    return {
      monthlyTotal,
      annualBase,
      annualAfterDiscount,
      annualTotal,
      diff,
    };
  }, [monthlyPremium, monthlyBillingFee, annualDiscountPct, annualOneTimeFee]);

  const winner =
    result.diff > 0 ? "Annual payment is cheaper" : result.diff < 0 ? "Monthly payment is cheaper" : "Both are equal";

  return (
    <div>
      <p style={{ marginBottom: 12, color: "#555" }}>
        Compare the total yearly cost of paying monthly vs paying annually. This helps you estimate whether an annual-pay
        discount outweighs monthly billing fees.
      </p>

      <h3>Monthly payment</h3>
      <label>Monthly Premium ($)</label>
      <input
        type="number"
        value={monthlyPremium}
        onChange={(e) => setMonthlyPremium(e.target.value)}
        placeholder="200"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <label>Monthly Billing Fee ($)</label>
      <input
        type="number"
        value={monthlyBillingFee}
        onChange={(e) => setMonthlyBillingFee(e.target.value)}
        placeholder="0"
        style={{ width: "100%", marginBottom: 14 }}
      />

      <h3>Annual payment</h3>
      <label>Annual Pay Discount (%)</label>
      <input
        type="number"
        value={annualDiscountPct}
        onChange={(e) => setAnnualDiscountPct(e.target.value)}
        placeholder="0"
        style={{ width: "100%", marginBottom: 8 }}
      />
      <label>One-time Annual Payment Fee ($) (optional)</label>
      <input
        type="number"
        value={annualOneTimeFee}
        onChange={(e) => setAnnualOneTimeFee(e.target.value)}
        placeholder="0"
        style={{ width: "100%", marginBottom: 16 }}
      />

      <div style={{ marginTop: 8 }}>
        <h3>Results</h3>

        <p style={{ fontWeight: "bold" }}>{winner}</p>

        <div style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>
          <div>• Monthly total per year: ${money(result.monthlyTotal)}</div>
          <div>• Annual base (12 × monthly premium): ${money(result.annualBase)}</div>
          <div>• Annual after discount: ${money(result.annualAfterDiscount)}</div>
          <div>• Annual total (after discount + annual fee): ${money(result.annualTotal)}</div>
        </div>

        <p style={{ marginTop: 10, color: "#555" }}>
          Difference: <strong>${money(Math.abs(result.diff))}</strong>{" "}
          {result.diff > 0 ? "saved by paying annually." : result.diff < 0 ? "saved by paying monthly." : ""}
        </p>

        <p style={{ marginTop: 12, color: "#777", fontSize: 13, lineHeight: 1.6 }}>
          Note: Some insurers compute annual pricing differently than 12× monthly. If you have a quoted annual price,
          use it by setting discount/fees to match that quote.
        </p>
      </div>
    </div>
  );
}
