"use client";

import { useMemo, useState } from "react";

function f(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function MonthlyEscrowPaymentCalculator() {
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(6000);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);

  // Not technically escrow, but often part of monthly housing cost
  const [monthlyHOA, setMonthlyHOA] = useState<number>(0);

  const r = useMemo(() => {
    const tax = Math.max(0, f(annualPropertyTax));
    const ins = Math.max(0, f(annualHomeInsurance));
    const hoa = Math.max(0, f(monthlyHOA));

    const monthlyEscrow = (tax + ins) / 12;
    const monthlyAddOn = monthlyEscrow + hoa;

    return { tax, ins, hoa, monthlyEscrow, monthlyAddOn };
  }, [annualPropertyTax, annualHomeInsurance, monthlyHOA]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Annual Property Tax ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualPropertyTax}
            onChange={(e) => setAnnualPropertyTax(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Home Insurance ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualHomeInsurance}
            onChange={(e) => setAnnualHomeInsurance(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Monthly HOA ($/month) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={monthlyHOA}
            onChange={(e) => setMonthlyHOA(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            HOA isn’t part of escrow, but many people want a quick “monthly add-on” estimate.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Escrow payments typically cover property taxes and homeowners insurance collected monthly by your mortgage servicer.
        </p>

        <p className="font-semibold">Monthly Escrow Payment (Tax + Insurance): ${r.monthlyEscrow.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          (${r.tax.toFixed(2)} + ${r.ins.toFixed(2)}) / 12 = ${r.monthlyEscrow.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Escrow + HOA (optional): ${r.monthlyAddOn.toFixed(2)} / month</p>
          <p className="text-xs opacity-70">
            HOA is shown separately as an optional housing add-on.
          </p>
        </div>
      </div>
    </div>
  );
}
