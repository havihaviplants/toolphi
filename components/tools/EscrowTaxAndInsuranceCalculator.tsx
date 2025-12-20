"use client";

import { useMemo, useState } from "react";

function num(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function EscrowTaxAndInsuranceCalculator() {
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(6000);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);

  // Optional add-ons that often show up in “housing payment” discussions
  const [annualFloodInsurance, setAnnualFloodInsurance] = useState<number>(0);
  const [monthlyPMI, setMonthlyPMI] = useState<number>(0); // not escrow, but common in mortgage payment

  const r = useMemo(() => {
    const tax = Math.max(0, num(annualPropertyTax));
    const ins = Math.max(0, num(annualHomeInsurance));
    const flood = Math.max(0, num(annualFloodInsurance));
    const pmi = Math.max(0, num(monthlyPMI));

    const annualEscrowItems = tax + ins + flood;
    const monthlyEscrow = annualEscrowItems / 12;

    const monthlyHousingAddOn = monthlyEscrow + pmi;

    return {
      tax,
      ins,
      flood,
      pmi,
      annualEscrowItems,
      monthlyEscrow,
      monthlyHousingAddOn,
    };
  }, [annualPropertyTax, annualHomeInsurance, annualFloodInsurance, monthlyPMI]);

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
          <label className="block text-sm font-medium">Annual Homeowners Insurance ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualHomeInsurance}
            onChange={(e) => setAnnualHomeInsurance(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Flood Insurance ($/year) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualFloodInsurance}
            onChange={(e) => setAnnualFloodInsurance(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">If you don’t have flood insurance, leave this at $0.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Monthly PMI ($/month) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={monthlyPMI}
            onChange={(e) => setMonthlyPMI(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            PMI isn’t typically part of escrow, but it often appears in “total monthly housing payment.”
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Escrow payments usually cover property taxes and insurance collected monthly. This tool estimates monthly escrow and
          shows a simple monthly add-on if you include PMI.
        </p>

        <p className="font-semibold">Annual Escrow Items (Tax + Insurance + Flood): ${r.annualEscrowItems.toFixed(2)}</p>
        <p className="font-semibold">Monthly Escrow Payment: ${r.monthlyEscrow.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          (${r.tax.toFixed(2)} + ${r.ins.toFixed(2)} + ${r.flood.toFixed(2)}) / 12 = ${r.monthlyEscrow.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Monthly Escrow + PMI (optional): ${r.monthlyHousingAddOn.toFixed(2)} / month</p>
          <p className="text-xs opacity-70">
            PMI is shown as an optional add-on for planning purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
