"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function NetInvestmentIncomeTaxCalculator() {
  const [netInvestmentIncome, setNetInvestmentIncome] = useState<number>(50000);
  const [threshold, setThreshold] = useState<number>(200000);
  const [taxRate, setTaxRate] = useState<number>(3.8);

  const { taxablePortion, taxOwed, effectiveRate } = useMemo(() => {
    const income = Math.max(0, safe(netInvestmentIncome));
    const th = Math.max(0, safe(threshold));
    const rate = Math.max(0, safe(taxRate)) / 100;

    // 단순 모델: (income - threshold) 만큼만 과세(음수면 0)
    const taxablePortion = Math.max(income - th, 0);
    const taxOwed = taxablePortion * rate;

    const effectiveRate = income > 0 ? (taxOwed / income) * 100 : 0;

    return { taxablePortion, taxOwed, effectiveRate };
  }, [netInvestmentIncome, threshold, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Net Investment Income ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={netInvestmentIncome}
            onChange={(e) => setNetInvestmentIncome(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Threshold ($)
          </label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
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
          This calculator uses a simplified model: taxable portion = max(income − threshold, 0).
          Actual rules vary by jurisdiction and filing status.
        </p>

        <p className="font-semibold">
          Taxable Portion: ${taxablePortion.toFixed(2)}
        </p>
        <p className="font-semibold">
          Estimated Tax Owed: ${taxOwed.toFixed(2)}
        </p>
        <p className="font-semibold">
          Effective Rate (vs total income): {effectiveRate.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
