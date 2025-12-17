"use client";

import { useMemo, useState } from "react";

export default function CreditCardCashWithdrawalInterestCalculator() {
  const [amount, setAmount] = useState(600);
  const [apr, setApr] = useState(27);
  const [days, setDays] = useState(14);

  const { dailyRate, interest } = useMemo(() => {
    const safeAmount = Math.max(0, Number.isFinite(amount) ? amount : 0);
    const safeApr = Math.max(0, Number.isFinite(apr) ? apr : 0);
    const safeDays = Math.max(0, Math.floor(Number.isFinite(days) ? days : 0));

    const dr = safeApr / 100 / 365;
    const i = safeAmount * dr * safeDays;

    return { dailyRate: dr, interest: i };
  }, [amount, apr, days]);

  const totalAfterInterest = amount + interest;

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
            APR (%)
          </label>
          <input
            type="number"
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Days Carried
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input"
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p>
          <strong>Daily Interest Rate:</strong>{" "}
          {(dailyRate * 100).toFixed(5)}% per day
        </p>
        <p>
          <strong>Estimated Interest ({days} days):</strong> $
          {interest.toFixed(2)}
        </p>
        <p className="font-semibold">
          Total After Interest: ${totalAfterInterest.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
