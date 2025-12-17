"use client";

import { useState } from "react";

export default function CreditCardCashAppTransferFeeCalculator() {
  const [amount, setAmount] = useState(300);
  const [feePercent, setFeePercent] = useState(3);
  const [apr, setApr] = useState(25);

  const platformFee = amount * (feePercent / 100);
  const dailyInterestRate = apr / 100 / 365;
  const firstDayInterest = amount * dailyInterestRate;
  const totalImmediateCost = platformFee + firstDayInterest;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Amount to Add ($)
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
            Cash App Fee (%)
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
            Credit Card APR (%)
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
          <strong>Cash App Fee:</strong> ${platformFee.toFixed(2)}
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
