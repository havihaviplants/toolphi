"use client";

import { useMemo, useState } from "react";

function safe(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export default function InvestmentTaxCalculator() {
  const [capitalGains, setCapitalGains] = useState<number>(5000);
  const [investmentIncome, setInvestmentIncome] = useState<number>(2000);

  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState<number>(15);
  const [investmentIncomeTaxRate, setInvestmentIncomeTaxRate] = useState<number>(22);

  const result = useMemo(() => {
    const cg = Math.max(0, safe(capitalGains));
    const inc = Math.max(0, safe(investmentIncome));
    const cgRate = Math.max(0, safe(capitalGainsTaxRate)) / 100;
    const incRate = Math.max(0, safe(investmentIncomeTaxRate)) / 100;

    const cgTax = cg * cgRate;
    const incTax = inc * incRate;

    const totalTax = cgTax + incTax;
    const totalProfit = cg + inc;
    const afterTaxProfit = Math.max(totalProfit - totalTax, 0);

    return { cgTax, incTax, totalTax, afterTaxProfit };
  }, [capitalGains, investmentIncome, capitalGainsTaxRate, investmentIncomeTaxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Capital Gains ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={capitalGains}
            onChange={(e) => setCapitalGains(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Dividend / Interest Income ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={investmentIncome}
            onChange={(e) => setInvestmentIncome(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Capital Gains Tax Rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={capitalGainsTaxRate}
            onChange={(e) => setCapitalGainsTaxRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Investment Income Tax Rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={investmentIncomeTaxRate}
            onChange={(e) => setInvestmentIncomeTaxRate(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This calculator provides a simplified estimate. Actual investment taxation depends on jurisdiction,
          holding period, income bracket, and account type.
        </p>

        <p className="font-semibold">Capital Gains Tax: ${result.cgTax.toFixed(2)}</p>
        <p className="font-semibold">Income Tax (Dividends/Interest): ${result.incTax.toFixed(2)}</p>
        <p className="font-semibold">Total Investment Tax: ${result.totalTax.toFixed(2)}</p>
        <p className="font-semibold">After-Tax Profit: ${result.afterTaxProfit.toFixed(2)}</p>
      </div>
    </div>
  );
}
