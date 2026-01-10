"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function monthlyPayment(principal: number, apr: number, months: number) {
  const P = Math.max(0, principal);
  const m = Math.max(1, Math.round(months));
  const r = Math.max(0, apr) / 12;

  if (P === 0) return 0;
  if (r === 0) return P / m;

  const p = P * (r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
  return Number.isFinite(p) ? p : 0;
}

function remainingBalance(principal: number, apr: number, termMonths: number, monthsPaid: number, mp: number) {
  const P = Math.max(0, principal);
  const term = Math.max(1, Math.round(termMonths));
  const paid = Math.max(0, Math.min(term, Math.round(monthsPaid)));
  const r = Math.max(0, apr) / 12;

  if (P === 0) return 0;
  if (r === 0) {
    const perMonth = P / term;
    return Math.max(0, P - perMonth * paid);
  }
  const f = Math.pow(1 + r, paid);
  const bal = P * f - (mp * (f - 1)) / r;
  return Number.isFinite(bal) ? Math.max(0, bal) : 0;
}

export default function AgriculturalEquipmentLeaseVsLoanCalculator() {
  // Context
  const [equipmentPrice, setEquipmentPrice] = useState<number>(120000);
  const [yearsOfUse, setYearsOfUse] = useState<number>(6);
  const [expectedResaleValueEnd, setExpectedResaleValueEnd] = useState<number>(45000);

  // Lease
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState<number>(1900);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(48);
  const [leaseFeesUpfront, setLeaseFeesUpfront] = useState<number>(0);
  const [leaseDownPayment, setLeaseDownPayment] = useState<number>(0);
  const [leaseBuyout, setLeaseBuyout] = useState<number>(40000);

  // Loan
  const [loanDownPayment, setLoanDownPayment] = useState<number>(20000);
  const [loanAprPct, setLoanAprPct] = useState<number>(7.0);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(72);
  const [feesFinanced, setFeesFinanced] = useState<number>(1500);

  // Ongoing costs
  const [annualMaintenanceLease, setAnnualMaintenanceLease] = useState<number>(2500);
  const [annualMaintenanceLoan, setAnnualMaintenanceLoan] = useState<number>(3500);
  const [annualInsurance, setAnnualInsurance] = useState<number>(900);

  const r = useMemo(() => {
    const price = Math.max(0, n(equipmentPrice));
    const useMonths = Math.max(1, Math.round(Math.max(1, n(yearsOfUse)) * 12));
    const resale = Math.max(0, n(expectedResaleValueEnd));

    // Lease cost
    const lmp = Math.max(0, n(leaseMonthlyPayment));
    const lterm = Math.max(1, Math.round(Math.max(1, n(leaseTermMonths))));
    const lfees = Math.max(0, n(leaseFeesUpfront));
    const ldp = Math.max(0, n(leaseDownPayment));
    const buyout = Math.max(0, n(leaseBuyout));

    const leasePaidMonths = Math.min(useMonths, lterm);
    const leasePayments = lmp * leasePaidMonths;
    const leaseNeedsBuyout = useMonths > lterm;
    const leaseEndCost = leaseNeedsBuyout ? buyout : 0;
    const leaseEndValue = leaseNeedsBuyout ? resale : 0;

    const leaseMaint = (Math.max(0, n(annualMaintenanceLease)) / 12) * useMonths;
    const insurance = (Math.max(0, n(annualInsurance)) / 12) * useMonths;

    const leaseTotalOut = ldp + lfees + leasePayments + leaseEndCost + leaseMaint + insurance;
    const leaseNet = leaseTotalOut - leaseEndValue;
    const leaseEffMonthly = leaseNet / useMonths;

    // Loan cost
    const dp = Math.min(Math.max(0, n(loanDownPayment)), price);
    const financedFees = Math.max(0, n(feesFinanced));
    const principal = Math.max(0, price - dp + financedFees);

    const apr = Math.max(0, n(loanAprPct)) / 100;
    const term = Math.max(1, Math.round(Math.max(1, n(loanTermMonths))));
    const mp = monthlyPayment(principal, apr, term);

    const paidMonths = Math.min(useMonths, term);
    const payments = mp * paidMonths;

    const maint = (Math.max(0, n(annualMaintenanceLoan)) / 12) * useMonths;

    const bal = remainingBalance(principal, apr, term, paidMonths, mp);
    const endValue = resale - bal;

    const totalOut = dp + payments + maint + insurance;
    const net = totalOut - endValue;
    const effMonthly = net / useMonths;

    const cheaper = leaseEffMonthly < effMonthly ? "lease" : "loan";
    const diff = Math.abs(leaseEffMonthly - effMonthly);

    // Break-even scan (rough)
    let breakEvenMonths: number | null = null;
    const maxScan = Math.min(240, Math.max(12, useMonths * 2));
    for (let m = 12; m <= maxScan; m += 1) {
      // lease at horizon m
      const lp = lmp * Math.min(m, lterm);
      const needBuy = m > lterm;
      const endC = needBuy ? buyout : 0;
      const lm = (Math.max(0, n(annualMaintenanceLease)) / 12) * m;
      const ins = (Math.max(0, n(annualInsurance)) / 12) * m;
      const leaseTot = ldp + lfees + lp + endC + lm + ins;
      const leaseVal = needBuy ? resale : 0;
      const leaseNet2 = leaseTot - leaseVal;

      // loan at horizon m
      const paid = Math.min(m, term);
      const pay = mp * paid;
      const bm = (Math.max(0, n(annualMaintenanceLoan)) / 12) * m;
      const ins2 = (Math.max(0, n(annualInsurance)) / 12) * m;
      const bal2 = remainingBalance(principal, apr, term, paid, mp);
      const endVal2 = resale - bal2;
      const buyTot = dp + pay + bm + ins2;
      const buyNet2 = buyTot - endVal2;

      if (Math.abs(leaseNet2 - buyNet2) / Math.max(1, Math.min(leaseNet2, buyNet2)) < 0.02) {
        breakEvenMonths = m;
        break;
      }
    }

    return {
      useMonths,
      price,
      resale,
      // lease
      leaseNeedsBuyout,
      leaseTotalOut,
      leaseNet,
      leaseEffMonthly,
      // loan
      mp,
      totalOut,
      bal,
      net,
      effMonthly,
      // compare
      cheaper,
      diff,
      breakEvenMonths,
    };
  }, [
    equipmentPrice,
    yearsOfUse,
    expectedResaleValueEnd,
    leaseMonthlyPayment,
    leaseTermMonths,
    leaseFeesUpfront,
    leaseDownPayment,
    leaseBuyout,
    loanDownPayment,
    loanAprPct,
    loanTermMonths,
    feesFinanced,
    annualMaintenanceLease,
    annualMaintenanceLoan,
    annualInsurance,
  ]);

  const winnerText = r.cheaper === "lease" ? "Leasing is cheaper" : "Loan financing is cheaper";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Agricultural Equipment Lease vs Loan Calculator</h1>
        <p className="text-sm opacity-80">
          Compare leasing versus loan financing for agricultural equipment using effective monthly cost,
          total out-of-pocket, and a rough break-even horizon.
        </p>
      </div>

      {/* Context */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Equipment & usage</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Equipment price ($)</label>
            <input className="input" type="number" min={0} step="1" value={equipmentPrice} onChange={(e) => setEquipmentPrice(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Years of use</label>
            <input className="input" type="number" min={1} step="1" value={yearsOfUse} onChange={(e) => setYearsOfUse(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Expected resale value at end ($)</label>
            <input className="input" type="number" min={0} step="1" value={expectedResaleValueEnd} onChange={(e) => setExpectedResaleValueEnd(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used for both options to estimate end value.</p>
          </div>
        </div>
      </div>

      {/* Lease */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Lease</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Monthly payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseMonthlyPayment} onChange={(e) => setLeaseMonthlyPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Lease term (months)</label>
            <input className="input" type="number" min={1} step="1" value={leaseTermMonths} onChange={(e) => setLeaseTermMonths(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseDownPayment} onChange={(e) => setLeaseDownPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Upfront fees ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseFeesUpfront} onChange={(e) => setLeaseFeesUpfront(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Buyout price ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseBuyout} onChange={(e) => setLeaseBuyout(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Only applied if you keep it beyond the lease term.</p>
          </div>
        </div>
      </div>

      {/* Loan */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Loan financing</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={loanDownPayment} onChange={(e) => setLoanDownPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">APR (%)</label>
            <input className="input" type="number" min={0} step="0.01" value={loanAprPct} onChange={(e) => setLoanAprPct(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Loan term (months)</label>
            <input className="input" type="number" min={1} step="1" value={loanTermMonths} onChange={(e) => setLoanTermMonths(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Fees financed ($)</label>
            <input className="input" type="number" min={0} step="1" value={feesFinanced} onChange={(e) => setFeesFinanced(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t text-sm opacity-80">
          Estimated loan monthly payment: <span className="font-semibold">${money(r.mp)}</span>
        </div>
      </div>

      {/* Costs */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Ongoing costs (annual)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Maintenance (lease) ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualMaintenanceLease} onChange={(e) => setAnnualMaintenanceLease(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Maintenance (loan/buy) ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualMaintenanceLoan} onChange={(e) => setAnnualMaintenanceLoan(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Insurance ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualInsurance} onChange={(e) => setAnnualInsurance(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Lease: effective monthly cost</p>
            <p className="text-xl font-bold">${money(r.leaseEffMonthly)}</p>
            <p className="text-xs opacity-70 mt-1">
              Net cost ÷ months of use (includes ongoing costs and end value).
            </p>
          </div>

          <div>
            <p className="text-sm opacity-70">Loan: effective monthly cost</p>
            <p className="text-xl font-bold">${money(r.effMonthly)}</p>
            <p className="text-xs opacity-70 mt-1">
              Includes resale value minus remaining loan balance.
            </p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t">
            <div className="text-sm opacity-70">Result</div>
            <div className="text-lg font-semibold">
              {winnerText} by about <span className="font-bold">${money(r.diff)}</span> per month (effective).
            </div>

            <div className="text-sm opacity-80 mt-2">
              Break-even (rough):{" "}
              <span className="font-semibold">
                {r.breakEvenMonths ? `${r.breakEvenMonths} months (~${(r.breakEvenMonths / 12).toFixed(1)} years)` : "Not found within scan range"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Lease net cost includes payments, buyout (if needed), maintenance, insurance minus end value.</li>
          <li>Loan net cost includes down payment + payments + costs minus (resale − remaining balance).</li>
          <li>Effective monthly cost = net cost ÷ months of use.</li>
          <li>Break-even is approximated by scanning usage horizons.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why does remaining balance matter?</span><br />
            If you sell or replace equipment before the loan ends, you must pay off the remaining principal.
          </p>
          <p>
            <span className="font-medium">Why keep resale value the same for both options?</span><br />
            It isolates the financing choice. If lease restrictions affect value, adjust resale downward.
          </p>
        </div>
      </div>
    </div>
  );
}
