"use client";

import { useMemo, useState } from "react";

function toNumberLoose(v: string) {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function monthsToText(m: number) {
  const months = Math.max(0, Math.round(m));
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (months === 0) return "—";
  if (years === 0) return `${rem} months`;
  if (rem === 0) return `${years} years`;
  return `${years} years ${rem} months`;
}

type Row = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

function monthlyPayment(P: number, aprPct: number, years: number) {
  const principal = Math.max(0, P);
  const r = Math.max(0, aprPct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

function simulateToMonth(params: {
  principal: number;
  aprPct: number;
  amortYears: number;
  monthsToSim: number;
}): {
  baseMonthly: number;
  rows: Row[];
  remainingBalance: number;
  totalInterest: number;
  totalPaid: number;
  warning: string;
} {
  const P0 = Math.max(0, params.principal);
  const apr = Math.max(0, params.aprPct);
  const amortYears = Math.max(0, params.amortYears);
  const monthsToSim = Math.max(0, Math.floor(params.monthsToSim));

  if (P0 <= 0) {
    return {
      baseMonthly: 0,
      rows: [],
      remainingBalance: 0,
      totalInterest: 0,
      totalPaid: 0,
      warning: "Enter a loan amount greater than 0.",
    };
  }
  if (apr <= 0) {
    return {
      baseMonthly: 0,
      rows: [],
      remainingBalance: 0,
      totalInterest: 0,
      totalPaid: 0,
      warning: "Enter an interest rate greater than 0.",
    };
  }
  if (amortYears <= 0) {
    return {
      baseMonthly: 0,
      rows: [],
      remainingBalance: 0,
      totalInterest: 0,
      totalPaid: 0,
      warning: "Enter an amortization term greater than 0.",
    };
  }
  if (monthsToSim <= 0) {
    return {
      baseMonthly: monthlyPayment(P0, apr, amortYears),
      rows: [],
      remainingBalance: P0,
      totalInterest: 0,
      totalPaid: 0,
      warning: "Balloon due time must be greater than 0.",
    };
  }

  const r = apr / 100 / 12;
  const base = monthlyPayment(P0, apr, amortYears);

  if (r > 0 && base <= P0 * r) {
    return {
      baseMonthly: base,
      rows: [],
      remainingBalance: Infinity,
      totalInterest: Infinity,
      totalPaid: Infinity,
      warning: "Monthly payment is too low to reduce balance (interest exceeds payment).",
    };
  }

  let balance = P0;
  let totalInterest = 0;
  let totalPaid = 0;
  const rows: Row[] = [];

  // 안전장치 (최대 100년)
  const cap = Math.min(monthsToSim, 1200);

  for (let m = 1; m <= cap; m++) {
    const interest = balance * r;
    let principalPaid = Math.max(0, base - interest);

    // 마지막달 과납 보정 (여기서는 balloon이므로 balance가 0 되게 만들 필요는 없지만,
    // 입력이 특이할 때 음수 방지를 위해 보정)
    if (principalPaid > balance) principalPaid = balance;

    const payment = interest + principalPaid;

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPaid += payment;

    rows.push({
      month: m,
      payment,
      interest,
      principal: principalPaid,
      balance,
    });

    if (balance <= 0.01) break;
  }

  const warning =
    monthsToSim > 1200
      ? "Balloon due time is very long. Showing first 100 years only."
      : "";

  return {
    baseMonthly: base,
    rows,
    remainingBalance: balance,
    totalInterest,
    totalPaid,
    warning,
  };
}

export default function BalloonLoanCalculator() {
  const [principal, setPrincipal] = useState<number>(250000);
  const [aprStr, setAprStr] = useState<string>("7");
  const [amortYears, setAmortYears] = useState<number>(30);
  const [balloonYears, setBalloonYears] = useState<number>(5);
  const [showAll, setShowAll] = useState<boolean>(false);

  const {
    baseMonthly,
    remainingBalance,
    totalInterest,
    totalPaid,
    rows,
    warning,
    balloonMonths,
  } = useMemo(() => {
    const P = Math.max(0, principal);
    const apr = Math.max(0, toNumberLoose(aprStr));
    const amort = Math.max(0, amortYears);
    const by = Math.max(0, balloonYears);
    const months = Math.max(0, Math.round(by * 12));

    const sim = simulateToMonth({
      principal: P,
      aprPct: apr,
      amortYears: amort,
      monthsToSim: months,
    });

    return {
      baseMonthly: sim.baseMonthly,
      remainingBalance: sim.remainingBalance,
      totalInterest: sim.totalInterest,
      totalPaid: sim.totalPaid,
      rows: sim.rows,
      warning: sim.warning,
      balloonMonths: months,
    };
  }, [principal, aprStr, amortYears, balloonYears]);

  const visibleRows = useMemo(() => {
    if (showAll) return rows;
    return rows.slice(0, 24);
  }, [rows, showAll]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          Monthly payment is calculated using the amortization term. The remaining balance at the
          balloon due time is your <strong>balloon payment</strong>.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Loan Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={principal === 0 ? "" : String(principal)}
                onChange={(e) => setPrincipal(toNumberLoose(e.target.value))}
                placeholder="250000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Interest Rate (APR)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={aprStr}
                onChange={(e) => setAprStr(e.target.value)}
                placeholder="7 or 7.25"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Amortization Term</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={amortYears === 0 ? "" : String(amortYears)}
                onChange={(e) => setAmortYears(toNumberLoose(e.target.value))}
                placeholder="30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Balloon Due In</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={balloonYears === 0 ? "" : String(balloonYears)}
                onChange={(e) => setBalloonYears(toNumberLoose(e.target.value))}
                placeholder="5"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>
        </div>

        {warning && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {warning}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Results</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Monthly Payment (Amortized)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {baseMonthly > 0 ? `$${money(baseMonthly)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Balloon Payment (Remaining Balance)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {Number.isFinite(remainingBalance) ? `$${money(remainingBalance)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Interest Paid (Before Balloon)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {Number.isFinite(totalInterest) ? `$${money(totalInterest)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Time to Balloon</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {balloonMonths > 0 ? monthsToText(balloonMonths) : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Note: This assumes a fixed rate and standard amortized payments until the balloon due date.
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Payment Breakdown</h3>
            <p className="mt-1 text-sm text-gray-600">
              {showAll ? "Showing schedule up to balloon due date." : "Showing first 24 months."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          >
            {showAll ? "Show less" : "Show full"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-800">Month</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Payment</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Interest</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Principal</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-gray-600" colSpan={5}>
                    Enter inputs to generate a breakdown.
                  </td>
                </tr>
              ) : (
                visibleRows.map((r) => (
                  <tr key={r.month} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 text-left text-gray-800">{r.month}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.payment)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.interest)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.principal)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
