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
  extra: number;
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

function buildSchedule(params: {
  principal: number;
  aprPct: number;
  years: number;
  extraMonthly: number;
}): {
  rows: Row[];
  months: number;
  totalInterest: number;
  totalPaid: number;
  baseMonthly: number;
  warning: string;
} {
  const P0 = Math.max(0, params.principal);
  const apr = Math.max(0, params.aprPct);
  const years = Math.max(0, params.years);
  const extra = Math.max(0, params.extraMonthly);

  if (P0 <= 0) {
    return { rows: [], months: 0, totalInterest: 0, totalPaid: 0, baseMonthly: 0, warning: "Enter a loan amount greater than 0." };
  }
  if (apr <= 0) {
    return { rows: [], months: 0, totalInterest: 0, totalPaid: 0, baseMonthly: 0, warning: "Enter an interest rate greater than 0." };
  }
  if (years <= 0) {
    return { rows: [], months: 0, totalInterest: 0, totalPaid: 0, baseMonthly: 0, warning: "Enter a loan term greater than 0." };
  }

  const r = apr / 100 / 12;
  const n = years * 12;
  const base = monthlyPayment(P0, apr, years);

  // 상환불가 방어 (기본 월납이 이자보다 작으면 원금이 줄지 않음)
  if (r > 0 && base <= P0 * r) {
    return {
      rows: [],
      months: Infinity,
      totalInterest: Infinity,
      totalPaid: Infinity,
      baseMonthly: base,
      warning: "Your monthly payment is too low to reduce the balance (interest exceeds payment).",
    };
  }

  // 시뮬레이션 (최대 100년 안전장치)
  const maxMonths = 1200;
  const rows: Row[] = [];
  let balance = P0;
  let totalInterest = 0;
  let totalPaid = 0;
  let m = 0;

  while (balance > 0.01 && m < maxMonths) {
    m += 1;

    const interest = balance * r;
    let principalPaid = Math.max(0, base - interest);

    // extra는 원금에 직격
    let extraPaid = extra;

    // 마지막달 과납 보정
    if (principalPaid + extraPaid > balance) {
      const need = balance;
      if (principalPaid >= need) {
        principalPaid = need;
        extraPaid = 0;
      } else {
        extraPaid = need - principalPaid;
      }
    }

    const paymentThisMonth = interest + principalPaid + extraPaid;

    balance = balance - (principalPaid + extraPaid);
    totalInterest += interest;
    totalPaid += paymentThisMonth;

    rows.push({
      month: m,
      payment: paymentThisMonth,
      interest,
      principal: principalPaid,
      extra: extraPaid,
      balance: Math.max(0, balance),
    });
  }

  const warn =
    m >= maxMonths ? "Reached safety limit (100 years). Check your inputs." : "";

  return {
    rows,
    months: m,
    totalInterest,
    totalPaid,
    baseMonthly: base,
    warning: warn,
  };
}

function totalInterestBaseline(P: number, aprPct: number, years: number) {
  const base = monthlyPayment(P, aprPct, years);
  const r = Math.max(0, aprPct) / 100 / 12;
  const n = Math.max(0, years) * 12;

  if (P <= 0 || aprPct <= 0 || years <= 0) return { months: 0, totalInterest: 0, baseMonthly: 0 };
  if (r === 0) return { months: n, totalInterest: 0, baseMonthly: base };

  // baseline interest = totalPaid - principal
  const totalPaid = base * n;
  return { months: n, totalInterest: Math.max(0, totalPaid - P), baseMonthly: base };
}

