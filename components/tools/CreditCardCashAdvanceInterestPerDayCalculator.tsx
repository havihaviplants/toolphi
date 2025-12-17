"use client";

import { useMemo, useState } from "react";

export default function CreditCardCashAdvanceInterestPerDayCalculator() {
  const [amount, setAmount] = useState(1000);
  const [apr, setApr] = useState(30);

  const { dailyRate, interestPerDay } = useMemo(() => {
    const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
    const safeApr = Math.max(0, Number.isFinite(apr) ? apr : 0);

    const dr = safeApr / 100 / 365;
    const ipd = safeAmount * dr;

    return { dailyRate: dr, interestPerDay: ipd };
  }, [amount, apr]);

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
          <strong>Daily Interest Rate:</strong>{" "}
          {(dailyRate * 100).toFixed(5)}% per day
        </p>
        <p className="font-semibold">
          Interest Per Day: ${interestPerDay.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
