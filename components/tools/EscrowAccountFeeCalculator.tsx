"use client";

import { useMemo, useState } from "react";

function nn(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function EscrowAccountFeeCalculator() {
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(6000);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);

  // Some servicers may charge fees; keep optional.
  const [monthlyServicingFee, setMonthlyServicingFee] = useState<number>(0);

  const r = useMemo(() => {
    const tax = Math.max(0, nn(annualPropertyTax));
    const ins = Math.max(0, nn(annualHomeInsurance));
    const fee = Math.max(0, nn(monthlyServicingFee));

    const monthlyBaseEscrow = (tax + ins) / 12;
    const monthlyTotalEscrow = monthlyBaseEscrow + fee;

    const annualBaseEscrow = monthlyBaseEscrow * 12;
    const annualTotalEscrow = monthlyTotalEscrow * 12;

    return {
      tax,
      ins,
      fee,
      monthlyBaseEscrow,
      monthlyTotalEscrow,
      annualBaseEscrow,
      annualTotalEscrow,
    };
  }, [annualPropertyTax, annualHomeInsurance, monthlyServicingFee]);

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
          <label className="block text-sm font-medium">Monthly Escrow Account Fee ($/month) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={monthlyServicingFee}
            onChange={(e) => setMonthlyServicingFee(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Many servicers don’t charge a separate escrow account fee. If unsure, leave this as $0.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This estimates your monthly escrow payment for property tax and homeowners insurance, plus an optional monthly servicing fee.
        </p>

        <p className="font-semibold">Monthly Escrow (Tax + Insurance): ${r.monthlyBaseEscrow.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          (${r.tax.toFixed(2)} + ${r.ins.toFixed(2)}) / 12 = ${r.monthlyBaseEscrow.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Monthly Servicing Fee: ${r.fee.toFixed(2)}</p>
          <p className="font-semibold">Total Monthly Escrow Payment: ${r.monthlyTotalEscrow.toFixed(2)}</p>
        </div>

        <div className="pt-2">
          <p>Annual escrow (tax+insurance): ${r.annualBaseEscrow.toFixed(2)}</p>
          <p>Annual escrow (including fee): ${r.annualTotalEscrow.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
