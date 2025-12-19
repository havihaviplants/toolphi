"use client";

import { useMemo, useState } from "react";

type Mode = "percent" | "fixed";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function PrepaymentPenaltyCalculator() {
  const [remainingBalance, setRemainingBalance] = useState<number>(200000);
  const [mode, setMode] = useState<Mode>("percent");
  const [penaltyRate, setPenaltyRate] = useState<number>(2);
  const [fixedPenalty, setFixedPenalty] = useState<number>(4000);

  const penalty = useMemo(() => {
    const bal = Math.max(0, safe(remainingBalance));
    if (mode === "fixed") return Math.max(0, safe(fixedPenalty));
    const rate = Math.max(0, safe(penaltyRate)) / 100;
    return bal * rate;
  }, [remainingBalance, mode, penaltyRate, fixedPenalty]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Remaining Loan Balance ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={remainingBalance}
            onChange={(e) => setRemainingBalance(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Penalty Type</label>
          <select
            className="input"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="percent">Percent of Balance</option>
            <option value="fixed">Fixed Fee</option>
          </select>
        </div>

        {mode === "percent" ? (
          <div>
            <label className="block text-sm font-medium">Penalty Rate (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={penaltyRate}
              onChange={(e) => setPenaltyRate(Number(e.target.value))}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Fixed Penalty ($)</label>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={fixedPenalty}
              onChange={(e) => setFixedPenalty(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This is an estimate. Actual prepayment penalties depend on your lender’s policy and loan terms.
        </p>
        <p className="font-semibold">Estimated Prepayment Penalty: ${penalty.toFixed(2)}</p>
      </div>
    </div>
  );
}
