"use client";

import { useState } from "react";

export default function CreditCardCashAdvanceFeeCalculator() {
  const [amount, setAmount] = useState(500);
  const [feePercent, setFeePercent] = useState(5);
  const [apr, setApr] = useState(25);

  const upfrontFee = amount * (feePercent / 100);
  const dailyInterestRate = apr / 100 / 365;
  const firstDayInterest = amount * dailyInterestRate;
  const totalImmediateCost = upfrontFee + firstDayInterest;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Cash Advance Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Cash Advance Fee (%)
          </label>
          <input
            type="number"
            value={feePercent}
            onChange={(e) => setFeePercent(Number(e.target.value))}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            APR (%)
          </label>
          <input
            type="number"
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="input"
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p>
          <strong>Upfront Fee:</strong> ${upfrontFee.toFixed(2)}
        </p>
        <p>
          <strong>First-Day Interest:</strong> ${firstDayInterest.toFixed(2)}
        </p>
        <p className="font-semibold">
          Total Immediate Cost: ${totalImmediateCost.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
