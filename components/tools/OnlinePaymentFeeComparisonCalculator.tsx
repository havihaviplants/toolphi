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
      <div>
        <h1 className="text-2xl font-semibold">
          Online Payment Fee Comparison Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Compare payment processing fees across popular providers.
        </p>
      </div>

      <div className="max-w-xl">
        <label className="block font-medium">Transaction Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      {results && (
        <div className="rounded-lg border p-6 max-w-xl space-y-3">
          {results.map((r) => (
            <div key={r.name} className="flex justify-between">
              <span>{r.name}</span>
              <span className="font-semibold">${r.fee.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
