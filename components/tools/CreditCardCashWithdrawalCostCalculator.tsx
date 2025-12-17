"use client";

import { useState } from "react";

export default function CreditCardCashWithdrawalCostCalculator() {
  const [amount, setAmount] = useState(400);
  const [atmFee, setAtmFee] = useState(6);
  const [apr, setApr] = useState(24);

  const dailyInterestRate = apr / 100 / 365;
  const firstDayInterest = amount * dailyInterestRate;
  const totalImmediateCost = atmFee + firstDayInterest;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Cash Withdrawal Amount ($)
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
            ATM Fee ($)
          </label>
          <input
            type="number"
            value={atmFee}
            onChange={(e) => setAtmFee(Number(e.target.value))}
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
          <strong>ATM Fee:</strong> ${atmFee.toFixed(2)}
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
