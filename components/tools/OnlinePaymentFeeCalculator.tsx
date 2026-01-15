"use client";

import { useState } from "react";

export default function OnlinePaymentFeeCalculator() {
  const [amount, setAmount] = useState("");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [result, setResult] = useState<null | {
    totalFee: number;
    netAmount: number;
  }>(null);

  const calculate = () => {
    const paymentAmount = parseFloat(amount);
    const rate = parseFloat(feeRate);
    const fixed = parseFloat(fixedFee);

    if (
      isNaN(paymentAmount) ||
      isNaN(rate) ||
      isNaN(fixed) ||
      paymentAmount <= 0
    ) {
      setResult(null);
      return;
    }

    const percentageFee = (paymentAmount * rate) / 100;
    const totalFee = percentageFee + fixed;
    const netAmount = paymentAmount - totalFee;

    setResult({
      totalFee,
      netAmount
    });
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate online payment processing fees and see how much money you
          actually receive after transaction costs.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">
            Payment Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 1000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the total amount of the online payment.
          </p>
        </div>

        <div>
          <label className="block font-medium">
            Fee Percentage (%)
          </label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 2.9"
          />
          <p className="text-sm text-gray-500 mt-1">
            Typical online payment processors charge a percentage fee.
          </p>
        </div>

        <div>
          <label className="block font-medium">
            Fixed Transaction Fee
          </label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 0.30"
          />
          <p className="text-sm text-gray-500 mt-1">
            Some processors also charge a fixed fee per transaction.
          </p>
        </div>

        <button
          onClick={calculate}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Calculate Fees
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-lg border p-6 max-w-xl space-y-3">
          <div className="flex justify-between">
            <span>Total Payment Fees</span>
            <span className="font-semibold">
              ${result.totalFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Net Amount Received</span>
            <span className="font-semibold">
              ${result.netAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Online payment processors typically charge a percentage of the
          transaction amount plus a fixed fee. This calculator adds both
          components to estimate your total processing cost and subtracts it
          from the payment amount.
        </p>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">
            Are online payment fees the same for all providers?
          </h3>
          <p className="text-gray-600">
            No. Fees vary by payment processor, payment method, and country.
            Always check your provider’s official pricing.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            Does this include currency conversion fees?
          </h3>
          <p className="text-gray-600">
            No. This calculator focuses on transaction fees only. Currency
            conversion or cross-border fees may apply separately.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            Can merchants pass payment fees to customers?
          </h3>
          <p className="text-gray-600">
            This depends on local regulations and payment network rules.
            Merchants should verify compliance before adding surcharges.
          </p>
        </div>
      </div>
    </div>
  );
}
