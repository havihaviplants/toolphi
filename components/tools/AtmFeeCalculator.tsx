"use client";

import { useMemo, useState } from "react";

export default function AtmFeeCalculator() {
  const [feePerWithdrawal, setFeePerWithdrawal] = useState<number>(3.5);
  const [withdrawalsPerMonth, setWithdrawalsPerMonth] = useState<number>(4);

  const { monthlyFees, yearlyFees } = useMemo(() => {
    const fee = Math.max(0, Number.isFinite(feePerWithdrawal) ? feePerWithdrawal : 0);
    const count = Math.max(0, Number.isFinite(withdrawalsPerMonth) ? withdrawalsPerMonth : 0);

    const monthly = fee * count;
    return { monthlyFees: monthly, yearlyFees: monthly * 12 };
  }, [feePerWithdrawal, withdrawalsPerMonth]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">ATM Fee (per withdrawal) ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={feePerWithdrawal}
            onChange={(e) => setFeePerWithdrawal(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ATM Withdrawals (per month)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={withdrawalsPerMonth}
            onChange={(e) => setWithdrawalsPerMonth(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Tip: If you pay both a bank fee and an ATM operator fee, add them together.
        </p>
        <p className="font-semibold">Monthly ATM Fees: ${monthlyFees.toFixed(2)}</p>
        <p>Estimated Yearly ATM Fees: ${yearlyFees.toFixed(2)}</p>
      </div>
    </div>
  );
}
