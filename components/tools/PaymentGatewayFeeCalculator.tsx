"use client";

import { useState } from "react";

export default function PaymentGatewayFeeCalculator() {
  const [amount, setAmount] = useState("500");
  const [feeRate, setFeeRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");

  const paymentAmount = Number(amount);
  const rate = Number(feeRate);
  const fixed = Number(fixedFee);

  const valid =
    paymentAmount > 0 && rate >= 0 && fixed >= 0 &&
    isFinite(paymentAmount) && isFinite(rate) && isFinite(fixed);

  const percentageFee = valid ? (paymentAmount * rate) / 100 : 0;
  const totalFee = valid ? percentageFee + fixed : 0;
  const netAmount = valid ? paymentAmount - totalFee : 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Payment Gateway Fee Calculator</h1>
        <p className="mt-2 text-gray-600">
          Calculate payment gateway fees and see how much you pay in transaction
          costs and how much you receive after gateway fees.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 500"
          />
          <p className="text-sm text-gray-500 mt-1">
            The total amount of a single payment processed through the gateway.
          </p>
        </div>

        <div>
          <label className="block font-medium">Gateway Fee Rate (%)</label>
          <input
            type="number"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 2.9"
          />
          <p className="text-sm text-gray-500 mt-1">
            Percentage fee charged by the payment gateway.
          </p>
        </div>

        <div>
          <label className="block font-medium">Fixed Gateway Fee</label>
          <input
            type="number"
            value={fixedFee}
            onChange={(e) => setFixedFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="e.g. 0.30"
          />
          <p className="text-sm text-gray-500 mt-1">
            Flat fee charged per transaction by the gateway.
          </p>
        </div>
      </div>

      {/* Results */}
      {valid && (
        <div className="rounded-lg border p-6 max-w-xl space-y-3">
          <div className="flex justify-between">
            <span>Total Gateway Fees</span>
            <span className="font-semibold">
              ${totalFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Net Amount Received</span>
            <span className="font-semibold">
              ${netAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Payment gateways typically charge a percentage of the transaction
          amount plus a fixed fee. This calculator adds both components to show
          your total gateway cost and net proceeds.
        </p>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Is this the same as payment processor fees?</h3>
          <p className="text-gray-600">
            Sometimes. In many cases, the gateway and processor are bundled,
            but some providers charge them separately.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Does this include cross-border fees?</h3>
          <p className="text-gray-600">
            No. International or currency conversion fees may apply separately.
          </p>
        </div>
      </div>
    </div>
  );
}
