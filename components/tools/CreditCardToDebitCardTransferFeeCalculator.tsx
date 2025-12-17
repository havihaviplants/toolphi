"use client";

import { useState } from "react";

export default function CreditCardToDebitCardTransferFeeCalculator() {
  const [amount, setAmount] = useState(800);
  const [feePercent, setFeePercent] = useState(4);
  const [apr, setApr] = useState(23);

  const transferFee = amount * (feePercent / 100);
  const dailyInterestRate = apr / 100 / 365;
  const firstDayInterest = amount * dailyInterestRate;
  const totalImmediateCost = transferFee + firstDayInterest;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Transfer Amount ($)
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
            Transfer Fee (%)
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
          <strong>Transfer Fee:</strong> ${transferFee.toFixed(2)}
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
