"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function InternationalAtmFeeCalculator() {
  const [atmFee, setAtmFee] = useState<number>(3);
  const [foreignFeePct, setForeignFeePct] = useState<number>(3); // %
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(200);
  const [withdrawalsPerMonth, setWithdrawalsPerMonth] = useState<number>(2);

  const r = useMemo(() => {
    const fee = Math.max(0, n(atmFee));
    const pct = Math.max(0, n(foreignFeePct));
    const amount = Math.max(0, n(withdrawalAmount));
    const count = Math.max(0, n(withdrawalsPerMonth));

    const atmFeeTotal = fee * count;
    const foreignFeeTotal = amount * (pct / 100) * count;
    const totalCost = atmFeeTotal + foreignFeeTotal;

    return { atmFeeTotal, foreignFeeTotal, totalCost };
  }, [atmFee, foreignFeePct, withdrawalAmount, withdrawalsPerMonth]);

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
            value={atmFee}
            onChange={(e) => setAtmFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Foreign Transaction Fee (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={foreignFeePct}
            onChange={(e) => setForeignFeePct(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Withdrawal Amount ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Withdrawals per Month</label>
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
          International ATM withdrawals often include both a flat ATM fee and a foreign transaction fee.
        </p>

        <p className="font-semibold">Total Monthly International ATM Fees: ${r.totalCost.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Breakdown — ATM Fees: ${r.atmFeeTotal.toFixed(2)}, Foreign Transaction Fees: $
          {r.foreignFeeTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
