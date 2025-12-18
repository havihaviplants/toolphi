"use client";

import { useMemo, useState } from "react";

function safe(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function BankMaintenanceFeeCalculator() {
  const [monthlyFee, setMonthlyFee] = useState<number>(12);
  const [months, setMonths] = useState<number>(24);

  const r = useMemo(() => {
    const fee = Math.max(0, safe(monthlyFee));
    const m = Math.max(0, safe(months));

    const totalCost = fee * m;
    const yearlyCost = fee * 12;

    return { totalCost, yearlyCost };
  }, [monthlyFee, months]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Monthly Maintenance Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Account Duration (months)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Many banks waive maintenance fees if balance or activity requirements are met.
          Use this to estimate the worst-case cost.
        </p>

        <p className="font-semibold">Total Maintenance Fees: ${r.totalCost.toFixed(2)}</p>
        <p>Estimated Yearly Cost: ${r.yearlyCost.toFixed(2)}</p>
      </div>
    </div>
  );
}
