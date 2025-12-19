"use client";

import { useMemo, useState } from "react";

export default function CapitalGainsTaxEstimator() {
  const [estimatedGain, setEstimatedGain] = useState<number>(5000);
  const [taxRate, setTaxRate] = useState<number>(15);

  const result = useMemo(() => {
    const gain = Math.max(0, estimatedGain);
    const rate = Math.max(0, taxRate) / 100;

    const tax = gain * rate;
    const afterTaxGain = gain - tax;

    return { tax, afterTaxGain };
  }, [estimatedGain, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Estimated Capital Gain ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            value={estimatedGain}
            onChange={(e) => setEstimatedGain(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Estimated Tax Rate (%)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This is a simplified estimate for planning purposes. Actual capital gains
          tax depends on holding period, income level, and jurisdiction.
        </p>

        <p className="font-semibold">
          Estimated Tax: ${result.tax.toFixed(2)}
        </p>
        <p className="font-semibold">
          Estimated After-Tax Gain: ${result.afterTaxGain.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
