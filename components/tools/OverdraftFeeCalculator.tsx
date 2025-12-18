"use client";

import { useMemo, useState } from "react";

export default function OverdraftFeeCalculator() {
  const [feePerOverdraft, setFeePerOverdraft] = useState<number>(35);
  const [overdraftCount, setOverdraftCount] = useState<number>(3);

  const { totalFees, monthlyFees, yearlyFees } = useMemo(() => {
    const fee = Math.max(0, Number.isFinite(feePerOverdraft) ? feePerOverdraft : 0);
    const count = Math.max(0, Number.isFinite(overdraftCount) ? overdraftCount : 0);

    const total = fee * count;
    return {
      totalFees: total,
      monthlyFees: total,        // 입력이 "월 기준 횟수"라는 전제
      yearlyFees: total * 12,
    };
  }, [feePerOverdraft, overdraftCount]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Overdraft Fee (per event) ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={feePerOverdraft}
            onChange={(e) => setFeePerOverdraft(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Overdrafts (per month)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={overdraftCount}
            onChange={(e) => setOverdraftCount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Assumes the overdraft count is a monthly number.
        </p>
        <p className="font-semibold">Total Overdraft Fees (Monthly): ${monthlyFees.toFixed(2)}</p>
        <p>Estimated Overdraft Fees (Yearly): ${yearlyFees.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Total = fee × overdrafts. If your bank charges differently (tiers/limits), use an average fee.
        </p>
      </div>
    </div>
  );
}