export default function AmortizationScheduleWithExtraPaymentsCalculator() {
  const [principal, setPrincipal] = useState<number>(300000);
  const [rateStr, setRateStr] = useState<string>("6");
  const [years, setYears] = useState<number>(30);
  const [extra, setExtra] = useState<number>(200);
  const [showAll, setShowAll] = useState<boolean>(false);

  const {
    rows,
    months,
    totalInterest,
    totalPaid,
    baseMonthly,
    warning,
    interestSaved,
    timeSavedMonths,
    baselineInterest,
    baselineMonths,
  } = useMemo(() => {
    const P = Math.max(0, principal);
    const apr = Math.max(0, toNumberLoose(rateStr));
    const Y = Math.max(0, years);
    const ex = Math.max(0, extra);

    const sched = buildSchedule({
      principal: P,
      aprPct: apr,
      years: Y,
      extraMonthly: ex,
    });

    const base = totalInterestBaseline(P, apr, Y);

    const savedInterest =
      Number.isFinite(base.totalInterest) && Number.isFinite(sched.totalInterest)
        ? Math.max(0, base.totalInterest - sched.totalInterest)
        : 0;

    const savedMonths =
      Number.isFinite(base.months) && Number.isFinite(sched.months)
        ? Math.max(0, base.months - sched.months)
        : 0;

    return {
      rows: sched.rows,
      months: sched.months,
      totalInterest: sched.totalInterest,
      totalPaid: sched.totalPaid,
      baseMonthly: sched.baseMonthly,
      warning: sched.warning,
      interestSaved: savedInterest,
      timeSavedMonths: savedMonths,
      baselineInterest: base.totalInterest,
      baselineMonths: base.months,
    };
  }, [principal, rateStr, years, extra]);

  const visibleRows = useMemo(() => {
    if (showAll) return rows;
    return rows.slice(0, 24); // 기본은 24개월만 보여주고 토글
  }, [rows, showAll]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Inputs</h3>
        <p className="mt-1 text-sm text-gray-600">
          This schedule applies your <strong>extra payment monthly</strong> to principal.
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
                placeholder="300000"
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
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                placeholder="6 or 6.25"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Loan Term</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={years === 0 ? "" : String(years)}
                onChange={(e) => setYears(toNumberLoose(e.target.value))}
                placeholder="30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">Extra Payment (Monthly)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 bg-white px-7 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                value={extra === 0 ? "" : String(extra)}
                onChange={(e) => setExtra(toNumberLoose(e.target.value))}
                placeholder="200"
              />
            </div>
          </div>
        </div>

        {warning && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {warning}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">Summary</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Base Monthly (P&I)</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {baseMonthly > 0 ? `$${money(baseMonthly)}` : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">New Payoff Time</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {Number.isFinite(months) ? monthsToText(months) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Time Saved</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {timeSavedMonths > 0 ? monthsToText(timeSavedMonths) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Interest Saved</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {interestSaved > 0 ? `$${money(interestSaved)}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">Baseline (No Extra)</div>
            <div className="mt-2 text-sm text-gray-700">
              <div>Term: <strong>{monthsToText(baselineMonths)}</strong></div>
              <div>Total interest: <strong>{baselineInterest > 0 ? `$${money(baselineInterest)}` : "—"}</strong></div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">With Extra Payments</div>
            <div className="mt-2 text-sm text-gray-700">
              <div>Term: <strong>{Number.isFinite(months) ? monthsToText(months) : "—"}</strong></div>
              <div>Total interest: <strong>{Number.isFinite(totalInterest) ? `$${money(totalInterest)}` : "—"}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Amortization Schedule</h3>
            <p className="mt-1 text-sm text-gray-600">
              {showAll ? "Showing full schedule." : "Showing first 24 months (toggle for full schedule)."}
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
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Extra</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-800">Balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-gray-600" colSpan={6}>
                    Enter inputs to generate a schedule.
                  </td>
                </tr>
              ) : (
                visibleRows.map((r) => (
                  <tr key={r.month} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-3 py-2 text-left text-gray-800">{r.month}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.payment)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.interest)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.principal)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.extra)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${money(r.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Note: This is an estimate. Actual loan servicing may apply extra payments differently.
        </div>
      </div>
    </div>
  );
}
