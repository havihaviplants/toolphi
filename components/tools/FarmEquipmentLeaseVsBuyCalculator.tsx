"use client";

import { useMemo, useState } from "react";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}
function money(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function pct1(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return x.toFixed(1) + "%";
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

export default function FarmEquipmentLeaseVsBuyCalculator() {
  // Context
  const [equipmentPrice, setEquipmentPrice] = useState<number>(180000);
  const [yearsOfUse, setYearsOfUse] = useState<number>(7);

  // Lease inputs
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState<number>(2600);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(60);
  const [leaseDownPayment, setLeaseDownPayment] = useState<number>(0);
  const [leaseBuyout, setLeaseBuyout] = useState<number>(60000);
  const [leaseFeesUpfront, setLeaseFeesUpfront] = useState<number>(0);

  // Buy/Loan inputs
  const [buyDownPayment, setBuyDownPayment] = useState<number>(30000);
  const [buyAprPct, setBuyAprPct] = useState<number>(7.25);
  const [buyLoanTermMonths, setBuyLoanTermMonths] = useState<number>(84);
  const [buyFeesFinanced, setBuyFeesFinanced] = useState<number>(2000);

  // Costs / value
  const [annualMaintenanceLease, setAnnualMaintenanceLease] = useState<number>(3500);
  const [annualMaintenanceBuy, setAnnualMaintenanceBuy] = useState<number>(4500);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1200);
  const [expectedResaleValueEnd, setExpectedResaleValueEnd] = useState<number>(70000);

  // Simple “tax” proxy (optional) for decision-thickness
  const [effectiveTaxRatePct, setEffectiveTaxRatePct] = useState<number>(0);

  const r = useMemo(() => {
    const price = Math.max(0, n(equipmentPrice));
    const useMonths = Math.max(1, Math.round(Math.max(1, n(yearsOfUse)) * 12));

    // ---- Lease cost over use horizon
    const leaseMP = Math.max(0, n(leaseMonthlyPayment));
    const leaseM = Math.max(1, Math.round(Math.max(1, n(leaseTermMonths))));
    const leaseDP = Math.max(0, n(leaseDownPayment));
    const leaseFees = Math.max(0, n(leaseFeesUpfront));
    const buyout = Math.max(0, n(leaseBuyout));

    // pay lease payments only for leaseTerm (or up to useMonths if shorter)
    const leasePaidMonths = Math.min(useMonths, leaseM);
    const leasePaymentsTotal = leaseMP * leasePaidMonths;

    // If you use longer than lease term, assume you buy out at end and keep remaining months
    const leaseRequiresBuyout = useMonths > leaseM ? true : false;
    const leaseEndCost = leaseRequiresBuyout ? buyout : 0;

    const leaseMaintenance = (Math.max(0, n(annualMaintenanceLease)) / 12) * useMonths;
    const insurance = (Math.max(0, n(annualInsurance)) / 12) * useMonths;

    const leaseTotalOutOfPocket =
      leaseDP + leaseFees + leasePaymentsTotal + leaseEndCost + leaseMaintenance + insurance;

    // Value at end if you buyout and own at end of use horizon (can resell)
    const resale = Math.max(0, n(expectedResaleValueEnd));
    const leaseEndValue = leaseRequiresBuyout ? resale : 0;

    // Effective net cost (after selling)
    const leaseNetCost = leaseTotalOutOfPocket - leaseEndValue;

    // ---- Buy/Loan cost over use horizon
    const buyDP = Math.min(Math.max(0, n(buyDownPayment)), price);
    const financedFees = Math.max(0, n(buyFeesFinanced));
    const principal = Math.max(0, price - buyDP + financedFees);

    const apr = Math.max(0, n(buyAprPct)) / 100;
    const loanM = Math.max(1, Math.round(Math.max(1, n(buyLoanTermMonths))));
    const buyMP = monthlyPayment(principal, apr, loanM);

    // payments over use horizon = min(useMonths, loanTerm)
    const paidMonths = Math.min(useMonths, loanM);
    const buyPaymentsTotal = buyMP * paidMonths;

    // maintenance for buy
    const buyMaintenance = (Math.max(0, n(annualMaintenanceBuy)) / 12) * useMonths;

    // if useMonths < loan term, you still owe balance; approximate remaining balance after paidMonths
    // amortization remaining balance formula:
    const rMonthly = apr / 12;
    let remainingBalance = 0;
    if (principal === 0) remainingBalance = 0;
    else if (rMonthly === 0) {
      remainingBalance = Math.max(0, principal - (principal / loanM) * paidMonths);
    } else {
      const factor = Math.pow(1 + rMonthly, paidMonths);
      remainingBalance =
        principal * factor - (buyMP * (factor - 1)) / rMonthly;
      remainingBalance = Number.isFinite(remainingBalance) ? Math.max(0, remainingBalance) : 0;
    }

    // total out-of-pocket during use horizon (cash out)
    const buyTotalOutOfPocket =
      buyDP + buyPaymentsTotal + buyMaintenance + insurance;

    // end value: sell equipment for resale, but pay off remaining balance if any
    const buyEndValue = resale - remainingBalance;
    const buyNetCost = buyTotalOutOfPocket - buyEndValue;

    // ---- Optional tax proxy (very simplified)
    const taxRate = Math.max(0, Math.min(60, n(effectiveTaxRatePct))) / 100;
    // assume some deductibility benefit proportional to payments+maintenance (rough proxy)
    const leaseTaxBenefit = (leasePaymentsTotal + leaseMaintenance) * taxRate;
    const buyTaxBenefit = (buyPaymentsTotal + buyMaintenance) * taxRate;

    const leaseNetAfterTax = leaseNetCost - leaseTaxBenefit;
    const buyNetAfterTax = buyNetCost - buyTaxBenefit;

    // Effective monthly net cost
    const leaseEffectiveMonthly = leaseNetAfterTax / useMonths;
    const buyEffectiveMonthly = buyNetAfterTax / useMonths;

    const cheaper = leaseEffectiveMonthly < buyEffectiveMonthly ? "lease" : "buy";
    const monthlyDiff = Math.abs(leaseEffectiveMonthly - buyEffectiveMonthly);

    // Break-even (rough): solve useMonths where costs equal by scanning
    let breakEvenMonths: number | null = null;
    const maxScan = Math.min(240, Math.max(12, useMonths * 2)); // cap
    for (let m = 12; m <= maxScan; m += 1) {
      // recompute quickly with same assumptions, varying horizon m
      const horizon = m;

      // Lease
      const lp = leaseMP * Math.min(horizon, leaseM);
      const needBuyout = horizon > leaseM;
      const endCost = needBuyout ? buyout : 0;
      const lm = (Math.max(0, n(annualMaintenanceLease)) / 12) * horizon;
      const ins = (Math.max(0, n(annualInsurance)) / 12) * horizon;
      const leaseTotal = leaseDP + leaseFees + lp + endCost + lm + ins;
      const leaseVal = needBuyout ? resale : 0;
      const leaseNet = leaseTotal - leaseVal;
      const leaseTax = (lp + lm) * taxRate;
      const leaseAfter = leaseNet - leaseTax;

      // Buy
      const pm = buyMP * Math.min(horizon, loanM);
      let rem = 0;
      if (principal === 0) rem = 0;
      else if (rMonthly === 0) rem = Math.max(0, principal - (principal / loanM) * Math.min(horizon, loanM));
      else {
        const f = Math.pow(1 + rMonthly, Math.min(horizon, loanM));
        rem = principal * f - (buyMP * (f - 1)) / rMonthly;
        rem = Number.isFinite(rem) ? Math.max(0, rem) : 0;
      }
      const bm = (Math.max(0, n(annualMaintenanceBuy)) / 12) * horizon;
      const ins2 = (Math.max(0, n(annualInsurance)) / 12) * horizon;
      const buyTotal = buyDP + pm + bm + ins2;
      const buyVal = resale - rem;
      const buyNet2 = buyTotal - buyVal;
      const buyTax = (pm + bm) * taxRate;
      const buyAfter = buyNet2 - buyTax;

      if (Math.abs(leaseAfter - buyAfter) / Math.max(1, Math.min(leaseAfter, buyAfter)) < 0.02) {
        breakEvenMonths = horizon;
        break;
      }
    }

    return {
      useMonths,
      // lease
      leaseTotalOutOfPocket,
      leaseNetAfterTax,
      leaseEffectiveMonthly,
      leaseRequiresBuyout,
      // buy
      buyMP,
      buyTotalOutOfPocket,
      remainingBalance,
      buyNetAfterTax,
      buyEffectiveMonthly,
      // compare
      cheaper,
      monthlyDiff,
      breakEvenMonths,
    };
  }, [
    equipmentPrice,
    yearsOfUse,
    leaseMonthlyPayment,
    leaseTermMonths,
    leaseDownPayment,
    leaseBuyout,
    leaseFeesUpfront,
    buyDownPayment,
    buyAprPct,
    buyLoanTermMonths,
    buyFeesFinanced,
    annualMaintenanceLease,
    annualMaintenanceBuy,
    annualInsurance,
    expectedResaleValueEnd,
    effectiveTaxRatePct,
  ]);

  const winnerText = r.cheaper === "lease" ? "Leasing is cheaper" : "Buying is cheaper";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Farm Equipment Lease vs Buy Calculator</h1>
        <p className="text-sm opacity-80">
          Compare leasing vs buying equipment using total cost, effective monthly cost, end-of-horizon value,
          and a rough break-even estimate. (Decision-grade model, not accounting advice.)
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
            <label className="block text-sm font-medium">Years you expect to use it</label>
            <input className="input" type="number" min={1} step="1" value={yearsOfUse} onChange={(e) => setYearsOfUse(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Used to compute “effective monthly cost”.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Expected resale value at end ($)</label>
            <input className="input" type="number" min={0} step="1" value={expectedResaleValueEnd} onChange={(e) => setExpectedResaleValueEnd(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Conservative estimate helps avoid over-buying.</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Effective tax rate (optional %)</label>
            <input className="input" type="number" min={0} max={60} step="0.1" value={effectiveTaxRatePct} onChange={(e) => setEffectiveTaxRatePct(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">Very simplified proxy for deductibility impact.</p>
          </div>
        </div>
      </div>

      {/* Lease */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Lease option</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Monthly lease payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseMonthlyPayment} onChange={(e) => setLeaseMonthlyPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Lease term (months)</label>
            <input className="input" type="number" min={1} step="1" value={leaseTermMonths} onChange={(e) => setLeaseTermMonths(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Lease down payment ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseDownPayment} onChange={(e) => setLeaseDownPayment(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium">Upfront fees ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseFeesUpfront} onChange={(e) => setLeaseFeesUpfront(Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">End-of-lease buyout price ($)</label>
            <input className="input" type="number" min={0} step="1" value={leaseBuyout} onChange={(e) => setLeaseBuyout(Number(e.target.value))} />
            <p className="text-xs opacity-70 mt-1">
              If you keep it after the lease ends, this is what you pay to own it.
            </p>
          </div>
        </div>
      </div>

      {/* Buy */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="font-semibold">Buy / loan option</div>

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
            <input className="input" type="number" min={0} step="1" value={buyFeesFinanced} onChange={(e) => setBuyFeesFinanced(Number(e.target.value))} />
          </div>
        </div>

        <div className="pt-3 border-t text-sm opacity-80">
          Estimated loan monthly payment: <span className="font-semibold">${money(r.buyMP)}</span>
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
            <label className="block text-sm font-medium">Maintenance (buy) ($/yr)</label>
            <input className="input" type="number" min={0} step="1" value={annualMaintenanceBuy} onChange={(e) => setAnnualMaintenanceBuy(Number(e.target.value))} />
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
            <p className="text-xl font-bold">${money(r.leaseEffectiveMonthly)}</p>
            <p className="text-xs opacity-70 mt-1">
              Includes ongoing costs and end value (if buying out), with an optional tax proxy.
            </p>
          </div>

          <div>
            <p className="text-sm opacity-70">Buy: effective monthly cost</p>
            <p className="text-xl font-bold">${money(r.buyEffectiveMonthly)}</p>
            <p className="text-xs opacity-70 mt-1">
              Accounts for resale value and remaining balance at the end of your use horizon.
            </p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t">
            <div className="text-sm opacity-70">Result</div>
            <div className="text-lg font-semibold">
              {winnerText} by about <span className="font-bold">${money(r.monthlyDiff)}</span> per month
              (effective).
            </div>

            <div className="text-sm opacity-80 mt-2">
              Break-even (rough):{" "}
              <span className="font-semibold">
                {r.breakEvenMonths ? `${r.breakEvenMonths} months (~${(r.breakEvenMonths / 12).toFixed(1)} years)` : "Not found within scan range"}
              </span>
            </div>

            <div className="text-xs opacity-70 mt-1">
              Lease buyout assumed only if your usage exceeds the lease term.
            </div>
          </div>
        </div>
      </div>

      {/* Thick content */}
      <div className="space-y-2">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 text-sm opacity-80 space-y-1">
          <li>Lease cost = upfront + lease payments + (buyout if you keep it) + maintenance + insurance − end value.</li>
          <li>Buy cost = down payment + loan payments + maintenance + insurance − (resale − remaining balance).</li>
          <li>Effective monthly cost = net cost ÷ months of use.</li>
          <li>Break-even is approximated by scanning different usage horizons.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <div className="space-y-2 text-sm opacity-80">
          <p>
            <span className="font-medium">Why include resale value?</span><br />
            The end value is a major part of the real cost of ownership—ignoring it often makes buying look worse than it is.
          </p>
          <p>
            <span className="font-medium">Is the tax part accurate?</span><br />
            It’s a simplified proxy. Real deductions depend on jurisdiction, depreciation rules, and your filing situation.
          </p>
          <p>
            <span className="font-medium">What if I plan to replace equipment early?</span><br />
            Lower the years of use. If you sell before the loan ends, remaining balance matters a lot.
          </p>
        </div>
      </div>
    </div>
  );
}
