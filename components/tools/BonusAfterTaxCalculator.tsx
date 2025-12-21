"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function BonusAfterTaxCalculator() {
  const [grossBonus, setGrossBonus] = useState<number>(10000);
  const [withholdingRate, setWithholdingRate] = useState<number>(30);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  const r = useMemo(() => {
    const gross = Math.max(0, n(grossBonus));
    const rate = Math.min(100, Math.max(0, n(withholdingRate))) / 100;
    const deductions = Math.max(0, n(otherDeductions));

    const taxWithheld = gross * rate;
    const takeHome = Math.max(0, gross - taxWithheld - deductions);

    return {
      gross,
      ratePct: rate * 100,
      taxWithheld,
      deductions,
      takeHome,
    };
  }, [grossBonus, withholdingRate, otherDeductions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Gross bonus ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={grossBonus}
            onChange={(e) => setGrossBonus(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Bonus withholding rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={withholdingRate}
            onChange={(e) => setWithholdingRate(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            This is an estimate for tax withheld on bonuses.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Other deductions ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="1"
            value={otherDeductions}
            onChange={(e) => setOtherDeductions(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Optional: benefits, garnishments, or other bonus-specific deductions.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          After-tax bonus estimate using a withholding rate (tax withheld) and optional deductions.
        </p>

        <p className="font-semibold">Take-home bonus: ${r.takeHome.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Take-home = Gross ${r.gross.toFixed(2)} − Tax withheld ${r.taxWithheld.toFixed(2)} − Deductions ${r.deductions.toFixed(2)}
        </p>

        <p className="text-xs opacity-70 pt-2">
          Withholding rate applied: {r.ratePct.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
