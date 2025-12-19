"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function InvestmentIncomeTaxCalculator() {
  const [income, setIncome] = useState<number>(2000);
  const [taxRate, setTaxRate] = useState<number>(22);

  const { taxOwed, afterTaxIncome } = useMemo(() => {
    const inc = Math.max(0, safe(income));
    const rate = Math.max(0, safe(taxRate)) / 100;

    const taxOwed = inc * rate;
    const afterTaxIncome = inc - taxOwed;

    return { taxOwed, afterTaxIncome };
  }, [income, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Investment Income ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Tax Rate (%)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This estimates tax on investment income (e.g., dividends, interest, distributions)
          using a flat rate you provide. Actual taxation may vary by income type and jurisdiction.
        </p>

        <p className="font-semibold">
          Estimated Tax Owed: ${taxOwed.toFixed(2)}
        </p>
        <p className="font-semibold">
          After-Tax Income: ${afterTaxIncome.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
