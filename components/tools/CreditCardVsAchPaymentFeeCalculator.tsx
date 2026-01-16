"use client";

import { useMemo, useState } from "react";

export default function CreditCardVsAchPaymentFeeCalculator() {
  const [amount, setAmount] = useState("2000");
  const [ccRate, setCcRate] = useState("2.9");
  const [ccFixed, setCcFixed] = useState("0.30");
  const [achFee, setAchFee] = useState("5");

  const result = useMemo(() => {
    const amt = Number(amount);
    const rate = Number(ccRate);
    const fixed = Number(ccFixed);
    const ach = Number(achFee);

    if (
      !amt ||
      amt <= 0 ||
      rate < 0 ||
      fixed < 0 ||
      ach < 0 ||
      !isFinite(amt)
    )
      return null;

    const creditCardFee = (amt * rate) / 100 + fixed;
    const achTotalFee = ach;

    return {
      creditCardFee,
      achTotalFee,
      cheaper:
        creditCardFee < achTotalFee
          ? "Credit Card"
          : creditCardFee > achTotalFee
          ? "ACH"
          : "Equal",
    };
  }, [amount, ccRate, ccFixed, achFee]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Credit Card vs ACH Payment Fee Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare credit card and ACH payment fees to see which payment method
          costs less for your transaction.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Credit Card Fee Rate (%)
          </label>
          <input
            type="number"
            value={ccRate}
            onChange={(e) => setCcRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Credit Card Fixed Fee
          </label>
          <input
            type="number"
            value={ccFixed}
            onChange={(e) => setCcFixed(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">ACH Flat Fee</label>
          <input
            type="number"
            value={achFee}
            onChange={(e) => setAchFee(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      {result && (
        <div className="max-w-xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Credit Card Fee</span>
            <span className="font-semibold">
              ${result.creditCardFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>ACH Fee</span>
            <span className="font-semibold">
              ${result.achTotalFee.toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-3 text-sm text-gray-700">
            Cheaper option:{" "}
            <strong>{result.cheaper}</strong>
          </div>
        </div>
      )}

      <div className="max-w-xl space-y-2">
        <h2 className="font-semibold">How it works</h2>
        <p className="text-sm text-gray-600">
          Credit card fees scale with transaction size, while ACH fees are often
          flat. Larger payments usually favor ACH.
        </p>
      </div>
    </div>
  );
}
