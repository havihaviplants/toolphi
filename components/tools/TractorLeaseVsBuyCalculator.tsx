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

export default function TractorLeaseVsBuyCalculator() {
  // Context
  const [tractorPrice, setTractorPrice] = useState<number>(95000);
  const [yearsOfUse, setYearsOfUse] = useState<number>(5);
  const [expectedResaleValueEnd, setExpectedResaleValueEnd] = useState<number>(40000);

  // Lease
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState<number>(1450);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(48);
  const [leaseFeesUpfront, setLeaseFeesUpfront] = useState<number>(0);
  const [leaseDownPayment, setLeaseDownPayment] = useState<number>(0);
  const [leaseBuyout, setLeaseBuyout] = useState<number>(35000);

  // Buy/Loan
  const [buyDownPayment, setBuyDownPayment] = useState<number>(15000);
  const [buyAprPct, setBuyAprPct] = useState<number>(7.5);
  const [buyLoanTermMonths, setBuyLoanTermMonths] = useState<number>(60);
  const [feesFinanced, setFeesFinanced] = useState<number>(1200);

  // Ongoing costs
  const [annualMaintenanceLease, setAnnualMaintenanceLease] = useState<number>(1800);
  const [annualMaintenanceBuy, setAnnualMaintenanceBuy] = useState<number>(2600);
  const [annualInsurance, setAnnualInsurance] = useState<number>(700);

  const r = useMemo(() => {
    const price = Math.max(0, n(tractorPrice));
    const useMonths = Math.max(1, Math.round(Math.max(1, n(yearsOfUse)) * 12));
    const resale = Math.max(0, n(expectedResaleValueEnd));

    // Lease
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

    // Buy / Loan
    const dp = Math.min(Math.max(0, n(buyDownPayment)), price);
    const financedFees = Math.max(0, n(feesFinanced));
    const principal = Math.max(0, price - dp + financedFees);

    const apr = Math.max(0, n(buyAprPct)) / 100;
    const term = Math.max(1, Math.round(Math.max(1, n(buyLoanTermMonths))));
    const mp = monthlyPayment(principal, apr, term);

    const paidMonths = Math.min(useMonths, term);
    const payments = mp * paidMonths;

    const buyMaint = (Math.max(0, n(annualMaintenanceBuy)) / 12) * useMonths;

    const bal = remainingBalance(principal, apr, term, paidMonths, mp);
    const endValue = resale - bal;

    const buyTotalOut = dp + payments + buyMaint + insurance;
    const buyNet = buyTotalOut - endValue;
    const buyEffMonthly = buyNet / useMonths;

    const cheaper = leaseEffMonthly < buyEffMonthly ? "lease" : "buy";
    const diff = Math.abs(leaseEffMonthly - buyEffMonthly);

    // Break-even scan
    let breakEvenMonths: number | null = null;
    const maxScan = Math.min(240, Math.max(12, useMonths * 2));
    for (let m = 12; m <= maxScan; m += 1) {
      // lease
      const lp = lmp * Math.min(m, lterm);
      const needBuy = m > lterm;
      const endC = needBuy ? buyout : 0;
      const lm = (Math.max(0, n(annualMaintenanceLease)) / 12) * m;
      const ins = (Math.max(0, n(annualInsurance)) / 12) * m;
      const leaseTot = ldp + lfees + lp + endC + lm + ins;
      const leaseVal = needBuy ? resale : 0;
      const leaseNet2 = leaseTot - leaseVal;

      // buy
      const paid = Math.min(m, term);
      const pay = mp * paid;
      const bm = (Math.max(0, n(annualMaintenanceBuy)) / 12) * m;
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
      // lease
      leaseNeedsBuyout,
      leaseTotalOut,
      leaseNet,
      leaseEffMonthly,
      // buy
      mp,
      bal,
      buyTotalOut,
      buyNet,
      buyEffMonthly,
      // compare
      cheaper,
      diff,
      breakEvenMonths,
    };
  }, [
    tractorPrice,
    yearsOfUse,
    expectedResaleValueEnd,
    leaseMonthlyPayment,
    leaseTermMonths,
    leaseFeesUpfront,
    leaseDownPayment,
    leaseBuyout,
    buyDownPayment,
    buyAprPct,
    buyLoanTermMonths,
    feesFinanced,
    annualMaintenanceLease,
    annualMaintenanceBuy,
    annualInsurance,
  ]);

  const winnerText = r.cheaper === "lease" ? "Leasing is cheaper" : "Buying is cheaper";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Tractor Lease vs Buy Calculator</h1>
        <p className="text-sm opacity-80">
          Compare leasing vs buying a tractor using effective monthly cost, total cash out, and a rough break-even horizon.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Tractor & usage</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Tractor price ($)</label>
            <input className="input" type="number" min={0} step="1" value={tractorPrice} onChange={(e) => setTractorPrice(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Years of use</label>
            <input className="input" type="number" min={1} step="1" value={yearsOfUse} onChange={(e) => setYearsOfUse(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Expected resale value at end ($)</label>
            <input className="input" type="number" min={0} step="1" value={expectedResaleValueEnd} onChange={(e) => setExpectedResaleValueEnd(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used to estimate end value for both options.</p>
          </div>
        </div>
      </div>

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
            <p className="text-xs opacity-70 mt-1">Only applied if you keep the tractor after the lease term ends.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Buy / loan</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={buyDownPayment} onChange={(e) => setBuyDownPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">APR (%)</label>
            <input className="input" type="number" min={0} step="0.01" value={buyAprPct} onChange={(e) => setBuyAprPct(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Loan term (months)</label>
            <input className="input" type="number" min={1} step="1" value={buyLoanTermMonths} onChange={(e) => setBuyLoanTermMonths(Number(e.target.value))} />
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

      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Ongoing costs (annual)</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Maintenance (lease) ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualMaintenanceLease} onChange={(e) => setAnnualMaintenanceLease(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Maintenance (buy) ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualMaintenanceBuy} onChange={(e) => setAnnualMaintenanceBuy(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Insurance ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualInsurance} onChange={(e) => setAnnualInsurance(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm opacity-70">Lease: effective monthly cost</p>
            <p className="text-xl font-bold">${money(r.leaseEffMonthly)}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">Buy: effective monthly cost</p>
            <p className="text-xl font-bold">${money(r.buyEffMonthly)}</p>
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
          <li>Buy net cost includes down payment + loan payments + costs minus (resale − remaining loan balance).</li>
          <li>Effective monthly cost = net cost ÷ months of use.</li>
          <li>Break-even is approximated by scanning different usage horizons.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">What makes tractors different from other equipment?</span><br />
            Tractor resale values can hold up well, so resale assumptions can swing the result significantly.
          </p>
          <p>
            <span className="font-medium">What if I keep it longer than the loan term?</span><br />
            Set years of use higher—once the loan is paid off, buying often becomes cheaper if resale value remains meaningful.
          </p>
        </div>
      </div>
    </div>
  );
}
