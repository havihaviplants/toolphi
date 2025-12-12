"use client";

import { useMemo, useState } from "react";

function toNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function format(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function LoanInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(3);

  const { totalInterest, totalPaid } = useMemo(() => {
    const p = Math.max(0, principal);
    const r = Math.max(0, rate) / 100;
    const t = Math.max(0, years);

    const interest = p * r * t; // simple interest
    return {
      totalInterest: interest,
      totalPaid: p + interest,
    };
  }, [principal, rate, years]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Loan Amount</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              value={principal}
              onChange={(e) => setPrincipal(toNumber(e.target.value))}
              placeholder="10000"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Interest Rate (%)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              value={rate}
              onChange={(e) => setRate(toNumber(e.target.value))}
              placeholder="6"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Loan Term (Years)</label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              value={years}
              onChange={(e) => setYears(toNumber(e.target.value))}
              placeholder="3"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Results</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Total Interest</div>
            <div className="text-2xl font-semibold">
              ${format(totalInterest)}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Total Amount Paid</div>
            <div className="text-2xl font-semibold">
              ${format(totalPaid)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
