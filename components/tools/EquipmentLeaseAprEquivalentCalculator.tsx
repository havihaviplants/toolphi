"use client";

import { useMemo, useState } from "react";

function money(v: number) {
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Solve APR via binary search on IRR-style cash flows
 */
function solveApr(
  price: number,
  monthly: number,
  months: number,
  upfront: number,
  buyout: number
) {
  const cashFlows = [-price + upfront];
  for (let i = 1; i <= months; i++) cashFlows.push(monthly);
  if (buyout > 0) cashFlows[cashFlows.length - 1] += buyout;

  let low = 0;
  let high = 0.5; // 50% APR upper bound
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const r = mid / 12;
    let npv = 0;
    cashFlows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + r, t);
    });
    if (npv > 0) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export default function EquipmentLeaseAprEquivalentCalculator() {
  const [price, setPrice] = useState(80000);
  const [monthlyPayment, setMonthlyPayment] = useState(1450);
  const [termMonths, setTermMonths] = useState(48);
  const [upfrontFees, setUpfrontFees] = useState(0);
  const [buyout, setBuyout] = useState(30000);

  const apr = useMemo(() => {
    if (price <= 0 || monthlyPayment <= 0 || termMonths <= 0) return 0;
    return solveApr(price, monthlyPayment, termMonths, upfrontFees, buyout);
  }, [price, monthlyPayment, termMonths, upfrontFees, buyout]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Equipment Lease APR Equivalent Calculator
        </h1>
        <p className="text-sm opacity-80">
          Translate lease payments into an equivalent APR to compare leasing with
          traditional loan financing.
        </p>
      </div>

      <div className="rounded-lg border p-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            Equipment price ($)
          </label>
          <input
            className="input"
            type="number"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Monthly lease payment ($)
          </label>
          <input
            className="input"
            type="number"
            value={monthlyPayment}
            onChange={e => setMonthlyPayment(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Lease term (months)
          </label>
          <input
            className="input"
            type="number"
            value={termMonths}
            onChange={e => setTermMonths(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Upfront fees ($)
          </label>
          <input
            className="input"
            type="number"
            value={upfrontFees}
            onChange={e => setUpfrontFees(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">
            Lease-end buyout ($)
          </label>
          <input
            className="input"
            type="number"
            value={buyout}
            onChange={e => setBuyout(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Set to 0 if the equipment is returned at lease end.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm opacity-70">Equivalent APR</p>
        <p className="text-3xl font-bold">
          {(apr * 100).toFixed(2)}%
        </p>
        <p className="text-sm opacity-80 mt-2">
          This is the implied annual interest rate of the lease, useful for
          comparing against loan APRs.
        </p>
      </div>

      <div className="space-y-2 text-sm opacity-80">
        <p className="font-semibold">How it works</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Models the lease as a series of cash flows.</li>
          <li>Uses an IRR-style calculation to solve for APR.</li>
          <li>Accounts for buyout value and upfront fees.</li>
        </ul>

        <p className="font-semibold pt-2">FAQ</p>
        <p>
          <strong>Is this the same as the lease money factor?</strong>
          <br />
          No. Money factor is a leasing shorthand; APR equivalent translates it
          into a standard interest rate.
        </p>
      </div>
    </div>
  );
}
