"use client";

import { useState } from "react";

type Method = {
  label: string;
  rate: string;
  fixed: string;
};

export default function PaymentMethodFeeComparisonCalculator() {
  const [amount, setAmount] = useState("1000");
  const [methods, setMethods] = useState<Method[]>([
    { label: "Credit Card", rate: "2.9", fixed: "0.30" },
    { label: "Debit Card", rate: "1.5", fixed: "0.20" },
    { label: "Bank Transfer", rate: "0", fixed: "5.00" },
    { label: "Digital Wallet", rate: "2.5", fixed: "0.30" },
  ]);

  const paymentAmount = Number(amount);
  const valid = paymentAmount > 0 && isFinite(paymentAmount);

  function calcTotal(rate: number, fixed: number) {
    return (paymentAmount * rate) / 100 + fixed;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Payment Method Fee Comparison Calculator</h1>
        <p className="mt-2 text-gray-600">
          Compare transaction fees across different payment methods to determine
          which option minimizes costs.
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        {methods.map((m, idx) => {
          const rate = Number(m.rate);
          const fixed = Number(m.fixed);
          const total = valid ? calcTotal(rate, fixed) : 0;

          return (
            <div key={idx} className="rounded border p-4 space-y-2">
              <h3 className="font-medium">{m.label}</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Fee Rate (%)</label>
                  <input
                    type="number"
                    value={m.rate}
                    onChange={(e) => {
                      const copy = [...methods];
                      copy[idx].rate = e.target.value;
                      setMethods(copy);
                    }}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>

                <div>
                  <label className="text-sm">Fixed Fee</label>
                  <input
                    type="number"
                    value={m.fixed}
                    onChange={(e) => {
                      const copy = [...methods];
                      copy[idx].fixed = e.target.value;
                      setMethods(copy);
                    }}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>
              </div>

              {valid && (
                <p className="text-sm text-gray-600">
                  Total fee: <strong>${total.toFixed(2)}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Each payment method has a different pricing structure. This calculator
          applies percentage-based and fixed fees to show total costs and makes
          it easier to compare options.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Which payment method is cheapest?</h3>
          <p className="text-gray-600">
            It depends on transaction size. Fixed-fee methods are cheaper for
            large payments, while percentage-based methods cost less for small
            transactions.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Does this include settlement delays?</h3>
          <p className="text-gray-600">
            No. This comparison focuses only on fees, not payout timing.
          </p>
        </div>
      </div>
    </div>
  );
}
