"use client";

import { useMemo, useState } from "react";

export default function OnlinePaymentFeeComparisonCalculator() {
  const [amount, setAmount] = useState("1000");

  const processors = [
    { name: "Stripe", rate: 0.029, fixed: 0.3 },
    { name: "PayPal", rate: 0.0349, fixed: 0.49 },
    { name: "Square", rate: 0.026, fixed: 0.1 },
  ];

  const results = useMemo(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return null;

    return processors.map((p) => {
      const fee = amt * p.rate + p.fixed;
      return {
        name: p.name,
        fee,
      };
    });
  }, [amount]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Comparison Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare estimated payment processing fees across popular online
          payment providers.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-xl space-y-2">
        <label className="block font-medium">Transaction Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Enter transaction amount"
        />
        <p className="text-sm text-gray-500">
          Enter the gross transaction amount before fees.
        </p>
      </div>

      {/* Results */}
      {results && (
        <div className="max-w-xl rounded-lg border p-6 space-y-3">
          {results.map((r) => (
            <div key={r.name} className="flex justify-between">
              <span>{r.name}</span>
              <span className="font-semibold">${r.fee.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="max-w-xl text-xs text-gray-500 leading-relaxed border-t pt-4">
        Fees vary by country, card type, transaction volume, and individual
        agreements. This calculator provides estimates for comparison purposes
        only and does not represent official pricing from any payment provider.
        It should not be considered financial, legal, or accounting advice.
      </div>

      {/* How it works */}
      <div className="max-w-xl space-y-2">
        <h2 className="font-semibold">How this calculator works</h2>
        <p className="text-sm text-gray-600">
          The calculator applies typical percentage-based and fixed fees used by
          major payment processors to estimate total processing costs. Actual
          fees may differ depending on your account terms.
        </p>
      </div>
    </div>
  );
}
